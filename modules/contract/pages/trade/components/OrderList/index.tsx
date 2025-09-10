import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { observer } from "mobx-react-lite";
import { Tabs, Table, Switch, ConfigProvider } from "antd";
import appStore from "@/store";
import {
  usePosition,
  useOrdinaryCommission,
  useConditionalCommission,
  useHistoryCommission,
  useProfitLoss,
  useTradeHistory,
  Position,
  OrdinaryCommission,
  TradeRecord,
  TradeHistory,
} from "./hooks";
import {
  createPositionColumns,
  createOrdinaryColumns,
  createHistoryColumns,
  createTradeRecordColumns,
  createTradeHistoryColumns,
} from "./configs/columns";
import styles from "@/styles/components/Table.module.css";
import {
  SliderTheme,
  SwitchTheme,
  TableTheme,
  TabsTheme,
  TokenTheme,
} from "@/theme/publicThemeConfig";
import { NoData, NoLogin } from "@/components/noData";
import StopModal from "./components/StopModal";
import ReverModal from "./components/ReverModal";
import AdjustModal from "./components/AdjustModal";
import TipModal from "./components/TipModal";
import ConfirmModal from "./components/ConfirmModal";
import PhaseModal from "./components/PhaseModal";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

// 订单列表组件
const OrderListComponent = (props: any, ref: any) => {
  const { t } = useTranslation(["contract"]);
  const [isClient, setIsClient] = useState(false);
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState("position");
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [reverModalOpen, setReverModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [tipModal, setTipModal] = useState({
    open: false,
    title: "",
    tip: "",
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [onlyCurrentSymbol, setOnlyCurrentSymbol] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("onlyCurrentSymbol") === "true";
    }
    return false;
  });

  // 获取当前合约信息
  const currentContractInfo = appStore.getCurrentContractInfo();
  const currentSymbol = currentContractInfo?.symbol || "";
  const symbolPricePrecision =
    currentContractInfo?.coinResultVo.symbolPricePrecision;

  const getFilteredList = (list:any[],onlyCurrentSymbol:boolean,currentSymbol:string) => {
    if (!onlyCurrentSymbol || !currentSymbol) return list;
    return list.filter((item) => item.symbol === currentSymbol);
  };

  // ============ 使用各种hooks ============
  // 仓位
  const {
    loading: positionLoading,
    getPosition,
    positionNumber,
    positions,
    quickClose,
  } = usePosition({
    contractId: currentContractInfo?.id,
  });

  // 普通委托
  const {
    ordinaryCommissionNumber,
    loading: ordinaryLoading,
    getOrdinaryCommission,
    handleCancelOrdinaryOrder,
    ordinaryCommission,
  } = useOrdinaryCommission({
    contractId: currentContractInfo?.id,
  });

  // 条件委托
  const { loading: conditionalLoading, getConditionalCommission } =
    useConditionalCommission({
      contractId: currentContractInfo?.id,
    });

  // 历史委托
  const {
    historyCommissionNumber,
    loading: historyLoading,
    getHistoryCommission,
    historyCommission,
  } = useHistoryCommission({
    contractId: currentContractInfo?.id,
  });

  // 盈亏记录
  const {
    loading: profitLossLoading,
    getProfitLoss,
    profitLoss,
  } = useProfitLoss({
    contractId: currentContractInfo?.id,
  });

  // 成交记录
  const {
    loading: tradeHistoryLoading,
    getTradeHistory,
    tradeHistory,
  } = useTradeHistory({
    contractId: currentContractInfo?.id,
  });

  // 获取综合loading状态
  const loading =
    positionLoading ||
    ordinaryLoading ||
    conditionalLoading ||
    historyLoading ||
    profitLossLoading ||
    tradeHistoryLoading;

  // ============ 各种表格的列配置 ============
  const positionColumns = createPositionColumns({
    t,
    onQuickClose: quickClose,
    symbolPricePrecision,
  });
  const ordinaryColumns = createOrdinaryColumns({
    t,
    onCancelOrder: handleCancelOrdinaryOrder,
    symbolPricePrecision,
  });
  const historyColumns = createHistoryColumns({
    t,
    symbolPricePrecision,
  });
  const tradeRecordColumns = createTradeRecordColumns({
    t,
    symbolPricePrecision,
  });
  const tradeHistoryColumns = createTradeHistoryColumns({
    t,
    symbolPricePrecision,
  });

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    // 获取仓位
    getPosition,
    // 获取普通委托
    getOrdinaryCommission,
    // 获取历史委托
    getHistoryCommission,
  }));

  // ============ 各种表格的tab配置 ============
  const tabItems = [
    {
      key: "position",
      label: `${t("order.position")}(${positionNumber})`,
      children: (
        <Table<Position>
          scroll={{ x: "max-content" }}
          className={styles.table}
          columns={positionColumns}
          dataSource={getFilteredList(positions, onlyCurrentSymbol, currentSymbol)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{
            emptyText: isLoggedIn ? <NoData height="266px" /> : <NoLogin />,
          }}
        />
      ),
    },
    {
      key: "openOrders",
      label: `${t("order.currentCommission")}(${ordinaryCommissionNumber})`,
      children: (
        <Table<OrdinaryCommission>
          scroll={{ x: "max-content" }}
          className={styles.table}
          columns={ordinaryColumns}
          dataSource={getFilteredList(ordinaryCommission, onlyCurrentSymbol, currentSymbol)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{
            emptyText: isLoggedIn ? <NoData height="266px" /> : <NoLogin />,
          }}
        />
      ),
    },
    // {
    //   key: "conditionalOrders",
    //   label: `条件委托(${filterDataBySymbol(conditionalCommission).length})`,
    //   children: (
    //     <Table<any>
    //       scroll={{ x: "max-content" }}
    //       className={styles.table}
    //       columns={conditionalColumns}
    //       dataSource={getFilteredConditionalCommission(currentSymbol, onlyCurrentSymbol)}
    //       rowKey="id"
    //       pagination={false}
    //       loading={loading}
    //       locale={{
    //         emptyText: isLoggedIn ? <NoData height="266px" /> : <NoLogin />,
    //       }}
    //     />
    //   ),
    // },
    {
      key: "orderHistory",
      label: `${t("order.historyCommission")}(${historyCommissionNumber})`,
      children: (
        <Table<any>
          scroll={{ x: "max-content" }}
          className={styles.table}
          columns={historyColumns}
          dataSource={getFilteredList(
            historyCommission,
            onlyCurrentSymbol,
            currentSymbol
          )}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{
            emptyText: isLoggedIn ? <NoData height="266px" /> : <NoLogin />,
          }}
        />
      ),
    },
    {
      key: "profitLoss",
      label: `${t("order.profitLoss")}`,
      children: (
        <Table<TradeRecord>
          scroll={{ x: "max-content" }}
          className={styles.table}
          columns={tradeRecordColumns}
          dataSource={getFilteredList(profitLoss, onlyCurrentSymbol, currentSymbol)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{
            emptyText: isLoggedIn ? <NoData height="266px" /> : <NoLogin />,
          }}
        />
      ),
    },
    {
      key: "tradeHistory",
      label: `${t("order.tradeHistory")}`,
      children: (
        <Table<TradeHistory>
          scroll={{ x: "max-content" }}
          className={styles.table}
          columns={tradeHistoryColumns}
          dataSource={getFilteredList(tradeHistory, onlyCurrentSymbol, currentSymbol)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{
            emptyText: isLoggedIn ? <NoData height="266px" /> : <NoLogin />,
          }}
        />
      ),
    },
  ];

  // 切换合约或登录状态时，获取数量信息（用于tab标签显示）
  useEffect(() => {
    if (currentContractInfo?.id && isLoggedIn) {
      getPosition({ showLoading: false });
      getOrdinaryCommission({ showLoading: false, showMessage: false });
      getHistoryCommission({ showLoading: false, showMessage: false });
    }
  }, [
    currentContractInfo?.id,
    isLoggedIn,
    getPosition,
    getOrdinaryCommission,
    getHistoryCommission,
  ]);

  // 切换tab或合约时，只获取当前tab对应的表格数据
  useEffect(() => {
    if (currentContractInfo?.id && isLoggedIn) {
      const map = {
        position: ({
          showLoading,
          showMessage,
        }: {
          showLoading: boolean;
          showMessage: boolean;
        }) => getPosition({ showLoading, showMessage }),

        openOrders: ({
          showLoading,
          showMessage,
        }: {
          showLoading: boolean;
          showMessage: boolean;
        }) => getOrdinaryCommission({ showLoading, showMessage }),

        // 条件委托
        // conditionalOrders: ({ showLoading }: { showLoading: boolean }) =>
        //   getConditionalCommission({ showLoading }),

        // 历史委托
        orderHistory: ({
          showLoading,
          showMessage,
        }: {
          showLoading: boolean;
          showMessage: boolean;
        }) => getHistoryCommission({ showLoading, showMessage }),

        // 盈亏记录
        profitLoss: ({ showLoading }: { showLoading: boolean }) =>
          getProfitLoss({ showLoading }),

        // 成交记录
        tradeHistory: ({ showLoading }: { showLoading: boolean }) =>
          getTradeHistory({ showLoading }),
      };
      const fn = map[activeTab as keyof typeof map];
      // 只有仓位和当前委托需要轮询
      let intervalId: NodeJS.Timeout | null = null;
      if (activeTab === "position" || activeTab === "openOrders") {
        const poll = () => {
          fn?.({ showLoading: false, showMessage: false }).finally(() => {
            if (activeTab === "position" || activeTab === "openOrders") {
              // 检查当前是否仍是激活的 tab
              intervalId = setTimeout(poll, 800); // 请求完成后再设置下一个定时器
            }
          });
        };
        intervalId = setTimeout(poll, 800); // 启动第一次轮询
      }

      // 清理定时器
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  }, [
    activeTab,
    currentContractInfo?.id,
    isLoggedIn,
    getPosition,
    getOrdinaryCommission,
    getConditionalCommission,
    getHistoryCommission,
    getProfitLoss,
    getTradeHistory,
  ]);

  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染

  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Table: TableTheme,
            Tabs: {
              ...TabsTheme,
              inkBarColor: "transparent",
            },
            Slider: SliderTheme,
            Switch: SwitchTheme,
          },
          token: TokenTheme,
        }}
      >
        <div className="bg-[var(--background9)] h-[100%]">
          {/* tabs 切换 */}
          <Tabs
            tabBarGutter={20}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            tabBarStyle={{ padding: "0 20px", height: "72px" }}
            tabBarExtraContent={
              <div className="flex items-center gap-[20px] text-[14px] font-[400]">
                {/* 当前合约 */}
                <div className="flex items-center gap-[8px]">
                  <Switch
                    size="small"
                    checked={onlyCurrentSymbol}
                    onChange={(e) => {
                      localStorage.setItem("onlyCurrentSymbol", e.toString());
                      setOnlyCurrentSymbol(e);
                    }}
                  />
                  <div className="text-[var(--text-color5)]">
                    {t("order.onlyCurrentSymbol")}
                  </div>
                </div>
                {/* 一键全平 */}
                {/* {activeTab === "position" && (
                  <div className="text-[var(--theme-color)] cursor-pointer">
                    一键全平
                  </div>
                )} */}
              </div>
            }
            items={tabItems}
            style={{ minHeight: "404px" }}
          />
        </div>
      </ConfigProvider>
      {/* 止盈止损 */}
      <StopModal
        open={stopModalOpen}
        onCancel={() => setStopModalOpen(false)}
      />
      {/* 反向开仓 */}
      <ReverModal
        open={reverModalOpen}
        onCancel={() => setReverModalOpen(false)}
      />
      {/* 调整保证金 */}
      <AdjustModal
        open={adjustModalOpen}
        onCancel={() => setAdjustModalOpen(false)}
      />
      {/* 提示弹框 */}
      <TipModal
        title={tipModal.title}
        tip={tipModal.tip}
        open={tipModal.open}
        onCancel={() => setTipModal({ open: false, title: "", tip: "" })}
      />
      {/* 二次确认弹框 */}
      <ConfirmModal
        open={confirmModalOpen}
        onCancel={() => setConfirmModalOpen(false)}
      />
      {/* 未实现盈亏/收益率 */}
      <PhaseModal
        open={phaseModalOpen}
        onCancel={() => setPhaseModalOpen(false)}
      />
    </>
  );
};
// 使用observer包装订单列表组件
const OrderList = observer(forwardRef(OrderListComponent));

// 设置订单列表组件的displayName
OrderList.displayName = "OrderList";

// 导出订单列表组件
export default OrderList;
