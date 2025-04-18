'use client'
import React from 'react';
import { withSpotLayout } from '@/components/sidebarLayout/SpotLayout/userSpotLayout';
import styles from '../../styles/billDetails.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs, Spin, Button, Space, Tooltip, Dropdown } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { TabsProps } from 'antd';
import SpotChartTables from '../compontents/spotChart_table'
import SpotChartAssets from '../compontents/spotChart_assets'
import SpotChartTrade from '../compontents/spotChart_trade'
import SpotHeaderPage from '../compontents/spotChart_header'
import KlineChart from '@/components/KlineChart'
import Tradingview from '@/components/Tradingview'
import DepthChart from '@/components/DepthChart'
import OrderBook from '@/components/OrderBook'
import WebSocketService from '@/utils/websocket';
import { FullscreenOutlined } from '@ant-design/icons';
import Image from 'next/image'
import { NoData } from '@/components/noData';
import type { DropdownProps, MenuProps } from 'antd'
import { getExchangeGroup,getExchangeCoinList } from '@/services/spot';
import { toast } from 'sonner';
import appStore from '@/store';
import { set } from 'mobx';
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
    const [klineData, setKlineData] = useState<any>();
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [activeChartType, setActiveChartType] = useState<string>('basic');
    const [loading, setLoading] = useState<boolean>(false);
    const [coinSelect, setCoinSelect] = useState<coinSelectType[]>([])
    const [tableData, setTableData] = useState<DataType[]>([
        {
            id: 1,
            userId: 1,
            platformType: 1,
            deviceNo: 'BTC',
            ip: '123.45.67.89',
            address: '123.45.67.89',
            token: 23.3,
            tokenTime: 123,
            createTime: 1234567890,
            updateTime: 1234567890,
            tenantId: '1234567890'
        }, {
            id: 2,
            userId: 1,
            platformType: 1,
            deviceNo: 'POINT',
            ip: '123.45.67.89',
            address: '123.45.67.89',
            token: 1234567890,
            tokenTime: 23.0,
            createTime: 1234567892,
            updateTime: 1234567889,
            tenantId: '1234567890'
        }
    ]);
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
    const [dayData, setDayData] = useState<any[]>(['15m','1h','4h','1D']);
    const [chartType, setChartType] = useState<any[]>([
        {label:'基本版',value:'basic'},
        {label:'TradingView',value:'tradingview'},
        {label:'深度图',value:'depth'}
    ]);
    const [chartDisplayType, setChartDisplayType] = useState<number>(1);
    const [depthData, setDepthData] = useState<any>();
    const [orderData, setOrderData] = useState<any[]>([]);
    const [coinData, setCoinData] = useState<any>();
    const [groupData, setGroupData] = useState<any[]>([]);
    const [currentPair, setCurrentPair] = useState<any>();

    // 修改WebSocket相关逻辑，使用useRef保存WebSocket实例
    const websocketRef = useRef<WebSocketService | null>(null);
    const depthWsRef = useRef<WebSocketService | null>(null);

    // 添加客户端渲染标记
    const [isClient, setIsClient] = useState(false);

    const getCoinList = async () => {
        const response = await getExchangeCoinList();
        if(response.code === '0'){
           
           await setGroupData(response.data)
            await getGroup();
        }

    }

    const getGroup = async () => {
        const response = await getExchangeGroup();
        if(response.code === '0'){
            groupData.forEach((item:any)=>{
                const group = response.data.find((group:any)=>group.baseSymbol === item.baseSymbol&&group.coinSymbol === item.coinSymbol);
                if(group){
                    item.group = group;
                }
            });
            setGroupData(groupData);
        }
    }
    const getOrderWsData = () => {
        // 添加安全检查
        if (!currentPair || !currentPair.coinSymbol) return;
        
        // 如果已经有连接，不要重复创建
        if (websocketRef.current) return;
        
        const websocket = new WebSocketService(`ws://ws80.imsaas.work/ws/${currentPair.coinSymbol.toUpperCase()}_${currentPair.baseSymbol.toUpperCase()}_${currentPair.groupStatus}@trade`);
        websocketRef.current = websocket;
        
        websocket.connect((message: string) => {

            try {
                const data = JSON.parse(message);
                
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
        
        const websocket = new WebSocketService(`ws://ws80.imsaas.work/ws/${currentPair.coinSymbol.toUpperCase()}_${currentPair.baseSymbol.toUpperCase()}_${currentPair.groupStatus}@depth`);
        depthWsRef.current = websocket;
        
        websocket.connect((message: string) => {
            try {
                const data = JSON.parse(message);
                console.log(data, 'wsDepthData');
                
                // 更新深度数据而不是直接覆盖
                setDepthData((prevData:any) => {
                    // 如果还没有初始数据，则不处理WebSocket更新
                    if (!prevData || !prevData.bids) return prevData;
                    
                    // 创建当前数据的副本
                    const newData = {
                        asks: [...(prevData.asks || [])],
                        bids: [...(prevData.bids || [])],
                        lastUpdateId: data.end_update_id || prevData.lastUpdateId
                    };
                    
                    // 处理买单(bids)更新
                    if (data.bids && data.bids.length > 0) {
                        data.bids.forEach((newBid:any) => {
                            const [price, quantity] = newBid;
                            
                            // 查找是否存在此价格档位
                            const existingIndex = newData.bids.findIndex(bid => bid[0] === price);
                            
                            if (quantity === 0) {
                                // 如果数量为0，删除该价格档位
                                if (existingIndex > -1) {
                                    newData.bids.splice(existingIndex, 1);
                                }
                            } else {
                                // 更新或添加价格档位
                                if (existingIndex > -1) {
                                    newData.bids[existingIndex] = newBid;
                                } else {
                                    // 按价格降序插入新买单
                                    let insertIndex = 0;
                                    while (insertIndex < newData.bids.length && 
                                           newData.bids[insertIndex][0] > price) {
                                        insertIndex++;
                                    }
                                    newData.bids.splice(insertIndex, 0, newBid);
                                }
                            }
                        });
                    }
                    
                    // 处理卖单(asks)更新
                    if (data.asks && data.asks.length > 0) {
                        data.asks.forEach((newAsk:any) => {
                            const [price, quantity] = newAsk;
                            
                            // 查找是否存在此价格档位
                            const existingIndex = newData.asks.findIndex(ask => ask[0] === price);
                            
                            if (quantity === 0) {
                                // 如果数量为0，删除该价格档位
                                if (existingIndex > -1) {
                                    newData.asks.splice(existingIndex, 1);
                                }
                            } else {
                                // 更新或添加价格档位
                                if (existingIndex > -1) {
                                    newData.asks[existingIndex] = newAsk;
                                } else {
                                    // 按价格升序插入新卖单
                                    let insertIndex = 0;
                                    while (insertIndex < newData.asks.length && 
                                           newData.asks[insertIndex][0] < price) {
                                        insertIndex++;
                                    }
                                    newData.asks.splice(insertIndex, 0, newAsk);
                                }
                            }
                        });
                    }
                    
                    // 可选：限制深度档位数量
                    const MAX_DEPTH_LEVELS = 200;
                    if (newData.bids.length > MAX_DEPTH_LEVELS) {
                        newData.bids = newData.bids.slice(0, MAX_DEPTH_LEVELS);
                    }
                    if (newData.asks && newData.asks.length > MAX_DEPTH_LEVELS) {
                        newData.asks = newData.asks.slice(0, MAX_DEPTH_LEVELS);
                    }
                    
                    return newData;
                });
            } catch (error) {
                console.error('解析WebSocket深度数据失败:', error);
            }
        });
    }

    const getHistoryDepthData = async () => {
        try {
            const response = await fetch(`http://ws81.imsaas.work/depth/${currentPair.coinSymbol}_${currentPair.baseSymbol}_${currentPair.groupStatus}`);
            const data = await response.json();
            console.log(data, 'getHistoryDepthData');
            
            // 格式化初始深度数据
            const formattedData = {
                bids: data.bids || [],
                asks: data.asks || [],  // 确保asks字段存在，即使API返回中没有
                lastUpdateId: data.spot_log_last_seq
            };
            
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

    const getKlineData = () => {
        // 先关闭已有连接
        if (klineWsRef.current) {
            klineWsRef.current.close();
            klineWsRef.current = null;
        }
        
        const websocket = new WebSocketService(`ws://ws80.imsaas.work/ws/${currentPair.coinSymbol}_${currentPair.baseSymbol}_${currentPair.groupStatus}@kline_${timeInterval.toLowerCase()}`);
        klineWsRef.current = websocket;
        
        websocket.connect((message: string) => {
            // console.log(message,'message');
            const data = JSON.parse(message);
            if(data.type === 'kline' && Array.isArray(data.data)) {
                setCoinData(data);
                setKlineData((prevData:any) => {
                    if (!prevData) return data;
                    
                    // 合并新数据和旧数据
                    return {
                        ...data,
                        data: [...(data.data || []), ...(prevData.data || [])]
                    };
                });
            }
        });
    }

    useEffect(() => {
        // 设置客户端渲染标记
        setIsClient(true);
        
        // 只获取不依赖currentPair的数据
        getCoinList();
        
        // 组件卸载时清理所有WebSocket连接
        return () => {
            if (websocketRef.current) websocketRef.current.close();
            if (depthWsRef.current) depthWsRef.current.close();
            if (klineWsRef.current) klineWsRef.current.close();
        };
    }, []);

    useEffect(() => {
        // 只在客户端且currentPair有值时执行
        if (!isClient || !currentPair) return;
        
        // 现在可以安全地使用currentPair
        getOrderWsData();
        getHistoryDepthData();
        getKlineData();
    }, [isClient, currentPair]);

    useEffect(() => {
        // 只在客户端执行
        if (!isClient) return;

        appStore.loadCurrencyPairs()
            .then(() =>{
                const currentPairList = appStore.getCurrentPair() || appStore.currencyPairs[0];
                setCurrentPair(currentPairList);
            })
            .catch((error) => {
                console.error('加载货币对数据失败:', error);
            });
    }, [isClient]);

    const toggleFullscreen = () => {
        const chartContainer = document.getElementById('chart-container');
        if (chartContainer) {
            if (!isFullscreen) {
                if (chartContainer.requestFullscreen) {
                    chartContainer.requestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
            setIsFullscreen(!isFullscreen);
        }
    };

    const chartTypeItems: MenuProps['items'] = [
        {
            key: 1,
            label: 'K线图',


        },
        {
            key: 8,
            label: '美国线',

        },
        {
            key: 13,
            label: '面积图',
        },
    ];

    const handleChartTypeChange = (e: { key: string }) => {
        setChartDisplayType(Number(e.key));
    };

    return (<div className={`${styles.page_box} w-full`}>
        {/* 使用客户端渲染标记来控制渲染 */}
        {!isClient ? (
            // 服务器端渲染占位符
            <div className="w-full h-screen flex items-center justify-center">
                <Spin size="large" tip="加载中..." />
            </div>
        ) : (
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
                <div className={`${styles.card_bgc4} w-full`}>
                <SpotHeaderPage coinData={coinData}  />
                </div>


                <div className='flex flex-wrap'>
                    <div className={`${styles.card_bgc3} ${styles.spot_chartBox} w-full mb-1 mr-1 flex`} >
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
                                        <Tooltip title="技术指标">
                                            <Image src="/images/exchange/icon_chart.png" alt="exchange" width={20} height={20} />
                                        </Tooltip>
                                        <Tooltip title="图表重置">
                                            <Image src="/images/exchange/icon_delete.png" alt="exchange" width={20} height={20} />
                                        </Tooltip>
                                        <Tooltip title="图表截图">
                                            <Image src="/images/exchange/icon_camera.png" alt="exchange" width={20} height={20} />
                                        </Tooltip>
                                        <Tooltip title="成交量分布">
                                            <Image src="/images/exchange/icon_value.png" alt="exchange" width={20} height={20} />
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
                                    
                                    <Tooltip title="全屏">
                                        <Button type="text" icon={<FullscreenOutlined />} onClick={toggleFullscreen} />
                                    </Tooltip>
                                </div>
                            </div>

                            <Spin spinning={loading} tip="加载中...">
                                {(activeChartType === 'basic' || activeChartType === 'tradingview') && currentPair && (
                                    <Tradingview symbol={currentPair.coinSymbol.toUpperCase() + '_' + currentPair.baseSymbol.toUpperCase() + '_' + currentPair.groupStatus} showLeftToolbar={activeChartType === 'basic' ? false : true} chartType={chartDisplayType} klineData={klineData} timeInterval={timeInterval} />
                                )}
                               
                                {activeChartType === 'depth' && <DepthChart data={depthData} />}
                            </Spin>
                        </div>
                        <OrderBook bookData={depthData}  orderData={orderData}/>

                        {/* </div> */}
                    </div>
                    <div className={`${styles.card_bgc} mb-1 flex-1`} >
                        <SpotChartTrade />
                    </div>
                    <div className={`${styles.card_bgc1} mr-1 ${styles.table_card}`} style={{ minHeight: '57.5vh'}}>
                        <SpotChartTables />
                    </div>
                    <div className={`${styles.card_bgc1} ${styles.assets_card} flex-1 flex-y align-center`} >
                        <SpotChartAssets />
                    </div>
                </div>
            </ConfigProvider>
        )}
    </div>
    );
};

export default ExchangePage