import React from "react";
import dayjs from "dayjs";
import { TFunction } from "i18next";
import BigNumber from "bignumber.js";
import { TradeRecord } from "../hooks";
import { SideMap, PositionTypeMap } from "./constants";

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
  // {
  //   title: t("order.tradeRecordColumn.id"),
  //   dataIndex: "id",
  //   key: "id",
  //   render: (_: any, record: TradeRecord) => (
  //     <div className="text-[12px] font-[500]">{record.id}</div>
  //   ),
  // },
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
        {t((PositionTypeMap as any)[record.positionType])}
      </div>
    ),
  },
  // 已实现盈亏
  // {
  //   title: t("order.tradeRecordColumn.realizedAmount"),
  //   dataIndex: "realizedAmount",
  //   key: "realizedAmount",
  //   render: (_: any, record: TradeRecord) => (
  //     <div
  //       className="text-[12px] font-[500]"
  //       style={{
  //         color:
  //           record.realizedAmount > 0
  //             ? "#4CAF50"
  //             : record.realizedAmount < 0
  //             ? "#F44336"
  //             : "",
  //       }}
  //     >
  //       {new BigNumber(record.realizedAmount).toFormat(symbolPricePrecision)}
  //     </div>
  //   ),
  // },
  // 持仓数量
  {
    title: t("order.tradeRecordColumn.positionVolume"),
    dataIndex: "positionVolume",
    key: "positionVolume",
    render: (_: any, record: TradeRecord) => (
      <div className="text-[12px] font-[500]">{record.positionVolume} {t("order.tradeRecordColumn.piece")}</div>
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
  // {
  //   title: t("order.tradeRecordColumn.openPrice"),
  //   dataIndex: "openPrice",
  //   key: "openPrice",
  //   render: (_: any, record: TradeRecord) => (
  //     <div className="text-[12px] font-[500]">
  //       {new BigNumber(record.openPrice).toFormat(symbolPricePrecision)}
  //     </div>
  //   ),
  // },
  // 结算盈亏
  // {
  //   title: t("order.tradeRecordColumn.settleProfit"),
  //   dataIndex: "settleProfit",
  //   key: "settleProfit",
  //   render: (_: any, record: TradeRecord) => (
  //     <div className="text-[12px] font-[500]">
  //       {new BigNumber(record.settleProfit).toFormat(symbolPricePrecision)}
  //     </div>
  //   ),
  // },
  // 修改时间
  // {
  //   title: t("order.tradeRecordColumn.mtime"),
  //   dataIndex: "mtime",
  //   key: "mtime",
  //   render: (_: any, record: TradeRecord) => (
  //     <div className="text-[12px] font-[500]">
  //       {dayjs(record.mtime).format("YYYY-MM-DD HH:mm:ss")}
  //     </div>
  //   ),
  // },
  // 方向
  {
    title: t("order.tradeRecordColumn.orderSide"),
    dataIndex: "orderSide",
    key: "orderSide",
    render: (_: any, record: TradeRecord) => (
      <div
        className="text-[12px] font-[500]"
        style={{ color: (SideMap as any)[record.orderSide].color }}
      >
        {t((SideMap as any)[record.orderSide].text)}
      </div>
    ),
  },
  // 已实现盈亏
  // {
  //   title: t("order.tradeRecordColumn.profitRealizedAmount"),
  //   dataIndex: "profitRealizedAmount",
  //   key: "profitRealizedAmount",
  //   render: (_: any, record: TradeRecord) => (
  //     <div
  //       className="text-[12px] font-[500]"
  //       style={{
  //         color:
  //           record.profitRealizedAmount > 0
  //             ? "#4CAF50"
  //             : record.profitRealizedAmount < 0
  //             ? "#F44336"
  //             : "",
  //       }}
  //     >
  //       {new BigNumber(record.profitRealizedAmount).toFormat(
  //         symbolPricePrecision
  //       )}
  //     </div>
  //   ),
  // },
  // 合约ID
  // {
  //   title: t("order.tradeRecordColumn.contractId"),
  //   dataIndex: "contractId",
  //   key: "contractId",
  //   render: (_: any, record: TradeRecord) => (
  //     <div className="text-[12px] font-[500]">{record.contractId}</div>
  //   ),
  // },
  // 历史已实现盈亏
  {
    title: t("order.tradeRecordColumn.historyRealizedAmount"),
    dataIndex: "historyRealizedAmount",
    key: "historyRealizedAmount",
    render: (_: any, record: TradeRecord) => (
      <div
        className="text-[12px] font-[500]"
        style={{
          color:
            record.historyRealizedAmount > 0
              ? "#4CAF50"
              : record.historyRealizedAmount < 0
              ? "#F44336"
              : "",
        }}
      >
        {new BigNumber(record.historyRealizedAmount).toFormat(
          symbolPricePrecision
        )}
      </div>
    ),
  },
  // 创建时间  平仓时间
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
