import React, { useState } from "react";
import { Select, Tooltip, Image } from "antd";
import { useTranslation } from "next-i18next";

const { Option } = Select;

interface OrderBookItem {
  price: number;
  amount: number;
  total: number;
}

interface OrderBookProps {
  orderBookData?: any;
}

interface TradeItem {
  price: number;
  amount: number;
  time: string;
  side: "buy" | "sell";
}

interface RealtimeTradeProps {
  tradeData?: any;
  orderBookData?: any; // 暂时使用orderBookData模拟
}

// 委托列表组件
const OrderBookList: React.FC<OrderBookProps> = ({ orderBookData }) => {
  const { t } = useTranslation(["contract", "spot"]);
  const [colorMode, setColorMode] = useState<"both" | "buy" | "sell">("both");
  const [precision, setPrecision] = useState<number>(2);

  // 处理WebSocket数据，如果没有数据则使用模拟数据
  const processOrderBookData = () => {
    if (orderBookData?.tick) {
      const { asks, buys } = orderBookData.tick;

      // 调试信息
      console.log("OrderBook组件 - 原始数据:", { asks, buys });
      console.log(
        "asks类型:",
        typeof asks,
        "asks是否为数组:",
        Array.isArray(asks)
      );
      console.log(
        "buys类型:",
        typeof buys,
        "buys是否为数组:",
        Array.isArray(buys)
      );

      // 处理卖单数据 (asks) - 按价格从高到低排序
      const processedSellOrders: OrderBookItem[] =
        asks && Array.isArray(asks)
          ? asks
              .map((item: [number, number]) => {
                const [price, amount] = item;
                return {
                  price,
                  amount,
                  total: price * amount,
                };
              })
              .filter(
                (item: OrderBookItem) => item.price > 0 && item.amount > 0
              )
              .sort((a, b) => b.price - a.price) // 卖单价格从高到低
              .slice(0, 10) // 只显示前10条
          : [];

      // 处理买单数据 (buys) - 按价格从高到低排序
      const processedBuyOrders: OrderBookItem[] =
        buys && Array.isArray(buys)
          ? buys
              .map((item: [number, number]) => {
                const [price, amount] = item;
                return {
                  price,
                  amount,
                  total: price * amount,
                };
              })
              .filter(
                (item: OrderBookItem) => item.price > 0 && item.amount > 0
              )
              .sort((a, b) => b.price - a.price) // 买单价格从高到低
              .slice(0, 10) // 只显示前10条
          : [];

      return {
        sellOrders: processedSellOrders,
        buyOrders: processedBuyOrders,
      };
    }

    // 返回空数据
    return {
      sellOrders: [],
      buyOrders: [],
    };
  };

  const { sellOrders, buyOrders } = processOrderBookData();

  const formatNumber = (num: number, decimals: number = precision) => {
    return num.toFixed(decimals);
  };

  const getSellPriceColor = () => {
    return colorMode === "both" || colorMode === "sell" ? "text-red-500" : "text-green-500";
  };

  const getBuyPriceColor = () => {
    return colorMode === "both" || colorMode === "buy" ? "text-green-500" : "text-red-500";
  };

  const renderColorModeButtons = () => {
    return (
      <div className="flex gap-[8px]">
        {/* 显示买卖盘 */}
        <Tooltip
          title={t("spot:spot.orderBook.bothOrders")}
        >
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
        <Tooltip
          title={t("spot:spot.orderBook.buyOrders")}
        >
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
    <div className="p-[10px_16px]">
      <div className="flex flex-col gap-[8px] mb-[10px]">
        <div className="text-[var(--text-color5)] font-[500] text-[14px]">
          委托列表
        </div>
        <div className="flex justify-between items-center gap-[8px]">
          {renderColorModeButtons()}
          <Select
            size="small"
            style={{ width: 60 }}
            value={precision}
            onChange={setPrecision}
            className="w-20"
          >
            <Option value={0}>0</Option>
            <Option value={1}>0.1</Option>
            <Option value={2}>0.5</Option>
            <Option value={3}>1</Option>
          </Select>
        </div>
      </div>

      <div className="flex text-[var(--text-color6)] font-[400] text-[12px] mb-[8px]">
        <div className="flex-1 text-left">价格</div>
        <div className="flex-1 text-right">数量</div>
        <div className="flex-1 text-right">总计</div>
      </div>

      <div className="flex flex-col overflow-hidden">
        {/* 卖盘数据 - 只在 both 或 sell 模式下显示 */}
        {(colorMode === "both" || colorMode === "sell") && (
          <div className="flex flex-col gap-[9px] overflow-y-auto">
            {sellOrders.length > 0 ? (
              sellOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center text-[var(--text-color6)] font-[400] text-[12px] cursor-pointer  hover:bg-gray-50"
                >
                  <div className={`flex-1 text-left ${getSellPriceColor()}`}>
                    {formatNumber(order.price)}
                  </div>
                  <div className="flex-1 text-right">
                    {formatNumber(order.amount, 3)}
                  </div>
                  <div className="flex-1 text-right">
                    {formatNumber(order.total, 3)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center text-[var(--text-color6)] font-[400] text-[12px] text-center">
                暂无卖单数据
              </div>
            )}
          </div>
        )}

        {/* 当前价格显示 - 只在 both 模式下显示 */}
        {colorMode === "both" && (
          <div className="flex justify-between items-center my-[10px]">
            <div className="text-xl font-semibold text-red-500">50120.5</div>
            <div className="text-xs text-green-500">+0.12%</div>
          </div>
        )}

        {/* 买盘数据 - 只在 both 或 buy 模式下显示 */}
        {(colorMode === "both" || colorMode === "buy") && (
          <div className="flex flex-col gap-[9px] overflow-y-auto">
            {buyOrders.length > 0 ? (
              buyOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center text-[var(--text-color6)] font-[400] text-[12px] cursor-pointer  hover:bg-gray-50"
                >
                  <div className={`flex-1 text-left ${getBuyPriceColor()}`}>
                    {formatNumber(order.price)}
                  </div>
                  <div className="flex-1 text-right">
                    {formatNumber(order.amount, 3)}
                  </div>
                  <div className="flex-1 text-right">
                    {formatNumber(order.total, 3)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center text-[var(--text-color6)] font-[400] text-[12px] text-center">
                暂无买单数据
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 实时成交组件
const RealtimeTrade: React.FC<RealtimeTradeProps> = ({
  tradeData,
  orderBookData,
}) => {
  const { t } = useTranslation(["contract", "spot"]);
  const [colorMode] = useState<"both" | "buy" | "sell">("both");

  // 处理实时成交数据，暂时使用orderBookData模拟
  const processTradeData = () => {
    if (orderBookData?.tick) {
      const { asks, buys } = orderBookData.tick;

      // 合并买卖单数据作为成交记录
      const allTrades: TradeItem[] = [];

      if (asks && Array.isArray(asks)) {
        asks.slice(0, 5).forEach((item: [number, number], index: number) => {
          const [price, amount] = item;
          allTrades.push({
            price,
            amount,
            time: new Date(Date.now() - index * 1000).toLocaleTimeString(),
            side: "sell",
          });
        });
      }

      if (buys && Array.isArray(buys)) {
        buys.slice(0, 5).forEach((item: [number, number], index: number) => {
          const [price, amount] = item;
          allTrades.push({
            price,
            amount,
            time: new Date(
              Date.now() - (index + 5) * 1000
            ).toLocaleTimeString(),
            side: "buy",
          });
        });
      }

      // 按时间排序（最新的在前）
      return allTrades
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);
    }

    return [];
  };

  const trades = processTradeData();

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const getPriceColor = (side: "buy" | "sell") => {
    if (side === "sell") {
      return colorMode === "both" || colorMode === "sell" ? "text-red-500" : "text-green-500";
    } else {
      return colorMode === "both" || colorMode === "buy" ? "text-green-500" : "text-red-500";
    }
  };

  return (
    <div className="p-[10px_16px]">
      <div className="text-[var(--text-color5)] font-[500] text-[14px] mb-[10px]">
        实时成交
      </div>

      <div className="flex text-[var(--text-color6)] font-[400] text-[12px] mb-[8px]">
        <div className="flex-1 text-left">价格</div>
        <div className="flex-1 text-right">数量</div>
        <div className="flex-1 text-right">时间</div>
      </div>

      <div className="flex flex-col gap-[9px] overflow-y-auto">
        {trades.length > 0 ? (
          trades.map((trade, index) => (
            <div
              key={index}
              className="flex text-[var(--text-color6)] font-[400] text-[12px] cursor-pointer  hover:bg-gray-50"
            >
              <div className={`flex-1 text-left ${getPriceColor(trade.side)}`}>
                {formatNumber(trade.price)}
              </div>
              <div className="flex-1 text-right">
                {formatNumber(trade.amount, 3)}
              </div>
              <div className="flex-1 text-right">{trade.time}</div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center text-[var(--text-color6)] font-[400] text-[12px] text-center">
            暂无成交数据
          </div>
        )}
      </div>
    </div>
  );
};

export { OrderBookList, RealtimeTrade };
