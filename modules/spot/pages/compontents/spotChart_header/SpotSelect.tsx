'use client'
import React from 'react';
import styles from '../styles/spotHeader_select.module.css'
import { Input, Radio, ConfigProvider, Rate, Table, Select, Form, Tabs, Spin, Button, Space, Tooltip, Dropdown } from 'antd';
import { Iconify } from "@/components/icon"
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import type { DropdownProps, MenuProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import appStore from '@/store';
const SpotSelect = ({currencyPairs}:{currencyPairs:any[]}) => {
    const { t } = useTranslation(['spot']);
    const [activeTab, setActiveTab] = useState('all'); // 当前选中的tab
    const [searchValue, setSearchValue] = useState('');

    
    // 标签页配置
    const tabsItem: TabsProps['items'] = [
        // { key: 'all', label: '全部' },
        { key: 'defi', label: 'Defi' },
        { key: 'main', label: '主流币' },
        { key: 'new', label: '新币种' },
        { key: 'ai', label: '人工智能' },
    ];

    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const handlePairClick = async (pair: any) => {
        console.log(pair);  
        await appStore.setCurrentPair(pair);
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Tabs: {
                        itemActiveColor: "var(--tip-color)",
                        itemSelectedColor: "var(--text-color5)",
                        horizontalMargin: "0 0 0 0",
                        itemColor: "var(--text-color6)",
                        inkBarColor: "var(--text-color5)",
                    },
                },
            }}
        >
            <div className={styles.container}>
                {/* 标签页导航 */}
                <div className={`${styles.tabs_wrapper} px-4 `}>
                    <ul className={`flex-x align-center `}>
                        <li className={`${styles.fixed_tab} pointer font-14`}>全部</li>
                        {/* <li>
        <Iconify icon="mingcute:left-line" size={16}/>
    </li> */}
                        <li>
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Tabs: {
                                            itemActiveColor: "var(--theme-color)",
                                            itemSelectedColor: "var(--theme-color)",
                                            horizontalMargin: "0 0 0 0",
                                            itemColor: "var(--text-color6)",
                                            inkBarColor: "transparent",
                                        },
                                    },
                                }}
                            >
                                <Tabs items={tabsItem} className={`spot-tabs`} />
                            </ConfigProvider>
                        </li>
                        {/* <li>
        <Iconify icon="mingcute:right-line" size={16}/>
    </li> */}
                    </ul>
                </div>
                {/* 列表头部 */}
                <div className={`${styles.list_header} px-4 pb-4 flex-x align-center`}>
                    <div className={`${styles.tip_color} font-12  flex-1 flex-x align-center`}>
                        <span>名称</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify icon="fluent-mdl2:flick-down" className='pointer' size={10} style={{ marginBottom: 2 }} />
                            <Iconify icon="fluent-mdl2:flick-up" className='pointer' size={10} />
                        </div>

                    </div>
                    <div className={`${styles.tip_color} font-12  flex-1 flex-x align-center`}>
                        <span>最新价</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify icon="fluent-mdl2:flick-down" className='pointer' size={10} style={{ marginBottom: 2 }} />
                            <Iconify icon="fluent-mdl2:flick-up" className='pointer' size={10} />
                        </div>

                    </div>
                    <div className={`${styles.tip_color} font-12  flex-1 flex-x align-center`}>
                        <span>24h涨跌</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify icon="fluent-mdl2:flick-down" className='pointer' size={10} style={{ marginBottom: 2 }} />
                            <Iconify icon="fluent-mdl2:flick-up" className='pointer' size={10} />
                        </div>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify icon="mingcute:transfer-line" size={18} />
                        </div>

                    </div>
                </div>

                {/* 交易对列表 */}
                <div className={`${styles.pair_list}`}>
                    {currencyPairs.map((pair:any, index:any) => (
                        <div key={index} className={`${styles.base}  px-4 flex-x align-center`} style={{cursor: 'pointer'}} onClick={() => handlePairClick(pair)}>
                            {/* 币种名称 */}
                            <div className={`${styles.pair_name} flex-1`}>
                                <span className={styles.favorite}>
                                    <Rate
                                        // defaultValue={pair.isFavorite ? 1 : 0}
                                        count={1}
                                        style={{ fontSize: 14 }}
                                    />
                                </span>
                                <span className={styles.coin_icon}>{pair.icon}</span>
                                <span className={`font-14 ${styles.title_color}`}>{pair.coinSymbol}/{pair.baseSymbol}</span>
                            </div>
                            {/* 最新价 */}
                            <div className={`font-14 ${styles.title_color} flex-1`}>
                                {/* {pair.price} */}
                            </div>
                            {/* 24h涨跌/24h成交量 */}
                            <div
                                className={`${styles.pair_change} ${pair.isUp ? styles.success_icon : styles.error_icon} flex-1`}
                            >
                                {/* {pair.change} */}
                            </div>
                        </div>
                    ))}
                    {/* {renderPairList()} */}
                </div>
            </div>
        </ConfigProvider>
    );
};

export default SpotSelect;