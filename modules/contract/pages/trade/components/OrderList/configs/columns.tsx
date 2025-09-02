import React from "react";
import { Button, Tooltip } from "antd";
import { SvgIcon } from "@/components/icon";
import dayjs from "dayjs";
import {
  Position,
  OrdinaryCommission,
  HistoryCommission,
  TradeRecord,
  TradeHistory,
  QuickCloseParams,
} from "../hooks";
import { TFunction } from "i18next";
import QuickClose from "../components/QuickClose";
import BigNumber from "bignumber.js";
// 方向枚举
export enum Side {
  BUY = "BUY",
  SELL = "SELL",
}
// 仓位类型枚举
export enum PositionType {
  CROSS_MARGIN = 1, // 全仓
  ISOLATED_MARGIN = 2, // 逐仓
}
// 类型枚举
export enum Type {
  LIMIT = 1, // 限价单
  MARKET = 2, // 市价单
  POST_ONLY = 3, // PostOnly
  FORCE_LIQUIDATION = 4, // 强制减仓
  POSITION_MERGE = 5, // 仓位合并
}
// 开仓状态枚举
export enum Open {
  OPEN = "OPEN", // 开仓
  CLOSE = "CLOSE", // 平仓
}
// 状态枚举
export enum Status {
  PENDING = 0, // 待成交
  NEW_ORDER = 1, // 新订单
  FULLY_FILLED = 2, // 完全成交
  PARTIALLY_FILLED = 3, // 部分成交
  CANCELLED = 4, // 已取消
  CANCELLING = 5, // 待撤销
  ABNORMAL = 6, // 已废弃
  PARTIALLY_FILLED_AND_CANCELLED = 7, // 部分成交已撤销
}
// 角色枚举
export enum Role {
  MAKER = "maker",
  TAKER = "taker",
}

// 映射对象
const PositionTypeMap = {
  [PositionType.CROSS_MARGIN]: "order.common.crossMargin",
  [PositionType.ISOLATED_MARGIN]: "order.common.isolatedMargin",
};

const SideMap = {
  [Side.BUY]: {
    text: "order.common.buy",
    color: "#4CAF50",
  },
  [Side.SELL]: {
    text: "order.common.sell",
    color: "#F44336",
  },
};

const TypeMap = {
  [Type.LIMIT]: "order.common.limit",
  [Type.MARKET]: "order.common.market",
  [Type.POST_ONLY]: "order.common.postOnly",
  [Type.FORCE_LIQUIDATION]: "order.common.forceLiquidation",
  [Type.POSITION_MERGE]: "order.common.positionMerge",
};

const OpenMap = {
  [Open.OPEN]: "order.common.open",
  [Open.CLOSE]: "order.common.close",
};

const StatusMap = {
  [Status.PENDING]: "order.common.pending",
  [Status.NEW_ORDER]: "order.common.newOrder",
  [Status.FULLY_FILLED]: "order.common.fullyFilled",
  [Status.PARTIALLY_FILLED]: "order.common.partiallyFilled",
  [Status.CANCELLED]: "order.common.cancelled",
  [Status.CANCELLING]: "order.common.cancelling",
  [Status.ABNORMAL]: "order.common.abnormal",
  [Status.PARTIALLY_FILLED_AND_CANCELLED]:
    "order.common.partiallyFilledAndCancelled",
};

const RoleMap = {
  [Role.MAKER]: "Maker",
  [Role.TAKER]: "Taker",
};

interface PositionColumnConfig {
  t: TFunction;
  onQuickClose: (record: Position, params: QuickCloseParams) => void;
  symbolPricePrecision?: number;
}
/**
 * 仓位列表配置
 */
export const createPositionColumns = ({
  t,
  onQuickClose,
  symbolPricePrecision,
}: PositionColumnConfig) => {
  return [
    // 合约符号(合约)
    {
      title: t("order.positionColumn.contract"),
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          <div className="flex gap-[5px]">
            <div
              className="w-[2px] h-[11px]"
              style={{ backgroundColor: SideMap[record.orderSide].color }}
            ></div>
            <div> {record.symbol}</div>
          </div>
          <div className="flex gap-[5px]">
            {/* 仓位类型 */}
            <div> {t(PositionTypeMap[record.positionType])}</div>
            {/* 杠杆 */}
            <div> {record.leverageLevel}x</div>
          </div>
        </div>
      ),
    },
    // 方向
    {
      title: t("order.positionColumn.orderSide"),
      dataIndex: "orderSide",
      key: "orderSide",
      render: (_: any, record: Position) => (
        <div
          className="text-[12px] font-[500]"
          style={{ color: SideMap[record.orderSide].color }}
        >
          {t(SideMap[record.orderSide].text)}
        </div>
      ),
    },
    // 仓位/可平(张)
    {
      title: t("order.positionColumn.positionVolume"),
      dataIndex: "positionVolume",
      key: "positionVolume",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {record.positionVolume}/{record.canCloseVolume}
        </div>
      ),
    },
    // 开仓均价(成本价)
    {
      title: t("order.positionColumn.openAvgPrice"),
      dataIndex: "openAvgPrice",
      key: "openAvgPrice",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {new BigNumber(record.openAvgPrice).toFormat(symbolPricePrecision)}
        </div>
      ),
    },
    // 指数价格(标记价格)
    {
      title: t("order.positionColumn.indexPrice"),
      dataIndex: "indexPrice",
      key: "indexPrice",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {new BigNumber(record.indexPrice).toFormat(symbolPricePrecision)}
        </div>
      ),
    },
    // 平仓均价(预估强平价)
    {
      title: t("order.positionColumn.reducePrice"),
      dataIndex: "reducePrice",
      key: "reducePrice",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {new BigNumber(record.reducePrice).toFormat(symbolPricePrecision)}
        </div>
      ),
    },
    // 占用保证金 item.holdAmount + marginCoin
    {
      title: t("order.positionColumn.holdAmount"),
      dataIndex: "holdAmount",
      key: "holdAmount",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {new BigNumber(record.holdAmount).toFormat(symbolPricePrecision)}
        </div>
      ),
    },
    // 保证金率
    {
      title: t("order.positionColumn.marginRate"),
      dataIndex: "marginRate",
      key: "marginRate",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {new BigNumber(record.marginRate).toFormat(symbolPricePrecision)}
        </div>
      ),
    },
    // 已实现盈亏(盈亏/收益率) unrealizedProfitLoss + returnRate
    {
      title: t("order.positionColumn.realizedAmount"),
      dataIndex: "realizedAmount",
      key: "realizedAmount",
      render: (_: any, record: Position) => (
        <div
          className="text-[12px] font-[500]"
          style={{
            color:
              record.realizedAmount > 0
                ? "#4CAF50"
                : record.realizedAmount < 0
                ? "#F44336"
                : "",
          }}
        >
          <span
            style={{
              color:
                record.realizedAmount > 0
                  ? "#4CAF50"
                  : record.realizedAmount < 0
                  ? "#F44336"
                  : "",
            }}
          >
            {new BigNumber(record.realizedAmount).toFormat(
              symbolPricePrecision
            )}
          </span>
          /
          <span
            style={{
              color:
                record.returnRate > 0
                  ? "#4CAF50"
                  : record.returnRate < 0
                  ? "#F44336"
                  : "",
            }}
          >
            {new BigNumber(record.returnRate).toFormat(symbolPricePrecision)}%
          </span>
        </div>
      ),
    },
    // 开仓已实现盈亏
    {
      title: t("order.positionColumn.openRealizedAmount"),
      dataIndex: "openRealizedAmount",
      key: "openRealizedAmount",
      render: (_: any, record: Position) => (
        <div
          className="text-[12px] font-[500]"
          style={{
            color:
              record.openRealizedAmount > 0
                ? "#4CAF50"
                : record.openRealizedAmount < 0
                ? "#F44336"
                : "",
          }}
        >
          {new BigNumber(record.openRealizedAmount).toFormat(
            symbolPricePrecision
          )}
        </div>
      ),
    },
    // 快速平仓
    {
      title: t("order.positionColumn.quickClose"),
      dataIndex: "canCloseVolume",
      key: "canCloseVolume",
      render: (_: any, record: Position) => (
        <QuickClose record={record} onQuickClose={onQuickClose} />
      ),
    },
  ];
};

interface OrdinaryColumnConfig {
  t: TFunction;
  onCancelOrder?: (record: OrdinaryCommission) => void;
  symbolPricePrecision?: number;
}

/**
 * 普通委托列表配置
 */
export const createOrdinaryColumns = ({
  t,
  onCancelOrder,
  symbolPricePrecision,
}: OrdinaryColumnConfig) => [
  // 合约符号(合约)
  {
    title: t("order.ordinaryColumn.symbol"),
    dataIndex: "symbol",
    key: "symbol",
    render: (_: any, record: OrdinaryCommission) => (
      <div className="text-[12px] font-[500]">{record.symbol}</div>
    ),
  },
  // 方向
  {
    title: t("order.ordinaryColumn.side"),
    dataIndex: "side",
    key: "side",
    render: (_: any, record: OrdinaryCommission) => (
      <div
        className={`text-[12px] font-[500]`}
        style={{ color: SideMap[record.side].color }}
      >
        {t(SideMap[record.side].text)}
      </div>
    ),
  },
  //数量
  {
    title: t("order.ordinaryColumn.volume"),
    dataIndex: "volume",
    key: "volume",
    render: (_: any, record: OrdinaryCommission) => (
      <div className="text-[12px] font-[500]">{record.volume}</div>
    ),
  },
  // 委托价格
  {
    title: t("order.ordinaryColumn.price"),
    dataIndex: "price",
    key: "price",
    render: (_: any, record: OrdinaryCommission) => (
      <div className="text-[12px] font-[500]">{record.price}</div>
    ),
  },
  //成交均价
  {
    title: t("order.ordinaryColumn.avgPrice"),
    dataIndex: "avgPrice",
    key: "avgPrice",
    render: (_: any, record: OrdinaryCommission) => (
      <div className="text-[12px] font-[500]">{record.avgPrice}</div>
    ),
  },
  //类型
  {
    title: t("order.ordinaryColumn.type"),
    dataIndex: "type",
    key: "type",
    render: (_: any, record: OrdinaryCommission) => (
      <div className="text-[12px] font-[500]">{t(TypeMap[record.type])}</div>
    ),
  },
  // 委托时间
  {
    title: t("order.ordinaryColumn.mtime"),
    dataIndex: "mtime",
    key: "mtime",
    render: (_: any, record: OrdinaryCommission) => (
      <div className="text-[12px] font-[500]">
        {dayjs(record.mtime).format("YYYY-MM-DD HH:mm:ss")}
      </div>
    ),
  },
];

/**
 * 历史委托列表配置
 */
export const createHistoryColumns = ({
  t,
  symbolPricePrecision,
}: {
  t: TFunction;
  symbolPricePrecision?: number;
}) => [
  // 合约符号(合约)
  {
    title: t("order.historyColumn.symbol"),
    dataIndex: "symbol",
    key: "symbol",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.symbol}</div>
    ),
  },
  //类型
  {
    title: t("order.historyColumn.type"),
    dataIndex: "type",
    key: "type",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{t(TypeMap[record.type])}</div>
    ),
  },
  // 方向
  {
    title: t("order.historyColumn.side"),
    dataIndex: "side",
    key: "side",
    render: (_: any, record: HistoryCommission) => (
      <div
        className="text-[12px] font-[500]"
        style={{ color: SideMap[record.side].color }}
      >
        {t(SideMap[record.side].text)}
      </div>
    ),
  },
  // 委托价格
  {
    title: t("order.historyColumn.price"),
    dataIndex: "price",
    key: "price",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.price}</div>
    ),
  },
  // 委托数量
  {
    title: t("order.historyColumn.volume"),
    dataIndex: "volume",
    key: "volume",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.volume}</div>
    ),
  },
  //成交数量
  {
    title: t("order.historyColumn.dealVolume"),
    dataIndex: "dealVolume",
    key: "dealVolume",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.dealVolume}</div>
    ),
  },
  // 成交均价
  {
    title: t("order.historyColumn.avgPrice"),
    dataIndex: "avgPrice",
    key: "avgPrice",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.avgPrice}</div>
    ),
  },
  // 盈亏
  {
    title: t("order.historyColumn.realizedAmount"),
    dataIndex: "realizedAmount",
    key: "realizedAmount",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]" style={{ color:
            record.realizedAmount > 0
              ? "#4CAF50"
              : record.realizedAmount < 0
              ? "#F44336"
              : "",
        }}>{record.realizedAmount}</div>
    ),
  },
  //状态
  {
    title: t("order.historyColumn.status"),
    dataIndex: "status",
    key: "status",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">
        {t(StatusMap[record.status])}
      </div>
    ),
  },
  // 时间
  {
    title: t("order.historyColumn.ctime"),
    dataIndex: "mtime",
    key: "mtime",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">
        {dayjs(record.mtime).format("YYYY-MM-DD HH:mm:ss")}
      </div>
    ),
  },
  // 手续费
  {
    title: t("order.historyColumn.tradeFee"),
    dataIndex: "tradeFee",
    key: "tradeFee",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.tradeFee}</div>
    ),
  },
];

/**
 * 盈亏记录列表配置
 */
export const createTradeRecordColumns = ({
  t,
  symbolPricePrecision,
}: {
  t: TFunction;
  symbolPricePrecision?: number;
}) => [
   // 订单ID
  {
    title: t("order.tradeRecordColumn.id"),
    dataIndex: "id",
    key: "id",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">{record.id}</div>
    ),
  },
  // 开仓均价
  {
    title: t("order.tradeRecordColumn.openAvgPrice"),
    dataIndex: "openAvgPrice",
    key: "openAvgPrice",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">
        {new BigNumber(record.openAvgPrice).toFormat(symbolPricePrecision)}
      </div>
    ),
  },
  // 仓位类型
  {
    title: t("order.tradeRecordColumn.positionType"),
    dataIndex: "positionType",
    key: "positionType",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">
        {t(PositionTypeMap[record.positionType])}
      </div>
    ),
  },
  // 已实现盈亏
  {
    title: t("order.tradeRecordColumn.realizedAmount"),
    dataIndex: "realizedAmount",
    key: "realizedAmount",
    render: (_: any, record: TradeRecord) => (
      <div
        className="text-[12px] font-[500]"
        style={{
          color:
            record.realizedAmount > 0
              ? "#4CAF50"
              : record.realizedAmount < 0
              ? "#F44336"
              : "",
        }}
      >
        {new BigNumber(record.realizedAmount).toFormat(symbolPricePrecision)}
      </div>
    ),
  },
  // 持仓数量
  {
    title: t("order.tradeRecordColumn.positionVolume"),
    dataIndex: "positionVolume",
    key: "positionVolume",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">{record.positionVolume}</div>
    ),
  },
  // 杠杆倍数
  {
    title: t("order.tradeRecordColumn.leverageLevel"),
    dataIndex: "leverageLevel",
    key: "leverageLevel",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">{record.leverageLevel}</div>
    ),
  },
  // 开仓价格
  {
    title: t("order.tradeRecordColumn.openPrice"),
    dataIndex: "openPrice",
    key: "openPrice",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">
        {new BigNumber(record.openPrice).toFormat(symbolPricePrecision)}
      </div>
    ),
  },
  // 结算盈亏
  {
    title: t("order.tradeRecordColumn.settleProfit"),
    dataIndex: "settleProfit",
    key: "settleProfit",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">
        {new BigNumber(record.settleProfit).toFormat(symbolPricePrecision)}
      </div>
    ),
  },
  // 创建时间
  {
    title: t("order.tradeRecordColumn.mtime"),
    dataIndex: "mtime",
    key: "mtime",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">
        {dayjs(record.mtime).format("YYYY-MM-DD HH:mm:ss")}
      </div>
    ),
  },
  // 方向
  {
    title: t("order.tradeRecordColumn.orderSide"),
    dataIndex: "orderSide",
    key: "orderSide",
    render: (_: any, record: TradeRecord) => (
      <div
        className="text-[12px] font-[500]"
        style={{ color: SideMap[record.orderSide].color }}
      >
        {t(SideMap[record.orderSide].text)}
      </div>
    ),
  },
  // 已实现盈亏
  {
    title: t("order.tradeRecordColumn.profitRealizedAmount"),
    dataIndex: "profitRealizedAmount",
    key: "profitRealizedAmount",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]" style={{ color:
            record.profitRealizedAmount > 0
              ? "#4CAF50"
              : record.profitRealizedAmount < 0
              ? "#F44336"
              : "",
        }}>
        {new BigNumber(record.profitRealizedAmount).toFormat(
          symbolPricePrecision
        )}
      </div>
    ),
  },
  // 合约ID
  {
    title: t("order.tradeRecordColumn.contractId"),
    dataIndex: "contractId",
    key: "contractId",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">{record.contractId}</div>
    ),
  },
  // 历史已实现盈亏
  {
    title: t("order.tradeRecordColumn.historyRealizedAmount"),
    dataIndex: "historyRealizedAmount",
    key: "historyRealizedAmount",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]" style={{ color:
            record.historyRealizedAmount > 0
              ? "#4CAF50"
              : record.historyRealizedAmount < 0
              ? "#F44336"
              : "",
        }}>
        {new BigNumber(record.historyRealizedAmount).toFormat(
          symbolPricePrecision
        )}
      </div>
    ),
  },
  // 创建时间
  {
    title: t("order.tradeRecordColumn.ctime"),
    dataIndex: "ctime",
    key: "ctime",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">
        {dayjs(record.ctime).format("YYYY-MM-DD HH:mm:ss")}
      </div>
    ),
  },
];

/**
 * 成交历史列表配置
 */
export const createTradeHistoryColumns = ({
  t,
  symbolPricePrecision,
}: {
  t: TFunction;
  symbolPricePrecision?: number;
}) => [
  // 订单ID
  {
    title: t("order.tradeHistoryColumn.id"),
    dataIndex: "id",
    key: "id",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.id}</div>
    ),
  },
  // 合约符号
  {
    title: t("order.tradeHistoryColumn.symbol"),
    dataIndex: "symbol",
    key: "symbol",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.symbol}</div>
    ),
  },
  // 方向
  {
    title: t("order.tradeHistoryColumn.side"),
    dataIndex: "side",
    key: "side",
    render: (_: any, record: TradeHistory) => (
      <div
        className="text-[12px] font-[500]"
        style={{ color: SideMap[record.side].color }}
      >
        {t(SideMap[record.side].text)}
      </div>
    ),
  },
  // 角色
  {
    title: t("order.tradeHistoryColumn.role"),
    dataIndex: "role",
    key: "role",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{RoleMap[record.role]}</div>
    ),
  },
  // 手续费
  {
    title: t("order.tradeHistoryColumn.fee"),
    dataIndex: "fee",
    key: "fee",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">
        {new BigNumber(record.fee).toFormat(record.feeCoinPrecision)}{" "}
        {record.feeCoin}
      </div>
    ),
  },
  // 委托数量
  {
    title: t("order.tradeHistoryColumn.volume"),
    dataIndex: "volume",
    key: "volume",
    align: "right" as const,
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.volume}</div>
    ),
  },
  // 价格
  {
    title: t("order.tradeHistoryColumn.price"),
    dataIndex: "price",
    key: "price",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">
        {new BigNumber(record.price).toFormat(symbolPricePrecision)}
      </div>
    ),
  },
  // 创建时间
  {
    title: t("order.tradeHistoryColumn.ctime"),
    dataIndex: "ctime",
    key: "ctime",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">
        {dayjs(record.ctime).format("YYYY-MM-DD HH:mm:ss")}
      </div>
    ),
  },
  // 状态
  {
    title: t("order.tradeHistoryColumn.open"),
    dataIndex: "open",
    key: "open",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{t(OpenMap[record.open])}</div>
    ),
  },
];
