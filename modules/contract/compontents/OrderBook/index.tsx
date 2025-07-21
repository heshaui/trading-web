import React, { useState } from 'react';
import { Button, Select } from 'antd';
import { useTranslation } from 'next-i18next';
import styles from './style/OrderBook.module.css';

const { Option } = Select;

interface OrderBookItem {
  price: number;
  amount: number;
  total: number;
}

const OrderBook: React.FC = () => {
  const { t } = useTranslation('contract');
  const [colorMode, setColorMode] = useState<'red-green' | 'green-red'>('red-green');
  const [precision, setPrecision] = useState<number>(2);

  // 模拟数据
  const sellOrders: OrderBookItem[] = [
    { price: 50125.5, amount: 0.234, total: 11729.367 },
    { price: 50124.0, amount: 0.156, total: 7819.344 },
    { price: 50123.5, amount: 0.089, total: 4460.992 },
    { price: 50122.0, amount: 0.234, total: 11728.548 },
    { price: 50121.5, amount: 0.156, total: 7818.954 },
  ];

  const buyOrders: OrderBookItem[] = [
    { price: 50119.0, amount: 0.234, total: 11727.846 },
    { price: 50118.5, amount: 0.156, total: 7818.486 },
    { price: 50117.0, amount: 0.089, total: 4460.413 },
    { price: 50116.5, amount: 0.234, total: 11727.261 },
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

  return (
    <div className={styles.orderBook}>
      <div className={styles.header}>
        <div className={styles.title}>
          委托列表
        </div>
        <div className={styles.controls}>

          <Select
            size="small"
            value={precision}
            onChange={setPrecision}
            className={styles.precisionSelect}
          >
            <Option value={0}>0</Option>
            <Option value={1}>0.1</Option>
            <Option value={2}>0.01</Option>
            <Option value={3}>0.001</Option>
          </Select>
        </div>
      </div>

      <div className={styles.tableHeader}>
        <div className={styles.priceColumn}>{t('price')}</div>
        <div className={styles.amountColumn}>{t('amount')}</div>
        <div className={styles.totalColumn}>{t('total')}</div>
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
      <div className={styles.header}>
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
  );
};

export default OrderBook;
