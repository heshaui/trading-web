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
    const [depthChartData, setDepthChartData] = useState<any>([]);
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
    const [timeInterval, setTimeInterval] = useState('15m');
    const [fullscreen, setFullscreen] = useState(false);
    const getHistoryKLineData = async () => {
        setLoading(true);
        const symbols = 'BTC_USDT_1m';
        const response = await fetch(`http://ws81.imsaas.work/kline/history/${symbols}`);
        const data = await response.json();
        console.log("getHistoryKLineData", data);
        // setKlineData(data);
        console.log("getHistoryKLineData", data);

        // /kline/history/
    }
    const [open, setOpen] = useState<boolean>(true);

    const getKlineData = () => {
        getHistoryKLineData();
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
                // console.log("WebSocket收到的原始数据:", data);

                setKlineData(prevData => {
                    const newData = Array.isArray(data) ? [...prevData, ...data] : [...prevData, data];
                    // console.log("更新后的klineData将是:", newData);
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

    const getDepthData = () => {

        const websocket = new WebSocketService('ws://ws80.imsaas.work/ws/BTC_USDT_1@depth');

        websocket.connect((message: string) => {
            console.log("getDepthData接收message", message);
            try {
                // 检查是否为订阅确认消息
                if (message.startsWith('Subscribed to')) {
                    setStatusMessage(message);
                    return;
                }

                // 处理JSON数据
                const data = JSON.parse(message);
                console.log("getDepthData收到的原始数据:", data);

                setDepthChartData((prevData: any[]) => {
                    const newData = Array.isArray(data) ? [...prevData, ...data] : [...prevData, data];
                    console.log("更新后的getDepthData:", newData);
                    return newData;
                });
            } catch (error) {
                // 处理非JSON格式消息
                setStatusMessage(message);
                console.error('解析 WebSocket 消息时出错:', error);
            }
        });

    }

    useEffect(() => {
        getKlineData();
        getDepthData();


    }, [])

    const toggleFullscreen = () => {
        setFullscreen(!fullscreen);
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
                <SpotHeaderPage />
            </div>


            <div className='flex flex-wrap'>
                <div className={`${styles.card_bgc3} w-full mb-1 mr-1 flex`} style={{ width: '75%' }}>
                    <div style={{ width: '70%', height: '548px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 16px',
                            borderBottom: '1px solid var(--border-color1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                    type={timeInterval === '15m' ? 'primary' : 'text'}
                                    onClick={() => setTimeInterval('15m')}
                                    style={{
                                        background: timeInterval === '15m' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                        color: timeInterval === '15m' ? 'var(--text-color5)' : 'var(--text-color6)'
                                    }}
                                >
                                    15m
                                </Button>
                                <Button
                                    type={timeInterval === '1h' ? 'primary' : 'text'}
                                    onClick={() => setTimeInterval('1h')}
                                    style={{
                                        background: timeInterval === '1h' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                        color: timeInterval === '1h' ? 'var(--text-color5)' : 'var(--text-color6)'
                                    }}
                                >
                                    1h
                                </Button>
                                <Button
                                    type={timeInterval === '4h' ? 'primary' : 'text'}
                                    onClick={() => setTimeInterval('4h')}
                                    style={{
                                        background: timeInterval === '4h' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                        color: timeInterval === '4h' ? 'var(--text-color5)' : 'var(--text-color6)'
                                    }}
                                >
                                    4h
                                </Button>
                                <Button
                                    type={timeInterval === '1D' ? 'primary' : 'text'}
                                    onClick={() => setTimeInterval('1D')}
                                    style={{
                                        background: timeInterval === '1D' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                        color: timeInterval === '1D' ? 'var(--text-color5)' : 'var(--text-color6)'
                                    }}
                                >
                                    1D
                                </Button>
                                <div className={`${styles.card_bgc3} w-full mb-1 mr-1 flex`} style={{ width: '75%' }}>
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
                                                <Button
                                                    type={timeInterval === '15m' ? 'primary' : 'text'}
                                                    onClick={() => setTimeInterval('15m')}
                                                    style={{
                                                        background: timeInterval === '15m' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                                        color: timeInterval === '15m' ? 'var(--text-color5)' : 'var(--text-color6)'
                                                    }}
                                                >
                                                    15m
                                                </Button>
                                                <Button
                                                    type={timeInterval === '1h' ? 'primary' : 'text'}
                                                    onClick={() => setTimeInterval('1h')}
                                                    style={{
                                                        background: timeInterval === '1h' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                                        color: timeInterval === '1h' ? 'var(--text-color5)' : 'var(--text-color6)'
                                                    }}
                                                >
                                                    1h
                                                </Button>
                                                <Button
                                                    type={timeInterval === '4h' ? 'primary' : 'text'}
                                                    onClick={() => setTimeInterval('4h')}
                                                    style={{
                                                        background: timeInterval === '4h' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                                        color: timeInterval === '4h' ? 'var(--text-color5)' : 'var(--text-color6)'
                                                    }}
                                                >
                                                    4h
                                                </Button>
                                                <Button
                                                    type={timeInterval === '1D' ? 'primary' : 'text'}
                                                    onClick={() => setTimeInterval('1D')}
                                                    style={{
                                                        background: timeInterval === '1D' ? 'rgba(0,0,0,0.05)' : 'transparent',
                                                        color: timeInterval === '1D' ? 'var(--text-color5)' : 'var(--text-color6)'
                                                    }}
                                                >
                                                    1D
                                                </Button>

                                                <Space size="small" style={{ marginLeft: '16px' }}>
                                                    {/* <Tooltip title="指标">
                                        <Button type="text" icon={<Iconify icon="mdi:chart-line" />} />
                                    </Tooltip>
                                    <Tooltip title="画线工具">
                                        <Button type="text" icon={<Iconify icon="mdi:pencil-ruler" />} />
                                    </Tooltip>
                                    <Tooltip title="模板">
                                        <Button type="text" icon={<Iconify icon="mdi:template" />} />
                                    </Tooltip>
                                    <Tooltip title="撤销">
                                        <Button type="text" icon={<Iconify icon="mdi:undo" />} />
                                    </Tooltip>
                                    <Tooltip title="重做">
                                        <Button type="text" icon={<Iconify icon="mdi:redo" />} />
                                    </Tooltip>
                                    <Tooltip title="设置">
                                        <Button type="text" icon={<Iconify icon="mdi:cog" />} />
                                    </Tooltip>
                                    <Tooltip title="截图">
                                        <Button type="text" icon={<Iconify icon="mdi:camera" />} />
                                    </Tooltip>
                                    <Tooltip title="刷新">
                                        <Button type="text" icon={<Iconify icon="mdi:refresh" />} />
                                    </Tooltip> */}
                                                </Space>
                                            </div>
                                            <Space size="small" style={{ marginLeft: '16px' }}>
                                                <Tooltip title="指标">
                                                    <Button type="text" icon={<Iconify icon="mdi:chart-line" />} />
                                                </Tooltip>
                                                <Tooltip title="画线工具">
                                                    <Button type="text" icon={<Iconify icon="mdi:pencil-ruler" />} />
                                                </Tooltip>
                                                <Tooltip title="模板">
                                                    <Button type="text" icon={<Iconify icon="mdi:template" />} />
                                                </Tooltip>
                                                <Tooltip title="撤销">
                                                    <Button type="text" icon={<Iconify icon="mdi:undo" />} />
                                                </Tooltip>
                                                <Tooltip title="重做">
                                                    <Button type="text" icon={<Iconify icon="mdi:redo" />} />
                                                </Tooltip>
                                                <Tooltip title="设置">
                                                    <Button type="text" icon={<Iconify icon="mdi:cog" />} />
                                                </Tooltip>
                                                <Tooltip title="截图">
                                                    <Button type="text" icon={<Iconify icon="mdi:camera" />} />
                                                </Tooltip>
                                                <Tooltip title="刷新">
                                                    <Button type="text" icon={<Iconify icon="mdi:refresh" />} />
                                                </Tooltip>
                                            </Space>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Button
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
                                            </Button>
                                            <Tooltip title="全屏">
                                                <Button type="text" icon={<FullscreenOutlined />} onClick={toggleFullscreen} />
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Button
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
                                        </Button>
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
                            <Spin spinning={loading} tip="加载中...">
                                {activeChartType === 'basic' && <KlineChart socketData={klineData} width={100} />}
                                {activeChartType === 'tradingview' && <Tradingview data={klineData} />}
                                {activeChartType === 'depth' && <DepthChart data={klineData} />}
                            </Spin>
                        </div>
                        <OrderBook data={klineData} />

                    </div>

                </div>
                <div className={`${styles.card_bgc} mb-1 flex-1`} >
                    <SpotChartTrade />
                </div>
                <div className={`${styles.card_bgc1} mr-1 ${styles.table_card}`} style={{ minHeight: '57.5vh', width: '75%' }}>
                    <SpotChartTables />
                </div>
                <div className={`${styles.card_bgc1} flex-1 `} >
                    <SpotChartAssets />
                </div>
            </div>
        </ConfigProvider>
    </div>
    );
};

export default ExchangePage