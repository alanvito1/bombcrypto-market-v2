import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAccount } from '../../context/account';
import { rest_api } from '../../utils/config';

interface GamificationStats {
    walletAddress: string;
    xp: number;
    level: number;
    nextLevelXp: number;
    progress: number;
}

const BadgeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 15px;
    cursor: help;
    position: relative;

    &:hover .tooltip {
        visibility: visible;
        opacity: 1;
    }
`;

const LevelCircle = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff973a, #ff5e00);
    border: 2px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 1.2rem;
    box-shadow: 0 0 10px rgba(255, 151, 58, 0.5);
    z-index: 2;
`;

const ProgressBarContainer = styled.div`
    width: 60px;
    height: 6px;
    background: #3a3f54;
    border-radius: 3px;
    margin-top: 5px;
    overflow: hidden;
`;

const ProgressBarFill = styled.div<{ progress: number }>`
    height: 100%;
    width: ${props => props.progress}%;
    background: #3aca22;
    transition: width 0.3s ease;
`;

const Tooltip = styled.div`
    visibility: hidden;
    opacity: 0;
    position: absolute;
    top: 100%;
    right: 0;
    background: #191b24;
    border: 1px solid #3f445b;
    padding: 10px;
    border-radius: 8px;
    width: 150px;
    z-index: 100;
    transition: opacity 0.2s;
    margin-top: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    text-align: center;
    pointer-events: none;

    div {
        margin-bottom: 4px;
        font-size: 0.9rem;
        color: #aeb5d1;
    }

    strong {
        color: #fff;
    }
`;

const LevelBadge: React.FC = () => {
    const { auth, network } = useAccount();
    const [stats, setStats] = useState<GamificationStats | null>(null);

    useEffect(() => {
        if (auth.logged && auth.address && network) {
            const apiUrl = rest_api[network];
            const wallet = auth.address.toLowerCase();

            if (!apiUrl) return;

            fetch(`${apiUrl}users/${wallet}/gamification`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch stats');
                    return res.json();
                })
                .then(data => setStats(data))
                .catch(err => {
                    // console.error("Failed to fetch gamification stats", err);
                    setStats({
                        walletAddress: wallet,
                        xp: 0,
                        level: 1,
                        nextLevelXp: 100,
                        progress: 0
                    });
                });
        }
    }, [auth.logged, auth.address, network]);

    if (!stats || !auth.logged) return null;

    return (
        <BadgeContainer>
            <LevelCircle>{stats.level}</LevelCircle>
            <ProgressBarContainer>
                <ProgressBarFill progress={stats.progress} />
            </ProgressBarContainer>
            <Tooltip className="tooltip">
                <div>Level <strong>{stats.level}</strong></div>
                <div>XP: <strong>{stats.xp}</strong></div>
                <div>Next Level: <strong>{stats.nextLevelXp}</strong> XP</div>
            </Tooltip>
        </BadgeContainer>
    );
};

export default LevelBadge;
