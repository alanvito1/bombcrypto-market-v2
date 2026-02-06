import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApiServer, ServerDeps } from '../src/api/server';
import { Config } from '../src/config/types';

describe('CORS Security', () => {
    it('should set Access-Control-Allow-Origin header', async () => {
        const mockConfig: Config = {
            server: {
                port: '0',
                cacheEviction: 60,
                getCacheEviction: 60,
                adminApiKey: 'test-key',
                blockchainCenterApiUrl: '',
                bheroContractAddress: '0x1',
                bhouseContractAddress: '0x2',
                isProduction: false,
                redisUrl: '',
                network: 'bsc',
                corsOrigin: 'https://allowed-origin.com',
            },
            subscriber: {
                blockchainCenterApiUrl: '',
                network: 'bsc',
                heroContractAddress: '',
                houseContractAddress: '',
                heroSoldNotifyUrl: '',
                houseSoldNotifyUrl: '',
                blockRetryTimeout: 1000,
                heroStartingBlockNumber: 0,
                houseStartingBlockNumber: 0,
                bcoinContractAddress: '',
                senContractAddress: '',
            },
            logger: {
                development: true,
                level: 'error',
            },
            postgres: {
                dsn: 'postgres://localhost:5432/test',
            },
        };

        const mockDeps: ServerDeps = {
            config: mockConfig,
            db: {
                query: vi.fn(),
                connect: vi.fn(),
            } as any,
            cacheSet: {
                getCache: { get: vi.fn(), set: vi.fn() } as any,
                listCache: { get: vi.fn(), set: vi.fn() } as any
            },
            redis: null,
            logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } as any,
        };

        const apiServer = createApiServer(mockDeps);
        const app = apiServer.getApp();

        const response = await request(app)
            .get('/')
            .set('Origin', 'https://allowed-origin.com');

        expect(response.headers['access-control-allow-origin']).toBe('https://allowed-origin.com');
    });

    it('should not allow unauthorized origin if configured strictly', async () => {
         const mockConfig: Config = {
            server: {
                port: '0',
                cacheEviction: 60,
                getCacheEviction: 60,
                adminApiKey: 'test-key',
                blockchainCenterApiUrl: '',
                bheroContractAddress: '0x1',
                bhouseContractAddress: '0x2',
                isProduction: false,
                redisUrl: '',
                network: 'bsc',
                corsOrigin: 'https://allowed-origin.com',
            },
            subscriber: {
                blockchainCenterApiUrl: '',
                network: 'bsc',
                heroContractAddress: '',
                houseContractAddress: '',
                heroSoldNotifyUrl: '',
                houseSoldNotifyUrl: '',
                blockRetryTimeout: 1000,
                heroStartingBlockNumber: 0,
                houseStartingBlockNumber: 0,
                bcoinContractAddress: '',
                senContractAddress: '',
            },
            logger: {
                development: true,
                level: 'error',
            },
            postgres: {
                dsn: 'postgres://localhost:5432/test',
            },
        };

        const mockDeps: ServerDeps = {
            config: mockConfig,
            db: {
                query: vi.fn(),
                connect: vi.fn(),
            } as any,
            cacheSet: {
                getCache: { get: vi.fn(), set: vi.fn() } as any,
                listCache: { get: vi.fn(), set: vi.fn() } as any
            },
            redis: null,
            logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } as any,
        };

        const apiServer = createApiServer(mockDeps);
        const app = apiServer.getApp();

        const response = await request(app)
            .get('/')
            .set('Origin', 'https://malicious.com');

        // By default, cors middleware might reflect origin if strict, or not set header.
        // If origin is string, it sets Access-Control-Allow-Origin to that string.
        // So even if we send malicious, it returns 'https://allowed-origin.com'.
        // Browser then blocks it because it doesn't match.

        expect(response.headers['access-control-allow-origin']).toBe('https://allowed-origin.com');
    });
});
