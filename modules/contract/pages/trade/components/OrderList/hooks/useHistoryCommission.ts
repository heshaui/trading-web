import { useState, useCallback } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { getHistoryOrderList } from "@/services/contract";
import { Side, PositionType, Type, Open, Status } from "../configs/columns";

// 历史委托接口
interface HistoryCommission {
  symbol: string; // 合约
  pricePrecision: number; // 价格精度
  side: Side; // 方向
  positionType: PositionType; // 仓位类型
  avgPrice: number; // 平均价格
  tradeFee: number; // 手续费
  realizedAmount: number; // 已实现盈亏
  type: Type; // 类型
  mtime: number; // 修改时间
  volume: number; // 委托数量
  dealVolume: number; // 成交数量
  price: number; // 委托价格
  contractId: number; // 合约ID
  ctime: number; // 创建时间
  contractName: string; // 合约名称
  id: string; // 订单ID
  open: Open; // 开仓状态
  status: Status; // 状态
}

interface UseHistoryCommissionOptions {
  contractId?: number;
}

export const useHistoryCommission = (
  options: UseHistoryCommissionOptions = {}
) => {
  const { contractId } = options;
  const [historyCommission, setHistoryCommission] = useState<
    HistoryCommission[]
  >([]);
  const [historyCommissionNumber, setHistoryCommissionNumber] = useState(0);
  const [loading, setLoading] = useState(false);

  // 获取历史委托列表
  const getHistoryCommission = useCallback(
    async ({
      overrideContractId,
      showLoading = false,
      showMessage = true,
    }: {
      overrideContractId?: number;
      showLoading?: boolean;
      showMessage?: boolean;
    } = {}) => { // 添加默认值 {}
      try {
        if (showLoading) setLoading(true);
        console.log("获取历史委托");
        const { code, data, msg } = await getHistoryOrderList({
          contractId: overrideContractId ?? contractId,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (code === "0") {
          setHistoryCommission(data.orderList);
          setHistoryCommissionNumber(data.count);
        } else {
          if (showMessage) toast.error(msg);
        }
      } catch (error) {
        console.error("获取历史委托失败:", error);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [contractId]
  );

  return {
    historyCommission,
    historyCommissionNumber,
    loading,
    getHistoryCommission,
  };
};

export type { HistoryCommission };
