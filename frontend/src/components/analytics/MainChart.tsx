import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries, UTCTimestamp } from 'lightweight-charts';
import { PricePoint } from '../../hooks/analytics/useMarketHistory';

interface MainChartProps {
  priceHistory: PricePoint[];
  loading?: boolean;
}

const MainChart: React.FC<MainChartProps> = ({ priceHistory, loading = false }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || loading || priceHistory.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(0, 255, 65, 0.56)',
      bottomColor: 'rgba(0, 255, 65, 0.04)',
      lineColor: 'rgba(0, 255, 65, 1)',
      lineWidth: 2,
    });

    // Ensure unique timestamps. If multiple sales occur at the same second, we keep the first one found.
    const seen = new Set();
    const uniqueData = priceHistory
      .filter(item => {
        const duplicate = seen.has(item.time);
        seen.add(item.time);
        return !duplicate;
      })
      .map(item => ({
        time: item.time as UTCTimestamp,
        value: item.value
      }));

    areaSeries.setData(uniqueData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [priceHistory, loading]);

  if (loading) return <div className="w-full h-[400px] flex items-center justify-center text-gray-500 font-mono">LOADING CHART DATA...</div>;
  if (priceHistory.length === 0) return <div className="w-full h-[400px] flex items-center justify-center text-gray-500 font-mono">NO SALES DATA FOUND</div>;

  return <div ref={chartContainerRef} className="w-full h-[400px]" />;
};

export default MainChart;
