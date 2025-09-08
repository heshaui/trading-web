import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { Tooltip } from "antd";
import SymbolSelector from "../SymbolSelector";
import appStore from "@/store";
import { useMarketInfo } from "@/hooks/useMarketInfo";
const ContractHeader = ({ priceData, style }: { priceData: any, style?: React.CSSProperties }) => {
  const { t } = useTranslation(["contract"]);
  const symbolList = appStore.getPublicInfo();
  const currentContractInfo = appStore.getCurrentContractInfo();
  const [currentSymbol, setCurrentSymbol] = useState<any>(currentContractInfo);
  const { marketInfo, loadMarketInfo } = useMarketInfo();


  const handleSymbolSelect = (symbol: any) => {
    
    appStore.setCurrentContractInfo(symbol.id);
    setCurrentSymbol(symbol);

  };

  const handleToggleFavorite = (symbol: any) => {
    console.log("handleToggleFavorite", symbol);
  };

   const symbolPricePrecision=currentContractInfo.coinResultVo.symbolPricePrecision
  
  // 格式化价格显示，确保不超过symbolPricePrecision精度
  const formatPriceWithPrecision = (price: number | string | null | undefined): string => {
    if (!price || price === '' || price === null || price === undefined) return '--';
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '--';
    
    // 如果没有设置精度限制，返回原值
    if (symbolPricePrecision === undefined || symbolPricePrecision === null) {
      return numPrice.toString();
    }
    
    // 格式化为指定精度，然后去掉末尾的0
    const fixed = numPrice.toFixed(symbolPricePrecision);
    return fixed.replace(/\.?0+$/, '');
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
        loadMarketInfo(currentContractInfo.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentContractInfo, loadMarketInfo]);

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
            {formatPriceWithPrecision(priceData?.price)}
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
          <Tooltip title={t("contractHeader.tooltip.markPrice")}>
          <span className="text-[12px] text-[var(--text-color6)] font-[400] underline decoration-dashed cursor-pointer">
            {t("contractHeader.markPrice")}
          </span>
          </Tooltip>
          <span
            className={`text-[var(--text-color5)] font-500 text-[12px] ${priceData?.isUp
              ? "text-[var(--success-color)]"
              : "text-[var(--error-color)]"
              }`}
          >
             {formatPriceWithPrecision(marketInfo?.tagPrice)}
          </span>
        </div>
        <div className="flex flex-col">
           <Tooltip title={t("contractHeader.tooltip.indexPrice")}>
          <span className="text-[12px] text-[var(--text-color6)] font-[400] underline decoration-dashed cursor-pointer">
            {t("contractHeader.indexPrice")}
          </span>
          </Tooltip>
          <span className="text-[var(--text-color5)] font-500 text-[12px]">
            {formatPriceWithPrecision(marketInfo?.indexPrice)}
          </span>
        </div>
        <div className="flex flex-col">
          <Tooltip title={t("contractHeader.tooltip.fundingRate")}>
          <span className="text-[12px] text-[var(--text-color6)] font-[400] underline decoration-dashed cursor-pointer">
            {t("contractHeader.fundingRate")}
          </span>
          </Tooltip>
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
