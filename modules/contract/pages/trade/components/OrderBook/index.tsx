import React, { useState, useMemo } from "react";
import { Select, Tooltip, Image } from "antd";
import { useTranslation } from "next-i18next";
import styles from "./style/index.module.css";
import appStore from "@/store";
const { currentContractInfo } = appStore
const { Option } = Select;

interface OrderBookItem {
  price: number;
  amount: number;
  total: number;
  cumulativeAmount: number; // 累积数量
  cumulativeTotal: number; // 累积总额
}

// WebSocket 数据类型定义
interface OrderBookTick {
  asks: [number, number][]; // [价格, 数量]
  buys: [number, number][];
  lastPrice?: number; // 最新成交价
  priceChange?: number; // 24h涨跌幅
}

interface OrderBookData {
  tick: OrderBookTick;
}

interface OrderBookProps {
  orderBookData?: OrderBookData;
  realtimeTradeData?: TradeItem[];
  onPriceClick?: (price: number) => void; // 新增价格点击回调
  onPrecisionChange?: (precision: number) => void; // 新增精度变化回调
  style?: React.CSSProperties;
}

interface TradeItem {
  amount: string;
  ds: string; // 时间字符串 "2025-08-25 14:31:28"
  price: string;
  side: "BUY" | "SELL";
  ts: number; // 时间戳
  vol: string;
}

interface RealtimeTradeProps {
  tradeData?: any;
  orderBookData?: OrderBookData;
  realtimeTradeData?: any;
  onPriceClick?: (price: number) => void; // 新增价格点击回调
  style?: React.CSSProperties;
}

// 委托列表组件
const OrderBookList: React.FC<OrderBookProps> = ({ orderBookData, realtimeTradeData, onPriceClick, onPrecisionChange, style }) => {
  const { t } = useTranslation(["contract", "spot"]);
  const [colorMode, setColorMode] = useState<"both" | "buy" | "sell">("both");
  const [precision, setPrecision] = useState<number>();

  // 处理精度变化
  const handlePrecisionChange = (newPrecision: number) => {
    setPrecision(newPrecision);
    // 通知父组件精度变化
    if (onPrecisionChange) {
      onPrecisionChange(newPrecision);
    }
  };

  // 使用 useMemo 优化性能，处理WebSocket数据
  const { sellOrders, buyOrders, priceChange } = useMemo(() => {
    if (orderBookData?.tick) {
      const { asks, buys, lastPrice, priceChange } = orderBookData.tick;

      // 根据显示模式决定显示数量：both模式显示6条，单独模式显示12条
      const displayCount = colorMode === "both" ? 6 : 12;

      // 处理卖单数据 (asks) - 按价格从低到高排序（最优卖价在前）
      const processedSellOrders: OrderBookItem[] =
        asks && Array.isArray(asks)
          ? asks
            .map((item: [number, number]) => {
              const [price, amount] = item;
              return {
                price,
                amount,
                total: price * amount,
                cumulativeAmount: 0, // 稍后计算
                cumulativeTotal: 0,
              };
            })
            .filter(
              (item: OrderBookItem) => item.price > 0 && item.amount > 0
            )
            .sort((a, b) => a.price - b.price) // 卖单价格从低到高（最优卖价在前）
            .slice(0, displayCount) // 根据模式显示不同数量
          : [];

      // 计算卖单累积深度
      let sellCumulativeAmount = 0;
      let sellCumulativeTotal = 0;
      processedSellOrders.forEach((order) => {
        sellCumulativeAmount += order.amount;
        sellCumulativeTotal += order.total;
        order.cumulativeAmount = sellCumulativeAmount;
        order.cumulativeTotal = sellCumulativeTotal;
      });

      // 处理买单数据 (buys) - 按价格从高到低排序（最优买价在前）
      const processedBuyOrders: OrderBookItem[] =
        buys && Array.isArray(buys)
          ? buys
            .map((item: [number, number]) => {
              const [price, amount] = item;
              return {
                price,
                amount,
                total: price * amount,
                cumulativeAmount: 0, // 稍后计算
                cumulativeTotal: 0,
              };
            })
            .filter(
              (item: OrderBookItem) => item.price > 0 && item.amount > 0
            )
            .sort((a, b) => b.price - a.price) // 买单价格从高到低（最优买价在前）
            .slice(0, displayCount) // 根据模式显示不同数量
          : [];

      // 计算买单累积深度
      let buyCumulativeAmount = 0;
      let buyCumulativeTotal = 0;
      processedBuyOrders.forEach((order) => {
        buyCumulativeAmount += order.amount;
        buyCumulativeTotal += order.total;
        order.cumulativeAmount = buyCumulativeAmount;
        order.cumulativeTotal = buyCumulativeTotal;
      });

      // 如果需要反转卖单显示顺序（UI上从高到低显示）
      processedSellOrders.reverse();

      return {
        sellOrders: processedSellOrders,
        buyOrders: processedBuyOrders,
        priceChange: priceChange || 0,
      };
    }

    // 返回空数据
    return {
      sellOrders: [],
      buyOrders: [],
      priceChange: 0,
    };
  }, [orderBookData, colorMode]);



  // 计算百分比宽度（基于累积深度）
  const calculatePercentWidth = (orders: OrderBookItem[], cumulativeTotal: number): number => {
    if (orders.length === 0) return 0;
    const maxCumulativeTotal = Math.max(...orders.map(order => order.cumulativeTotal));
    return maxCumulativeTotal > 0 ? (cumulativeTotal / maxCumulativeTotal) * 100 : 0;
  };

  const getSellPriceColor = () => {
    return colorMode === "both" || colorMode === "sell"
      ? "text-red-500"
      : "text-green-500";
  };

  const getBuyPriceColor = () => {
    return colorMode === "both" || colorMode === "buy"
      ? "text-green-500"
      : "text-red-500";
  };

  const renderColorModeButtons = () => {
    return (
      <div className="flex gap-[8px]">
        {/* 显示买卖盘 */}
        <Tooltip title={t("spot:spot.orderBook.bothOrders")}>
          <Image
            src={
              colorMode === "both"
                ? "/images/exchange/icon_order_hover.png"
                : "/images/exchange/icon_order.png"
            }
            alt="color-mode"
            width={20}
            height={20}
            preview={false}
            style={{ cursor: "pointer" }}
            onClick={() => setColorMode("both")}
          />
        </Tooltip>
        {/* 显示买盘 */}
        <Tooltip title={t("spot:spot.orderBook.buyOrders")}>
          <Image
            src={
              colorMode === "buy"
                ? "/images/exchange/icon_green_hover.png"
                : "/images/exchange/icon_green.png"
            }
            alt="color-mode"
            width={20}
            height={20}
            preview={false}
            style={{ cursor: "pointer" }}
            onClick={() => setColorMode("buy")}
          />
        </Tooltip>
        {/* 显示卖盘 */}
        <Tooltip
          title={t("spot:spot.orderBook.sellOrders")}
          overlayInnerStyle={{ fontSize: "12px" }}
        >
          <Image
            src={
              colorMode === "sell"
                ? "/images/exchange/icon_red_hover.png"
                : "/images/exchange/icon_red.png"
            }
            alt="color-mode"
            width={20}
            height={20}
            preview={false}
            style={{ cursor: "pointer" }}
            onClick={() => setColorMode("sell")}
          />
        </Tooltip>
      </div>
    );
  };

  return (
    <div style={style} className="bg-[var(--background9)]">
      <div className="p-[10px_16px]">
        <div className="flex flex-col gap-[8px] mb-[10px]">
          <div className="text-[var(--text-color5)] font-[500] text-[14px]">
            {t("contract:orderBookList.title")}
          </div>
          <div className="flex justify-between items-center gap-[8px]">
            {renderColorModeButtons()}
            <Select
              size="small"
              style={{ width: 80 }}
              value={precision}
              onChange={handlePrecisionChange}
              className="w-20"
            >
              {currentContractInfo.coinResultVo.depth.map((item: any, index: number) => (
                <Option key={index} value={item}>{item}</Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex text-[var(--text-color6)] font-[400] text-[12px] mb-[8px]">
          <div className="flex-1 text-left">{t("contract:orderBookList.price")}</div>
          <div className="flex-1 text-center">{t("contract:orderBookList.amount")}</div>
          <div className="flex-1 text-right">{t("contract:orderBookList.total")}</div>
        </div>

        <div className="flex flex-col overflow-hidden">
          {/* 卖盘数据 - 只在 both 或 sell 模式下显示 */}
          {(colorMode === "both" || colorMode === "sell") && (
            <div className="flex flex-col gap-[9px] overflow-y-auto">
              {sellOrders.length > 0 ? (
                sellOrders.map((order) => {
                  const percentWidth = calculatePercentWidth(sellOrders, order.cumulativeTotal);
                  return (
                    <div
                      key={`sell-${order.price}`}
                      className="flex items-center justify-center text-[var(--text-color6)] font-[400] text-[12px] cursor-pointer hover:bg-gray-50 relative"
                    >
                      <div
                        className={`flex-1 text-left ${getSellPriceColor()} cursor-pointer hover:opacity-80`}
                        onClick={() => onPriceClick && onPriceClick(order.price)}
                      >
                        {order.price}
                      </div>
                      <div className="flex-1 text-center" style={{ color: "var(--text-color6)" }}>
                        {order.amount}
                      </div>
                      <div className="flex-1 text-right relative overflow-hidden">
                        <div
                          className={styles.background}
                          style={{
                            width: `${Math.min(percentWidth, 100)}%`,
                            transition: "width 0.3s ease-in-out",
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            zIndex: 0,
                          }}
                        />
                        <span style={{ position: "relative", zIndex: 1, color: "#000" }}>
                          {order.total}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center text-[var(--text-color6)] font-[400] text-[12px] text-center">
                  {t("contract:orderBookList.noSellOrders")}
                </div>
              )}
            </div>
          )}

          {/* 当前价格显示 - 只在 both 模式下显示 */}
          {colorMode === "both" && realtimeTradeData && realtimeTradeData.length > 0 && (
            <div className="flex justify-between items-center my-[10px]">
              <div className={`text-xl font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {realtimeTradeData[0].price}
              </div>
              <div className={`text-xs ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange}%
              </div>
            </div>
          )}

          {/* 买盘数据 - 只在 both 或 buy 模式下显示 */}
          {(colorMode === "both" || colorMode === "buy") && (
            <div className="flex flex-col gap-[9px] overflow-y-auto">
              {buyOrders.length > 0 ? (
                buyOrders.map((order) => {
                  const percentWidth = calculatePercentWidth(buyOrders, order.cumulativeTotal);
                  return (
                    <div
                      key={`buy-${order.price}`}
                      className="flex items-center justify-center text-[var(--text-color6)] font-[400] text-[12px] cursor-pointer hover:bg-gray-50 relative"
                    >
                      <div
                        className={`flex-1 text-left ${getBuyPriceColor()} cursor-pointer hover:opacity-80`}
                        onClick={() => onPriceClick && onPriceClick(order.price)}
                      >
                        {order.price}
                      </div>
                      <div className="flex-1 text-center" style={{ color: "var(--text-color6)" }}>
                        {order.amount}
                      </div>
                      <div className="flex-1 text-right relative overflow-hidden">
                        <div
                          className={styles.background}
                          style={{
                            width: `${Math.min(percentWidth, 100)}%`,
                            transition: "width 0.3s ease-in-out",
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            backgroundColor: "rgba(34, 197, 94, 0.1)",
                            zIndex: 0,
                          }}
                        />
                        <span style={{ position: "relative", zIndex: 1, color: "#000" }}>
                          {order.total}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center text-[var(--text-color6)] font-[400] text-[12px] text-center">
                  {t("contract:orderBookList.noBuyOrders")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 实时成交组件
const RealtimeTrade: React.FC<RealtimeTradeProps> = ({
  tradeData,
  orderBookData,
  realtimeTradeData,
  onPriceClick,
  style
}) => {
  const { t } = useTranslation(["contract", "spot"]);
  const [colorMode] = useState<"both" | "buy" | "sell">("both");

  // 使用 useMemo 优化性能，处理实时成交数据
  const trades = useMemo(() => {
    // 只使用真实的实时成交数据
    if (realtimeTradeData && Array.isArray(realtimeTradeData) && realtimeTradeData.length > 0) {
      // 限制显示的数据量，只显示最新的50条记录
      return realtimeTradeData.slice(0, 50);
    }
    return [];
  }, [realtimeTradeData]);



  // 格式化时间显示
  const formatTime = (timeStr: string) => {
    try {
      // 尝试解析时间字符串 "2025-08-25 14:31:28"
      const date = new Date(timeStr);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      // 如果解析失败，返回原字符串的时间部分
      return timeStr.split(' ')[1] || timeStr;
    }
  };

  const getPriceColor = (side: "BUY" | "SELL") => {
    if (side === "SELL") {
      return colorMode === "both" || colorMode === "sell"
        ? "text-red-500"
        : "text-green-500";
    } else {
      return colorMode === "both" || colorMode === "buy"
        ? "text-green-500"
        : "text-red-500";
    }
  };

  return (
    <div className="bg-[var(--background9)]" style={style}>
      <div className="p-[10px_16px]">
        <div className="text-[var(--text-color5)] font-[500] text-[14px] mb-[10px]">
          {t("contract:realtimeTrade.title")}
        </div>

        <div className="flex text-[var(--text-color6)] font-[400] text-[12px] mb-[8px]">
          <div className="flex-1 text-left">{t("contract:realtimeTrade.price")}</div>
          <div className="flex-1 text-center">{t("contract:realtimeTrade.amount")}</div>
          <div className="flex-1 text-right">{t("contract:realtimeTrade.time")}</div>
        </div>

        <div
          className="flex flex-col gap-[9px] overflow-y-auto max-h-[240px]"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'
          }}
        >
          {trades && trades.length > 0 ? (
            trades.map((trade: TradeItem, index: number) => (
              <div
                key={`trade-${trade.ts}-${index}`}
                className="flex text-[var(--text-color6)] font-[400] text-[12px] cursor-pointer hover:bg-gray-50 px-1 py-1 rounded transition-colors duration-150"
              >
                <div
                  className={`flex-1 text-left ${getPriceColor(trade.side)} font-medium cursor-pointer hover:opacity-80`}
                  onClick={() => onPriceClick && onPriceClick(parseFloat(trade.price))}
                >
                  {trade.price}
                </div>
                <div className="flex-1 text-center" style={{ color: "var(--text-color6)" }}>
                  {trade.vol}
                </div>
                <div className="flex-1 text-right text-[11px]" style={{ color: "var(--text-color6)" }}>
                  {formatTime(trade.ds)}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center text-[var(--text-color6)] font-[400] text-[12px] text-center h-[100px]">
              {t("contract:realtimeTrade.noTradeData")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { OrderBookList, RealtimeTrade };
