import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import SymbolSelector from "../SymbolSelector";
import { getPublicMarketInfo } from "@/services/contract";
import appStore from "@/store";
const ContractHeader = ({ priceData, style }: { priceData: any, style?: React.CSSProperties }) => {
  const { t } = useTranslation(["contract"]);
  const symbolList = appStore.getPublicInfo();
  const currentContractInfo = appStore.getCurrentContractInfo();
  const [currentSymbol, setCurrentSymbol] = useState<any>(currentContractInfo);
  const [marketInfo, setMarketInfo] = useState<any>(null);
  const handleSymbolSelect = (symbol: any) => {

    appStore.setCurrentContractInfo(symbol.id);
    setCurrentSymbol(symbol);
  };

  const handleToggleFavorite = (symbol: any) => {
    console.log("handleToggleFavorite", symbol);
  };

  const getMarketInfo = async (id: number) => {
    const res = await getPublicMarketInfo({ contractId: id });
    console.log("Public market info:", res);
    if (res.code === '0') {
      setMarketInfo(res.data);
    }
  };

  // 同步 store 中的 currentContractInfo 到本地状态
  useEffect(() => {
    if (currentContractInfo && Object.keys(currentContractInfo).length > 0) {
      setCurrentSymbol(currentContractInfo);
    }
  }, [currentContractInfo]);

  useEffect(() => {
    if (currentContractInfo?.id) {
      const interval = setInterval(() => {
        getMarketInfo(currentContractInfo.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentContractInfo]);

  return (
    <div style={style} className="flex items-center px-[16px] h-[100%] bg-[var(--background9)]">
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
            className={`font-500 text-[14px] ${priceData?.isUp
              ? "text-[var(--success-color)]"
              : "text-[var(--error-color)]"
              }`}
          >
            {priceData?.price}
          </div>
          <div
            className={`text-[12px] font-500 ${priceData?.isUp
              ? "text-[var(--success-color)]"
              : "text-[var(--error-color)]"
              }`}
          >
            {priceData?.changePercent}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] text-[var(--text-color6)] font-[400]">
            {t("contractHeader.markPrice")}
          </span>
          <span
            className={`text-[var(--text-color5)] font-500 text-[12px] ${priceData?.isUp
              ? "text-[var(--success-color)]"
              : "text-[var(--error-color)]"
              }`}
          >
            {marketInfo?.tagPrice}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] text-[var(--text-color6)] font-[400]">
            {t("contractHeader.indexPrice")}
          </span>
          <span className="text-[var(--text-color5)] font-500 text-[12px]">
            {marketInfo?.indexPrice}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] text-[var(--text-color6)] font-[400]">
            {t("contractHeader.fundingRate")}
          </span>
          <span className="text-[var(--text-color5)] font-500 text-[12px]">
            {marketInfo?.currentFundRate}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] text-[var(--text-color6)] font-[400]">
            {t("contractHeader.volume24h")}
          </span>
          <span className="text-[var(--text-color5)] font-500 text-[12px]">
            {priceData?.volume24hUSD}
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
