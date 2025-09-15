import React from "react";
import dayjs from "dayjs";
import { TFunction } from "i18next";
import BigNumber from "bignumber.js";
import { TradeHistory } from "../hooks";
import { SideMap, RoleMap } from "./constants";

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
  // {
  //   title: t("order.tradeHistoryColumn.id"),
  //   dataIndex: "id",
  //   key: "id",
  //   render: (_: any, record: TradeHistory) => (
  //     <div className="text-[12px] font-[500]">{record.id}</div>
  //   ),
  // },
  // 合约符号
  {
    title: t("order.tradeHistoryColumn.symbol"),
    dataIndex: "symbol",
    key: "symbol",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{record.symbol}</div>
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
  // 方向
  {
    title: t("order.tradeHistoryColumn.side"),
    dataIndex: "side",
    key: "side",
    render: (_: any, record: TradeHistory) => (
      <div
        className="text-[12px] font-[500]"
        style={{ color: (SideMap as any)[record.side].color }}
      >
        {t((SideMap as any)[record.side].text)}
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
  // 角色
  {
    title: t("order.tradeHistoryColumn.role"),
    dataIndex: "role",
    key: "role",
    render: (_: any, record: TradeHistory) => (
      <div className="text-[12px] font-[500]">{(RoleMap as any)[record.role]}</div>
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
  // {
  //   title: t("order.tradeHistoryColumn.open"),
  //   dataIndex: "open",
  //   key: "open",
  //   render: (_: any, record: TradeHistory) => (
  //     <div className="text-[12px] font-[500]">{t(OpenMap[record.open])}</div>
  //   ),
  // },
];
