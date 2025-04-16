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
    const [klineData, setKlineData] = useState<any[]>([]);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [activeChartType, setActiveChartType] = useState<string>('basic');
    const [loading, setLoading] = useState<boolean>(true);
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
    const [timeInterval, setTimeInterval] = useState<string>('15m');
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(true);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [dayData, setDayData] = useState<any[]>(['15m','1h','4h','1D']);
    const [chartType, setChartType] = useState<any[]>([{label:'基本版',value:'basic'},{label:'TradingView',value:'tradingview'},{label:'深度图',value:'depth'}]);
    const [historyLoading, setHistoryLoading] = useState<boolean>(false);

    const getKlineData = () => {
        setLoading(true);
        const websocket = new WebSocketService('ws://ws80.imsaas.work/ws/btc_usdt_1@kline_1m');

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
                console.log("WebSocket收到的原始数据:", data);

                setKlineData(prevData => {
                    const newData = Array.isArray(data) ? [...prevData, ...data] : [...prevData, data];
                     console.log("更新后的klineData将是:", newData);
                    return newData;
                });

                setLoading(false);
            } catch (error) {
                // 处理非JSON格式消息
                setStatusMessage(message);
                console.error('解析 WebSocket 消息时出错:', error);
                setLoading(false);
            }
        });
    }
    const getHistoryData = async () => {
        const response = await fetch(`http://ws81.imsaas.work/kline/BTC_USDT_1/1m/range?start_time=1744750140000&end_time=1744750200000&limit=50`);
            const data = await response.json();
            console.log("data", data);

            getKlineData();
    }
    useEffect(() => {
        getHistoryData();


    }, [])

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

    return (<div className={`${styles.page_box} w-full`}>
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
            {/* <SpotHeaderPage /> */}
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
                                
                                {/* <Button
                                    type={activeChartType === 'basic' ? 'primary' : 'text'}
                                    onClick={() => setActiveChartType('basic')}
                                    style={{
                                        background: activeChartType === 'basic' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                        color: activeChartType === 'basic' ? 'var(--text-color5)' : 'var(--text-color6)'
                                    }}
                                >
                                    基本版
                                </Button>
                                <Button
                                    type={activeChartType === 'tradingview' ? 'primary' : 'text'}
                                    onClick={() => setActiveChartType('tradingview')}
                                    style={{
                                        background: activeChartType === 'tradingview' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                        color: activeChartType === 'tradingview' ? 'var(--text-color5)' : 'var(--text-color6)'
                                    }}
                                >
                                    TradingView
                                </Button>
                                <Button
                                    type={activeChartType === 'depth' ? 'primary' : 'text'}
                                    onClick={() => setActiveChartType('depth')}
                                    style={{
                                        background: activeChartType === 'depth' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                        color: activeChartType === 'depth' ? 'var(--text-color5)' : 'var(--text-color6)'
                                    }}
                                >
                                    深度图
                                </Button> */}
                                <Tooltip title="全屏">
                                    <Button type="text" icon={<FullscreenOutlined />} onClick={toggleFullscreen} />
                                </Tooltip>
                            </div>
                        </div>

                        <Spin spinning={loading} tip="加载中...">
                            {activeChartType === 'basic' && <KlineChart socketData={klineData} width={100} />}
                            {activeChartType === 'tradingview' && <Tradingview data={klineData} />}
                            {activeChartType === 'depth' && <DepthChart data={klineData} />}
                        </Spin>
                    </div>
                    <OrderBook data={klineData} />

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
    </div>
    );
};

export default ExchangePage