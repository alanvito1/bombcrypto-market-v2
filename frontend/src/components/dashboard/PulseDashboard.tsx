import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { bcoinFormat, mapRarity } from '../../utils/helper';
import { BHero } from '../../types/hero';
import _ from 'lodash';

interface PulseDashboardProps {
  data: any[];
  totalCount: number | undefined;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PulseDashboard: React.FC<PulseDashboardProps> = ({ data, totalCount }) => {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Cast data to BHero array
    const heroes = data as BHero[];

    let totalVolume = 0;
    const prices: number[] = [];
    const validHeroes: Array<{ hero: BHero; price: number; statScore: number; date: string }> = [];

    // First pass: Calculate Price and StatScore
    heroes.forEach((hero) => {
      const price = bcoinFormat(hero.amount);
      if (price > 0) {
        totalVolume += price;
        prices.push(price);

        const statScore = (hero.bomb_power || 0) + (hero.speed || 0) + (hero.stamina || 0) + (hero.bomb_count || 0) + (hero.bomb_range || 0);

        // Handle date parsing safely
        let date = new Date().toISOString().split('T')[0];
        if (hero.block_timestamp) {
           try {
             // Try to parse block_timestamp. If it's a number string (timestamp), handle it?
             // Assuming ISO string or compatible format based on existing code usage
             const d = new Date(hero.block_timestamp);
             if (!isNaN(d.getTime())) {
                date = d.toISOString().split('T')[0];
             }
           } catch (e) {
             console.warn("Invalid date for hero", hero.id);
           }
        }

        validHeroes.push({
          hero,
          price,
          statScore,
          date
        });
      }
    });

    if (prices.length === 0) return null;

    prices.sort((a, b) => a - b);
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    const avgPrice = totalVolume / prices.length;
    const medianPrice = prices[Math.floor(prices.length / 2)];

    // Calculate Median StatScore per Rarity for segmentation
    const heroesByRarity = _.groupBy(validHeroes, (h) => h.hero.rarity);
    const medianStatsByRarity: Record<string, number> = {};

    Object.keys(heroesByRarity).forEach(rarity => {
        const scores = heroesByRarity[rarity].map(h => h.statScore).sort((a, b) => a - b);
        medianStatsByRarity[rarity] = scores[Math.floor(scores.length / 2)];
    });

    // Prepare Chart Data
    // 1. Scatter: Price vs StatScore
    const scatterData = validHeroes.map(h => ({
      statScore: h.statScore,
      price: h.price,
      rarity: mapRarity(h.hero.rarity),
      rarityId: h.hero.rarity
    }));

    // 2. Line Chart: Avg Price History by Rarity
    // Group by Date + Rarity
    const groupedByDateRarity = _.groupBy(validHeroes, (h) => `${h.date}-${h.hero.rarity}`);

    const timeSeriesDataMap: Record<string, any> = {};
    const dates = new Set<string>();

    Object.keys(groupedByDateRarity).forEach(key => {
        const group = groupedByDateRarity[key];
        const [date, rarityStr] = key.split('-');
        const rarity = parseInt(rarityStr);
        const avgPriceGroup = _.meanBy(group, 'price');

        if (!timeSeriesDataMap[date]) {
            timeSeriesDataMap[date] = { date };
        }
        dates.add(date);
        timeSeriesDataMap[date][mapRarity(rarity)] = avgPriceGroup;
    });

    const lineChartData = Array.from(dates).sort().map(date => timeSeriesDataMap[date]);

    // Get unique rarities present in the data for Line Chart Series
    const presentRarities = Array.from(new Set(validHeroes.map(h => h.hero.rarity))).sort((a,b) => a-b);

    return {
      volume: totalVolume,
      avgPrice,
      minPrice,
      maxPrice,
      medianPrice,
      count: heroes.length,
      scatterData,
      lineChartData,
      presentRarities
    };
  }, [data]);

  if (!data || data.length === 0 || !metrics) {
    return (
      <Container>
        <NoData>No data available for analysis. Please check filters or try again later.</NoData>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>📈 Pulse Strategic Dashboard</Title>
        <Subtitle>Analysis of {metrics.count} Listings (Avg Price & Efficiency)</Subtitle>
      </Header>

      <Grid>
        <Card>
          <Label>Snapshot Volume</Label>
          <Value>{metrics.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
          <Unit>BCOIN</Unit>
        </Card>
        <Card>
          <Label>Avg. Listing Price</Label>
          <Value>{metrics.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Value>
          <Unit>BCOIN</Unit>
        </Card>
        <Card>
          <Label>Median Price</Label>
          <Value>{metrics.medianPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Value>
          <Unit>BCOIN</Unit>
        </Card>
         <Card>
          <Label>Floor Price</Label>
          <Value>{metrics.minPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Value>
          <Unit>BCOIN</Unit>
        </Card>
      </Grid>

      {totalCount && (
         <GlobalStats>
             Global Marketplace Listings: <strong>{totalCount.toLocaleString()}</strong>
         </GlobalStats>
      )}

      <ChartsRow>
        <ChartCardFull>
           <ChartTitle>Average Listing Price History (by Rarity)</ChartTitle>
           <ChartSubtitle>Trends of asking prices over time based on listing creation date.</ChartSubtitle>
           <ResponsiveContainer width="100%" height={400}>
             <LineChart data={metrics.lineChartData}>
               <CartesianGrid strokeDasharray="3 3" stroke="#3f445b" />
               <XAxis
                dataKey="date"
                stroke="#7680ab"
                tick={{fontSize: 12}}
               />
               <YAxis stroke="#7680ab" />
               <Tooltip
                contentStyle={{ backgroundColor: '#242735', borderColor: '#3f445b', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#8884d8' }}
               />
               <Legend wrapperStyle={{ paddingTop: '20px' }} />
               {metrics.presentRarities.map((rarityId, index) => (
                   <Line
                    key={rarityId}
                    type="monotone"
                    dataKey={mapRarity(rarityId)}
                    stroke={COLORS[rarityId % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                   />
               ))}
             </LineChart>
           </ResponsiveContainer>
        </ChartCardFull>

        <ChartCardFull>
           <ChartTitle>Price Efficiency (Price vs Stats)</ChartTitle>
           <ChartSubtitle>Correlation between Hero Stats (Power + Speed + Stamina + etc) and Listing Price.</ChartSubtitle>
           <ResponsiveContainer width="100%" height={400}>
             <ScatterChart>
               <CartesianGrid strokeDasharray="3 3" stroke="#3f445b" />
               <XAxis type="number" dataKey="statScore" name="Stat Score" stroke="#7680ab" domain={['dataMin - 5', 'dataMax + 5']} />
               <YAxis type="number" dataKey="price" name="Price" unit=" BCOIN" stroke="#7680ab" />
               <ZAxis type="number" dataKey="rarityId" range={[60, 60]} /> {/* Fixed size dots */}
               <Tooltip
                 cursor={{ strokeDasharray: '3 3' }}
                 contentStyle={{ backgroundColor: '#242735', borderColor: '#3f445b', color: '#fff' }}
               />
               <Legend wrapperStyle={{ paddingTop: '20px' }} />
               {metrics.presentRarities.map((rarityId, index) => (
                 <Scatter
                    key={rarityId}
                    name={mapRarity(rarityId)}
                    data={metrics.scatterData.filter(d => d.rarityId === rarityId)}
                    fill={COLORS[rarityId % COLORS.length]}
                 />
               ))}
             </ScatterChart>
           </ResponsiveContainer>
        </ChartCardFull>
      </ChartsRow>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  animation: fadeIn 0.5s ease-in-out;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  font-size: 1rem;
`;

const ChartSubtitle = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.875rem;
    margin-top: -10px;
    margin-bottom: 20px;
    text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Value = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.75rem;
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: bold;
`;

const Unit = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.75rem;
  opacity: 0.7;
`;

const ChartsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ChartCardFull = styled.div`
  background: ${({ theme }) => theme.colors.surfaceLight};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  min-height: 450px;
  width: 100%;
`;

const ChartTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: normal;
  text-align: center;
`;

const NoData = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;
`;

const GlobalStats = styled.div`
    background: ${({ theme }) => theme.colors.surfaceLighter};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: 4px;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: center;
    strong {
        color: ${({ theme }) => theme.colors.text};
        margin-left: 5px;
    }
`;

export default PulseDashboard;
