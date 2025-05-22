'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { withSpotLayout } from '@/components/sidebarLayout/SpotLayout/userSpotLayout';
import styles from '../../styles/billDetails.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs, Spin, Button, Space, Tooltip, Dropdown } from 'antd';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import type { TabsProps } from 'antd';
import SpotChartTables from '../compontents/spotChart_table'
import SpotChartAssets from '../compontents/spotChart_assets'
import SpotChartTrade from '../compontents/spotChart_trade'
import SpotHeaderPage from '../compontents/spotChart_header'
import KlineChart from '@/components/KlineChart'
import Tradingview, { TradingviewRefHandle } from '@/components/Tradingview'
import DepthChart from '@/components/DepthChart'
import OrderBook from '@/components/OrderBook'
import WebSocketService from '@/utils/websocket';
import { FullscreenOutlined } from '@ant-design/icons';
import Image from 'next/image'
import { NoData } from '@/components/noData';
import type { DropdownProps, MenuProps } from 'antd'
import { getExchangeGroup, getExchangeCoinList } from '@/services/spot';
import { toast } from 'sonner';
import appStore from '@/store';
import { set } from 'mobx';
import { reaction } from 'mobx';
import { useAuth } from '@/context/AuthContext';
import { throttle } from 'lodash';

interface DataType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: number,
    tokenTime: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
}
interface coinSelectType {
    coinId: string,
    coinName: string,
    iconUrl: string,
    nameDefault: string,
    value: string,
    label: string,
}

const ExchangePage = () => {
    const { t } = useTranslation(['spot']);
    const [form] = Form.useForm();
    const { isLoggedIn} = useAuth()
    const [klineData, setKlineData] = useState<any>();
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [activeChartType, setActiveChartType] = useState<string>('basic');
    const [coinSelect, setCoinSelect] = useState<coinSelectType[]>([])
    const [tradePrice, setTradePrice] = useState<number>(0);
    const router = useRouter();

    const [paramInfo, sePparamInfo] = useState({
        type: '',
        selsect: ''
    });
    const [total, setTotal] = useState(0);
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10,
    })
    const paramdataRef = useRef(pageParam);
    const [timeInterval, setTimeInterval] = useState<string>('1D');
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(true);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [dayData, setDayData] = useState<any[]>(['15m', '1h', '4h', '1D']);
    const [timeIntervalOptions, setTimeIntervalOptions] = useState<any[]>([
        '1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1D', '3D', '1W', '1M', '1Y'
    ]);
    const [chartType, setChartType] = useState<any[]>([
        { label: t('spot.label.kline'), value: 'basic' },
        // { label: 'TradingView', value: 'tradingview' },
        { label: t('spot.label.depth'), value: 'depth' }
    ]);
 
    const [chartDisplayType, setChartDisplayType] = useState<number>(1);
    const [depthData, setDepthData] = useState<any>();
    const [orderData, setOrderData] = useState<any[]>([]);
    const [coinData, setCoinData] = useState<any>();
    const [groupData, setGroupData] = useState<any[]>([]);
    const [currentPair, setCurrentPair] = useState<any>();
    // const [orderUpdateFlag, setOrderUpdateFlag] = useState<number>(0);
    const orderUpdateFlag = useRef<number>(0);
    const assetsUpdateFlag = useRef<number>(0);
    // ref to access Tradingview methods
    const tradingviewRef = useRef<TradingviewRefHandle>(null);

    // 修改WebSocket相关逻辑，使用useRef保存WebSocket实例
    const websocketRef = useRef<WebSocketService | null>(null);
    const depthWsRef = useRef<WebSocketService | null>(null);

    // 添加客户端渲染标记
    const [isClient, setIsClient] = useState(false);

    const getCoinList = async () => {
        const response = await getExchangeCoinList();
        if (response.code === '0') {

            await setGroupData(response.data)
            await getGroup();
        }

    }

    const getGroup = async () => {
        const response = await getExchangeGroup();
        if (response.code === '0') {
            groupData.forEach((item: any) => {
                const group = response.data.find((group: any) => group.baseSymbol === item.baseSymbol && group.coinSymbol === item.coinSymbol);
                if (group) {
                    item.group = group;
                }
            });
            setGroupData(groupData);
        }
    }
    const getOrderWsData = () => {


        // 如果已经有连接，不要重复创建
        if (websocketRef.current) return;

        const websocket = new WebSocketService(`${process.env.NEXT_PUBLIC_WS_API_BASE}/ws/${currentPair.coinSymbol.toUpperCase()}_${currentPair.baseSymbol.toUpperCase()}_${currentPair.groupStatus}@trade`);
        websocketRef.current = websocket;

        websocket.connect((message: string) => {

            try {
                
                const data = JSON.parse(message);
                if(data.type === '__ping__'){
                   
                    return;
                }
                // 使用函数式更新来累积数据
                setOrderData((prevData) => {
                    if (!prevData) return [data];

                    // 假设我们希望保留最新的100条数据
                    const maxEntries = 100;
                    const newData = Array.isArray(data) ? data : [data];

                    // 将新数据添加到数组开头（假设最新的数据应该显示在前面）
                    const combinedData = [...newData, ...prevData];

                    // 限制数组长度
                    return combinedData.slice(0, maxEntries);
                });
            } catch (error) {

            }
        });
    }

    const getWsDepthData = () => {
        // 如果已经有连接，不要重复创建
        if (depthWsRef.current) return;

        const websocket = new WebSocketService(`${process.env.NEXT_PUBLIC_WS_API_BASE}/ws/${currentPair.coinSymbol.toUpperCase()}_${currentPair.baseSymbol.toUpperCase()}_1051@depth`);
        depthWsRef.current = websocket;

        websocket.connect((message: string) => {
            try {
                // 检查消息是否为系统消息
                if (message.startsWith('subscribe:') ||
                    message.startsWith('ping') ||
                    message.startsWith('pong') ||
                    message.includes('subscribe') ||
                    message.includes('left the channel') ||
                    message.includes('client')) {
                    // 处理系统消息
                    return;
                }

                if (message.includes('error')) {
                    return;
                }
                console.log('getWsDepthData',message)
                const data = JSON.parse(message);

                console.log(data, 'getWsDepthData');
                // 检查消息类型是否为depth
                if (data.type !== 'depth') {
                    return;
                }

                // 更新深度数据而不是直接覆盖
                setDepthData((prevData: any) => {
                    // 如果还没有初始数据，则创建一个新的数据结构
                    if (!prevData || !prevData.bids) {
                        return {
                            asks: data.asks || [],
                            bids: data.bids || [],
                        };
                    }

                    // 创建当前数据的副本
                    const newData = {
                        asks: [...(prevData.asks || [])],
                        bids: [...(prevData.bids || [])],
                    };

                    // 处理买单(bids)更新
                    if (data.bids && Array.isArray(data.bids)) {
                        // 买单按价格降序排列
                        const sortedBids = [...newData.bids].sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
                        const minPrice = sortedBids.length >= 10 ? parseFloat(sortedBids[9][0]) : 0;
                        
                        data.bids.forEach((newBid: any) => {
                            const [price, quantity] = newBid;
                            console.log('买单',newBid)
                            const priceFloat = parseFloat(price);
                            
                            // 规则1: 如果新档位不在10档内（对于买单，价格小于当前10档最低价），不处理
                            if (sortedBids.length >= 10 && priceFloat < minPrice) {
                                return; // 不处理此档位
                            }
                            
                            // 查找是否存在此价格档位
                            const existingIndex = newData.bids.findIndex(bid => bid[0] === price);

                            // 规则3: 如果新档位在10档内且价格能找到，进行数量计算
                            if (existingIndex > -1) {
                                const currentQuantity = Number(newData.bids[existingIndex][1]);
                                const quantityNum = Number(quantity);
                                let newQuantity;
                                
                                // 如果数量为负数，进行减法操作
                                if (quantityNum < 0) {
                                    console.log('买单负数quantityNum', quantityNum);
                                    newQuantity = currentQuantity - Math.abs(quantityNum);
                                } else {
                                    // 否则进行累加
                                    newQuantity = currentQuantity + quantityNum;
                                }
                                
                                if (newQuantity <= 0) {
                                    // 如果计算后小于等于0，移除该档位
                                    newData.bids.splice(existingIndex, 1);
                                } else {
                                    // 否则更新为计算后的数量
                                    newData.bids[existingIndex][1] = newQuantity.toString();
                                }
                            } 
                            // 规则2: 如果新档位在10档内但价格找不到，加入到盘口
                            else if (quantity !== '0') {
                                // 按价格降序插入新买单
                                let insertIndex = 0;
                                while (insertIndex < newData.bids.length &&
                                    parseFloat(newData.bids[insertIndex][0]) > priceFloat) {
                                    insertIndex++;
                                }
                                newData.bids.splice(insertIndex, 0, newBid);
                            }
                        });
                    }

                    // 处理卖单(asks)更新
                    if (data.asks && Array.isArray(data.asks)) {
                        console.log('当前卖单1',data.asks)
                        console.log('当前卖单2',newData)
                        // 卖单按价格降序排列   
                        const sortedAsks = [...newData.asks].sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
                        const minPrice = sortedAsks.length >= 10 ? parseFloat(sortedAsks[9][0]) : 0;
                        
                        data.asks.forEach((newAsk: any) => {
                            const [price, quantity] = newAsk;
                            const priceFloat = parseFloat(price);
                            
                            // 规则1: 如果新档位不在10档内（对于卖单，价格小于当前10档最低价），不处理
                            if (sortedAsks.length >= 10 && priceFloat < minPrice) {
                                return; // 不处理此档位
                            }
                            
                            // 查找是否存在此价格档位
                            const existingIndex = newData.asks.findIndex(ask => ask[0] === price);

                            // 规则3: 如果新档位在10档内且价格能找到，进行数量计算
                            if (existingIndex > -1) {
                                const currentQuantity = Number(newData.asks[existingIndex][1]);
                                const quantityNum = Number(quantity);
                                let newQuantity;
                                
                                // 如果数量为负数，进行减法操作
                                if (quantityNum < 0) {
                                    console.log('负数quantityNum',quantityNum)
                                    newQuantity = currentQuantity - Math.abs(quantityNum);
                                } else {
                                    // 否则进行累加
                                    newQuantity = currentQuantity + quantityNum;
                                }
                                
                                if (newQuantity <= 0) {
                                    // 如果计算后小于等于0，移除该档位
                                    newData.asks.splice(existingIndex, 1);
                                } else {
                                    // 否则更新为计算后的数量
                                    newData.asks[existingIndex][1] = newQuantity.toString();
                                }
                            } 
                            // 规则2: 如果新档位在10档内但价格找不到，且数量不为负数，加入到盘口
                            else if (quantity !== '0' && parseFloat(quantity) > 0) {
                                // 按价格降序插入新卖单
                                let insertIndex = 0;
                                while (insertIndex < newData.asks.length &&
                                    parseFloat(newData.asks[insertIndex][0]) > priceFloat) {
                                    insertIndex++;
                                }
                                newData.asks.splice(insertIndex, 0, newAsk);
                            }
                            // 规则4: 如果新档位价格找不到且数量为负数，不处理
                        });
                    }

                    // 确保只保留必要的档位数量并正确排序
                    newData.bids.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0])); // 买单按价格降序
                    newData.asks.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])); // 卖单按价格升序
                    
                    newData.bids = newData.bids.slice(0, 10);
                    newData.asks = newData.asks.slice(0, 10);

                    return newData;
                });
            } catch (error) {
                console.error('解析WebSocket深度数据失败:', error, '原始消息:', message);
            }
        });
    }

    const getHistoryDepthData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_API_BASE}/depth/${currentPair.coinSymbol}_${currentPair.baseSymbol}_1051`);
            const data = await response.json();
            console.log(data, 'getHistoryDepthData');

            // 确保bids和asks是数组并限制为10条
            const formattedData = {
                bids: Array.isArray(data.bids) ? data.bids.slice(0, 10) : [],
                asks: Array.isArray(data.asks) ? data.asks.slice(0, 10) : [],
            };

            console.log('格式化后的深度数据:', formattedData);

            // 设置初始深度数据
            setDepthData(formattedData);

            // 初始数据加载完成后建立WebSocket连接获取实时更新
            getWsDepthData();
        } catch (error) {
            console.error('获取历史深度数据失败:', error);
        }
    }

    // 修改K线WebSocket连接逻辑
    const klineWsRef = useRef<WebSocketService | null>(null);

    // 使用useCallback包装getKlineData函数，确保只有当依赖项变化时才会重新创建函数
    const getKlineData = useCallback(() => {
        if (typeof window === 'undefined' || !currentPair || !currentPair.coinSymbol) return;
    
        if (klineWsRef.current) {
            klineWsRef.current.close();
            klineWsRef.current = null;
        }
    
        try {
            const websocket = new WebSocketService(`${process.env.NEXT_PUBLIC_WS_API_BASE}/ws/${currentPair.coinSymbol}_${currentPair.baseSymbol}_${currentPair.groupStatus}@kline_${timeInterval.toLowerCase()}`);
            klineWsRef.current = websocket;
    
       
            const updateKlineData = throttle((newData: any) => {
                setKlineData((prevData: any) => {
                    const newDataCopy = JSON.parse(JSON.stringify(newData));
                    const combinedKlines = [...(prevData?.data || []), ...(newDataCopy.data || [])]
                      .reduce((acc, curr) => {
                        acc.push(curr);
                        return acc;
                      }, [])
                      .sort((a: any, b: any) => a.timestamp - b.timestamp);
                    return { ...newDataCopy, data: combinedKlines };
                });
                console.log('更新k线执行')
            }, 1000);
    
            websocket.connect((message: string) => {
                console.log(message,'homeklinedata数据1');
                try {
                    if (message.startsWith('subscribe:') || message.startsWith('ping') || message.startsWith('pong') || message.includes('subscribe') || message.includes('joined') || message.includes('left')) {
                        console.log('WebSocket系统消息:', message);
                        return;
                    }
    
                    const data = JSON.parse(message);
                    console.log(data,'homeklinedata数据2');
                    setCoinData(data);
                    updateKlineData(data);
                } catch (err) {
                    console.error('解析K线数据失败:', err, '原始消息:', message);
                }
            });
        } catch (err) {
            console.error('创建K线WebSocket连接失败:', err);
            toast.error('无法建立K线数据连接');
        }
    }, [currentPair, timeInterval]);



    
    useEffect(() => {
        // 设置客户端渲染标记
        setIsClient(true);

        // 只在客户端执行初始化
        if (typeof window !== 'undefined') {
            // 只获取不依赖currentPair的数据
            getCoinList();
        }

        // 组件卸载时清理所有WebSocket连接
        return () => {
            if (websocketRef.current) websocketRef.current.close();
            if (depthWsRef.current) depthWsRef.current.close();
            if (klineWsRef.current) klineWsRef.current.close();
        };
    }, []);

    useEffect(() => {
        // 只在客户端且currentPair有值时执行
        if (!isClient || !currentPair || typeof window === 'undefined') return;

        // 现在可以安全地使用currentPair
        getOrderWsData();
        getHistoryDepthData();
        getKlineData();
    }, [isClient, currentPair]);
    
    // 新增：监听timeInterval变化，重新连接kline的WebSocket
    useEffect(() => {
        // 只在客户端且currentPair有值时执行
        if (!isClient || !currentPair || typeof window === 'undefined') return;
        
        // 当timeInterval变化时，重新获取K线数据
        getKlineData();
    }, [timeInterval, isClient, currentPair, getKlineData]);

    useEffect(() => {
        // 只在客户端执行
        if (!isClient || typeof window === 'undefined') return;

        try {
            appStore.loadCurrencyPairs()
                .then((result) => {
                    const currentPairList = appStore.getCurrentPair() || (appStore.currencyPairs && appStore.currencyPairs.length > 0 ? appStore.currencyPairs[0] : null);
                    if (currentPairList) {
                        setCurrentPair(currentPairList);
                    }
                })
                .catch((error) => {
                    console.error('加载货币对数据失败:', error);
                    toast.error('加载货币对数据失败');
                });
        } catch (error) {
            console.error('初始化货币对数据错误:', error);
        }
    }, [isClient]);

    // 添加一个新的 useEffect 来监听 appStore 中的币对变化
    useEffect(() => {
        // 只在客户端执行
        if (!isClient || typeof window === 'undefined') return;

        // 创建一个订阅函数来监听 appStore 中当前币对的变化
        const disposer = reaction(
            () => appStore.getCurrentPair(),
            (newPair) => {
                if (newPair && (!currentPair ||
                    newPair.coinSymbol !== currentPair.coinSymbol ||
                    newPair.baseSymbol !== currentPair.baseSymbol ||
                    newPair.groupStatus !== currentPair.groupStatus)) {

                    console.log('当前币对已更新:', newPair);

                    // 清理现有的 WebSocket 连接
                    if (websocketRef.current) {
                        websocketRef.current.close();
                        websocketRef.current = null;
                    }

                    if (depthWsRef.current) {
                        depthWsRef.current.close();
                        depthWsRef.current = null;
                    }

                    if (klineWsRef.current) {
                        klineWsRef.current.close();
                        klineWsRef.current = null;
                    }

                    // 更新当前币对
                    setCurrentPair(newPair);

                    // 重置数据
                    setOrderData([]);
                    setDepthData(null);
                    setKlineData(null);
                }
            },
            { fireImmediately: true }
        );

        // 清理函数
        return () => {
            disposer();
        };
    }, [isClient, currentPair]);

  

    const chartTypeItems: MenuProps['items'] = [
        {
            key: 1,
            label: <span style={{ fontSize: '12px' }}>K线图</span>,
        },
        {
            key: 8,
            label: <span style={{ fontSize: '12px' }}>美国线</span>,
        },
        {
            key: 13,
            label: <span style={{ fontSize: '12px' }}>面积图</span>,
        },
        {
            key: 3,
            label: <span style={{ fontSize: '12px' }}>线型图</span>,
        },
    ];

    const handleChartTypeChange = (e: { key: string }) => {
        setChartDisplayType(Number(e.key));
    };

    const handleOrderSuccess = () => {
        // 更新标志，触发SpotChartTables组件重新获取数据
        appStore.updateOrderFlag(1);
        
    };
    const handleOrderDelect = () => {
        assetsUpdateFlag.current = assetsUpdateFlag.current + 1;
        appStore.updateOrderFlag(1);
    };

    const handlePriceClick = (price: number) => {
        console.log('Price clicked:', price);
        setTradePrice(price);

    };

    return (<div className={`${styles.page_box} w-full`}>
        {/* 使用客户端渲染标记来控制渲染 */}
        {/* {!isClient ? (
            // 服务器端渲染占位符
            <div className="w-full h-screen flex items-center justify-center">
                <Spin size="large" tip="加载中..." />
            </div>
        ) : ( */}
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            // bodySortBg: "pink",
                            headerBg: "transparent",
                            headerColor: "var(--text-color6)",
                            headerSplitColor: "transparent", // 表头分割线颜色
                            rowExpandedBg: "var(--background10)", // 表格行展开背景色
                            borderColor: "transparent",
                            // stickyScrollBarBg:"transparent",
                            headerBorderRadius: 0, // 表头圆角
                        },
                        Pagination: {
                            itemActiveBg: "transparent",
                            itemBg: "transparent",
                        },

                        Select: {
                            activeBorderColor: "var(--border-color4)",
                            optionActiveBg: "transparent",
                            selectorBg: "transparent", //选框背景色
                        },
                        Tabs: {
                            itemActiveColor: "var(--tip-color)", //激活态颜色  
                            itemSelectedColor: "var(--text-color5)", //选中态颜色
                            horizontalMargin: "0 0 0 0",
                            itemColor: "var(--text-color6)",
                            inkBarColor: "var(--text-color5)", //指示条颜色
                        },
                    },
                }}
            >
                <div className={`${styles.card_bgc4} w-full  mb-1`} style={{minWidth:'1135px'}}>
                    <SpotHeaderPage coinData={coinData} />
                </div>

                <div className='flex-x'>
                    <div className={`${styles.card_bgc3} ${styles.spot_chartBox} w-full mb-1 mr-1 flex`}  style={{paddingRight:'0'}}>
                        {/* <div className={`flex-1`}> */}
                  
                        <div id="chart-container" style={{ width: '70%', height: '548px' }} className='flex-1'>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 16px',
                                borderBottom: '1px solid var(--border-color1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {dayData.map((item, index) => (
                                        <Button
                                            key={index}
                                            type={timeInterval === item ? 'primary' : 'text'}
                                            onClick={() => setTimeInterval(item)}
                                            style={{
                                                fontSize: '12px',
                                                background: timeInterval === item ? 'rgba(0,0,0,0.05)' : 'transparent',
                                                color: timeInterval === item ? 'var(--text-color5)' : 'var(--text-color6)'
                                            }}
                                        >
                                            {item}
                                            {item === '1D' && (
                                                <Dropdown
                                                    trigger={['hover']}
                                                    placement="bottomRight"
                                                    dropdownRender={() => (
                                                        <div style={{
                                                            background: '#fff',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                            padding: '10px',
                                                            display: 'grid',
                                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                                            gap: '10px',
                                                            width: '320px',
                                                        }}>
                                                            {timeIntervalOptions.map((option) => (
                                                                <div
                                                                    key={option}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setTimeInterval(option);
                                                                    
                                                                    }}
                                                                    style={{
                                                                        padding: '10px',
                                                                        textAlign: 'center',
                                                                        background: timeInterval === option ? 'var(--theme-color)' : '#f0f0f0',
                                                                        color: timeInterval === option ? '#fff' : '#000',
                                                                        borderRadius: '5px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px'
                                                                    }}
                                                                >
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                >
                                                    <Iconify
                                                        icon="eva:arrow-down-fill"
                                                        style={{ fontSize: '12px', marginLeft: '4px', cursor: 'pointer' }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </Dropdown>
                                            )}
                                        </Button>

                                    ))}

                                    <Space size="small" style={{ marginLeft: '16px' }}>
                                        <Dropdown
                                            menu={{
                                                items: chartTypeItems,
                                                onClick: handleChartTypeChange,
                                                selectedKeys: [String(chartDisplayType)]
                                            }}
                                            trigger={['hover']}
                                            placement="bottom"
                                        >
                                            <Image src="/images/exchange/icon_stock.png" alt="exchange" width={20} height={20} style={{ cursor: 'pointer' }} />
                                        </Dropdown>
                                        <Tooltip title="技术指标" overlayInnerStyle={{fontSize: '12px'}}>
                                            <Image src="/images/exchange/icon_chart.png" alt="exchange" width={20} height={20} onClick={() => tradingviewRef.current?.handleAddIndicator()}  style={{cursor: 'pointer'}}/>
                                        </Tooltip>
                                        <Tooltip title="图表重置" overlayInnerStyle={{fontSize: '12px'}}>
                                            <Image src="/images/exchange/icon_delete.png" alt="exchange" width={20} height={20}  onClick={() => tradingviewRef.current?.resetChart()} style={{cursor: 'pointer'}}/>
                                        </Tooltip>
                                        {/* <Tooltip title="图表截图">
                                            <Image src="/images/exchange/icon_camera.png" alt="exchange" width={20} height={20}  onClick={() => tradingviewRef.current?.handleChartScreenshot()}/>
                                        </Tooltip> 暂时注释 ---2025。04.28 -zyj */}
                                        <Tooltip title="成交量分布" overlayInnerStyle={{fontSize: '12px'}}>
                                            <Image
                                                src="/images/exchange/icon_value.png"
                                                alt="exchange"
                                                width={20}
                                                height={20}
                                                onClick={() => tradingviewRef.current?.addVolumeDistribution()} style={{cursor: 'pointer'}}
                                            />
                                        </Tooltip>
                                    </Space>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {chartType.map((item, index) => (
                                        <Button
                                            key={index}
                                            type={activeChartType === item.value ? 'primary' : 'text'}
                                            onClick={() => setActiveChartType(item.value)}
                                            style={{
                                                fontSize: '12px',
                                                background: activeChartType === item.value ? 'rgba(0,0,0,0.05)' : 'transparent',
                                                color: activeChartType === item.value ? 'var(--text-color5)' : 'var(--text-color6)'
                                            }}
                                        >
                                            {item.label}
                                        </Button>
                                    ))}

                                    <Tooltip title="全屏" overlayInnerStyle={{fontSize: '12px'}}>
                                        <Button type="text" icon={<FullscreenOutlined />}  onClick={() => tradingviewRef.current?.toggleFullScreen()} />
                                    </Tooltip>
                                </div>
                            </div>
                        
                          
                                  

                                    
                                {(activeChartType === 'basic') && (
                                    <div>
                                    <Tradingview
                                        ref={tradingviewRef}
                                        key={`${currentPair?.coinSymbol || ''}_${currentPair?.baseSymbol || ''}_${currentPair?.groupStatus || ''}_${timeInterval}`}
                                        symbol={(currentPair?.coinSymbol || '') + '_' + (currentPair?.baseSymbol || '') + '_' + (currentPair?.groupStatus || '')}
                                        showLeftToolbar={activeChartType === 'basic' ? false : true}
                                        chartType={chartDisplayType}
                                        klineData={klineData}
                                        timeInterval={timeInterval}
                                    />
                                      </div>
                                )}

                                {activeChartType === 'depth' &&
                                    <DepthChart
                                        key={`depth_${currentPair?.coinSymbol || ''}_${currentPair?.baseSymbol || ''}_${currentPair?.groupStatus || ''}`}
                                        data={depthData}
                                    />
                                }
                        </div>
                        <OrderBook bookData={depthData} orderData={orderData} priceClickHandler={handlePriceClick} />

                        {/* </div> */}
                    </div>
                    <div className={`${styles.card_bgc} mb-1 flex-1`} >
                            <SpotChartTrade onOrderSuccess={handleOrderSuccess}
                                segmentedType="limit" orderData={orderData}
                                tradePrice={tradePrice}
                            />
                        
                    </div>


                    </div>
                    <div className='flex-x'>
                        <div className={`${styles.card_bgc1} mr-1 ${isLoggedIn?styles.table_card:styles.table_card2}`} style={{ minHeight: '57.5vh' }}>
                            <SpotChartTables />
                        </div>
                        {isLoggedIn&&<div className={`${styles.card_bgc1} ${styles.assets_card} flex-1 flex-y align-center`} >
                            <SpotChartAssets />
                        </div>}
                    </div>


            </ConfigProvider>
        {/* )} */}
    </div>);
}

export default ExchangePage;