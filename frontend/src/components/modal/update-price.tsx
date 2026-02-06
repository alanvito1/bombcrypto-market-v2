import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import styled from "styled-components";
import { useContract } from "../../context/smc";
import { SmartContracts, NETWORK, IMAGE_TOKEN_SHOW } from "../../utils/config";
import Close from "../icons/close";
import { useAccount } from "../../context/account";
import { Modal } from "antd";

interface UpdatePriceModalData {
  id: string | number;
  token_id?: string | number;
  isToken?: string; // Token address
  [key: string]: any;
}

interface UpdatePriceModalProps {
  data: UpdatePriceModalData;
  hide: () => void;
  minPrice: number;
  setStatus: (status: any) => void;
  name: string;
  isShowing: boolean;
}

const UpdatePriceModal: React.FC<UpdatePriceModalProps> = ({ data, hide, minPrice, setStatus, name, isShowing }) => {
  const id = data.token_id || data.id;
  const [price, setPrice] = useState<number | undefined>();
  const {
    updateOrderPrice,
    updateOrderPriceBhouse,
    BcoinAllowance,
    BcoinApprove,
    SenAllowance,
    SenApprove
  } = useContract();

  const [isApprove, setIsApprove] = useState(false);
  const [approving, setApproving] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const tokenAddress = data.isToken || SmartContracts.bcoin.address;
  const isBcoin = tokenAddress.toLowerCase() === SmartContracts.bcoin.address.toLowerCase() ||
                  tokenAddress.toLowerCase() === SmartContracts.bcoinMatic.address.toLowerCase() ||
                  tokenAddress === "0x0000000000000000000000000000000000000000";

  const tokenSymbol = isBcoin ? "BCOIN" : "SEN";
  const tokenIcon = IMAGE_TOKEN_SHOW[tokenAddress] || "/icons/token.png";

  const checkAllowance = async () => {
    try {
      let allowance = "0";
      if (isBcoin) {
        allowance = await BcoinAllowance();
      } else {
        allowance = await SenAllowance();
      }
      if (mountedRef.current) {
        // Assuming allowance > 0 implies sufficiently approved (usually infinite)
        // Since user sets approval once.
        setIsApprove(Number(allowance) > 0);
      }
    } catch (e) {
      console.error("Failed to check allowance", e);
    }
  };

  useEffect(() => {
    checkAllowance();
  }, [isBcoin]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPrice(Number(value));
  };

  const isSellable = price !== undefined && price >= minPrice;
  const updateFee = price ? (price * 1) / 100 : 0; // 1% fee

  const handleApprove = async () => {
    setApproving(true);
    try {
      if (isBcoin) {
        await BcoinApprove();
      } else {
        await SenApprove();
      }
      await checkAllowance();
    } catch (e) {
      console.error(e);
    }
    if (mountedRef.current) {
      setApproving(false);
    }
  };

  const handleUpdate = async () => {
    if (!price && isSellable) return;
    hide();

    if (name === "BHouse") {
      const status = await updateOrderPriceBhouse(id, String(price!));
      if (mountedRef.current) {
        setStatus(status === "success" ? "update-success" : "fail");
      }
    } else {
      const status = await updateOrderPrice(id, String(price!));
      if (mountedRef.current) {
        setStatus(status === "success" ? "update-success" : "fail");
      }
    }
  };

  return (
    <ContentModal open={isShowing} width={800} footer={false} onCancel={hide}>
      <div className="head-modal">
        <img src="/icons/sell.webp" alt="" />
        <div className="agency">Update Price {name}</div>
        <div className="icon" onClick={() => hide()}>
          <Close />
        </div>
      </div>
      <div className="agency des">
        Update listing for {name} <span>#{id}</span>
      </div>
      <RowCustom>
        <TextTite>New Price</TextTite>
        <div className="box-input">
            <div style={{display: 'flex', alignItems: 'center', padding: '0 1rem', width: '150px', background: '#242735', border: '1px solid #434040', color: 'white', fontWeight: 'bold', fontSize: '1.3rem'}}>
              <img src={tokenIcon} alt="" style={{width: '1.5rem', height: '1.5rem', marginRight: '0.5rem'}} />
              {tokenSymbol}
            </div>
          <input
            onChange={onChange}
            type="number"
            className="agency"
            placeholder={`Enter ${tokenSymbol}`}
          />
        </div>
      </RowCustom>
      <div className="des-bottom min agency">
        Min price: {" "}
        <span className="coin">
          {minPrice} {tokenSymbol}
        </span>
      </div>
      <div className="des-bottom agency">
        <div style={{marginTop: '10px', color: '#ff4d4f'}}>
            Warning: You will pay an immediate fee of <span style={{fontWeight: 'bold'}}>{updateFee} {tokenSymbol}</span> (1%).
        </div>
      </div>

      <div className="block-button">
        {!isApprove ? (
          <button onClick={handleApprove} className={approving ? "disable" : ""}>
             {approving ? "APPROVING..." : "APPROVE"}
          </button>
        ) : (
          <button
            onClick={handleUpdate}
            disabled={!isSellable}
            className={!isSellable ? "disable" : ""}
          >
            UPDATE PRICE
          </button>
        )}
      </div>
    </ContentModal>
  );
};

const ContentModal = styled(Modal)`
  .ant-modal-content {
    background-color: rgb(36, 39, 53);
  }

  .head-modal {
    min-width: 58rem;
    display: flex;
    margin-bottom: 3rem;
    align-items: center;

    img {
      width: 1.5rem;
      height: 1.5rem;
    }
    div {
      margin-left: 1rem;
      font-size: 2.563rem;
      line-height: 1.2;
      color: white;
      white-space: nowrap;
    }
    .icon {
      position: absolute;
      top: 1rem;
      right: 1rem;
      border-radius: 100px;
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: 0.3s ease-in-out;
      svg {
        width: 1.5rem;
        height: 1.5rem;
        fill: white;
      }
      &:hover {
        background: black;
      }
    }
  }
  .des {
    font-size: 2.563rem;
    color: #8a8fa4;
    span {
      color: #38e58d;
    }
  }
  .box-input {
    height: 3.5rem;
    display: flex;
    align-items: center;
    border-radius: 4px;
    background-color: #151720;
    position: relative;

    input {
      height: 3.5rem;
      background-color: #151720;
      border: none;
      padding-left: 1rem;
      font-size: 2.563rem;
      width: 100%;
      color: #fff;
      &:focus {
        background-color: #151720;
        outline: none;
        box-shadow: none;
        border: none;
      }
    }
  }

  .des-bottom {
    font-size: 1.781rem;
    color: white;
    text-align: center;
    margin-top: 1rem;
    .coin {
      color: #dfad25;
    }
  }
  .block-button {
    margin: 4.75rem 0rem;
    display: flex;
    justify-content: center;
    button {
      padding: 0.938rem 2.125rem 0.938rem 1.125rem;
      border-radius: 3px;
      font-size: 1.125rem;
      color: #381a09;
      box-sizing: border-box;
      line-height: 1;
      background: none;
      cursor: pointer;
      font-weight: 500;
      background-color: #ff973a;
      border: none;
      box-shadow: none;
      display: flex;
      align-items: center;
      transition: all 0.3s ease-in-out;
      &.disable {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
`;

const RowCustom = styled.div`
  display: flex;
  align-items: center;
  margin-top: 7.313rem;
  justify-content: center;
`;

const TextTite = styled.div`
  font-size: 2.563rem;
  line-height: 1.2;
  color: white;
  margin-right: 2.313rem;
  white-space: nowrap;
  font-family: "agency-fb-regular", sans-serif;
`;

export default UpdatePriceModal;
