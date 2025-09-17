import React from "react";
import dayjs from "dayjs";
import { TFunction } from "i18next";
import { HistoryCommission } from "../hooks";
import { SideMap, TypeMap, StatusMap, Side } from "./constants";

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
      <div className="text-[12px] font-[500]">{t((TypeMap as any)[record.type])}</div>
    ),
  },
  // 方向
  {
    title: t("order.historyColumn.side"),
    dataIndex: "side",
    key: "side",
    render: (_: any, record: HistoryCommission) => {
      const key = `${record.side}_${record.open}` as Side;
      const displaySide = SideMap[key];
      return (
      <div
        className="text-[12px] font-[500]"
        style={{ color: displaySide.color }}
      >
        {t(displaySide.text)}
      </div>
    );
    },
  },
  // 委托价格 为0显示市价
  {
    title: t("order.historyColumn.price"),
    dataIndex: "price",
    key: "price",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.price === 0 ? t("marketOrder") : record.price}</div>
    ),
  },
  // 委托数量
  {
    title: t("order.historyColumn.volume"),
    dataIndex: "volume",
    key: "volume",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.volume} {t("order.historyColumn.piece")}</div>
    ),
  },
  //成交数量
  {
    title: t("order.historyColumn.dealVolume"),
    dataIndex: "dealVolume",
    key: "dealVolume",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">{record.dealVolume} {t("order.historyColumn.piece")}</div>
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
  // 盈亏 开仓显示0.00 平仓显示具体数值
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
        { record.realizedAmount > 0 ? record.realizedAmount : "0.00"}
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
  //状态
  {
    title: t("order.historyColumn.status"),
    dataIndex: "status",
    key: "status",
    render: (_: any, record: HistoryCommission) => (
      <div className="text-[12px] font-[500]">
        {t((StatusMap as any)[record.status])}
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
];
