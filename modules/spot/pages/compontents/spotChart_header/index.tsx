import React from 'react';
import styles from '../styles/spotHeader.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs, Spin, Button, Space, Tooltip, Dropdown } from 'antd';
import { Iconify } from "@/components/icon"
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import type { DropdownProps, MenuProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import SelfSelect from './SelfSelect';
import SpotSelect from './SpotSelect';
import dayjs from 'dayjs';
import WebSocketService from '@/utils/websocket';
const SpotHeaderPage = ({coinData}:{coinData:any}) => {
    const { t } = useTranslation(['spot']);
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState('spot'); // 当前选中的tab
    const [searchValue, setSearchValue] = useState('');

   
    // 解析K线数据
    const klineData = coinData?.data?.[0] || [];
    const [timestamp, open_price, high_price, low_price, close_price, volume] = klineData;
    
    // 计算涨跌幅
    const priceChange = close_price - open_price;
    const priceChangePercent = (priceChange / open_price * 100).toFixed(2);
    const isPriceUp = priceChange >= 0;


    useEffect(() => {
        setMounted(true);
    }, []);

    const tabsItem: TabsProps['items'] = [
        {
            key: 'favorites',
            label: '自选',
            children: <div>自选</div>
        },
        {
            key: 'spot',
            label: '现货',
            children: <SpotSelect/>
        },
    ];

    const handleTabClick = (key: string) => {
        setActiveTab(key);
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
    };

    const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
        if (info.source === 'trigger' || nextOpen) {
            setOpen(nextOpen);
        }
    };



  
    useEffect(() => {

    }, []);

    // 只在客户端渲染 Dropdown
    const renderDropdown = () => {
        if (!mounted) return null;

        return (
            <Dropdown
                trigger={['click']}
                open={open}
                onOpenChange={handleOpenChange}
                dropdownRender={() => (
                    <div className={styles.dropdown_container}>
                        <div className={styles.search_container}>
                            <Input
                                placeholder="搜索"
                                prefix={<SearchOutlined />}
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                                className={styles.search_input}
                            />
                        </div>
                        <div className={`${styles.tabs_container} w-full`}>
                            <div className={`${styles.tabs_list} w-full`}>
                                <Tabs items={tabsItem}
                                    className="custom-tabs2 w-full"
                                // indicator={{ size: (origin) => origin - 35, align: 'center' }} 
                                />
                            </div>
                            {/* <div className={styles.content_container}>
                                <div className={styles.pair_list}>
                                    <div className={styles.pair_header}>
                                        <span>名称</span>
                                        <span>最新价</span>
                                        <span>24h涨跌</span>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                )}
            >
                <Space className={styles.dropdown_trigger}>
                    <span>BTC/USDT</span>
                    <Iconify icon="prime:sort-down-fill" size={16} className={styles.dropdown_icon} />
                </Space>
            </Dropdown>
        );
    };

    return (
        <div className={`flex-x align-center`}>
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            headerBg: "transparent",
                            headerColor: "var(--text-color6)",
                            headerSplitColor: "transparent",
                            rowExpandedBg: "var(--background10)",
                            borderColor: "transparent",
                            headerBorderRadius: 0,
                        },
                        Pagination: {
                            itemActiveBg: "transparent",
                            itemBg: "transparent",
                        },
                        Select: {
                            activeBorderColor: "var(--border-color4)",
                            optionActiveBg: "transparent",
                            selectorBg: "transparent",
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
                {renderDropdown()}
                <ul className={`${styles.tip_color} ${styles.header_content_msg} font-14 font-w-400 flex-x align-center  ml-5 flex-1`}>
                    <li className='mr-9'>
                        <p className={`${isPriceUp ? styles.success_icon : styles.error_icon} font-16`}>
                            {close_price ? close_price.toFixed(2) : '--'}
                        </p>
                        <p>¥{close_price ? (close_price * 7.2).toFixed(2) : '--'}</p>
                    </li>
                    <li className='mr-9'>
                        <p>24H 涨跌</p>
                        <p className={`${isPriceUp ? styles.success_icon : styles.error_icon} font-14`}>
                            {priceChange ? (isPriceUp ? '+' : '') + priceChange.toFixed(2) : '--'} {priceChangePercent ? (isPriceUp ? '+' : '') + priceChangePercent + '%' : '--'}
                        </p>
                    </li>
                    <li className='mr-9'>
                        <p>24H 最高价</p>
                        <p className={`${styles.title_color}`}>{high_price ? high_price.toFixed(2) : '--'}</p>
                    </li>
                    <li className='mr-9'>
                        <p>24H 最低价</p>
                        <p className={`${styles.title_color}`}>{low_price ? low_price.toFixed(2) : '--'}</p>
                    </li>
                    <li className='mr-9'>
                        <p>24H 成交量(BTC)</p>
                        <p className={`${styles.title_color}`}>{volume ? volume.toFixed(2) : '--'}</p>
                    </li>
                    <li className='mr-9'>
                        <p>24H 交易额(USDT)</p>
                        <p className={`${styles.title_color}`}>
                            {volume && close_price ? formatAmount(volume * close_price) : '--'}
                        </p>
                    </li>
                </ul>
                <div className='flex-cc'>
                    <Iconify icon="mingcute:settings-5-line" size={26} className={`${styles.tip_color}`} />
                </div>
            </ConfigProvider>
        </div>
    );
};

// 辅助函数：格式化大额数字
const formatAmount = (amount) => {
    if (amount >= 100000000) {
        return (amount / 100000000).toFixed(2) + '亿';
    } else if (amount >= 10000) {
        return (amount / 10000).toFixed(2) + '万';
    } else {
        return amount.toFixed(2);
    }
};

export default SpotHeaderPage;