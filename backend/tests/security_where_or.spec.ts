import { describe, it, expect, vi } from 'vitest';
import { createQueryBuilder } from '../src/infrastructure/database/query-builder';
import { HeroTransactionRepository } from '../src/repositories/hero-transaction.repository';
import { createEmptyHeroTxFilterContext } from '../src/domain/models/hero';
import { DatabasePool } from '../src/infrastructure/database/postgres';
import { Logger } from '../src/utils/logger';

describe('QueryBuilder Security', () => {
    it('should correctly parameterize whereOr conditions', () => {
        const qb = createQueryBuilder();
        qb.from('test_table');

        const conditions = ['col1 = $?', 'col2 LIKE $?'];
        const values = ['val1', '%val2%'];

        qb.whereOr(conditions, values);

        const result = qb.build();

        expect(result.sql).toContain('WHERE (col1 = $1 OR col2 LIKE $2)');
        expect(result.params).toEqual(['val1', '%val2%']);
    });

    it('should handle existing params correctly', () => {
        const qb = createQueryBuilder();
        qb.from('test_table');

        qb.where('status = $?', 'active');

        const conditions = ['col1 = $?'];
        const values = ['val1'];

        qb.whereOr(conditions, values);

        const result = qb.build();

        expect(result.sql).toContain('WHERE status = $1 AND (col1 = $2)');
        expect(result.params).toEqual(['active', 'val1']);
    });
});

describe('HeroTransactionRepository Security', () => {
    it('should use parameters for abilitiesHeroS filter', async () => {
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
        context.abilitiesHeroS = [123, 456];

        await repo.filter(context);

        expect(mockQuery).toHaveBeenCalled();
        const sql = mockQuery.mock.calls[0][0];
        const params = mockQuery.mock.calls[0][1];

        expect(sql).toContain('abilities_hero_s LIKE $');
        expect(params).toContain('%123%');
        expect(params).toContain('%456%');
    });
});
