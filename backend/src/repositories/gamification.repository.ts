import {DatabasePool} from '@/infrastructure/database/postgres';
import {Logger} from '@/utils/logger';
import {UserGamification, calculateLevel} from '@/domain/models/gamification';
import {IGamificationRepository} from '@/domain/interfaces/repository';

export class GamificationRepository implements IGamificationRepository {
    constructor(
        private db: DatabasePool,
        private logger: Logger
    ) {}

    async getByWallet(walletAddress: string): Promise<UserGamification> {
        const sql = `
            SELECT wallet_address, xp, level, updated_at
            FROM user_gamification
            WHERE wallet_address = $1
        `;
        const result = await this.db.query(sql, [walletAddress]);

        if (result.rows.length === 0) {
            return {
                walletAddress,
                xp: 0,
                level: 1,
                updatedAt: new Date(),
            };
        }

        const row = result.rows[0];
        return {
            walletAddress: row.wallet_address,
            xp: Number(row.xp),
            level: row.level,
            updatedAt: row.updated_at,
        };
    }

    async upsertXP(walletAddress: string, xpDelta: number): Promise<UserGamification> {
        // Atomic increment of XP
        // Default level 1 for new users
        const sql = `
            INSERT INTO user_gamification (wallet_address, xp, level, updated_at)
            VALUES ($1, $2, 1, NOW())
            ON CONFLICT (wallet_address)
            DO UPDATE SET
                xp = user_gamification.xp + $2,
                updated_at = NOW()
            RETURNING xp
        `;
        const result = await this.db.query(sql, [walletAddress, xpDelta]);
        const newXp = Number(result.rows[0].xp);

        // Calculate correct level based on new XP
        const newLevel = calculateLevel(newXp);

        // Update level if needed
        const updateLevelSql = `
            UPDATE user_gamification
            SET level = $2
            WHERE wallet_address = $1 AND level != $2
            RETURNING wallet_address, xp, level, updated_at
        `;
        const updateResult = await this.db.query(updateLevelSql, [walletAddress, newLevel]);

        if (updateResult.rows.length > 0) {
             const row = updateResult.rows[0];
             this.logger.info(`User ${walletAddress} leveled up to ${newLevel}!`);
             return {
                walletAddress: row.wallet_address,
                xp: Number(row.xp),
                level: row.level,
                updatedAt: row.updated_at,
            };
        }

        // If level didn't change, re-fetch to get complete object (or construct it)
        // We know xp and level (implied old level was same as new level)
        // But for consistency let's just fetch or construct
        return {
            walletAddress,
            xp: newXp,
            level: newLevel,
            updatedAt: new Date()
        };
    }
}

export function createGamificationRepository(
    db: DatabasePool,
    logger: Logger
): IGamificationRepository {
    return new GamificationRepository(db, logger);
}
