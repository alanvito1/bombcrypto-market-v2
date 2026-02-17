export interface UserGamification {
    walletAddress: string;
    xp: number;
    level: number; // Deprecated, kept for compatibility or used as rank index
    currentRank: number; // 0-5
    totalFeesSaved: string; // Decimal string
    updatedAt: Date;
}

export interface Rank {
    id: number;
    name: string;
    threshold: number;
    discountPercent: number;
    color: string;
}

export const RANKS: Rank[] = [
    { id: 0, name: 'Common', threshold: 0, discountPercent: 0, color: '#808080' },
    { id: 1, name: 'Rare', threshold: 100, discountPercent: 1.5, color: '#3aca22' }, // Matching theme.colors.success or generic green
    { id: 2, name: 'Super Rare', threshold: 500, discountPercent: 3.0, color: '#0000FF' }, // Blue
    { id: 3, name: 'Epic', threshold: 1300, discountPercent: 6.5, color: '#800080' }, // Purple
    { id: 4, name: 'Legend', threshold: 2900, discountPercent: 9.0, color: '#FFD700' }, // Gold
    { id: 5, name: 'Super Legend', threshold: 5900, discountPercent: 11.0, color: '#FF0000' } // Red
];

export interface UserGamificationStats extends UserGamification {
    rank: string;
    rankId: number;
    nextLevelXp: number;
    progressPercent: number; // 0-100
    discountActive: number;
    color: string;
}

export function getRankFromXP(xp: number): Rank {
    // Iterate backwards to find the highest rank threshold met
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (xp >= RANKS[i].threshold) {
            return RANKS[i];
        }
    }
    return RANKS[0];
}

export function getNextRank(currentRankId: number): Rank | null {
    if (currentRankId >= RANKS.length - 1) return null;
    return RANKS[currentRankId + 1];
}

export function getGamificationStats(user: UserGamification): UserGamificationStats {
    const currentRank = getRankFromXP(user.xp);
    const nextRank = getNextRank(currentRank.id);

    let nextLevelXp = 0;
    let progressPercent = 100;

    if (nextRank) {
        nextLevelXp = nextRank.threshold;
        const currentThreshold = currentRank.threshold;
        const xpInLevel = user.xp - currentThreshold;
        const xpNeeded = nextRank.threshold - currentThreshold;
        if (xpNeeded > 0) {
            progressPercent = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));
        } else {
            progressPercent = 100;
        }
    } else {
        // Max rank
        nextLevelXp = currentRank.threshold; // Or maintain current
    }

    return {
        ...user,
        rank: currentRank.name,
        rankId: currentRank.id,
        currentRank: currentRank.id, // Update if mismatch
        discountActive: currentRank.discountPercent,
        nextLevelXp,
        progressPercent,
        color: currentRank.color
    };
}
