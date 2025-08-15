import { Button } from "antd";

const ContractAsset = () => {
  return (
    <div className="p-[10px_16px] text-[14px] font-[400] bg-[var(--background9)] h-[100%]">
      <div className="text-[var(--text-color5)] font-[500] mb-[16px]">资产</div>
      <div className="flex flex-col gap-[10px] mb-[14px]">
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">总权益</div>
          <div className="text-[var(--text-color5)]">0.00 USDT</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">钱包余额</div>
          <div className="text-[var(--text-color5)]">0.00 USDT</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">未实现盈亏</div>
          <div className="text-[var(--text-color5)]">0.00 USDT</div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Button
          type="primary"
          className="w-[144px] h-[32px] text-[var(--text-color5)] font-[500]"
          shape="round"
          style={{ background: "var(--btncolor6)" }}
        >
          划转
        </Button>
        <Button
          type="primary"
          className="w-[144px] h-[32px] text-[var(--text-color5)] font-[500]"
          shape="round"
          style={{ background: "var(--btncolor6)" }}
        >
          充值
        </Button>
      </div>
    </div>
  );
};

export default ContractAsset;
