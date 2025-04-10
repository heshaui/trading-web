import React, { useState, useEffect } from 'react';
import KlineChart from '@/components/KlineChart';
import Tradingview from '@/components/Tradingview';
import DepthChart from '@/components/DepthChart';
import WebSocketService from '@/utils/websocket';

// 创建 websocket 实例
const websocket = new WebSocketService('ws://ws80.imsaas.work:80');

const TestChart = () => {

    const [klineData, setKlineData] = useState<any[]>([]);
    const [tradingviewData, setTradingviewData] = useState<any[]>([]);
    const [depthChartData, setDepthChartData] = useState<any[]>([]);

    useEffect(() => {
        // 连接 websocket 并处理消息
        websocket.connect((message: string) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'kline') {
                    setKlineData(data.data);
                } else if (data.type === 'tradingview') {
                    setTradingviewData(data.data);
                } else if (data.type === 'depth') {
                    setDepthChartData(data.data);
                }
            } catch (error) {
                console.error('解析 WebSocket 消息时出错:', error);
            }
        });

        // 组件卸载时关闭连接
        return () => {
            websocket.close();
        };
    }, []);

    return <div>
        <KlineChart data={klineData} />
        <Tradingview data={tradingviewData} />
        <DepthChart data={depthChartData} />
    </div>;
};

export default TestChart;