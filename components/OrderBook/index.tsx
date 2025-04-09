// components/OrderBook.js
import { useState, useEffect } from 'react';
import styles from './style/OrderBook.module.css';

// 定义订单类型
interface Order {
  price: number;
  amount: number;
  total: number;
}

// 随机生成订单数据的函数
const generateRandomOrders = (count: number, priceBase: number, isSell: boolean) => {
  const orders = [];
  const priceRange = isSell ? [priceBase, priceBase + 100] : [priceBase - 100, priceBase];
  
  for (let i = 0; i < count; i++) {
    const price = Number(
      (Math.random() * (priceRange[1] - priceRange[0]) + priceRange[0]).toFixed(1)
    );
    const amount = Number((Math.random() * 10).toFixed(6)); // 数量在 0-10 之间
    const total = Number((price * amount).toFixed(2)); // 总计 = 价格 * 数量

    orders.push({ price, amount, total });
  }

  // 按价格排序：卖单升序，买单降序
  return orders.sort((a, b) => (isSell ? a.price - b.price : b.price - a.price));
};

const OrderBook = () => {
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [buyRatio, setBuyRatio] = useState(0);
  const [sellRatio, setSellRatio] = useState(0);

  useEffect(() => {
    // 初始化当前价格（随机生成一个基准价格）
    const basePrice = Math.random() * 1000 + 76000; // 价格在 76000-77000 之间
    setCurrentPrice(Number(basePrice.toFixed(1)));

    // 生成随机买单和卖单
    const generatedSellOrders = generateRandomOrders(10, basePrice, true); // 10 条卖单
    const generatedBuyOrders = generateRandomOrders(10, basePrice, false); // 10 条买单
    setSellOrders(generatedSellOrders as any);
    setBuyOrders(generatedBuyOrders as any);

    // 计算买单和卖单比例
    const totalBuyAmount = generatedBuyOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalSellAmount = generatedSellOrders.reduce((sum, order) => sum + order.amount, 0);
    const total = totalBuyAmount + totalSellAmount;
    const buyPercentage = (totalBuyAmount / total) * 100;
    const sellPercentage = (totalSellAmount / total) * 100;
    setBuyRatio(Number(buyPercentage.toFixed(2)));
    setSellRatio(Number(sellPercentage.toFixed(2)));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>订单簿</h1>
        <select className={styles.dropdown}>
          <option value="0.1">0.1</option>
          <option value="1">1</option>
          <option value="10">10</option>
        </select>
      </div>

      <div className={styles.labels}>
        <span>价格(USDT)</span>
        <span>数量(BTC)</span>
        <span>总计(USDT)</span>
      </div>

      {/* 卖单 */}
      <div className={styles.orderList}>
        {sellOrders.map((order, index) => (
          <div key={index} className={`${styles.orderRow} ${styles.sell}`}>
            <span>{order.price.toLocaleString()}</span>
            <span>{order.amount.toFixed(6)}</span>
            <span>{order.total.toLocaleString()}</span>
            <div
              className={styles.background}
              style={{
                width: `${(order.total / Math.max(...sellOrders.map(o => o.total))) * 100}%`,
                backgroundColor: 'rgba(255, 99, 71, 0.2)',
              }}
            />
          </div>
        ))}
      </div>

      {/* 当前价格 */}
      <div className={styles.currentPrice}>
        <span>{currentPrice.toLocaleString()}</span>
        <span>${currentPrice.toLocaleString()}</span>
      </div>

      {/* 买单 */}
      <div className={styles.orderList}>
        {buyOrders.map((order, index) => (
          <div key={index} className={`${styles.orderRow} ${styles.buy}`}>
            <span>{order.price.toLocaleString()}</span>
            <span>{order.amount.toFixed(6)}</span>
            <span>{order.total.toLocaleString()}</span>
            <div
              className={styles.background}
              style={{
                width: `${(order.total / Math.max(...buyOrders.map(o => o.total))) * 100}%`,
                backgroundColor: 'rgba(50, 205, 50, 0.2)',
              }}
            />
          </div>
        ))}
      </div>

      {/* 买单/卖单比例 */}
      <div className={styles.ratio}>
        <div className={styles.buyRatio} style={{ width: `${buyRatio}%` }}>
          B {buyRatio}%
        </div>
        <div className={styles.sellRatio} style={{ width: `${sellRatio}%` }}>
          S {sellRatio}%
        </div>
      </div>
    </div>
  );
};

export default OrderBook;