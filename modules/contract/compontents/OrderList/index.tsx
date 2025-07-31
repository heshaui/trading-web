import React, { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  Table,
  Button,
  Switch,
  message,
  ConfigProvider,
  InputNumber,
} from "antd";
import appStore from "@/store";
import {
  cancelOrder,
  getHistoryOrderList,
  getCurrentOrderList,
} from "@/services/contract";
import styles from "@/styles/components/Table.module.css";
import {
  SwitchTheme,
  TableTheme,
  TabsTheme,
  TokenTheme,
} from "@/theme/publicThemeConfig";
import { NoData } from "@/components/noData";
import { SvgIcon } from "@/components/icon";

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

interface Order {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET" | "CONDITIONAL";
  size: number;
  price: number;
  filled: number;
  remaining: number;
  status: "NEW" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";
  createTime: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  size: number;
  price: number;
  fee: number;
  createTime: number;
}

const OrderList: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  // 当前tab
  const [activeTab, setActiveTab] = useState("position");

  // 仅当前合约开关
  const [onlyCurrentSymbol, setOnlyCurrentSymbol] = useState(false);

  // 取消中的订单ID集合
  const [cancellingOrderIds, setCancellingOrderIds] = useState<Set<string>>(
    new Set()
  );

  // table 数据
  const [positions, setPositions] = useState<Position[]>([
    {
      id: "1",
      symbol: "BTCUSDT",
      side: "LONG",
      size: 595.51,
      entryPrice: 10000,
      markPrice: 10000,
      pnl: 100,
      pnlRate: 0.1,
      margin: 1000,
      marginRate: 0.1,
      liquidationPrice: 10000,
      createTime: 1717334400000,
    },
  ]); // 仓位
  const [openOrders, setOpenOrders] = useState<Order[]>([]); // 普通委托
  const [conditionalOrders, setConditionalOrders] = useState<Order[]>([]); // 条件委托
  const [orderHistory, setOrderHistory] = useState<Order[]>([]); // 历史委托
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]); // 盈亏记录
  const [tradeRecord, setTradeRecord] = useState<Trade[]>([]); // 成交记录

  // 获取当前合约信息
  const currentContractInfo = appStore.getCurrentContractInfo();

  // 获取当前合约symbol用于过滤
  const currentSymbol = currentContractInfo?.symbol || "";

  // 获取历史委托
  const getHistoryOrder = async () => {
    if (!currentContractInfo?.id) {
      console.warn("No contract info available");
      return;
    }

    try {
      setLoading(true);
      const response = await getHistoryOrderList({
        contractId: currentContractInfo.id,
        page: 1,
        pageSize: 100,
      });
      if (response?.data?.orderList) {
        setOrderHistory(response.data.orderList || []);
      }
    } catch (error) {
      console.error("Failed to fetch history order list:", error);
      message.error("加载历史委托失败");
    } finally {
      setLoading(false);
    }
  };

  // 获取当前合约的订单列表
  const getOrderList = useCallback(async () => {
    if (!currentContractInfo?.id) {
      console.warn("No contract info available");
      return;
    }

    try {
      setLoading(true);
      const response = await getCurrentOrderList({
        contractId: currentContractInfo.id,
      });

      if (response?.data?.orderList) {
        // 这里应该根据实际API返回的数据结构来设置不同的状态
        setPositions(response.data.orderList || []);
      }
    } catch (error) {
      console.error("Failed to fetch order list:", error);
      message.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, [currentContractInfo?.id]);

  // 取消订单功能
  const handleCancelOrder = async (order: any) => {
    try {
      // 添加到取消中的订单ID集合
      setCancellingOrderIds((prev) => new Set(prev).add(order.id));

      const response = await cancelOrder({
        orderId: order.id,
        contractId: order.contractId,
        isConditionOrder: false,
      });

      if (response?.code === "0") {
        message.success("订单取消成功");
        // 重新获取订单列表
        await getOrderList();
      } else {
        message.error(response?.msg || "取消订单失败");
      }
    } catch (error) {
      console.error("Cancel order failed:", error);
      message.error("取消订单失败");
    } finally {
      // 从取消中的订单ID集合中移除
      setCancellingOrderIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(order.id);
        return newSet;
      });
    }
  };

  // 根据仅当前合约开关过滤数据
  const filterDataBySymbol = <T extends { symbol?: string }>(
    data: T[]
  ): T[] => {
    if (!onlyCurrentSymbol || !currentSymbol) return data;
    return data.filter((item) => item.symbol === currentSymbol);
  };

  // 仓位: 合约,数量,成本价,标记价格,预估强平价,保证金,保证金率,未实现盈亏/收益率,快速平仓,反向开仓,止盈止损
  const positionColumns = [
    {
      title: "合约",
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.symbol}</div>
      ),
    },
    {
      title: "数量",
      dataIndex: "size",
      key: "size",
      render: (_: any, record: Position) => (
        <div
          className={`text-[12px] font-[500] ${
            record.side === "LONG" ? "text-[#4CAF50]" : "text-[#F44336]"
          }`}
        >
          {record.size} USDT
        </div>
      ),
    },
    {
      title: "成本价",
      dataIndex: "entryPrice",
      key: "entryPrice",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.entryPrice} USDT</div>
      ),
    },
    {
      title: "标记价格",
      dataIndex: "markPrice",
      key: "markPrice",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.markPrice}</div>
      ),
    },
    {
      title: "预估强平价",
      dataIndex: "liquidationPrice",
      key: "liquidationPrice",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.liquidationPrice}</div>
      ),
    },
    {
      title: "保证金",
      dataIndex: "margin",
      key: "margin",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          <div>{record.margin}</div>
          <div>USDT</div>
        </div>
      ),
    },
    {
      title: "保证金率",
      dataIndex: "marginRate",
      key: "marginRate",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.marginRate}</div>
      ),
    },
    {
      title: "未实现盈亏/收益率",
      dataIndex: "pnl",
      key: "pnl",
      render: (_: any, record: Position) => (
        <span className={record.pnl >= 0 ? "text-[#4CAF50]" : "text-[#F44336]"}>
          {record.pnl?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      title: "快速平仓",
      key: "quickClose",
      render: () => (
        <Tabs
          size="small"
          items={[
            {
              label: <div className="text-[12px] font-[500]">市价</div>,
              key: "market",
              children: (
                <div className="flex items-center gap-[4px] flex-wrap text-[12px] font-[500]">
                  <InputNumber className="w-[92px] h-[25px]" />
                  <div className="p-[4px_6px] cursor-pointer bg-[var(--background14)] rounded-[4px]">
                    市价平
                  </div>
                </div>
              ),
            },
            {
              label: <div className="text-[12px] font-[500]">限价</div>,
              key: "limit",
              children: (
                <div className="flex items-center gap-[4px] flex-wrap text-[12px] font-[500]">
                  <InputNumber className="w-[92px] h-[25px]" />
                  <div className="p-[4px_6px] cursor-pointer bg-[var(--background14)] rounded-[4px]">
                    限价平
                  </div>
                </div>
              ),
            },
          ]}
        />
      ),
    },
    {
      title: "反向开仓",
      key: "reverseOpen",
      render: () => (
        <div className="p-[4px_6px] cursor-pointer bg-[var(--background14)] rounded-[4px] text-[12px] font-[500] whitespace-nowrap">
          反向开仓
        </div>
      ),
    },
    {
      title: "止盈止损",
      key: "tpsl",
      render: () => (
        <SvgIcon>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12.5431 2.27249C12.2618 1.99129 11.8803 1.83331 11.4826 1.83331C11.0848 1.83331 10.7034 1.99129 10.4221 2.27249L2.68657 10.008C2.40525 10.2892 2.24716 10.6707 2.24707 11.0685V14.9932C2.24707 15.411 2.58682 15.7507 3.00457 15.7507L15.0001 15.75C15.199 15.75 15.3897 15.671 15.5304 15.5303C15.6711 15.3897 15.7501 15.1989 15.7501 15C15.7501 14.8011 15.6711 14.6103 15.5304 14.4697C15.3897 14.329 15.199 14.25 15.0001 14.25H9.05107L15.7253 7.57574C16.0065 7.29445 16.1645 6.91299 16.1645 6.51524C16.1645 6.1175 16.0065 5.73603 15.7253 5.45474L12.5431 2.27249ZM6.93007 14.25L14.6648 6.51524L11.4826 3.33299L3.74707 11.0685V14.25H6.93007Z"
            fill="#FF5F1F"
          />
        </SvgIcon>
      ),
    },
  ];

  // 普通委托 / 条件委托 / 历史委托
  const orderColumns = [
    {
      title: "合约",
      dataIndex: "symbol",
      key: "symbol",
    },
    {
      title: "方向",
      dataIndex: "side",
      key: "side",
      render: (side: string) => (
        <span
          className={`${side === "BUY" ? "text-[#4CAF50]" : "text-[#F44336]"}`}
        >
          {side === "BUY" ? "买入" : "卖出"}
        </span>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const typeMap = {
          LIMIT: "限价",
          MARKET: "市价",
          CONDITIONAL: "条件",
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: "委托价格",
      dataIndex: "price",
      key: "price",
      render: (price: number) => price?.toLocaleString() || "--",
    },
    {
      title: "委托数量",
      dataIndex: "size",
      key: "size",
      render: (size: number) => size?.toFixed(3) || "--",
    },
    {
      title: "完成度",
      key: "completion",
      render: (record: Order) => {
        const completion = (record.filled / record.size) * 100;
        return `${completion?.toFixed(1) || "0.0"}%`;
      },
    },
    {
      title: "时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: "操作",
      key: "action",
      render: (record: Order) => {
        const isCancelling = cancellingOrderIds.has(record.id);
        const canCancel =
          record.status === "NEW" || record.status === "PARTIALLY_FILLED";

        return canCancel ? (
          <Button
            size="small"
            type="link"
            danger
            loading={isCancelling}
            onClick={() => handleCancelOrder(record)}
            disabled={isCancelling}
          >
            {isCancelling ? "取消中..." : "取消"}
          </Button>
        ) : (
          <span style={{ color: "#999" }}>不可取消</span>
        );
      },
    },
  ];

  // 盈亏记录
  const tradeColumns = [
    {
      title: "合约",
      dataIndex: "symbol",
      key: "symbol",
    },
    {
      title: "方向",
      dataIndex: "side",
      key: "side",
      render: (side: string) => (
        <span
          className={`${side === "BUY" ? "text-[#4CAF50]" : "text-[#F44336]"}`}
        >
          {side === "BUY" ? "买入" : "卖出"}
        </span>
      ),
    },
    {
      title: "成交价",
      dataIndex: "price",
      key: "price",
      render: (price: number) => price?.toLocaleString() || "--",
    },
    {
      title: "委托数量",
      dataIndex: "size",
      key: "size",
      render: (size: number) => size?.toFixed(3) || "--",
    },
    {
      title: "手续费",
      dataIndex: "tradeFee",
      key: "tradeFee",
      render: (fee: number) => fee?.toFixed(6) || "--",
    },
    {
      title: "时间",
      dataIndex: "ctime",
      key: "ctime",
      render: (time: number) => new Date(time).toLocaleString(),
    },
  ];

  // 成交记录
  const tradeRecordColumns = [
    {
      title: "合约",
      dataIndex: "symbol",
      key: "symbol",
    },
  ];

  // tabs 切换
  const tabItems = [
    {
      key: "position",
      label: `仓位(${filterDataBySymbol(positions).length})`,
      children: (
        <Table<Position>
          className={styles.table}
          columns={positionColumns}
          dataSource={filterDataBySymbol(positions)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData height="266px" /> }}
        />
      ),
    },
    {
      key: "openOrders",
      label: `普通委托(${filterDataBySymbol(openOrders).length})`,
      children: (
        <Table<Order>
          className={styles.table}
          columns={orderColumns}
          dataSource={filterDataBySymbol(
            activeTab === "openOrders"
              ? openOrders
              : activeTab === "conditionalOrders"
              ? conditionalOrders
              : orderHistory
          )}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData height="266px" /> }}
        />
      ),
    },
    {
      key: "conditionalOrders",
      label: `条件委托(${filterDataBySymbol(conditionalOrders).length})`,
      children: (
        <Table<Order>
          className={styles.table}
          columns={orderColumns}
          dataSource={filterDataBySymbol(
            activeTab === "openOrders"
              ? openOrders
              : activeTab === "conditionalOrders"
              ? conditionalOrders
              : orderHistory
          )}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData height="266px" /> }}
        />
      ),
    },
    {
      key: "orderHistory",
      label: `历史委托(${filterDataBySymbol(orderHistory).length})`,
      children: (
        <Table<Order>
          className={styles.table}
          columns={orderColumns}
          dataSource={filterDataBySymbol(
            activeTab === "openOrders"
              ? openOrders
              : activeTab === "conditionalOrders"
              ? conditionalOrders
              : orderHistory
          )}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData height="266px" /> }}
        />
      ),
    },
    {
      key: "tradeHistory",
      label: `盈亏记录(${filterDataBySymbol(tradeHistory).length})`,
      children: (
        <Table<Trade>
          className={styles.table}
          columns={tradeColumns}
          dataSource={filterDataBySymbol(tradeHistory)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData height="266px" /> }}
        />
      ),
    },
    {
      key: "tradeRecord",
      label: `成交记录(${filterDataBySymbol(tradeHistory).length})`,
      children: (
        <Table<Trade>
          className={styles.table}
          columns={tradeRecordColumns}
          dataSource={filterDataBySymbol(tradeHistory)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData height="266px" /> }}
        />
      ),
    },
  ];

  // 获取当前合约的订单列表
  useEffect(() => {
    if (currentContractInfo?.id) {
      getOrderList();
    }
  }, [currentContractInfo?.id, getOrderList]);

  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: TableTheme,
          Tabs: TabsTheme,
          Switch: SwitchTheme,
        },
        token: TokenTheme,
      }}
    >
      {/* tabs 切换 */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          if (key === "orderHistory") {
            getHistoryOrder();
          }
        }}
        tabBarStyle={{ padding: "0 20px", height: "72px" }}
        tabBarExtraContent={
          <div className="flex items-center gap-[20px] text-[14px] font-[400]">
            {/* 当前合约 */}
            <div className="flex items-center gap-[8px]">
              <Switch size="small" onChange={setOnlyCurrentSymbol} />
              <div className="text-[var(--text-color5)]">仅当前合约</div>
            </div>
            {/* 一键全平 */}
            {activeTab === "position" && (
              <div className="text-[var(--theme-color)] cursor-pointer">
                一键全平
              </div>
            )}
          </div>
        }
        items={tabItems}
      />
    </ConfigProvider>
  );
};

export default OrderList;
