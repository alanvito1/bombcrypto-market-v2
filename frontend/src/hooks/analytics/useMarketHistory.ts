import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAccount } from '../../context/account';
import { getAPI, bcoinFormat, mapRarity } from '../../utils/helper';
import { BHero } from '../../types/hero';

export interface PricePoint {
  time: number; // Unix timestamp
  value: number; // Price
}

export interface RarityData {
  name: string;
  value: number;
  color: string;
}

export interface Sale {
  id: string;
  itemName: string;
  price: number;
  currency: string;
  buyer: string;
  seller: string;
  timestamp: number;
  isWhale: boolean;
  type: 'Hero' | 'House';
  rarity?: string;
}

export interface MarketHistoryData {
  priceHistory: PricePoint[];
  rarityDistribution: RarityData[];
  recentSales: Sale[];
  loading: boolean;
  error: string | null;
}

const RARITY_COLORS: Record<string, string> = {
  'Common': '#9ca3af',
  'Rare': '#3b82f6',
  'Super Rare': '#8b5cf6',
  'Epic': '#d946ef',
  'Legend': '#f59e0b',
  'SP Legend': '#ef4444',
};

export const useMarketHistory = (): MarketHistoryData => {
  const { network } = useAccount();
  const [data, setData] = useState<MarketHistoryData>({
    priceHistory: [],
    rarityDistribution: [],
    recentSales: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = getAPI(network);
        // Fetch last 100 sold items
        const response = await axios.get(
          `${baseUrl}transactions/heroes/search?status=sold&size=100&order_by=desc:updated_at`
        );

        const transactions: BHero[] = response.data.transactions || [];

        // Process Price History
        // Sort by time ascending for the chart
        const sortedTx = [...transactions].sort((a, b) =>
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        );

        const priceHistory = sortedTx.map(tx => ({
          time: Math.floor(new Date(tx.updated_at).getTime() / 1000), // Unix timestamp in seconds
          value: Number(bcoinFormat(tx.amount))
        }));

        // Process Rarity Distribution
        const rarityCounts: Record<string, number> = {};
        transactions.forEach(tx => {
          const rarityName = mapRarity(tx.rarity) || 'Unknown';
          rarityCounts[rarityName] = (rarityCounts[rarityName] || 0) + 1;
        });

        const rarityDistribution = Object.entries(rarityCounts).map(([name, value]) => ({
          name,
          value,
          color: RARITY_COLORS[name] || '#ffffff'
        })).sort((a, b) => b.value - a.value); // Sort by count descending

        // Process Recent Sales for Feed
        const recentSales: Sale[] = transactions.map(tx => {
            const price = Number(bcoinFormat(tx.amount));
            return {
                id: tx.tx_hash,
                itemName: `Hero #${tx.token_id}`,
                price: price,
                currency: tx.pay_token || 'BCOIN',
                buyer: tx.buyer_wallet_address,
                seller: tx.seller_wallet_address,
                timestamp: new Date(tx.updated_at).getTime(),
                isWhale: price > 500, // Threshold for whale alert
                type: 'Hero',
                rarity: mapRarity(tx.rarity)
            };
        }); // Already sorted by desc updated_at from API

        setData({
          priceHistory,
          rarityDistribution,
          recentSales,
          loading: false,
          error: null,
        });

      } catch (err) {
        console.error("Failed to fetch market history", err);
        setData(prev => ({ ...prev, loading: false, error: "Failed to load market history" }));
      }
    };

    fetchData();
  }, [network]);

  return data;
};
