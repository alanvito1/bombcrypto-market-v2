import React from 'react';
import TickerTape from '../../components/analytics/TickerTape';
import MainChart from '../../components/analytics/MainChart';
import MarketOverview from '../../components/analytics/MarketOverview';
import LiveSalesFeed from '../../components/analytics/LiveSalesFeed';
import SalesDistribution from '../../components/analytics/SalesDistribution';
import { useMarketHistory } from '../../hooks/analytics/useMarketHistory';

const MarketAnalyticsDashboard: React.FC = () => {
  const { priceHistory, rarityDistribution, recentSales, loading } = useMarketHistory();

  return (
    <div className="bg-[#050505] text-white font-sans flex flex-col min-h-[calc(100vh-80px)]">
      <TickerTape />

      <div className="flex-1 p-4 grid grid-cols-12 gap-4">
        {/* Left Panel: Market Overview & Distribution (3 cols) */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-4">
          <div className="h-auto">
            <MarketOverview />
          </div>
          <div className="flex-1 min-h-[300px]">
            <SalesDistribution rarityDistribution={rarityDistribution} loading={loading} />
          </div>
        </div>

        {/* Center Panel: Chart (6 cols) */}
        <div className="col-span-12 xl:col-span-6 flex flex-col gap-4">
          <div className="bg-[#111] border border-gray-800 p-4 relative flex-1 flex flex-col">
            <div className="text-gray-400 mb-2 font-bold flex justify-between items-center">
              <span className="text-lg text-white">PRICE TREND (LAST 100 SALES)</span>
              <div className="flex gap-2 text-xs font-mono">
                 {/* Filters could go here in future */}
                 <span className="text-[#00ff41]">BCOIN</span>
              </div>
            </div>
            {/* Chart Container */}
            <div className="w-full flex-1 min-h-[400px]">
              <MainChart priceHistory={priceHistory} loading={loading} />
            </div>
          </div>
        </div>

        {/* Right Panel: Live Sales (3 cols) */}
        <div className="col-span-12 xl:col-span-3 h-[800px] xl:h-auto">
          <LiveSalesFeed sales={recentSales} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default MarketAnalyticsDashboard;
