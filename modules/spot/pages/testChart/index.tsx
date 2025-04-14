import React, { useState, useEffect } from 'react';
import KlineChart from '@/components/KlineChart';
import Tradingview from '@/components/Tradingview';
import DepthChart from '@/components/DepthChart';
import OrderBook from '@/components/OrderBook';
import WebSocketService from '@/utils/websocket';

// 创建 websocket 实例
const websocket = new WebSocketService('ws://ws80.imsaas.work/ws/btc_usdt_1@kline_1m');

const TestChart = () => {

    const [klineData, setKlineData] = useState<any[]>([]);
    const [tradingviewData, setTradingviewData] = useState<any[]>([]);
    const [depthChartData, setDepthChartData] = useState<any>({ bids: [], asks: [] });
    const [httpData, setHttpData] = useState<any>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');
    
    // 修改发送消息的函数，使用正确的订阅格式
    const sendSubscription = (symbols: [string, number][], categories: string[] = ["kline"]) => {
        const message = JSON.stringify({
            symbol_groups: symbols,
            categories: categories
        });
        websocket.send(message);
    };

    // 使用fetch请求http://ws81.imsaas.work接口
    const fetchDataFromHttp = async () => {
        const symbols = 'BTC_USDT_1m';
        try {
            const response = await fetch(`http://ws81.imsaas.work/depth/${symbols}`);
            const data = await response.json();
            console.log("data",data);
            setDepthChartData(data);
            console.log('HTTP数据获取成功:', data);
        } catch (error) {
            console.error('获取HTTP数据时出错:', error);
        }
    };

    useEffect(() => {
        // fetchDataFromHttp();
        // 在获取HTTP数据后，再连接WebSocket并处理消息
        websocket.connect((message: string) => {
            // console.log("接收message",message);
            try {
                // 检查是否为订阅确认消息
                if (message.startsWith('Subscribed to')) {
                    setStatusMessage(message);
                    return;
                }
                
                // 处理JSON数据
                const data = JSON.parse(message);
                // console.log("WebSocket收到的原始数据:", data);
                
                setKlineData(prevData => {
                    const newData = Array.isArray(data) ? [...prevData, ...data] : [...prevData, data];
                    // console.log("更新后的klineData将是:", newData);
                    return newData;
                });
            } catch (error) {
                // 处理非JSON格式消息
                setStatusMessage(message);
                console.error('解析 WebSocket 消息时出错:', error);
            }
        });
        


        // 组件卸载时关闭连接
        return () => {
            websocket.close();
        };
    }, []);

    // 添加这个useEffect来监听klineData变化
    useEffect(() => {
        console.log("klineData更新了:", klineData);
    }, [klineData]);

    return <div>
        <button onClick={() => {
        }}>
            获取k线数据
        </button>
     <KlineChart socketData={klineData} />
        {/* {klineData.length > 0 && (
            
        )} */}

            <Tradingview data={klineData} />
        
       
       
    </div>;
};

export default TestChart;