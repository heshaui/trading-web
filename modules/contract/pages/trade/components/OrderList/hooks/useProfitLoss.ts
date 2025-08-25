import { useState, useCallback } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { getHistoryPositionList } from "@/services/contract";

// 盈亏记录接口
interface TradeRecord {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  size: number;
  price: number;
  fee: number;
  createTime: number;
  openPrice: number;
  realizedPnl: number;
  fundingFee: number;
  pnl: number;
  closeTime: number;
}

interface UseProfitLossOptions {
  contractId?: number;
}

export const useProfitLoss = (options: UseProfitLossOptions = {}) => {
  const { contractId } = options;
  const [profitLoss, setProfitLoss] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取盈亏记录
  const getProfitLoss = useCallback(
    async (overrideContractId?: number) => {
      try {
        setLoading(true);
        console.log("获取盈亏记录");
        const res = await getHistoryPositionList({
          contractId: overrideContractId ?? contractId,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (res.code === "0") {
          setProfitLoss(res.data?.list || []);
        } else {
          message.error(res.msg);
        }
        console.log(res);
      } catch (error) {
        console.error("获取盈亏记录失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [contractId]
  );

  // 根据symbol过滤数据
  const getFilteredProfitLoss = useCallback(
    (currentSymbol?: string, onlyCurrentSymbol?: boolean) => {
      if (!onlyCurrentSymbol || !currentSymbol) return profitLoss;
      return profitLoss.filter((item) => item.symbol === currentSymbol);
    },
    [profitLoss]
  );

  return {
    profitLoss,
    loading,
    getProfitLoss,
    getFilteredProfitLoss,
  };
};

export type { TradeRecord };
