import React from "react";
import styled from "styled-components";
import BhouseCard from "../cards/market-bhouse";
import EmptyState from "../common/empty-state";
import SearchIcon from "../icons/search";

interface HouseData {
  id: string | number;
  token_id: string | number;
  rarity: number;
  capacity: number;
  seller_wallet_address: string;
  amount: string | number | bigint;
  isToken?: string;
}

interface MarketBhouseListProps {
  data: HouseData[];
}

const Bhouse: React.FC<MarketBhouseListProps> = ({ data }) => {
  return (
    <Wrap>
      {data && data.length === 0 && (
        <EmptyState message="No houses found" icon={<SearchIcon />} />
      )}
      <List>
        {data &&
          data &&
          data.map((element) => (
            <BhouseCard key={element.id} data={element} />
          ))}
      </List>
    </Wrap>
  );
};

const Wrap = styled.div`
  min-height: 80vh;
`;

const List = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

export default Bhouse;
