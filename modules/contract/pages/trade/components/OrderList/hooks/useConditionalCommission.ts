import { useState, useCallback } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { getPlanOrderList, cancelOrder } from "@/services/contract";

// 条件委托接口
interface ConditionalCommission {
  id: string; // 订单ID
  contractId: number; // 合约ID
  symbol: string; // 合约
  type: "LIMIT" | "MARKET" | "CONDITIONAL"; // 类型
  side: "BUY" | "SELL"; // 方向
  triggerPrice: number; // 触发价格
  price: number; // 委托价格
  size: number; // 委托数量
  orderType: string; // 订单类型
  onlyReduce: boolean; // 是否只减少
  createTime: number; // 创建时间
  expireTime: number; // 过期时间
}

interface UseConditionalCommissionOptions {
  contractId?: number;
}

export const useConditionalCommission = (
  options: UseConditionalCommissionOptions = {}
) => {
  const { contractId } = options;
  const [conditionalCommission, setConditionalCommission] = useState<
    ConditionalCommission[]
  >([]);
  const [loading, setLoading] = useState(false);

  // 获取条件委托列表
  const getConditionalCommission = useCallback(
    async ({overrideContractId, showLoading}: {overrideContractId?: number, showLoading?: boolean}) => {
      try {
        if (showLoading) setLoading(true);
        console.log("获取条件委托");
        const res = await getPlanOrderList({
          contractId: (overrideContractId ?? contractId)?.toString(),
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (res.code === "0") {
          setConditionalCommission(res.data?.orderList || []);
        } else {
          toast.error(res.msg);
        }
        console.log(res);
      } catch (error) {
        console.error("获取条件委托失败:", error);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [contractId]
  );

  // 取消条件委托
  const handleCancelConditionalOrder = useCallback(
    async (record: ConditionalCommission) => {
      try {
        const params = {
          orderId: record.id,
          contractId: record.contractId,
          isConditionOrder: true,
        };
        const res = await cancelOrder(params);
        if (res.code === "0") {
          toast.success(res.msg);
          // 刷新数据
          getConditionalCommission({showLoading: true});
        } else {
          toast.error(res.msg);
        }
      } catch (error) {
        console.error("取消条件委托失败:", error);
      }
    },
    [getConditionalCommission]
  );

  // 根据symbol过滤数据
  const getFilteredConditionalCommission = useCallback(
    (currentSymbol?: string, onlyCurrentSymbol?: boolean) => {
      if (!onlyCurrentSymbol || !currentSymbol) return conditionalCommission;
      return conditionalCommission.filter(
        (item) => item.symbol === currentSymbol
      );
    },
    [conditionalCommission]
  );

  return {
    conditionalCommission,
    loading,
    getConditionalCommission,
    handleCancelConditionalOrder,
    getFilteredConditionalCommission,
  };
};

export type { ConditionalCommission };
