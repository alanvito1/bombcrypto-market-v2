import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApiServer, ServerDeps } from '../src/api/server';
import { Config } from '../src/config/types';
import { MAX_PAGE_SIZE } from '../src/domain/models/pagination';

describe('Pagination Security', () => {
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
            corsOrigin: '*',
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

    const createMockDeps = () => {
        const queryMock = vi.fn().mockImplementation(async (sql, params) => {
             return { rows: [] };
        });

        return {
            config: mockConfig,
            db: {
                query: queryMock,
                connect: vi.fn(),
            } as any,
            cacheSet: {
                getCache: { get: vi.fn((key, fn) => fn()), set: vi.fn() } as any,
                listCache: { get: vi.fn((key, fn) => fn()), set: vi.fn() } as any
            },
            redis: null,
            logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } as any,
            queryMock,
        };
    };

    it('should clamp size parameter to MAX_PAGE_SIZE for user history', async () => {
        const deps = createMockDeps();
        const apiServer = createApiServer(deps);
        const app = apiServer.getApp();

        await request(app)
            .get('/users/0x123/history?size=1000');

        // In WalletHistoryRepository, LIMIT is parameterized as $2
        const calls = deps.queryMock.mock.calls;
        // Look for the query call with 3 params where the second one is a number (limit)
        const historyCall = calls.find(call => call[1] && call[1].length === 3 && typeof call[1][1] === 'number');

        expect(historyCall).toBeDefined();
        if (historyCall) {
            const sizeParam = historyCall[1][1];
            expect(sizeParam).toBeLessThanOrEqual(MAX_PAGE_SIZE);
        }
    });

    it('should clamp size parameter to MAX_PAGE_SIZE for hero search', async () => {
        const deps = createMockDeps();
        const apiServer = createApiServer(deps);
        const app = apiServer.getApp();

        await request(app)
            .get('/transactions/heroes/search?size=1000');

        // QueryBuilder interpolates LIMIT directly into SQL string
        const calls = deps.queryMock.mock.calls;
        const searchCall = calls.find(call => typeof call[0] === 'string' && call[0].includes('FROM hero_orders') && call[0].includes('LIMIT'));

        expect(searchCall).toBeDefined();
        if (searchCall) {
            const sql = searchCall[0];
            expect(sql).toMatch(/LIMIT 100/);
            expect(sql).not.toMatch(/LIMIT 1000/);
        }
    });

     it('should clamp size parameter to MAX_PAGE_SIZE for house search', async () => {
        const deps = createMockDeps();
        const apiServer = createApiServer(deps);
        const app = apiServer.getApp();

        await request(app)
            .get('/transactions/houses/search?size=1000');

        // QueryBuilder interpolates LIMIT directly into SQL string
        const calls = deps.queryMock.mock.calls;
        const searchCall = calls.find(call => typeof call[0] === 'string' && call[0].includes('FROM house_orders') && call[0].includes('LIMIT'));

        expect(searchCall).toBeDefined();
        if (searchCall) {
            const sql = searchCall[0];
            expect(sql).toMatch(/LIMIT 100/);
            expect(sql).not.toMatch(/LIMIT 1000/);
        }
    });
});
