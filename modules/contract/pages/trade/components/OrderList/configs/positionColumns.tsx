import React from "react";
import { Popover } from "antd";
import { TFunction } from "i18next";
import BigNumber from "bignumber.js";
import { Position, QuickCloseParams } from "../hooks";
import { PositionTypeMap } from "./constants";
import QuickClose from "../components/QuickClose";

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
  const Tips = ({ content, tips }: { content: string; tips: string }) => {
    return (
      <Popover
        placement="topLeft"
        content={
          <div className="text-[12px] text-[var(--text-color5)] font-[400] max-w-[236px]">
            {tips}
          </div>
        }
      >
        <span className="text-[12px] font-[500] cursor-pointer border-b border-dashed border-[var(--text-color6)]">
          {content}
        </span>
      </Popover>
    );
  };
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
              style={{
                backgroundColor: record.orderSide.includes("BUY")
                  ? "#4CAF50"
                  : "#F44336",
              }}
            ></div>
            <div> {record.symbol}</div>
          </div>
          <div className="flex gap-[5px]">
            {/* 仓位类型 */}
            <div> {t((PositionTypeMap as any)[record.positionType])}</div>
            {/* 杠杆 */}
            <div> {record.leverageLevel}x</div>
          </div>
        </div>
      ),
    },
    // 数量(张)
    {
      title: t("order.positionColumn.positionVolume"),
      dataIndex: "positionVolume",
      key: "positionVolume",
      render: (_: any, record: Position) => (
        <div
          className="text-[12px] font-[500]"
          style={{
            color: record.orderSide.includes("BUY") ? "#4CAF50" : "#F44336",
          }}
        >
          {record.positionVolume}
        </div>
      ),
    },
    // 开仓均价(成本价)
    {
      title: Tips({
        content: t("order.positionColumn.openAvgPrice"),
        tips: t("order.positionColumn.tips.openAvgPrice"),
      }),
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
      title: Tips({
        content: t("order.positionColumn.indexPrice"),
        tips: t("order.positionColumn.tips.indexPrice"),
      }),
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
      title: Tips({
        content: t("order.positionColumn.reducePrice"),
        tips: t("order.positionColumn.tips.reducePrice"),
      }),
      dataIndex: "reducePrice",
      key: "reducePrice",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {new BigNumber(record.reducePrice).toFormat(symbolPricePrecision)}
        </div>
      ),
    },
    // 保证金
    {
      title: Tips({
        content: t("order.positionColumn.holdAmount"),
        tips: t("order.positionColumn.tips.holdAmount"),
      }),
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
      title: Tips({
        content: t("order.positionColumn.marginRate"),
        tips: t("order.positionColumn.tips.marginRate"),
      }),
      dataIndex: "marginRate",
      key: "marginRate",
      render: (_: any, record: Position) => (
        <div className="text-[12px] font-[500]">
          {new BigNumber(record.marginRate).toFormat(symbolPricePrecision)}
        </div>
      ),
    },
    // 为实现实现盈亏(盈亏/收益率) unrealizedProfitLoss + returnRate
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
          <div
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
          </div>
          <div
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
          </div>
        </div>
      ),
    },
    // 开仓已实现盈亏
    // {
    //   title: t("order.positionColumn.openRealizedAmount"),
    //   dataIndex: "openRealizedAmount",
    //   key: "openRealizedAmount",
    //   render: (_: any, record: Position) => (
    //     <div
    //       className="text-[12px] font-[500]"
    //       style={{
    //         color:
    //           record.openRealizedAmount > 0
    //             ? "#4CAF50"
    //             : record.openRealizedAmount < 0
    //             ? "#F44336"
    //             : "",
    //       }}
    //     >
    //       {new BigNumber(record.openRealizedAmount).toFormat(
    //         symbolPricePrecision
    //       )}
    //     </div>
    //   ),
    // },
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
