import React from 'react';
import { RarityData } from '../../hooks/analytics/useMarketHistory';

interface SalesDistributionProps {
  rarityDistribution: RarityData[];
  loading?: boolean;
}

const SalesDistribution: React.FC<SalesDistributionProps> = ({ rarityDistribution, loading = false }) => {

  if (loading) return <div className="text-gray-500 font-mono text-xs p-4">LOADING DISTRIBUTION...</div>;
  if (rarityDistribution.length === 0) return <div className="text-gray-500 font-mono text-xs p-4">NO DISTRIBUTION DATA</div>;

  const total = rarityDistribution.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-[#111] border border-gray-800 p-4 h-full flex flex-col">
      <div className="text-gray-400 uppercase text-xs tracking-wider mb-4 font-mono">Sales by Rarity (Last 100)</div>
      <div className="flex flex-col gap-3 font-mono text-sm flex-1 overflow-y-auto custom-scrollbar">
        {rarityDistribution.map((item) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-24 text-gray-300 text-xs truncate" title={item.name}>{item.name}</div>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: item.color }}
                />
              </div>
              <div className="w-8 text-right text-gray-400 text-xs">{item.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesDistribution;
