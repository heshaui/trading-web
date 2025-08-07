const ContractInfo = () => {
  return (
    <div className="p-[10px_16px] text-[14px] font-[400] bg-[var(--background9)] h-[100%]">
      <div className="text-[var(--text-color5)] font-[500] mb-[16px]">
        合约信息
      </div>
      <div className="flex flex-col gap-[10px]">
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">合约代号</div>
          <div className="text-[var(--text-color5)]">BTCUSDT</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">交割日期</div>
          <div className="text-[var(--text-color5)]">永续</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">合约标的</div>
          <div className="text-[var(--text-color5)]">BTCUSDT 指数</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">保证金币种</div>
          <div className="text-[var(--text-color5)]">USDT</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">合约面值</div>
          <div className="text-[var(--text-color5)]">0.0001 BTC</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">最小价格变动单位</div>
          <div className="text-[var(--text-color5)]">0.0001 BTC</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">最低维持保证金率</div>
          <div className="text-[var(--text-color5)]">0.40%</div>
        </div>
      </div>
    </div>
  );
};

export default ContractInfo;
