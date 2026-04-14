import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAccount } from '../../context/account';
import { getAPI, bcoinFormat } from '../../utils/helper';

export interface MarketGlobalStats {
  volume24h: number;
  volume7d: number;
  sales24h: number;
  sales7d: number;
  listings: number;
  loading: boolean;
  error: string | null;
}

interface StatsResponse {
  one_day?: {
    count_listing?: number;
    volume_sen?: number | string;
    volume_bcoin?: number | string;
    count_sold?: number;
  };
  seven_days?: {
    count_listing?: number;
    volume_sen?: number | string;
    volume_bcoin?: number | string;
    count_sold?: number;
  };
  thirty_days?: {
    count_listing?: number;
    volume_sen?: number | string;
    volume_bcoin?: number | string;
    count_sold?: number;
  };
  [key: string]: any;
}

export const useMarketStatsGlobal = (): MarketGlobalStats => {
  const { network } = useAccount();
  const [stats, setStats] = useState<MarketGlobalStats>({
    volume24h: 0,
    volume7d: 0,
    sales24h: 0,
    sales7d: 0,
    listings: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = getAPI(network);
        const response = await axios.get<StatsResponse>(`${baseUrl}transactions/heroes/stats`);
        const data = response.data;

        // Parse volume (assuming volume_bcoin is the primary currency for now, or sum both if needed)
        // Note: volume_sen is likely SEN token, volume_bcoin is BCOIN token.
        // For simplicity, we'll track BCOIN volume primarily or combine if prices are comparable?
        // Let's track BCOIN volume as it's the main game token usually.
        // Actually, let's just use BCOIN for now as per "Strategic KPI".

        const vol24h = Number(bcoinFormat(data.one_day?.volume_bcoin || 0));
        const vol7d = Number(bcoinFormat(data.seven_days?.volume_bcoin || 0));

        const sales24h = data.one_day?.count_sold || 0;
        const sales7d = data.seven_days?.count_sold || 0;

        // Listings count seems to be global, available in any timeframe object or maybe just one_day?
        // Based on Statistics component, it uses data[tab].count_listing.
        // count_listing is likely "current active listings", so it should be same across tabs?
        // Let's use one_day.count_listing.
        const listings = data.one_day?.count_listing || 0;

        setStats({
          volume24h: vol24h,
          volume7d: vol7d,
          sales24h: sales24h,
          sales7d: sales7d,
          listings: listings,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error("Failed to fetch market stats", err);
        setStats(prev => ({ ...prev, loading: false, error: "Failed to load market stats" }));
      }
    };

    fetchStats();
  }, [network]);

  return stats;
};
