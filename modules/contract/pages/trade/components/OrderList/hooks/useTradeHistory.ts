import { useState, useCallback } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { getTradeInfo } from "@/services/contract";
import { Open, Side, Role } from "../configs/columns";

// 成交记录接口
interface TradeHistory {
  symbol: string; // 合约
  pricePrecision: number; // 价格精度
  side: Side; // 方向
  role: Role; // 角色
  fee: number; // 手续费
  feeCoinPrecision: number; // 手续费币种精度
  volume: number; // 数量
  feeCoin: string; // 手续费币种
  price: number; // 价格
  contractId: number; // 合约ID
  ctime: number; // 创建时间
  contractName: string; // 合约名称
  id: string; // 订单ID
  open: Open; // 状态
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
    async ({overrideContractId, showLoading}: {overrideContractId?: number, showLoading?: boolean}) => {
      try {
        if (showLoading) setLoading(true);
        console.log("获取成交记录");
        const res = await getTradeInfo({
          contractId: overrideContractId ?? contractId,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (res.code === "0") {
          setTradeHistory(res.data?.tradeList || []);
        } else {
          toast.error(res.msg);
        }
        console.log(res);
      } catch (error) {
        console.error("获取成交记录失败:", error);
      } finally {
        if (showLoading) setLoading(false);
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
