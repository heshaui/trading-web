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

const OrderBook: React.FC = () => {
  const { t } = useTranslation(['contract', 'spot']);
  const [colorMode, setColorMode] = useState<'red-green' | 'green-red'>('red-green');
  const [precision, setPrecision] = useState<number>(2);

  // 模拟数据
  const sellOrders: OrderBookItem[] = [
    { price: 50125.5, amount: 0.234, total: 11729.367 },
    { price: 50124.0, amount: 0.156, total: 7819.344 },
    { price: 50123.5, amount: 0.089, total: 4460.992 },
    { price: 50122.0, amount: 0.234, total: 11728.548 },
    { price: 50121.5, amount: 0.156, total: 7818.954 },
    { price: 50121.5, amount: 0.156, total: 7818.954 },
  ];

  const buyOrders: OrderBookItem[] = [
    { price: 50119.0, amount: 0.234, total: 11727.846 },
    { price: 50118.5, amount: 0.156, total: 7818.486 },
    { price: 50117.0, amount: 0.089, total: 4460.413 },
    { price: 50116.5, amount: 0.234, total: 11727.261 },
    { price: 50115.0, amount: 0.156, total: 7817.940 },
    { price: 50115.0, amount: 0.156, total: 7817.940 },
  ];

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
          委托列表
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

        <div className={styles.currentPrice}>
          <div className={styles.priceValue}>50120.5</div>
          <div className={styles.priceChange}>+0.12%</div>
        </div>

        <div className={styles.buySection}>
          {buyOrders.map((order, index) => (
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
          ))}
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
