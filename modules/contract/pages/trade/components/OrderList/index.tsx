import React, { useState, useEffect, useCallback } from "react";
import { Tabs, Table, Switch, message, ConfigProvider, Tooltip } from "antd";
import appStore from "@/store";
import { getHistoryOrderList, getCurrentOrderList } from "@/services/contract";
import styles from "@/styles/components/Table.module.css";
import {
  SliderTheme,
  SwitchTheme,
  TableTheme,
  TabsTheme,
  TokenTheme,
} from "@/theme/publicThemeConfig";
import { NoData } from "@/components/noData";
import { SvgIcon } from "@/components/icon";
import dayjs from "dayjs";
import StopModal from "./components/StopModal";
import ReverModal from "./components/ReverModal";
import AdjustModal from "./components/AdjustModal";
import TipModal from "./components/TipModal";
import ConfirmModal from "./components/ConfirmModal";
import PhaseModal from "./components/PhaseModal";
import QuickClose from "./components/QuickClose";

// 仓位
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

// 普通委托
interface OrdinaryCommission {
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
  filledPrice: number;
  onlyReduce: boolean;
  tpsl: string;
}

// 条件委托
interface ConditionalCommission {
  id: string;
  symbol: string;
  type: "LIMIT" | "MARKET" | "CONDITIONAL";
  side: "BUY" | "SELL";
  triggerPrice: number;
  price: number;
  size: number;
  orderType: string;
  onlyReduce: boolean;
  createTime: number;
  expireTime: number;
}

// 历史委托
interface HistoryCommission {
  id: string;
  symbol: string;
  type: "LIMIT" | "MARKET" | "CONDITIONAL";
  side: "BUY" | "SELL";
  price: number;
  size: number;
  filled: number;
  filledPrice: number;
  tpsl: string;
  status: string;
  createTime: number;
  profit: number;
  fee: number;
}

// 盈亏记录
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

// 成交记录
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

const OrderList: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  // 当前tab
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

  // 仅当前合约开关
  const [onlyCurrentSymbol, setOnlyCurrentSymbol] = useState(false);

  // 取消中的订单ID集合
  const [cancellingOrderIds, setCancellingOrderIds] = useState<Set<string>>(
    new Set()
  );

  // table 数据
  // 仓位
  const [positions, setPositions] = useState<Position[]>(
    Array.from({ length: 10 }, (_, index) => ({
      id: index.toString(),
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
    }))
  );
  // 普通委托
  const [ordinaryCommission, setOrdinaryCommission] = useState<
    OrdinaryCommission[]
  >([
    {
      id: "1",
      symbol: "BTCUSDT",
      side: "BUY",
      type: "LIMIT",
      size: 595.51,
      price: 10000,
      onlyReduce: true,
      filled: 0,
      filledPrice: 10000,
      remaining: 0,
      status: "NEW",
      createTime: 1717334400000,
      tpsl: "10000",
    },
  ]);
  // 条件委托
  const [conditionalCommission, setConditionalCommission] = useState<
    ConditionalCommission[]
  >([
    {
      id: "1",
      symbol: "BTCUSDT",
      type: "LIMIT",
      side: "BUY",
      triggerPrice: 10000,
      price: 10000,
      size: 10000,
      orderType: "LIMIT",
      onlyReduce: true,
      createTime: 1717334400000,
      expireTime: 1717334400000,
    },
  ]);
  // 历史委托
  const [historyCommission, setHistoryCommission] = useState<
    HistoryCommission[]
  >([
    {
      id: "1",
      symbol: "BTCUSDT",
      type: "LIMIT",
      side: "BUY",
      price: 10000,
      size: 10000,
      filled: 10000,
      filledPrice: 10000,
      tpsl: "10000",
      status: "NEW",
      createTime: 1717334400000,
      profit: 10000,
      fee: 10000,
    },
  ]);
  // 盈亏记录
  const [profitLoss, setProfitLoss] = useState<TradeRecord[]>([
    {
      id: "1",
      symbol: "BTCUSDT",
      side: "BUY",
      size: 10000,
      price: 10000,
      fee: 10000,
      createTime: 1717334400000,
      openPrice: 10000,
      realizedPnl: 10000,
      fundingFee: 10000,
      pnl: 10000,
      closeTime: 1717334400000,
    },
  ]);
  // 成交记录
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([
    {
      id: "1",
      symbol: "BTCUSDT",
      side: "BUY",
      size: 10000,
      filledPrice: 10000,
      role: "maker",
      fee: 10000,
      createTime: 1717334400000,
    },
  ]);

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
        limit: 100,
        page: 1,
      });
      if (response?.data?.orderList) {
        setHistoryCommission(response.data.orderList || []);
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
        limit: 10,
        page: 1,
        type: "",
        uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      });

      if (response?.data?.orderList) {
        // 这里应该根据实际API返回的数据结构来设置不同的状态
        // setPositions(response.data.orderList || []);
      }
    } catch (error) {
      console.error("Failed to fetch order list:", error);
      message.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, [currentContractInfo?.id]);

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
        <div
          className="text-[12px] font-[500] cursor-pointer"
          onClick={() =>
            setTipModal({
              open: true,
              title: "自动减仓",
              tip: "该指标代表你在自动减仓序列的排序。若指示灯全部亮起，发生平仓事件后，您的持仓可能会被减少。",
            })
          }
        >
          {record.symbol}
        </div>
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
          <div className="flex items-center gap-[4px] ">
            <div>USDT</div>
            <SvgIcon
              onClick={() => setAdjustModalOpen(true)}
              className="text-[var(--text-color5)] flex items-center cursor-pointer"
              width={18}
              height={18}
              viewBox="0 0 18 18"
            >
              <path
                d="M9 1.5C13.1422 1.5 16.5 4.85775 16.5 9C16.5 13.1422 13.1422 16.5 9 16.5C4.85775 16.5 1.5 13.1422 1.5 9C1.5 4.85775 4.85775 1.5 9 1.5ZM9 3C7.4087 3 5.88258 3.63214 4.75736 4.75736C3.63214 5.88258 3 7.4087 3 9C3 10.5913 3.63214 12.1174 4.75736 13.2426C5.88258 14.3679 7.4087 15 9 15C10.5913 15 12.1174 14.3679 13.2426 13.2426C14.3679 12.1174 15 10.5913 15 9C15 7.4087 14.3679 5.88258 13.2426 4.75736C12.1174 3.63214 10.5913 3 9 3ZM9 5.25C9.19891 5.25 9.38968 5.32902 9.53033 5.46967C9.67098 5.61032 9.75 5.80109 9.75 6V8.25H12C12.1989 8.25 12.3897 8.32902 12.5303 8.46967C12.671 8.61032 12.75 8.80109 12.75 9C12.75 9.19891 12.671 9.38968 12.5303 9.53033C12.3897 9.67098 12.1989 9.75 12 9.75H9.75V12C9.75 12.1989 9.67098 12.3897 9.53033 12.5303C9.38968 12.671 9.19891 12.75 9 12.75C8.80109 12.75 8.61032 12.671 8.46967 12.5303C8.32902 12.3897 8.25 12.1989 8.25 12V9.75H6C5.80109 9.75 5.61032 9.67098 5.46967 9.53033C5.32902 9.38968 5.25 9.19891 5.25 9C5.25 8.80109 5.32902 8.61032 5.46967 8.46967C5.61032 8.32902 5.80109 8.25 6 8.25H8.25V6C8.25 5.80109 8.32902 5.61032 8.46967 5.46967C8.61032 5.32902 8.80109 5.25 9 5.25Z"
                fill="currentColor"
              />
            </SvgIcon>
          </div>
        </div>
      ),
    },
    {
      title: "保证金率",
      dataIndex: "marginRate",
      key: "marginRate",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.marginRate} %</div>
      ),
    },
    {
      title: "未实现盈亏/收益率",
      dataIndex: "pnl",
      key: "pnl",
      render: (_: any, record: Position) => (
        <div className="font-[500] text-[12px]">
          <div className="flex items-center gap-[4px]">
            <div
              className={record.pnl >= 0 ? "text-[#4CAF50]" : "text-[#F44336]"}
            >
              {record.pnl}
            </div>
            <div className="text-[var(--text-color5)]">USDT</div>
            <SvgIcon
              onClick={() => setPhaseModalOpen(true)}
              width={18}
              height={18}
              viewBox="0 0 18 18"
              className="text-[var(--text-color6)]"
            >
              <path
                d="M14.625 4.40072L8.23034 10.764C7.95507 11.0379 7.50988 11.0368 7.23596 10.7616C6.96206 10.4863 6.96315 10.0411 7.23843 9.76721L13.6621 3.375H11.0039C10.6156 3.375 10.3008 3.06019 10.3008 2.67188C10.3008 2.28356 10.6156 1.96875 11.0039 1.96875H14.0625C15.1498 1.96875 16.0312 2.85019 16.0312 3.9375V6.99609C16.0312 7.38441 15.7164 7.69922 15.3281 7.69922C14.9398 7.69922 14.625 7.38441 14.625 6.99609V4.40072ZM14.625 10.3757C14.625 9.98735 14.9398 9.67256 15.3281 9.67256C15.7164 9.67256 16.0312 9.98735 16.0312 10.3757V14.0625C16.0312 15.1498 15.1498 16.0312 14.0625 16.0312H3.9375C2.85019 16.0312 1.96875 15.1498 1.96875 14.0625V3.9375C1.96875 2.85019 2.85019 1.96875 3.9375 1.96875H7.62434C8.01264 1.96875 8.32746 2.28356 8.32746 2.67188C8.32746 3.06019 8.01264 3.375 7.62434 3.375H3.9375C3.62684 3.375 3.375 3.62684 3.375 3.9375V14.0625C3.375 14.3732 3.62684 14.625 3.9375 14.625H14.0625C14.3732 14.625 14.625 14.3732 14.625 14.0625V10.3757Z"
                fill="currentColor"
              />
            </SvgIcon>
          </div>
          <div
            className={
              record.pnlRate >= 0 ? "text-[#4CAF50]" : "text-[#F44336]"
            }
          >
            {record.pnlRate}%
          </div>
        </div>
      ),
    },
    {
      title: "快速平仓",
      key: "quickClose",
      render: () => <QuickClose />,
    },
    {
      title: "反向开仓",
      key: "reverseOpen",
      render: () => (
        <span
          onClick={() => setReverModalOpen(true)}
          className="p-[4px_6px] cursor-pointer bg-[var(--background14)] rounded-[4px] text-[12px] font-[500] whitespace-nowrap"
        >
          反向开仓
        </span>
      ),
    },
    {
      title: "止盈止损",
      key: "tpsl",
      render: () => (
        <SvgIcon
          className="text-[var(--theme-color)]"
          onClick={() => setStopModalOpen(true)}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.5431 2.27249C12.2618 1.99129 11.8803 1.83331 11.4826 1.83331C11.0848 1.83331 10.7034 1.99129 10.4221 2.27249L2.68657 10.008C2.40525 10.2892 2.24716 10.6707 2.24707 11.0685V14.9932C2.24707 15.411 2.58682 15.7507 3.00457 15.7507L15.0001 15.75C15.199 15.75 15.3897 15.671 15.5304 15.5303C15.6711 15.3897 15.7501 15.1989 15.7501 15C15.7501 14.8011 15.6711 14.6103 15.5304 14.4697C15.3897 14.329 15.199 14.25 15.0001 14.25H9.05107L15.7253 7.57574C16.0065 7.29445 16.1645 6.91299 16.1645 6.51524C16.1645 6.1175 16.0065 5.73603 15.7253 5.45474L12.5431 2.27249ZM6.93007 14.25L14.6648 6.51524L11.4826 3.33299L3.74707 11.0685V14.25H6.93007Z"
            fill="currentColor"
          />
        </SvgIcon>
      ),
    },
  ];

  // 普通委托: 合约,方向,数量,完成度 ,委托价格,成交均价,类型,只减仓,止盈止损,时间,全撤
  const ordinaryColumns = [
    {
      title: "合约",
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.symbol}</div>
      ),
    },
    {
      title: "方向",
      dataIndex: "side",
      key: "side",
      render: (_: any, record: OrdinaryCommission) => (
        <span
          className={`${
            record.side === "BUY" ? "text-[#4CAF50]" : "text-[#F44336]"
          }`}
        >
          {record.side === "BUY" ? "买入" : "卖出"}
        </span>
      ),
    },
    {
      title: "数量",
      dataIndex: "size",
      key: "size",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">
          <div>0.00/1,245.02</div>
          <div>USDT</div>
        </div>
      ),
    },
    {
      title: "完成度",
      key: "completion",
      render: (_: any, record: OrdinaryCommission) => {
        const completion = (record.filled / record.size) * 100;
        return (
          <div className="text-[12px] font-[500]">
            {completion?.toFixed(1) || "0.0"}%
          </div>
        );
      },
    },
    {
      title: "委托价格",
      dataIndex: "price",
      key: "price",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.price}</div>
      ),
    },
    {
      title: "成交均价",
      dataIndex: "filledPrice",
      key: "filledPrice",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.filledPrice}</div>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (_: any, record: OrdinaryCommission) => {
        const typeMap = {
          LIMIT: "限价",
          MARKET: "市价",
          CONDITIONAL: "条件",
        };
        return (
          <div className="text-[12px] font-[500]">
            {typeMap[record.type as keyof typeof typeMap] || record.type}
          </div>
        );
      },
    },
    {
      title: "只减仓",
      dataIndex: "onlyReduce",
      key: "onlyReduce",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">
          {record.onlyReduce ? "是" : "否"}
        </div>
      ),
    },
    {
      title: "止盈止损",
      dataIndex: "tpsl",
      key: "tpsl",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.tpsl}</div>
      ),
    },
    {
      title: "时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">
          {dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      ),
    },
    {
      title: (
        <div className="text-[12px] font-[500] text-[var(--theme-color)] cursor-pointer">
          全撤
        </div>
      ),
      key: "action",
      align: "right" as const,
      render: (_: any, record: OrdinaryCommission) => {
        return (
          <Tooltip title="取消" placement="left" className="ml-auto">
            <SvgIcon
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="text-[var(--theme-color)]"
            >
              <path
                fill="currentColor"
                d="M14.28 2C14.6998 2.00011 15.1088 2.13229 15.4493 2.37781C15.7898 2.62333 16.0444 2.96975 16.177 3.368L16.72 5H20C20.2652 5 20.5196 5.10536 20.7071 5.29289C20.8946 5.48043 21 5.73478 21 6C21 6.26522 20.8946 6.51957 20.7071 6.70711C20.5196 6.89464 20.2652 7 20 7L19.997 7.071L19.13 19.214C19.0759 19.9706 18.7372 20.6786 18.182 21.1956C17.6269 21.7125 16.8965 21.9999 16.138 22H7.862C7.10346 21.9999 6.37311 21.7125 5.81797 21.1956C5.26283 20.6786 4.92411 19.9706 4.87 19.214L4.003 7.07C4.00119 7.04671 4.00019 7.02336 4 7C3.73478 7 3.48043 6.89464 3.29289 6.70711C3.10536 6.51957 3 6.26522 3 6C3 5.73478 3.10536 5.48043 3.29289 5.29289C3.48043 5.10536 3.73478 5 4 5H7.28L7.823 3.368C7.9557 2.96959 8.21043 2.62305 8.5511 2.37752C8.89176 2.13198 9.30107 1.9999 9.721 2H14.28ZM17.997 7H6.003L6.865 19.071C6.88295 19.3232 6.99577 19.5592 7.18076 19.7316C7.36574 19.904 7.60916 19.9999 7.862 20H16.138C16.3908 19.9999 16.6343 19.904 16.8192 19.7316C17.0042 19.5592 17.117 19.3232 17.135 19.071L17.997 7ZM10 10C10.2449 10 10.4813 10.09 10.6644 10.2527C10.8474 10.4155 10.9643 10.6397 10.993 10.883L11 11V16C10.9997 16.2549 10.9021 16.5 10.7272 16.6854C10.5522 16.8707 10.313 16.9822 10.0586 16.9972C9.80416 17.0121 9.55362 16.9293 9.35817 16.7657C9.16271 16.6021 9.0371 16.3701 9.007 16.117L9 16V11C9 10.7348 9.10536 10.4804 9.29289 10.2929C9.48043 10.1054 9.73478 10 10 10ZM14 10C14.2652 10 14.5196 10.1054 14.7071 10.2929C14.8946 10.4804 15 10.7348 15 11V16C15 16.2652 14.8946 16.5196 14.7071 16.7071C14.5196 16.8946 14.2652 17 14 17C13.7348 17 13.4804 16.8946 13.2929 16.7071C13.1054 16.5196 13 16.2652 13 16V11C13 10.7348 13.1054 10.4804 13.2929 10.2929C13.4804 10.1054 13.7348 10 14 10ZM14.28 4H9.72L9.387 5H14.613L14.28 4Z"
              />
            </SvgIcon>
          </Tooltip>
        );
      },
    },
  ];

  // 条件委托: 合约,类型,方向,触发价格 ,委托价格,委托数量,订单类型,只减仓,提交时间,过期时间,全撤
  const conditionalColumns = [
    {
      title: "合约",
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: ConditionalCommission) => (
        <div className="text-[12px] font-[500]">{record.symbol}</div>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (_: any, record: ConditionalCommission) => (
        <div className="text-[12px] font-[500]">{record.type}</div>
      ),
    },
    {
      title: "方向",
      dataIndex: "side",
      key: "side",
      render: (_: any, record: ConditionalCommission) => (
        <span
          className={`${
            record.side === "BUY" ? "text-[#4CAF50]" : "text-[#F44336]"
          }`}
        >
          {record.side === "BUY" ? "买入" : "卖出"}
        </span>
      ),
    },
    {
      title: "触发价格",
      dataIndex: "triggerPrice",
      key: "triggerPrice",
      render: (_: any, record: ConditionalCommission) => (
        <div className="text-[12px] font-[500]">{record.triggerPrice}</div>
      ),
    },
    {
      title: "委托价格",
      dataIndex: "price",
      key: "price",
      render: (_: any, record: ConditionalCommission) => (
        <div className="text-[12px] font-[500]">{record.price}</div>
      ),
    },
    {
      title: "委托数量",
      dataIndex: "size",
      key: "size",
      render: (_: any, record: ConditionalCommission) => (
        <div className="text-[12px] font-[500]">{record.size} USDT</div>
      ),
    },
    {
      title: "订单类型",
      dataIndex: "orderType",
      key: "orderType",
      render: (_: any, record: ConditionalCommission) => (
        <div className="text-[12px] font-[500]">{record.orderType}</div>
      ),
    },
    {
      title: "只减仓",
      dataIndex: "onlyReduce",
      key: "onlyReduce",
      render: (_: any, record: ConditionalCommission) => (
        <div className="text-[12px] font-[500]">
          {record.onlyReduce ? "是" : "否"}
        </div>
      ),
    },
    {
      title: "提交时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (_: any, record: ConditionalCommission) => (
        <div className="text-[12px] font-[500]">
          {dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      ),
    },
    {
      title: "过期时间",
      dataIndex: "expireTime",
      key: "expireTime",
      render: (_: any, record: ConditionalCommission) => (
        <div className="text-[12px] font-[500]">
          {dayjs(record.expireTime).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      ),
    },
    {
      title: "全撤",
      key: "action",
      render: (_: any, record: ConditionalCommission) => {
        return (
          <SvgIcon
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="text-[var(--theme-color)]"
          >
            <path
              fill="currentColor"
              d="M14.28 2C14.6998 2.00011 15.1088 2.13229 15.4493 2.37781C15.7898 2.62333 16.0444 2.96975 16.177 3.368L16.72 5H20C20.2652 5 20.5196 5.10536 20.7071 5.29289C20.8946 5.48043 21 5.73478 21 6C21 6.26522 20.8946 6.51957 20.7071 6.70711C20.5196 6.89464 20.2652 7 20 7L19.997 7.071L19.13 19.214C19.0759 19.9706 18.7372 20.6786 18.182 21.1956C17.6269 21.7125 16.8965 21.9999 16.138 22H7.862C7.10346 21.9999 6.37311 21.7125 5.81797 21.1956C5.26283 20.6786 4.92411 19.9706 4.87 19.214L4.003 7.07C4.00119 7.04671 4.00019 7.02336 4 7C3.73478 7 3.48043 6.89464 3.29289 6.70711C3.10536 6.51957 3 6.26522 3 6C3 5.73478 3.10536 5.48043 3.29289 5.29289C3.48043 5.10536 3.73478 5 4 5H7.28L7.823 3.368C7.9557 2.96959 8.21043 2.62305 8.5511 2.37752C8.89176 2.13198 9.30107 1.9999 9.721 2H14.28ZM17.997 7H6.003L6.865 19.071C6.88295 19.3232 6.99577 19.5592 7.18076 19.7316C7.36574 19.904 7.60916 19.9999 7.862 20H16.138C16.3908 19.9999 16.6343 19.904 16.8192 19.7316C17.0042 19.5592 17.117 19.3232 17.135 19.071L17.997 7ZM10 10C10.2449 10 10.4813 10.09 10.6644 10.2527C10.8474 10.4155 10.9643 10.6397 10.993 10.883L11 11V16C10.9997 16.2549 10.9021 16.5 10.7272 16.6854C10.5522 16.8707 10.313 16.9822 10.0586 16.9972C9.80416 17.0121 9.55362 16.9293 9.35817 16.7657C9.16271 16.6021 9.0371 16.3701 9.007 16.117L9 16V11C9 10.7348 9.10536 10.4804 9.29289 10.2929C9.48043 10.1054 9.73478 10 10 10ZM14 10C14.2652 10 14.5196 10.1054 14.7071 10.2929C14.8946 10.4804 15 10.7348 15 11V16C15 16.2652 14.8946 16.5196 14.7071 16.7071C14.5196 16.8946 14.2652 17 14 17C13.7348 17 13.4804 16.8946 13.2929 16.7071C13.1054 16.5196 13 16.2652 13 16V11C13 10.7348 13.1054 10.4804 13.2929 10.2929C13.4804 10.1054 13.7348 10 14 10ZM14.28 4H9.72L9.387 5H14.613L14.28 4Z"
            />
          </SvgIcon>
        );
      },
    },
  ];

  // 历史委托: 合约,类型(强制减仓),方向,委托价格 ,委托数量,成交数量,成交均价,盈亏,手续费,止盈止损,状态,时间
  const historyColumns = [
    {
      title: "合约",
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: HistoryCommission) => (
        <div className="text-[12px] font-[500]">{record.symbol}</div>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (_: any, record: HistoryCommission) => (
        <div className="text-[12px] font-[500] flex items-center gap-[4px]">
          <div>{record.type}</div>
          <div
            className="text-[var(--theme-color)] cursor-pointer"
            onClick={() =>
              setTipModal({
                open: true,
                title: "强制减仓",
                tip: "BTCUSDT标记价格到达34,039.1，仓位保证金率大于或等于100%，触发强制平仓，仓位被系统接管。仓位被系统接管后，会以破产价格委托到市场上，若成交后有盈利，则盈利部分注入保险基金中。",
              })
            }
          >
            查看
          </div>
        </div>
      ),
    },
    {
      title: "方向",
      dataIndex: "side",
      key: "side",
      render: (_: any, record: HistoryCommission) => (
        <span
          className={`${
            record.side === "BUY" ? "text-[#4CAF50]" : "text-[#F44336]"
          }`}
        >
          {record.side === "BUY" ? "买入" : "卖出"}
        </span>
      ),
    },
    {
      title: "委托价格",
      dataIndex: "price",
      key: "price",
      render: (_: any, record: HistoryCommission) => (
        <div className="text-[12px] font-[500]">{record.price}</div>
      ),
    },
    {
      title: "委托数量",
      dataIndex: "size",
      key: "size",
      render: (_: any, record: HistoryCommission) => (
        <div className="text-[12px] font-[500]">{record.size}</div>
      ),
    },
    {
      title: "成交数量",
      dataIndex: "filled",
      key: "filled",
      render: (_: any, record: HistoryCommission) => (
        <div className="text-[12px] font-[500]">{record.filled}</div>
      ),
    },
    {
      title: "成交均价",
      dataIndex: "filledPrice",
      key: "filledPrice",
      render: (_: any, record: HistoryCommission) => (
        <div className="text-[12px] font-[500]">{record.filledPrice}</div>
      ),
    },
    {
      title: "盈亏",
      dataIndex: "profit",
      key: "profit",
      render: (_: any, record: HistoryCommission) => (
        <div
          className={`text-[12px] font-[500] ${
            record.profit >= 0 ? "text-[#4CAF50]" : "text-[#F44336]"
          }`}
        >
          {record.profit} USDT
        </div>
      ),
    },
    {
      title: "手续费",
      dataIndex: "fee",
      key: "fee",
      render: (_: any, record: HistoryCommission) => (
        <div className="text-[12px] font-[500]">{record.fee} USDT</div>
      ),
    },
    {
      title: "止盈止损",
      dataIndex: "tpsl",
      key: "tpsl",
      render: (_: any, record: HistoryCommission) => (
        <div className="text-[12px] font-[500]">{record.tpsl}</div>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: HistoryCommission) => (
        <div className="text-[12px] font-[500]">{record.status}</div>
      ),
    },
    {
      title: "时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (_: any, record: HistoryCommission) => (
        <div className="text-[12px] font-[500]">
          {dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      ),
    },
  ];

  // 盈亏记录: 合约,开仓均价,仓位数量,已实现盈亏,手续费,资金费用,仓位盈亏,分摊,平仓时间
  const tradeRecordColumns = [
    {
      title: "合约",
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: TradeRecord) => (
        <div className="text-[12px] font-[500] flex items-center gap-[4px]">
          <div className="text-[#00C788]">{record.symbol}</div>
          <div>逐仓 50x</div>
        </div>
      ),
    },
    {
      title: "开仓均价",
      dataIndex: "openPrice",
      key: "openPrice",
      render: (_: any, record: TradeRecord) => (
        <div className="text-[12px] font-[500]">{record.openPrice}</div>
      ),
    },
    {
      title: "仓位数量",
      dataIndex: "size",
      key: "size",
      render: (_: any, record: TradeRecord) => (
        <div className="text-[12px] font-[500]">{record.size}</div>
      ),
    },
    {
      title: "已实现盈亏",
      dataIndex: "realizedPnl",
      key: "realizedPnl",
      render: (_: any, record: TradeRecord) => (
        <div className="text-[12px] font-[500]">{record.realizedPnl}</div>
      ),
    },
    {
      title: "手续费",
      dataIndex: "fee",
      key: "fee",
      render: (_: any, record: TradeRecord) => (
        <div className="text-[12px] font-[500]">{record.fee} USDT</div>
      ),
    },
    {
      title: "资金费用",
      dataIndex: "fundingFee",
      key: "fundingFee",
      render: (_: any, record: TradeRecord) => (
        <div className="text-[12px] font-[500]">{record.fundingFee}</div>
      ),
    },
    {
      title: "仓位盈亏",
      dataIndex: "pnl",
      key: "pnl",
      render: (_: any, record: TradeRecord) => (
        <div className="text-[12px] font-[500] flex items-center gap-[4px]">
          <div>{record.pnl}</div>
          <SvgIcon
            width="18"
            height="18"
            viewBox="0 0 18 18"
            className="text-[var(--text-color6)]"
          >
            <path
              d="M14.625 4.40072L8.23034 10.764C7.95507 11.0379 7.50988 11.0368 7.23596 10.7616C6.96206 10.4863 6.96315 10.0411 7.23843 9.76721L13.6621 3.375H11.0039C10.6156 3.375 10.3008 3.06019 10.3008 2.67188C10.3008 2.28356 10.6156 1.96875 11.0039 1.96875H14.0625C15.1498 1.96875 16.0312 2.85019 16.0312 3.9375V6.99609C16.0312 7.38441 15.7164 7.69922 15.3281 7.69922C14.9398 7.69922 14.625 7.38441 14.625 6.99609V4.40072ZM14.625 10.3757C14.625 9.98735 14.9398 9.67256 15.3281 9.67256C15.7164 9.67256 16.0312 9.98735 16.0312 10.3757V14.0625C16.0312 15.1498 15.1498 16.0312 14.0625 16.0312H3.9375C2.85019 16.0312 1.96875 15.1498 1.96875 14.0625V3.9375C1.96875 2.85019 2.85019 1.96875 3.9375 1.96875H7.62434C8.01264 1.96875 8.32746 2.28356 8.32746 2.67188C8.32746 3.06019 8.01264 3.375 7.62434 3.375H3.9375C3.62684 3.375 3.375 3.62684 3.375 3.9375V14.0625C3.375 14.3732 3.62684 14.625 3.9375 14.625H14.0625C14.3732 14.625 14.625 14.3732 14.625 14.0625V10.3757Z"
              fill="currentColor"
            />
          </SvgIcon>
        </div>
      ),
    },
    {
      title: "分摊",
      dataIndex: "pnl",
      key: "pnl",
      render: (_: any, record: TradeRecord) => (
        <div className="text-[12px] font-[500]">{record.pnl}</div>
      ),
    },
    {
      title: "平仓时间",
      dataIndex: "closeTime",
      key: "closeTime",
      align: "right" as const,
      render: (_: any, record: TradeRecord) => (
        <div className="text-[12px] font-[500]">
          {dayjs(record.closeTime).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      ),
    },
  ];

  // 成交记录: 合约,成交均价,方向,成交数量,角色,手续费,时间
  const tradeHistoryColumns = [
    {
      title: "合约",
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: TradeHistory) => (
        <div className="text-[12px] font-[500]">{record.symbol}</div>
      ),
    },
    {
      title: "成交均价",
      dataIndex: "filledPrice",
      key: "filledPrice",
      render: (_: any, record: TradeHistory) => (
        <div className="text-[12px] font-[500]">{record.filledPrice}</div>
      ),
    },
    {
      title: "方向",
      dataIndex: "side",
      key: "side",
      render: (_: any, record: TradeHistory) => (
        <span
          className={`${
            record.side === "BUY" ? "text-[#4CAF50]" : "text-[#F44336]"
          }`}
        >
          {record.side === "BUY" ? "买入" : "卖出"}
        </span>
      ),
    },
    {
      title: "成交数量",
      dataIndex: "size",
      key: "size",
      render: (_: any, record: TradeHistory) => (
        <div className="text-[12px] font-[500]">{record.size}</div>
      ),
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (_: any, record: TradeHistory) => (
        <div className="text-[12px] font-[500]">{record.role}</div>
      ),
    },
    {
      title: "手续费",
      dataIndex: "fee",
      key: "fee",
      render: (_: any, record: TradeHistory) => (
        <div className="text-[12px] font-[500]">{record.fee} USDT</div>
      ),
    },
    {
      title: "时间",
      dataIndex: "createTime",
      key: "createTime",
      align: "right" as const,
      render: (_: any, record: TradeHistory) => (
        <div className="text-[12px] font-[500]">{record.createTime}</div>
      ),
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
      label: `普通委托(${filterDataBySymbol(ordinaryCommission).length})`,
      children: (
        <Table<OrdinaryCommission>
          className={styles.table}
          columns={ordinaryColumns}
          dataSource={filterDataBySymbol(ordinaryCommission)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData height="266px" /> }}
        />
      ),
    },
    {
      key: "conditionalOrders",
      label: `条件委托(${filterDataBySymbol(conditionalCommission).length})`,
      children: (
        <Table<any>
          className={styles.table}
          columns={conditionalColumns}
          dataSource={filterDataBySymbol(conditionalCommission)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData height="266px" /> }}
        />
      ),
    },
    {
      key: "orderHistory",
      label: `历史委托(${filterDataBySymbol(historyCommission).length})`,
      children: (
        <Table<any>
          className={styles.table}
          columns={historyColumns}
          dataSource={filterDataBySymbol(historyCommission)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData height="266px" /> }}
        />
      ),
    },
    {
      key: "profitLoss",
      label: `盈亏记录(${filterDataBySymbol(profitLoss).length})`,
      children: (
        <Table<TradeRecord>
          className={styles.table}
          columns={tradeRecordColumns}
          dataSource={filterDataBySymbol(profitLoss)}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData height="266px" /> }}
        />
      ),
    },
    {
      key: "tradeHistory",
      label: `成交记录(${filterDataBySymbol(tradeHistory).length})`,
      children: (
        <Table<TradeHistory>
          className={styles.table}
          columns={tradeHistoryColumns}
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
  }, [getOrderList, currentContractInfo?.id]);

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

export default OrderList;
