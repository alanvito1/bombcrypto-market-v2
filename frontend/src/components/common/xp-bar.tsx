import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useAccount } from "../../context/account";
import { getAPI } from "../../utils/helper";

interface GamificationStats {
  rank: string;
  currentXP: number;
  nextLevelXP: number;
  progressPercent: number;
  discountActive: number;
  color: string;
}

const XPBar: React.FC = () => {
  const { auth, network } = useAccount();
  const [stats, setStats] = useState<GamificationStats | null>(null);

  useEffect(() => {
    if (auth.address && network) {
      fetchStats();
    }
  }, [auth.address, network]);

  const fetchStats = async () => {
    try {
      const api = getAPI(network);
      const baseUrl = api.endsWith('/') ? api : api + '/';
      const url = `${baseUrl}users/${auth.address}/gamification`;
      const res = await axios.get(url);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch gamification stats", err);
    }
  };

  if (!stats || !auth.logged) return null;

  return (
    <Wrapper>
      <RankInfo>
        <RankName style={{ color: stats.color }}>{stats.rank}</RankName>
        {stats.discountActive > 0 && <Discount> -{stats.discountActive}% Fee</Discount>}
      </RankInfo>
      <ProgressBarContainer title={`${stats.currentXP}/${stats.nextLevelXP} XP to next rank`}>
        <ProgressBar width={stats.progressPercent} color={stats.color} />
      </ProgressBarContainer>
      <XPText>{stats.currentXP} / {stats.nextLevelXP} XP</XPText>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  height: 36px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const RankInfo = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0.75rem;
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const RankName = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
  text-transform: uppercase;
  text-shadow: 0 0 5px rgba(0,0,0,0.5);
`;

const Discount = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.success};
  margin-left: 0.5rem;
`;

const ProgressBarContainer = styled.div`
  width: 120px;
  height: 8px;
  background: ${({ theme }) => theme.colors.surfaceLighter};
  border-radius: 4px;
  overflow: hidden;
  margin-right: 0.75rem;
  position: relative;
`;

const ProgressBar = styled.div<{ width: number; color: string }>`
  width: ${({ width }) => width}%;
  background: ${({ color }) => color};
  height: 100%;
  transition: width 0.5s ease-in-out;
  box-shadow: 0 0 10px ${({ color }) => color};
`;

const XPText = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 80px;
  text-align: right;
`;

export default XPBar;
