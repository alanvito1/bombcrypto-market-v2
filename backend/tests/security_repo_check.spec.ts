import { describe, it, expect, vi } from 'vitest';
import { HeroTransactionRepository } from '../src/repositories/hero-transaction.repository';
import { createEmptyHeroTxFilterContext } from '../src/domain/models/hero';
import { Logger } from '../src/utils/logger';
import { DatabasePool } from '../src/infrastructure/database/postgres';

describe('HeroTransactionRepository Security', () => {
    it('should sanitize orderBy to prevent SQL injection', async () => {
        const mockQuery = vi.fn().mockResolvedValue({ rows: [], rowCount: 0 });
        const mockDb = {
            query: mockQuery
        } as unknown as DatabasePool;

        const mockLogger = {
            info: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn()
        } as unknown as Logger;

        const repo = new HeroTransactionRepository(mockDb, mockLogger);
        const context = createEmptyHeroTxFilterContext();
        context.orderBy = 'id; DROP TABLE hero_orders; --';
        context.orderDirection = 'desc';

        await repo.filter(context);

        expect(mockQuery).toHaveBeenCalled();
        const sql = mockQuery.mock.calls[0][0]; // First argument of first call

        // Should fallback to updated_at
        expect(sql).toContain('ORDER BY updated_at DESC');
        expect(sql).not.toContain('DROP TABLE');
    });
});
