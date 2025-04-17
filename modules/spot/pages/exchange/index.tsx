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
    const [timeInterval, setTimeInterval] = useState<string>('15m');
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
    const [depthData, setDepthData] = useState<any[]>([]);
    const [orderData, setOrderData] = useState<any[]>([]);

    const getCoinList = async () => {
        const response = await getExchangeCoinList();
        console.log(response,'response');
    }

    const getGroup = async () => {
        const response = await getExchangeGroup();

    }
    const getOrderWsData = () => {
        const websocket = new WebSocketService(`ws://ws80.imsaas.work/ws/BTC_USDT_1@trade`);
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
        const websocket = new WebSocketService(`ws://ws80.imsaas.work/ws/BTC_USDT_1@depth`);
        websocket.connect((message: string) => {

            try {
                const data = JSON.parse(message);
                
                // 更新深度数据而不是直接覆盖
                setDepthData((prevData) => {
                    // 假设深度数据有bids和asks属性
                    if (!prevData) return data;
                    
                    // 合并数据
                    return {
                        ...prevData,
                        bids: data.bids || (prevData as any).bids || [],
                        asks: data.asks || (prevData as any).asks || [],
                        // 可能还有其他需要更新的字段
                        lastUpdateId: data.lastUpdateId,
                        timestamp: data.timestamp
                    };
                });
            } catch (error) {

            }
        });
    }
 

    const getHistoryDepthData = async () => {

        const response = await fetch(`http://ws81.imsaas.work/depth/BTC_USDT_1`);
        
            const data = await response.json();

            setDepthData(data);
            
        
        getWsDepthData();

    }
    useEffect(() => {
        getGroup();
        getOrderWsData();
        getHistoryDepthData();
        getCoinList();

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
        setChartDisplayType(e.key);
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
            <div className={`${styles.card_bgc4} w-full mb-1`}>
            <SpotHeaderPage />
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
                                            selectedKeys: [chartDisplayType]
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
                            {(activeChartType === 'basic' || activeChartType === 'tradingview') && (
                                <Tradingview symbol="BTC_USDT_1" showLeftToolbar={activeChartType === 'basic' ? false : true} chartType={chartDisplayType}/>
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
    </div>
    );
};

export default ExchangePage