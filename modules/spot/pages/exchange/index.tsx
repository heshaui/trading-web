import React from 'react';
import { withSpotLayout } from '@/components/sidebarLayout/SpotLayout/userSpotLayout';
import styles from '../../styles/billDetails.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs, Spin, Button, Space, Tooltip } from 'antd';
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
import KlineChart from '@/components/KlineChart'
import Tradingview from '@/components/Tradingview'
import DepthChart from '@/components/DepthChart'
import OrderBook from '@/components/OrderBook'
import WebSocketService from '@/utils/websocket';
import { FullscreenOutlined } from '@ant-design/icons';

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
const ExchangePage = () => {
    const { t } = useTranslation(['spot']);
    const [form] = Form.useForm();
    const [klineData, setKlineData] = useState<any[]>([]);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [activeChartType, setActiveChartType] = useState<string>('basic');
    const [loading, setLoading] = useState<boolean>(true);
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
    const [timeInterval, setTimeInterval] = useState<string>('1h');
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    
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

    useEffect(() => {
        getKlineData();


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
            <div className={`${styles.card_bgc} w-full mb-1  flex-x align-center`}>
                <Select options={[]} />
                <ul className={`${styles.tip_color} ${styles.header_content_msg} font-14 font-w-400 flex-x align-center  ml-5 flex-1`}>
                    <li className='mr-9'>
                        <p className={`${styles.error_icon} font-16`}>27056.20</p>
                        <p>¥183,982.10</p>
                    </li>
                    <li className='mr-9'>
                        <p >24H  涨跌</p>
                        <p className={`${styles.success_icon} font-14`}>+7,156.36 +7.46%</p>
                    </li>
                    <li className='mr-9'>
                        <p >24H 最高价</p>
                        <p className={`${styles.title_color}`}>27,659.60</p>
                    </li>
                    <li className='mr-9'>
                        <p >24H 最低价</p>
                        <p className={`${styles.title_color}`} >26,857.90</p>
                    </li>
                    <li className='mr-9'>
                        <p >24H 成交量(BTC)</p>
                        <p className={`${styles.title_color}`} >3,667.17</p>
                    </li>
                    <li className='mr-9'>
                        <p >24H 交易额(USDT)</p>
                        <p  className={`${styles.title_color}`}>1.00亿</p>
                    </li>
                </ul>
                <div className='flex-cc'>
                    <Iconify icon="mingcute:settings-5-line" size={26} className={`${styles.tip_color}`} />
                </div>
            </div>
            <div className={`flex ${styles.grid_layout} mb-1`}>
                <div className={`flex-1`}>

                    <div className={`${styles.card_bgc3} w-full mb-1`}  style={{display:'flex'}}>
                    <div id="chart-container" style={{width:'70%',height:'548px'}}>
                        <div style={{
                            display:'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '8px 16px',
                            borderBottom: '1px solid var(--border-color1)'
                        }}>
                            <div style={{display:'flex', alignItems:'center'}}>
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
                                
                                <Space size="small" style={{marginLeft: '16px'}}>
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
                            
                            <div style={{display:'flex', alignItems:'center'}}>
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
                            {activeChartType === 'tradingview' && <Tradingview data={klineData}  />}
                            {activeChartType === 'depth' && <DepthChart data={klineData} />}
                        </Spin>
                    </div>

                   

                   
                    <OrderBook data={klineData} />

                    </div>
                    <div className={`${styles.card_bgc1}  flex-1`}>
                        <SpotChartTables />
                    </div>
                </div>

                <div className={` ${styles.grid_item} `}>


                    <div className={`${styles.card_bgc} mb-1`} >

                        <SpotChartTrade />
                    </div>
                    <div className={`${styles.card_bgc1} flex-1 `} >
                        <SpotChartAssets />
                    </div>
                </div>
            </div> 
            <div className='flex flex-wrap'>
                <div className={`${styles.card_bgc3} w-full mb-1 mr-1`} style={{ minHeight: '57.5vh', width: '75%' }}>

                    图表
                </div>
                <div className={`${styles.card_bgc} mb-1 flex-1`} >

                    <SpotChartTrade />
                </div>
                <div className={`${styles.card_bgc1} mr-1`} style={{ minHeight: '57.5vh', width: '75%' }}>
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