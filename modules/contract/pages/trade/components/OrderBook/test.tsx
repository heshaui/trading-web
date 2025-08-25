import React from 'react';
import { OrderBookList, RealtimeTrade } from './index';

// 模拟 WebSocket 数据
const mockOrderBookData = {
    tick: {
        asks: [
            [50121.5, 0.5],
            [50122.0, 1.2],
            [50122.5, 0.8],
            [50123.0, 2.1],
            [50123.5, 1.5],
            [50124.0, 0.9],
            [50124.5, 1.8],
            [50125.0, 2.5],
        ],
        buys: [
            [50120.5, 0.8],
            [50120.0, 1.5],
            [50119.5, 2.0],
            [50119.0, 1.2],
            [50118.5, 0.9],
            [50118.0, 1.8],
            [50117.5, 2.2],
            [50117.0, 1.5],
        ],
        lastPrice: 50121.0,
        priceChange: 1.25,
    },
};

const OrderBookTest: React.FC = () => {
    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#f5f5f5', height: '100vh' }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
                <h3>委托列表 (OrderBookList)</h3>
                <div style={{ height: '600px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                    <OrderBookList orderBookData={mockOrderBookData} />
                </div>
            </div>

            <div style={{ flex: 1, maxWidth: '400px' }}>
                <h3>实时成交 (RealtimeTrade)</h3>
                <div style={{ height: '600px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                    <RealtimeTrade orderBookData={mockOrderBookData} />
                </div>
            </div>
        </div>
    );
};

export default OrderBookTest;
