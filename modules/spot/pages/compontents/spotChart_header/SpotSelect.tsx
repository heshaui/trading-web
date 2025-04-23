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

interface SpotSelectProps {
    currencyPairs: any[];
    onPairSelect?: (pair: any) => void;
    searchValue: string;
}

const SpotSelect: React.FC<SpotSelectProps> = ({ currencyPairs, onPairSelect, searchValue }) => {
    const { t } = useTranslation(['spot']);
    const [activeTab, setActiveTab] = useState('all'); // 当前选中的tab
    const [sortField, setSortField] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    
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

   
    const handlePairClick = async (pair: any) => {
        console.log(pair);  
        await appStore.setCurrentPair(pair);
    };

    // 在用户点击货币对时调用
    const handleSelect = (pair: any) => {
        if (onPairSelect) {
            onPairSelect(pair);
        }
    };
        // 处理排序
        const handleSort = (field: string) => {
            if (sortField === field) {
                // 相同字段，切换排序方向
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                // 新字段，默认升序
                setSortField(field);
                setSortDirection('asc');
            }
        };
    

        // 获取排序后的数据
        const getSortedPairs = () => {
            if (!sortField) return currencyPairs;
        
            return [...currencyPairs].sort((a, b) => {
                if (sortField === 'name') {
                    // 使用正确的属性进行排序，确保不为undefined
                    const nameA = a.coinSymbol || '';
                    const nameB = b.coinSymbol || '';
                    return sortDirection === 'asc' 
                        ? nameA.localeCompare(nameB, undefined, { numeric: true })
                        : nameB.localeCompare(nameA, undefined, { numeric: true });
                }
                // 其他字段排序可以在这里添加
            return 0;
        });
    };
    const sortedPairList = getSortedPairs();

    const filteredPairs = sortedPairList.filter(pair => 
        pair.coinSymbol.toLowerCase().includes(searchValue.toLowerCase()) || 
        pair.baseSymbol.toLowerCase().includes(searchValue.toLowerCase())
      );
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
                        {/* <li className={`${styles.fixed_tab} pointer font-14`}>全部</li> */}
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
                                {/* <Tabs items={tabsItem} className={`spot-tabs`} /> */}
                            </ConfigProvider>
                        </li>
                        {/* <li>
        <Iconify icon="mingcute:right-line" size={16}/>
    </li> */}
                    </ul>
                </div>
                {/* 列表头部 */}
                <div className={`${styles.list_header} px-4 py-4 flex-x align-center`}>
                    <div 
                        className={`${styles.tip_color} font-12 flex-1 flex-x align-center pointer`}
                        onClick={() => handleSort('name')}
                    >
                        <span>名称</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify 
                                icon="fluent-mdl2:flick-down" 
                                className={`pointer ${sortField === 'name' && sortDirection === 'asc' ? styles.active_sort : ''}`} 
                                size={10} 
                                style={{marginBottom: 2}}
                            />
                            <Iconify 
                                icon="fluent-mdl2:flick-up" 
                                className={`pointer ${sortField === 'name' && sortDirection === 'desc' ? styles.active_sort : ''}`} 
                                size={10} 
                            />
                        </div>
                    </div>
                    <div className={`${styles.tip_color} font-12  flex-1 flex-x align-center`}>
                        <span>最新价</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify icon="fluent-mdl2:flick-down" className='pointer' size={10} style={{marginBottom: 2}}/>
                            <Iconify icon="fluent-mdl2:flick-up" className='pointer' size={10} />
                        </div>
                    </div>
                    <div className={`${styles.tip_color} font-12  flex-1 flex-x align-center`}>
                        <span>24h涨跌</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify icon="fluent-mdl2:flick-down" className='pointer' size={10} style={{marginBottom: 2}}/>
                            <Iconify icon="fluent-mdl2:flick-up" className='pointer' size={10} />
                        </div>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify icon="mingcute:transfer-line" size={18} />
                        </div>
                    </div>
                </div>

                {/* 交易对列表 */}
                <div className={`${styles.pair_list}`}>
                    {filteredPairs.map((pair:any, index:any) => (
                         <div key={index} className={`${styles.pair_item}  px-4 flex-x align-center`} onClick={() => handlePairClick(pair)} style={{cursor:'pointer'}}>
                         {/* 币种名称 */}
                         <div className={`${styles.pair_name} flex-1`}>
                             <span className={styles.favorite}>
                                 <Rate
                                    defaultValue={pair.isFavorite ? 1 : 0}
                                     count={1}
                                     style={{ fontSize: 14 }}
                                 />
                             </span>
                             <span className={styles.coin_icon}>{pair.icon}</span>
                             <span className={`font-14 ${styles.title_color}`}>{pair.coinSymbol}/{pair.baseSymbol}</span>
                         </div>
                         {/* 最新价 */}
                         <div className={`font-14 ${styles.title_color} flex-1`}>
                             {pair.yesterdayPrice}
                         </div>
                         {/* 24h涨跌/24h成交量 */}
                         <div
                             className={`${styles.pair_change} ${pair.priceChangePercent > 0 ? styles.success_icon : styles.error_icon} flex-1`}
                         >
                             {pair.priceChangePercent}
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