import {DatabasePool} from '@/infrastructure/database/postgres';
import {Logger} from '@/utils/logger';
import {UserGamification, getRankFromXP} from '@/domain/models/gamification';
import {IGamificationRepository} from '@/domain/interfaces/repository';

export class GamificationRepository implements IGamificationRepository {
    constructor(
        private db: DatabasePool,
        private logger: Logger
    ) {}

    async getByWallet(walletAddress: string): Promise<UserGamification> {
        // Use standard SQL. The table is expected to be in the search path (bsc or polygon).
        const sql = `
            SELECT wallet_address, current_xp, current_rank, total_fees_saved, updated_at
            FROM user_gamification
            WHERE wallet_address = $1
        `;
        const result = await this.db.query(sql, [walletAddress]);

        if (result.rows.length === 0) {
            return {
                walletAddress,
                xp: 0,
                level: 1, // Default level/rank
                currentRank: 0,
                totalFeesSaved: '0',
                updatedAt: new Date(),
            };
        }

        const row = result.rows[0];
        return {
            walletAddress: row.wallet_address,
            xp: Number(row.current_xp),
            level: row.current_rank + 1, // Map rank 0-5 to level 1-6 for compatibility
            currentRank: row.current_rank,
            totalFeesSaved: row.total_fees_saved,
            updatedAt: row.updated_at,
        };
    }

    async upsertXP(walletAddress: string, xpDelta: number): Promise<UserGamification> {
        // Atomic increment of XP
        // Default rank 0 (Common) for new users
        // We use parameterized query to prevent SQL injection

        // 1. Insert or Update XP
        const upsertSql = `
            INSERT INTO user_gamification (wallet_address, current_xp, current_rank, total_fees_saved, updated_at)
            VALUES ($1, $2, 0, 0, NOW())
            ON CONFLICT (wallet_address)
            DO UPDATE SET
                current_xp = user_gamification.current_xp + $2,
                updated_at = NOW()
            RETURNING current_xp, current_rank, total_fees_saved, updated_at
        `;

        const result = await this.db.query(upsertSql, [walletAddress, xpDelta]);
        const row = result.rows[0];
        const newXp = Number(row.current_xp);
        const currentRankId = row.current_rank;

        // 2. Calculate new rank based on new XP
        const newRank = getRankFromXP(newXp);

        // 3. Update rank if changed
        if (newRank.id !== currentRankId) {
             const updateRankSql = `
                UPDATE user_gamification
                SET current_rank = $2, updated_at = NOW()
                WHERE wallet_address = $1
                RETURNING wallet_address, current_xp, current_rank, total_fees_saved, updated_at
            `;
            const updateResult = await this.db.query(updateRankSql, [walletAddress, newRank.id]);
            const updatedRow = updateResult.rows[0];

            this.logger.info(`User ${walletAddress} leveled up to Rank ${newRank.name} (${newRank.id})!`);

            return {
                walletAddress: updatedRow.wallet_address,
                xp: Number(updatedRow.current_xp),
                level: updatedRow.current_rank + 1,
                currentRank: updatedRow.current_rank,
                totalFeesSaved: updatedRow.total_fees_saved,
                updatedAt: updatedRow.updated_at,
            };
        }

        return {
            walletAddress,
            xp: newXp,
            level: currentRankId + 1,
            currentRank: currentRankId,
            totalFeesSaved: row.total_fees_saved,
            updatedAt: row.updated_at
        };
    }
}

export function createGamificationRepository(
    db: DatabasePool,
    logger: Logger
): IGamificationRepository {
    return new GamificationRepository(db, logger);
}
