import React from 'react';
import classNames from 'classnames';
import { Sale } from '../../hooks/analytics/useMarketHistory';

interface LiveSalesFeedProps {
  sales: Sale[];
  loading?: boolean;
}

const LiveSalesFeed: React.FC<LiveSalesFeedProps> = ({ sales, loading = false }) => {
  return (
    <div className="bg-[#111] border border-gray-800 h-full overflow-hidden flex flex-col font-mono text-xs">
      <div className="p-2 border-b border-gray-800 bg-[#0a0a0a] text-gray-400 font-bold flex justify-between sticky top-0 z-10">
        <span>RECENT TRADES</span>
        {loading ? (
            <span className="text-gray-500">LOADING...</span>
        ) : (
            <span className="text-red-500 animate-pulse">● LIVE</span>
        )}
      </div>
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className={classNames(
              "p-2 border-b border-gray-800 flex justify-between items-center hover:bg-gray-900 transition-colors cursor-pointer",
              { "bg-blue-900/20 border-l-4 border-l-blue-500": sale.isWhale }
            )}
          >
            <div className="flex flex-col">
              <span className={classNames("font-bold", { "text-yellow-400": sale.isWhale, "text-gray-300": !sale.isWhale })}>
                {sale.itemName}
              </span>
              <div className="flex gap-2">
                 <span className="text-gray-500 text-[10px]">{new Date(sale.timestamp).toLocaleTimeString()}</span>
                 {sale.rarity && <span className="text-purple-400 text-[10px] uppercase">[{sale.rarity}]</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#00ff41] font-bold">{sale.price} {sale.currency}</div>
              {sale.isWhale && <div className="text-[10px] text-blue-400 uppercase tracking-wide font-bold">WHALE ALERT</div>}
            </div>
          </div>
        ))}
        {!loading && sales.length === 0 && (
            <div className="p-4 text-center text-gray-500">No recent sales found.</div>
        )}
      </div>
    </div>
  );
};

export default LiveSalesFeed;
