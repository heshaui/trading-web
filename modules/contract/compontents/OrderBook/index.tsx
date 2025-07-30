import React, { useState } from 'react';
import { Button, Select, Tooltip, Image } from 'antd';
import { useTranslation } from 'next-i18next';
import styles from './style/OrderBook.module.css';

const { Option } = Select;

interface OrderBookItem {
  price: number;
  amount: number;
  total: number;
}

interface OrderBookProps {
  orderBookData?: any;
}

const OrderBook: React.FC<OrderBookProps> = ({ orderBookData }) => {
  const { t } = useTranslation(['contract', 'spot']);
  const [colorMode, setColorMode] = useState<'red-green' | 'green-red'>('red-green');
  const [precision, setPrecision] = useState<number>(2);

  // 处理WebSocket数据，如果没有数据则使用模拟数据
  const processOrderBookData = () => {
    if (orderBookData?.tick) {
      const { asks, buys } = orderBookData.tick;
      
      // 调试信息
      console.log('OrderBook组件 - 原始数据:', { asks, buys });
      console.log('asks类型:', typeof asks, 'asks是否为数组:', Array.isArray(asks));
      console.log('buys类型:', typeof buys, 'buys是否为数组:', Array.isArray(buys));
      
      // 处理卖单数据 (asks) - 按价格从高到低排序
      const processedSellOrders: OrderBookItem[] = (asks && Array.isArray(asks))
        ? asks
          .map((item: [number, number]) => {
            const [price, amount] = item;
            return {
              price,
              amount,
              total: price * amount
            };
          })
          .filter((item: OrderBookItem) => item.price > 0 && item.amount > 0)
          .sort((a, b) => b.price - a.price) // 卖单价格从高到低
          .slice(0, 10) // 只显示前10条
        : [];

      // 处理买单数据 (buys) - 按价格从高到低排序
      const processedBuyOrders: OrderBookItem[] = (buys && Array.isArray(buys))
        ? buys
          .map((item: [number, number]) => {
            const [price, amount] = item;
            return {
              price,
              amount,
              total: price * amount
            };
          })
          .filter((item: OrderBookItem) => item.price > 0 && item.amount > 0)
          .sort((a, b) => b.price - a.price) // 买单价格从高到低
          .slice(0, 10) // 只显示前10条
        : [];

      return {
        sellOrders: processedSellOrders,
        buyOrders: processedBuyOrders
      };
    }
    
    // 返回空数据
    return {
      sellOrders: [],
      buyOrders: []
    };
  };


  const { sellOrders, buyOrders } = processOrderBookData();

  const formatNumber = (num: number, decimals: number = precision) => {
    return num.toFixed(decimals);
  };

  const getSellPriceColor = () => {
    return colorMode === 'red-green' ? styles.sellPrice : styles.buyPrice;
  };

  const getBuyPriceColor = () => {
    return colorMode === 'red-green' ? styles.buyPrice : styles.sellPrice;
  };

  const renderColorModeButtons = () => {
    return (
      <div className="flex" style={{ gap: "10px",margin:'10px 0 2px 0' }}>
        {/* 显示买卖盘 */}
        <Tooltip
          title={t("spot:spot.orderBook.bothOrders")}
          overlayInnerStyle={{ fontSize: "12px" }}
        >
          <Image
            src={
              colorMode === 'red-green'
                ? "/images/exchange/icon_order_hover.png"
                : "/images/exchange/icon_order.png"
            }
            alt="color-mode"
            width={20}
            height={20}
            preview={false}
            style={{ cursor: "pointer" }}
            onClick={() => setColorMode('red-green')}
          />
        </Tooltip>
        {/* 显示买盘 */}
        <Tooltip
          title={t("spot:spot.orderBook.buyOrders")}
          overlayInnerStyle={{ fontSize: "12px" }}
        >
          <Image
            src={
              colorMode === 'green-red'
                ? "/images/exchange/icon_green_hover.png"
                : "/images/exchange/icon_green.png"
            }
            alt="color-mode"
            width={20}
            height={20}
            preview={false}
            style={{ cursor: "pointer" }}
            onClick={() => setColorMode('green-red')}
          />
        </Tooltip>
        {/* 显示卖盘 */}
        <Tooltip
          title={t("spot:spot.orderBook.sellOrders")}
          overlayInnerStyle={{ fontSize: "12px" }}
        >
          <Image
            src={
              colorMode === 'red-green'
                ? "/images/exchange/icon_red_hover.png"
                : "/images/exchange/icon_red.png"
            }
            alt="color-mode"
            width={20}
            height={20}
            preview={false}
            style={{ cursor: "pointer" }}
            onClick={() => setColorMode('red-green')}
          />
        </Tooltip>
      </div>
    );
  };
  return (
    <div className={styles.orderBook}>
      <div className={styles.orderBookContent}>

     
      <div className={styles.header}>
        <div className={styles.title}>
          委托列表 {orderBookData ? '(实时)' : '(模拟)'}
        </div>
        <div className={styles.controls}>
          {renderColorModeButtons()}
          <Select
            size="small"
            style={{ width: 60 }}
            value={precision}
            onChange={setPrecision}
            bordered={false}
            className={styles.precisionSelect}
          >
            <Option value={0}>0</Option>
            <Option value={1}>0.1</Option>
            <Option value={2}>0.5</Option>
            <Option value={3}>1</Option>
          </Select>
        </div>
      </div>

      <div className={styles.tableHeader}>
        <div className={styles.priceColumn}>价格</div>
        <div className={styles.amountColumn}>数量</div>
        <div className={styles.totalColumn}>总计</div>
      </div>

      <div className={styles.content}>
        <div className={styles.sellSection}>
          {sellOrders.length > 0 ? (
            sellOrders.map((order, index) => (
              <div key={index} className={styles.orderRow}>
                <div className={`${styles.priceColumn} ${getSellPriceColor()}`}>
                  {formatNumber(order.price)}
                </div>
                <div className={styles.amountColumn}>
                  {formatNumber(order.amount, 3)}
                </div>
                <div className={styles.totalColumn}>
                  {formatNumber(order.total, 3)}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.orderRow}>
              <div style={{ textAlign: 'center', color: '#999', gridColumn: '1 / -1' }}>
                暂无卖单数据
              </div>
            </div>
          )}
        </div>

        <div className={styles.currentPrice}>
          <div className={styles.priceValue}>50120.5</div>
          <div className={styles.priceChange}>+0.12%</div>
        </div>

        <div className={styles.buySection}>
          {buyOrders.length > 0 ? (
            buyOrders.map((order, index) => (
              <div key={index} className={styles.orderRow}>
                <div className={`${styles.priceColumn} ${getBuyPriceColor()}`}>
                  {formatNumber(order.price)}
                </div>
                <div className={styles.amountColumn}>
                  {formatNumber(order.amount, 3)}
                </div>
                <div className={styles.totalColumn}>
                  {formatNumber(order.total, 3)}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.orderRow}>
              <div style={{ textAlign: 'center', color: '#999', gridColumn: '1 / -1' }}>
                暂无买单数据
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <div className={styles.orderBookContent}>

     
      <div className={styles.headerTrade}>
        <div className={styles.title}>
          实时成交
        </div>
        <div className={styles.controls}>

        </div>
      </div>
      <div className={styles.tableHeader}>
        <div className={styles.priceColumn}>价格</div>
        <div className={styles.amountColumn}>数量</div>
        <div className={styles.totalColumn}>时间</div>
      </div>
      <div className={styles.content}>
        <div className={styles.sellSection}>
          {sellOrders.map((order, index) => (
            <div key={index} className={styles.orderRow}>
              <div className={`${styles.priceColumn} ${getSellPriceColor()}`}>
                {formatNumber(order.price)}
              </div>
              <div className={styles.amountColumn}>
                {formatNumber(order.amount, 3)}
              </div>
              <div className={styles.totalColumn}>
                {formatNumber(order.total, 3)}
              </div>
            </div>
          ))}
        </div>




      </div>
      </div>

    </div>
  );
};

export default OrderBook;
