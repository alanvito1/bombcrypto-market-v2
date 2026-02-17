import React from 'react';
import styled from 'styled-components';

interface RankBadgeProps {
  rankName?: string;
  color?: string;
  mini?: boolean;
}

const RankBadge: React.FC<RankBadgeProps> = ({ rankName, color, mini }) => {
  if (!rankName) return null;

  return (
    <Badge color={color || '#808080'} mini={mini}>
      {rankName}
    </Badge>
  );
};

const Badge = styled.div<{ color: string; mini?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => color}20; // 20% opacity
  border: 1px solid ${({ color }) => color};
  color: ${({ color }) => color};
  border-radius: 4px;
  padding: ${({ mini }) => (mini ? '0.1rem 0.3rem' : '0.25rem 0.5rem')};
  font-size: ${({ mini }) => (mini ? '0.7rem' : '0.875rem')};
  font-weight: bold;
  text-transform: uppercase;
  margin-left: 0.5rem;
  box-shadow: 0 0 5px ${({ color }) => color}40;
`;

export default RankBadge;
