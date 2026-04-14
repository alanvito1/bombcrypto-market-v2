import React from 'react';
import { useMarketStatsGlobal } from '../../hooks/analytics/useMarketStatsGlobal';

const MarketOverview: React.FC = () => {
  const stats = useMarketStatsGlobal();

  if (stats.loading) return <div className="text-gray-500 p-4 font-mono text-xs">LOADING DATA...</div>;
  if (stats.error) return <div className="text-red-500 p-4 font-mono text-xs">ERROR: {stats.error}</div>;

  return (
    <div className="grid grid-cols-2 gap-4 text-sm font-mono h-full">
      <div className="bg-[#111] p-4 border border-gray-800 flex flex-col justify-center">
        <div className="text-gray-400 uppercase text-xs tracking-wider mb-1">Volume (24h)</div>
        <div className="text-2xl text-white font-bold text-[#00ff41]">{stats.volume24h.toLocaleString()} BCOIN</div>
      </div>
      <div className="bg-[#111] p-4 border border-gray-800 flex flex-col justify-center">
        <div className="text-gray-400 uppercase text-xs tracking-wider mb-1">Sales (24h)</div>
        <div className="text-2xl text-white font-bold text-[#00ff41]">{stats.sales24h.toLocaleString()}</div>
      </div>
      <div className="bg-[#111] p-4 border border-gray-800 flex flex-col justify-center">
        <div className="text-gray-400 uppercase text-xs tracking-wider mb-1">Total Listings</div>
        <div className="text-xl text-white font-mono">{stats.listings.toLocaleString()}</div>
      </div>
      <div className="bg-[#111] p-4 border border-gray-800 flex flex-col justify-center">
        <div className="text-gray-400 uppercase text-xs tracking-wider mb-1">Volume (7d)</div>
        <div className="text-xl text-white font-mono">{stats.volume7d.toLocaleString()} BCOIN</div>
      </div>
    </div>
  );
};

export default MarketOverview;
