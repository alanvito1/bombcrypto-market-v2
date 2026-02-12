export interface UserGamification {
    walletAddress: string;
    xp: number;
    level: number;
    updatedAt: Date;
}

export interface UserGamificationStats extends UserGamification {
    nextLevelXp: number;
    progress: number; // 0-100
}

const XP_CONSTANT = 50;

/**
 * Calculate level based on XP
 * Formula: XP = Level * (Level - 1) * 50
 * Quadratic equation to solve for Level: 50L^2 - 50L - XP = 0
 * L = (50 + sqrt(2500 + 200 * XP)) / 100
 */
export function calculateLevel(xp: number): number {
    if (xp <= 0) return 1;
    // Solving 50 * L * (L - 1) <= XP for max L
    // Approx L ~ sqrt(XP / 50)
    // Let's use a simpler discrete lookup or just iterative for small levels,
    // but formula is better.
    // 50L^2 - 50L - XP = 0
    // L = (50 + sqrt((-50)^2 - 4*50*(-XP))) / (2*50)
    // L = (50 + sqrt(2500 + 200*XP)) / 100
    // L = 0.5 + sqrt(0.25 + 0.02*XP)

    // However, the formula XP = Level * (Level - 1) * 50 means:
    // Level 1 starts at 0 XP
    // Level 2 starts at 100 XP
    // Level 3 starts at 300 XP

    const level = Math.floor(0.5 + Math.sqrt(0.25 + (xp / 50)));
    return Math.max(1, level);
}

export function calculateXpForLevel(level: number): number {
    if (level <= 1) return 0;
    return level * (level - 1) * XP_CONSTANT;
}

export function getGamificationStats(user: UserGamification): UserGamificationStats {
    const currentLevelXp = calculateXpForLevel(user.level);
    const nextLevelXp = calculateXpForLevel(user.level + 1);
    const xpInLevel = user.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;

    const progress = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

    return {
        ...user,
        nextLevelXp,
        progress
    };
}
