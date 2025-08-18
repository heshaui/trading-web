import { useState, useEffect } from "react";
import SymbolSelector from "../SymbolSelector";
import { getPublicMarketInfo } from "@/services/contract";
import appStore from "@/store";
const ContractHeader = ({ mockPriceData }: { mockPriceData: any }) => {
  const [currentSymbol, setCurrentSymbol] = useState<any>(null);
  const symbolList = appStore.getPublicInfo();
  const [marketInfo, setMarketInfo] = useState<any>(null);
  const currentContractInfo = appStore.getCurrentContractInfo();
  const handleSymbolSelect = (symbol: any) => {

    appStore.setCurrentContractInfo(symbol.id);
    setCurrentSymbol(symbol);
  };

  const handleToggleFavorite = (symbol: any) => {
    console.log("handleToggleFavorite", symbol);
  };

  const getMarketInfo = async (id: number) => {
    const res = await getPublicMarketInfo({ contractId: id });
    console.log("公共市场信息:", res);
    if (res.code === '0') {
      setMarketInfo(res.data);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getMarketInfo(currentContractInfo.id);
    }, 2000);
    return () => clearInterval(interval);
  }, [currentContractInfo]);

  return (
    <div className="flex items-center px-[16px] h-[100%] bg-[var(--background9)]">
      <SymbolSelector
        currentSymbol={currentSymbol}
        onSymbolSelect={handleSymbolSelect}
        symbolList={symbolList.contractList}
        onToggleFavorite={handleToggleFavorite}
      />
      <div className="w-[1px] h-[20px] bg-[var(--border-color4)] mx-[16px]"></div>
      <div className="flex gap-[24px] ml-[16px]">
        <div className="flex flex-col">
          <div
            className={`font-500 text-[14px] ${mockPriceData.isUp
              ? "text-[var(--success-color)]"
              : "text-[var(--error-color)]"
              }`}
          >
            {mockPriceData.price}
          </div>
          <div
            className={`text-[12px] font-500 ${mockPriceData.isUp
              ? "text-[var(--success-color)]"
              : "text-[var(--error-color)]"
              }`}
          >
            {mockPriceData.changePercent}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] text-[var(--text-color6)] font-[400]">
            标记价格
          </span>
          <span
            className={`text-[var(--text-color5)] font-500 text-[12px] ${mockPriceData.isUp
              ? "text-[var(--success-color)]"
              : "text-[var(--error-color)]"
              }`}
          >
            {marketInfo?.tagPrice}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] text-[var(--text-color6)] font-[400]">
            指数价格
          </span>
          <span className="text-[var(--text-color5)] font-500 text-[12px]">
            {marketInfo?.indexPrice}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] text-[var(--text-color6)] font-[400]">
            资金费率/倒计时
          </span>
          <span className="text-[var(--text-color5)] font-500 text-[12px]">
            {marketInfo?.currentFundRate}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] text-[var(--text-color6)] font-[400]">
            24H 成交量
          </span>
          <span className="text-[var(--text-color5)] font-500 text-[12px]">
            {mockPriceData.volume24hUSD}
          </span>
        </div>
        {/* <div className="flex flex-col">
          <span className="text-[12px] text-[var(--text-color6)] font-[400]">
            24H 成交额(USD)
          </span>
          <span className="text-[var(--text-color5)] font-500 text-[12px]">
            <span
              className={
                mockPriceData.fundingRate.startsWith("+")
                  ? "text-[var(--success-color)]"
                  : mockPriceData.fundingRate.startsWith("-")
                    ? "text-[var(--error-color)]"
                    : ""
              }
            >
              {mockPriceData.fundingRate}
            </span>
            <span className="text-[var(--text-color6)] font-[400]">
              {" "}
              / {mockPriceData.fundingCountdown}
            </span>
          </span>
        </div> */}
      </div>
    </div>
  );
};

export default ContractHeader;
