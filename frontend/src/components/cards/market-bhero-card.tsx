import React from "react";
import styled from "styled-components";
import { Tag } from "../common/style";
import { mapRarity, bcoinFormat, mapTag } from "../../utils/helper";
import { HeroIcon } from "../hero";
import { IMAGE_TOKEN_SHOW } from "../../utils/config";
import { useHistory } from "react-router-dom";

interface HeroData {
  token_id: string | number;
  rarity: number;
  amount: string | number | bigint;
  isToken?: string;
  skin: number;
  color: number;
}

interface BHeroCardProps {
  data: HeroData;
  network?: string;
}

const BHeroFullWidth: React.FC<BHeroCardProps> = ({ data }) => {
  const history = useHistory();

  const handleNavigate = () => {
    history.push(`/market/bhero/${data.token_id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNavigate();
    }
  };

  return (
    <Item
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      aria-label={`View details for BHero #${data.token_id}`}
      onKeyDown={handleKeyDown}
    >
      <div className="header">
        <Tag>#{data.token_id}</Tag>
        <Tag className={mapTag[data.rarity]}>{mapRarity(data.rarity)}</Tag>
      </div>

      <HeroIcon data={data} />
      <div className="footer">
        <img
          src={IMAGE_TOKEN_SHOW[data?.isToken || ""] || "/icons/token.png"}
          alt=""
        />
        <b>{bcoinFormat(data.amount)} </b>
        <div className="toolip">{bcoinFormat(data.amount)}</div>
        <span>$3200</span>
      </div>
    </Item>
  );
};

const Item = styled.div`
  width: 14.5rem;
  border: solid 1px #343849;
  background-color: #191b24;
  padding: 0.563rem 0.438rem;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
  &:hover, &:focus-visible {
    background: #000000;
    outline: none;
  }
  &:focus-visible {
    border-color: #ff973a;
    box-shadow: 0 0 0 1px #ff973a;
  }
  .header {
    display: flex;
    justify-content: space-between;
    & > div {
      margin: 0;
    }
  }
  .icon-hero {
    margin-top: 3.063rem;
    display: flex;
    justify-content: center;

    img {
      width: 6.875rem;
      height: 9rem;
    }
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2.563rem;
    margin-bottom: 1.125rem;
    img {
      width: 1.438rem;
      height: 1.563rem;
    }
    b {
      font-size: 1.25rem;
      font-weight: bold;
      line-height: 1.3;
      color: #fff;
      margin: 0px 0.438rem;
    }
    span {
      font-size: 0.938rem;
      line-height: 1.3;
      color: #fff;
    }
  }
`;

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders.
// This component is rendered in a large list, so avoiding re-renders when data hasn't changed is critical for performance.
export default React.memo(BHeroFullWidth);
