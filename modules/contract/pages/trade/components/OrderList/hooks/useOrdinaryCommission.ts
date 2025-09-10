import { useState, useCallback } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { getCurrentOrderList, cancelOrder } from "@/services/contract";
import { Side, PositionType, Type, Open, Status } from "../configs/columns";

// 普通委托接口
interface OrdinaryCommission {
  symbol: string; // 合约
  pricePrecision: number; // 价格精度
  side: Side; // 方向
  positionType: PositionType; // 仓位类型
  avgPrice: number; // 平均价格
  tradeFee: number; // 交易手续费
  type: Type; // 类型
  mtime: number; // 修改时间
  volume: number; // 委托数量
  dealVolume: number; // 成交数量
  price: number; // 委托价格
  contractId: number; // 合约ID
  ctime: number; // 创建时间
  contractName: string; // 合约名称
  id: string; // 订单ID
  open: Open; // 开仓方向
  status: Status; // 状态
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
    async (
      params: {
        overrideContractId?: number;
        showLoading?: boolean;
        showMessage?: boolean;
      } = {}
    ) => {
      // 添加默认空对象
      try {
        const { overrideContractId, showLoading, showMessage = true } = params; // 从params解构
        if (showLoading) setLoading(true);
        const { code, data, msg } = await getCurrentOrderList({
          contractId: overrideContractId ?? contractId,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (code === "0") {
          setOrdinaryCommission(data.orderList);
          setOrdinaryCommissionNumber(data.count);
        } else {
          if (showMessage) toast.error(msg);
        }
      } catch (error) {
        console.error("获取普通委托失败:", error);
      } finally {
        if (params.showLoading) setLoading(false);
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
          toast.success(res.msg);
          // 刷新数据
          getOrdinaryCommission({ showLoading: true });
        } else {
          toast.error(res.msg);
        }
      } catch (error) {
        console.error("取消普通委托失败:", error);
      }
    },
    [getOrdinaryCommission]
  );

  return {
    ordinaryCommission,
    ordinaryCommissionNumber,
    loading,
    getOrdinaryCommission,
    handleCancelOrdinaryOrder,
  };
};

export type { OrdinaryCommission };
