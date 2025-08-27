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
} from "../hooks";
import { TFunction } from "i18next";
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
  MAKER = "MAKER",
  TAKER = "TAKER",
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
  onQuickClose?: (
    record: Position,
    type: "market" | "limit",
    price?: number
  ) => void;
}
/**
 * 仓位列表配置
 */
export const createPositionColumns = ({
  t,
  onQuickClose,
}: PositionColumnConfig) => {
  return [
    {
      title: t("order.positionColumn.positionId"),
      dataIndex: "id",
      key: "id",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.id}</div>
      ),
    },
    {
      title: t("order.positionColumn.contractId"),
      dataIndex: "contractId",
      key: "contractId",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.contractId}</div>
      ),
    },
    {
      title: t("order.positionColumn.contractName"),
      dataIndex: "contractName",
      key: "contractName",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          <div className="flex gap-[5px]">
            <div className="w-[2px] h-[11px]" style={{ backgroundColor: SideMap[record.orderSide].color }}></div>
            <div> {record.contractName}</div>
          </div>
          <div className="flex gap-[5px]">
            {/* 仓位类型 */}
            <div>  {t(PositionTypeMap[record.positionType])}</div>
            {/* 杠杆 */}
            <div> {record.leverageLevel}x</div>
          </div>
        </div>
      ),
    },
    {
      title: t("order.positionColumn.symbol"),
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.symbol}</div>
      ),
    },
    {
      title: t("order.positionColumn.positionVolume"),
      dataIndex: "positionVolume",
      key: "positionVolume",
      render: (_: any, record: Position) => (
        <div
          className="text-[12px] font-[500]"
          style={{ color: SideMap[record.orderSide].color }}
        >
          {record.positionVolume} {record.symbol.split("-")[1]}
        </div>
      ),
    },
    {
      title: t("order.positionColumn.canCloseVolume"),
      dataIndex: "canCloseVolume",
      key: "canCloseVolume",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.canCloseVolume}</div>
      ),
    },
    {
      title: t("order.positionColumn.quickClose"),
      dataIndex: "canCloseVolume",
      key: "canCloseVolume",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500] flex gap-[5px]">
          <Button size="small" onClick={() => onQuickClose?.(record, "market")}>
            {t("order.positionColumn.marketClose")}
          </Button>
          <Button
            size="small"
            onClick={() =>
              onQuickClose?.(record, "limit", record.canCloseVolume)
            }
          >
            {t("order.positionColumn.limitClose")}
          </Button>
        </div>
      ),
    },
    {
      title: t("order.positionColumn.openAvgPrice"),
      dataIndex: "openAvgPrice",
      key: "openAvgPrice",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.openAvgPrice}</div>
      ),
    },
    {
      title: t("order.positionColumn.indexPrice"),
      dataIndex: "indexPrice",
      key: "indexPrice",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.indexPrice}</div>
      ),
    },
    {
      title: t("order.positionColumn.reducePrice"),
      dataIndex: "reducePrice",
      key: "reducePrice",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.reducePrice}</div>
      ),
    },
    {
      title: t("order.positionColumn.holdAmount"),
      dataIndex: "holdAmount",
      key: "holdAmount",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.holdAmount}</div>
      ),
    },
    {
      title: t("order.positionColumn.marginRate"),
      dataIndex: "marginRate",
      key: "marginRate",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.marginRate}</div>
      ),
    },
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
          {record.realizedAmount}
        </div>
      ),
    },
    {
      title: t("order.positionColumn.returnRate"),
      dataIndex: "returnRate",
      key: "returnRate",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.returnRate}</div>
      ),
    },
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
    {
      title: t("order.positionColumn.positionType"),
      dataIndex: "positionType",
      key: "positionType",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {t(PositionTypeMap[record.positionType])}
        </div>
      ),
    },
    {
      title: t("order.positionColumn.canUseAmount"),
      dataIndex: "canUseAmount",
      key: "canUseAmount",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.canUseAmount}</div>
      ),
    },
    {
      title: t("order.positionColumn.canSubMarginAmount"),
      dataIndex: "canSubMarginAmount",
      key: "canSubMarginAmount",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {record.canSubMarginAmount}
        </div>
      ),
    },
    {
      title: t("order.positionColumn.openRealizedAmount"),
      dataIndex: "openRealizedAmount",
      key: "openRealizedAmount",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {record.openRealizedAmount}
        </div>
      ),
    },
    {
      title: t("order.positionColumn.keepRate"),
      dataIndex: "keepRate",
      key: "keepRate",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.keepRate}</div>
      ),
    },
    {
      title: t("order.positionColumn.maxFeeRate"),
      dataIndex: "maxFeeRate",
      key: "maxFeeRate",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.maxFeeRate}</div>
      ),
    },
    {
      title: t("order.positionColumn.unRealizedAmount"),
      dataIndex: "unRealizedAmount",
      key: "unRealizedAmount",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.unRealizedAmount}</div>
      ),
    },
    {
      title: t("order.positionColumn.leverageLevel"),
      dataIndex: "leverageLevel",
      key: "leverageLevel",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.leverageLevel}</div>
      ),
    },
    {
      title: t("order.positionColumn.positionBalance"),
      dataIndex: "positionBalance",
      key: "positionBalance",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">{record.positionBalance}</div>
      ),
    },
  ];
};

interface OrdinaryColumnConfig {
  t: TFunction;
  onCancelOrder?: (record: OrdinaryCommission) => void;
}

/**
 * 普通委托列表配置
 */
export const createOrdinaryColumns = ({
  t,
  onCancelOrder,
}: OrdinaryColumnConfig) => [
    {
      title: t("order.ordinaryColumn.symbol"),
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.symbol}</div>
      ),
    },
    {
      title: t("order.ordinaryColumn.pricePrecision"),
      dataIndex: "pricePrecision",
      key: "pricePrecision",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.pricePrecision}</div>
      ),
    },
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
    {
      title: t("order.ordinaryColumn.positionType"),
      dataIndex: "positionType",
      key: "positionType",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">
          {t(PositionTypeMap[record.positionType])}
        </div>
      ),
    },
    {
      title: t("order.ordinaryColumn.avgPrice"),
      dataIndex: "avgPrice",
      key: "avgPrice",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.avgPrice}</div>
      ),
    },
    {
      title: t("order.ordinaryColumn.tradeFee"),
      dataIndex: "tradeFee",
      key: "tradeFee",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.tradeFee}</div>
      ),
    },
    {
      title: t("order.ordinaryColumn.type"),
      dataIndex: "type",
      key: "type",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{t(TypeMap[record.type])}</div>
      ),
    },
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
    {
      title: t("order.ordinaryColumn.volume"),
      dataIndex: "volume",
      key: "volume",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.volume}</div>
      ),
    },
    {
      title: t("order.ordinaryColumn.dealVolume"),
      dataIndex: "dealVolume",
      key: "dealVolume",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.dealVolume}</div>
      ),
    },
    {
      title: t("order.ordinaryColumn.price"),
      dataIndex: "price",
      key: "price",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.price}</div>
      ),
    },
    {
      title: t("order.ordinaryColumn.contractId"),
      dataIndex: "contractId",
      key: "contractId",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.contractId}</div>
      ),
    },
    {
      title: t("order.ordinaryColumn.ctime"),
      dataIndex: "ctime",
      key: "ctime",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">
          {dayjs(record.ctime).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      ),
    },
    {
      title: t("order.ordinaryColumn.contractName"),
      dataIndex: "contractName",
      key: "contractName",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.contractName}</div>
      ),
    },
    {
      title: t("order.ordinaryColumn.id"),
      dataIndex: "id",
      key: "id",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{record.id}</div>
      ),
    },
    {
      title: t("order.ordinaryColumn.open"),
      dataIndex: "open",
      key: "open",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">{t(OpenMap[record.open])}</div>
      ),
    },
    {
      title: t("order.ordinaryColumn.status"),
      dataIndex: "status",
      key: "status",
      render: (_: any, record: OrdinaryCommission) => (
        <div className="text-[12px] font-[500]">
          {t(StatusMap[record.status])}
        </div>
      ),
    },
    {
      title: (
        <div className="text-[12px] font-[500] text-[var(--theme-color)] cursor-pointer">
          {t("order.ordinaryColumn.cancelAll")}
        </div>
      ),
      key: "action",
      align: "right" as const,
      render: (_: any, record: OrdinaryCommission) => {
        return (
          <Tooltip
            title={t("order.ordinaryColumn.cancel")}
            placement="left"
            className="ml-auto"
          >
            <SvgIcon
              onClick={() => onCancelOrder?.(record)}
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

/**
 * 历史委托列表配置
 */
export const createHistoryColumns = ({ t }: { t: TFunction }) => [
  {
    title: t("order.historyColumn.symbol"),
    dataIndex: "symbol",
    key: "symbol",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.symbol}</div>
    ),
  },
  {
    title: t("order.historyColumn.pricePrecision"),
    dataIndex: "pricePrecision",
    key: "pricePrecision",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.pricePrecision}</div>
    ),
  },
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
  {
    title: t("order.historyColumn.positionType"),
    dataIndex: "positionType",
    key: "positionType",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">
        {t(PositionTypeMap[record.positionType])}
      </div>
    ),
  },
  {
    title: t("order.historyColumn.avgPrice"),
    dataIndex: "avgPrice",
    key: "avgPrice",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.avgPrice}</div>
    ),
  },
  {
    title: t("order.historyColumn.tradeFee"),
    dataIndex: "tradeFee",
    key: "tradeFee",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.tradeFee}</div>
    ),
  },
  {
    title: t("order.historyColumn.realizedAmount"),
    dataIndex: "realizedAmount",
    key: "realizedAmount",
    render: (_: any, record: HistoryCommission) => (
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
        {record.realizedAmount}
      </div>
    ),
  },
  {
    title: t("order.historyColumn.type"),
    dataIndex: "type",
    key: "type",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{t(TypeMap[record.type])}</div>
    ),
  },
  {
    title: t("order.historyColumn.volume"),
    dataIndex: "volume",
    key: "volume",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.volume}</div>
    ),
  },
  {
    title: t("order.historyColumn.dealVolume"),
    dataIndex: "dealVolume",
    key: "dealVolume",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.dealVolume}</div>
    ),
  },
  {
    title: t("order.historyColumn.price"),
    dataIndex: "price",
    key: "price",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.price}</div>
    ),
  },
  {
    title: t("order.historyColumn.contractId"),
    dataIndex: "contractId",
    key: "contractId",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.contractId}</div>
    ),
  },
  {
    title: t("order.historyColumn.ctime"),
    dataIndex: "ctime",
    key: "ctime",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">
        {dayjs(record.ctime).format("YYYY-MM-DD HH:mm:ss")}
      </div>
    ),
  },
  {
    title: t("order.historyColumn.contractName"),
    dataIndex: "contractName",
    key: "contractName",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.contractName}</div>
    ),
  },
  {
    title: t("order.historyColumn.id"),
    dataIndex: "id",
    key: "id",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.id}</div>
    ),
  },
  {
    title: t("order.historyColumn.open"),
    dataIndex: "open",
    key: "open",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{t(OpenMap[record.open])}</div>
    ),
  },
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
];

/**
 * 盈亏记录列表配置
 */
export const createTradeRecordColumns = ({ t }: { t: TFunction }) => [
  {
    title: t("order.tradeRecordColumn.symbol"),
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
    title: t("order.tradeRecordColumn.openPrice"),
    dataIndex: "openPrice",
    key: "openPrice",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">{record.openPrice}</div>
    ),
  },
  {
    title: t("order.tradeRecordColumn.size"),
    dataIndex: "size",
    key: "size",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">{record.size}</div>
    ),
  },
  {
    title: t("order.tradeRecordColumn.realizedPnl"),
    dataIndex: "realizedPnl",
    key: "realizedPnl",
    render: (_: any, record: TradeRecord) => (
      <div
        className="text-[12px] font-[500]"
        style={{
          color:
            record.realizedPnl > 0
              ? "#4CAF50"
              : record.realizedPnl < 0
                ? "#F44336"
                : "",
        }}
      >
        {record.realizedPnl}
      </div>
    ),
  },
  {
    title: t("order.tradeRecordColumn.fee"),
    dataIndex: "fee",
    key: "fee",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">{record.fee} USDT</div>
    ),
  },
  {
    title: t("order.tradeRecordColumn.fundingFee"),
    dataIndex: "fundingFee",
    key: "fundingFee",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">{record.fundingFee}</div>
    ),
  },
  {
    title: t("order.tradeRecordColumn.pnl"),
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
    title: t("order.tradeRecordColumn.pnl"),
    dataIndex: "pnl",
    key: "pnl_2",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">{record.pnl}</div>
    ),
  },
  {
    title: t("order.tradeRecordColumn.closeTime"),
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

/**
 * 成交历史列表配置
 */
export const createTradeHistoryColumns = ({ t }: { t: TFunction }) => [
  {
    title: t("order.tradeHistoryColumn.symbol"),
    dataIndex: "symbol",
    key: "symbol",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.symbol}</div>
    ),
  },
  {
    title: t("order.tradeHistoryColumn.pricePrecision"),
    dataIndex: "pricePrecision",
    key: "pricePrecision",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.pricePrecision}</div>
    ),
  },
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
  {
    title: t("order.tradeHistoryColumn.role"),
    dataIndex: "role",
    key: "role",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{RoleMap[record.role]}</div>
    ),
  },
  {
    title: t("order.tradeHistoryColumn.fee"),
    dataIndex: "fee",
    key: "fee",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.fee}</div>
    ),
  },
  {
    title: t("order.tradeHistoryColumn.feeCoinPrecision"),
    dataIndex: "feeCoinPrecision",
    key: "feeCoinPrecision",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.feeCoinPrecision}</div>
    ),
  },
  {
    title: t("order.tradeHistoryColumn.volume"),
    dataIndex: "volume",
    key: "volume",
    align: "right" as const,
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.volume}</div>
    ),
  },
  {
    title: t("order.tradeHistoryColumn.feeCoin"),
    dataIndex: "feeCoin",
    key: "feeCoin",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.feeCoin}</div>
    ),
  },
  {
    title: t("order.tradeHistoryColumn.price"),
    dataIndex: "price",
    key: "price",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.price}</div>
    ),
  },
  {
    title: t("order.tradeHistoryColumn.contractId"),
    dataIndex: "contractId",
    key: "contractId",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.contractId}</div>
    ),
  },
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
  {
    title: t("order.tradeHistoryColumn.contractName"),
    dataIndex: "contractName",
    key: "contractName",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.contractName}</div>
    ),
  },
  {
    title: t("order.tradeHistoryColumn.id"),
    dataIndex: "id",
    key: "id",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.id}</div>
    ),
  },
  {
    title: t("order.tradeHistoryColumn.open"),
    dataIndex: "open",
    key: "open",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{t(OpenMap[record.open])}</div>
    ),
  },
];
