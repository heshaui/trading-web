import { useState, useCallback } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import {
  getCurrentOrderList,
  getCurrentOrderNum,
  cancelOrder,
} from "@/services/contract";

// 方向枚举
enum Side {
  BUY = "BUY",
  SELL = "SELL",
}

// 仓位类型枚举
enum PositionType {
  CROSS_MARGIN = 1, // 全仓
  ISOLATED_MARGIN = 2, // 逐仓
}

// 类型枚举
enum Type {
  LIMIT = 1, // 限价单
  MARKET = 2, // 市价单
  POST_ONLY = 3, // PostOnly
  FORCE_LIQUIDATION = 4, // 强制减仓
  POSITION_MERGE = 5, // 仓位合并
}

// 开仓状态枚举
enum Open {
  OPEN = "OPEN", // 开仓
  CLOSE = "CLOSE", // 平仓
}

// 状态枚举
enum Status {
  PENDING = 0, // 待成交
  NEW_ORDER = 1, // 新订单
  FULLY_FILLED = 2, // 完全成交
  PARTIALLY_FILLED = 3, // 部分成交
  CANCELLED = 4, // 已取消
  CANCELLING = 5, // 待撤销
  ABNORMAL = 6, // 已废弃
  PARTIALLY_FILLED_AND_CANCELLED = 7, // 部分成交已撤销
}

// 普通委托接口
interface OrdinaryCommission {
  symbol: string;
  pricePrecision: number;
  side: Side;
  positionType: PositionType;
  avgPrice: number;
  tradeFee: number;
  type: Type;
  mtime: number;
  volume: number;
  dealVolume: number;
  price: number;
  contractId: number;
  ctime: number;
  contractName: string;
  id: string;
  open: Open;
  status: Status;
}

interface UseOrdinaryCommissionOptions {
  contractId?: number;
}

export const useOrdinaryCommission = (
  options: UseOrdinaryCommissionOptions = {}
) => {
  const { contractId } = options;
  const [ordinaryCommission, setOrdinaryCommission] = useState<
    OrdinaryCommission[]
  >([]);
  const [ordinaryCommissionNumber, setOrdinaryCommissionNumber] = useState(0);
  const [loading, setLoading] = useState(false);

  // 获取普通委托列表
  const getOrdinaryCommission = useCallback(
    async (overrideContractId?: number) => {
      try {
        setLoading(true);
        console.log("获取普通委托(当前委托)");
        const { code, data, msg } = await getCurrentOrderList({
          contractId: overrideContractId ?? contractId,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (code === "0") {
          setOrdinaryCommission(data.orderList);
        } else {
          message.error(msg);
        }
      } catch (error) {
        console.error("获取普通委托失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [contractId]
  );

  // 获取普通委托数量
  const getOrdinaryCommissionNumber = useCallback(
    async (overrideContractId?: number) => {
      try {
        const res = await getCurrentOrderNum({
          contractId: overrideContractId ?? contractId,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (res.code === "0") {
          console.log(res.data.count, "普通委托数量");
          setOrdinaryCommissionNumber(res.data.count);
        } else {
          message.error(res.msg);
        }
      } catch (error) {
        console.error("获取普通委托数量失败:", error);
      }
    },
    [contractId]
  );

  // 取消普通委托
  const handleCancelOrdinaryOrder = useCallback(
    async (record: OrdinaryCommission) => {
      try {
        const params = {
          orderId: record.id,
          contractId: record.contractId,
          isConditionOrder: false,
        };
        const res = await cancelOrder(params);
        if (res.code === "0") {
          message.success(res.msg);
          // 刷新数据
          getOrdinaryCommission();
        } else {
          message.error(res.msg);
        }
      } catch (error) {
        console.error("取消普通委托失败:", error);
      }
    },
    [getOrdinaryCommission]
  );

  // 根据symbol过滤数据
  const getFilteredOrdinaryCommission = useCallback(
    (currentSymbol?: string, onlyCurrentSymbol?: boolean) => {
      if (!onlyCurrentSymbol || !currentSymbol) return ordinaryCommission;
      return ordinaryCommission.filter((item) => item.symbol === currentSymbol);
    },
    [ordinaryCommission]
  );

  return {
    ordinaryCommission,
    ordinaryCommissionNumber,
    loading,
    getOrdinaryCommission,
    getOrdinaryCommissionNumber,
    handleCancelOrdinaryOrder,
    getFilteredOrdinaryCommission,
  };
};

export type { OrdinaryCommission };
export { Side, PositionType, Type, Open, Status };
