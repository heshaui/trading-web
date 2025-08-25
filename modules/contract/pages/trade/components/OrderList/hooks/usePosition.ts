import { useState, useCallback } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { getAssetsList } from "@/services/contract";

// 仓位接口
interface Position {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlRate: number;
  margin: number;
  marginRate: number;
  liquidationPrice: number;
  createTime: number;
}

interface UsePositionOptions {
  contractId?: number;
}

export const usePosition = (options: UsePositionOptions = {}) => {
  const { contractId } = options;
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取仓位数据
  const getPosition = useCallback(async () => {
    try {
      setLoading(true);
      console.log("获取仓位");
      const res = await getAssetsList({
        uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      });
      if (res.code === "0") {
        setPositions(res.data.list);
      } else {
        setPositions([]);
        message.error(res.msg);
      }
    } catch (error) {
      console.error("获取仓位失败:", error);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 根据symbol过滤仓位数据
  const getFilteredPositions = useCallback(
    (currentSymbol?: string, onlyCurrentSymbol?: boolean) => {
      if (!onlyCurrentSymbol || !currentSymbol) return positions;
      return positions.filter((item) => item.symbol === currentSymbol);
    },
    [positions]
  );

  return {
    positions,
    loading,
    getPosition,
    getFilteredPositions,
  };
};

export type { Position };
