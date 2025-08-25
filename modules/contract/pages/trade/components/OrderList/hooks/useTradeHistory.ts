import { useState, useCallback } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { getTradeInfo } from "@/services/contract";

// 成交记录接口
interface TradeHistory {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  size: number;
  filledPrice: number;
  role: string;
  fee: number;
  createTime: number;
}

interface UseTradeHistoryOptions {
  contractId?: number;
}

export const useTradeHistory = (options: UseTradeHistoryOptions = {}) => {
  const { contractId } = options;
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取成交记录
  const getTradeHistory = useCallback(
    async (overrideContractId?: number) => {
      try {
        setLoading(true);
        console.log("获取成交记录");
        const res = await getTradeInfo({
          contractId: overrideContractId ?? contractId,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (res.code === "0") {
          setTradeHistory(res.data?.list || []);
        } else {
          message.error(res.msg);
        }
        console.log(res);
      } catch (error) {
        console.error("获取成交记录失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [contractId]
  );

  // 根据symbol过滤数据
  const getFilteredTradeHistory = useCallback(
    (currentSymbol?: string, onlyCurrentSymbol?: boolean) => {
      if (!onlyCurrentSymbol || !currentSymbol) return tradeHistory;
      return tradeHistory.filter((item) => item.symbol === currentSymbol);
    },
    [tradeHistory]
  );

  return {
    tradeHistory,
    loading,
    getTradeHistory,
    getFilteredTradeHistory,
  };
};

export type { TradeHistory };
