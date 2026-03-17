import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Subscriber } from '../subscriber';
import { SubscriberConfig } from '@/config/types';

// Mock dependencies
const mockApi = {
    callContract: vi.fn(),
    stop: vi.fn(),
} as any;

const mockRedis = {
    popFromSet: vi.fn(),
    exists: vi.fn(),
    set: vi.fn(),
    disconnect: vi.fn(),
} as any;

const mockDb = {
    query: vi.fn(),
    end: vi.fn(),
} as any;

const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
} as any;

const mockConfig: SubscriberConfig = {
    network: 'BSC',
    marketAddress: '0x1234567890123456789012345678901234567890',
    erc721Address: '0x0987654321098765432109876543210987654321',
    dbTable: 'hero_orders',
    idInConfig: 'test_hero',
    dbSearchPath: 'test_schema',
    unlockNotifyUrl: 'https://api.test.com/unlock',
    internalWebhookSecret: 'SUPER_SECRET_TOKEN_123',
};

describe('Subscriber Webhook Security', () => {
    let subscriber: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock global fetch
        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({}),
        })) as any;

        // Crio a instância da classe mas acesso como "any" para chamar o método privado markDeleted
        subscriber = new Subscriber(
            mockConfig,
            mockApi,
            mockRedis,
            mockDb,
            mockLogger
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('Cenário A (Sucesso): Dispara o webhook com o cabeçalho de segurança, URL e payload corretos', async () => {
        const record = {
            id: 999,
            tokenId: 12345n,
            sellerWalletAddress: '0xSELLER123',
            txHash: '0xTX',
            status: 'listing',
            deleted: false,
            blockNumber: 1,
        };
        const reason = 'test reason';

        mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

        // Chamamos a função privada
        await subscriber.markDeleted(record, reason);

        // O que esperamos na URL
        const expectedUrlStr = 'https://api.test.com/unlock?tokenId=12345&seller=0xSELLER123&reason=test+reason';

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const [calledUrl, calledOptions] = vi.mocked(global.fetch).mock.calls[0];

        // Compara URL
        expect(calledUrl.toString()).toBe(expectedUrlStr);

        // Compara os cabeçalhos de segurança (injetado da variável de ambiente via config)
        expect(calledOptions).toBeDefined();
        expect(calledOptions?.headers).toBeDefined();
        expect((calledOptions?.headers as any)['x-internal-secret']).toBe('SUPER_SECRET_TOKEN_123');
        expect(calledOptions?.method).toBe('GET');
    });

    it('Cenário B (Resiliência): Captura erro (e.g. timeout ou network fail) e não dá crash', async () => {
        const record = {
            id: 888,
            tokenId: 54321n,
            sellerWalletAddress: '0xSELLER456',
            txHash: '0xTX2',
            status: 'listing',
            deleted: false,
            blockNumber: 2,
        };
        const reason = 'timeout test reason';

        mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

        // Simulamos o global.fetch lançando um erro severo
        global.fetch = vi.fn(() => Promise.reject(new Error('Network failure simulation'))) as any;

        // Se ocorrer uma unhandled promise rejection, o teste falhará ou a promise não resolverá.
        // A própria chamada não deve dar throw.
        await expect(subscriber.markDeleted(record, reason)).resolves.not.toThrow();

        // Verificamos se o log.error foi chamado relatando o problema do fetch
        expect(mockLogger.error).toHaveBeenCalled();
        const errorLogCall = mockLogger.error.mock.calls.find((call: any[]) =>
            call[0].includes('Failed to send unlock notification for token 54321') ||
            call[0].includes('fetch configuration error')
        );
        expect(errorLogCall).toBeDefined();
    });
});
