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
import { observer } from "mobx-react-lite";
import { addUserExchangeCoinType,canalUserExchangeCoinType } from '@/services/spot';
import SimpleScrollTabs from '@/components/ScrollableTabs';

interface SpotSelectProps {
    currencyPairs: any[];
    onPairSelect?: (pair: any) => void;
    searchValue: string;
}

const SpotSelect: React.FC<SpotSelectProps> = ({ currencyPairs, onPairSelect, searchValue }) => {
    const { t } = useTranslation(['spot']);
    const [activeTab, setActiveTab] = useState('all'); // 当前选中的tab
    const [sortField, setSortField] = useState<string>('');
    const [showVolume, setShowVolume] = useState<boolean>(false); // 控制显示24h涨跌或成交量
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    
    // 标签页配置
    const tabsItem: TabsProps['items'] = [
        { key: '1', label: '主流区' },
        { key: '2', label: '创新区' },
        { key: '3', label: '新币区' },
        { key: '4', label: 'AI' },
        { key: '5', label: 'Meme' },
        { key: '6', label: 'NFT' },
        { key: '7', label: 'DeFi' },
        { key: '8', label: 'Web3' },
        { key: '9', label: 'Payments' },
        { key: '10', label: 'Launchpad' },
        { key: '11', label: 'Layer2' },
        { key: '12', label: 'Solana' },
        { key: '13', label: 'RWA' },
        { key: '14', label: 'Launchpool' },
        { key: '15', label: '游戏元宇宙' },
        { key: '16', label: '存储' },
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
            console.log('排序字段:', field, '当前排序字段:', sortField, '当前排序方向:', sortDirection);
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
        
        console.log('开始排序，字段:', sortField, '方向:', sortDirection);
        
        return [...currencyPairs].sort((a, b) => {
            try {
                if (sortField === 'name') {
                    // 使用正确的属性进行排序，确保不为undefined
                    const nameA = String(a.coinSymbol || '');
                    const nameB = String(b.coinSymbol || '');
                    return sortDirection === 'asc' 
                        ? nameA.localeCompare(nameB, undefined, { numeric: true })
                        : nameB.localeCompare(nameA, undefined, { numeric: true });
                }
                if (sortField === 'price') {
                    // 最新价排序
                    const priceA = typeof a.yesterdayPrice === 'string' ? parseFloat(a.yesterdayPrice || '0') : (a.yesterdayPrice || 0);
                    const priceB = typeof b.yesterdayPrice === 'string' ? parseFloat(b.yesterdayPrice || '0') : (b.yesterdayPrice || 0);
                    return sortDirection === 'asc' 
                        ? priceA - priceB
                        : priceB - priceA;
                }
                if (sortField === 'change') {
                    // 24h涨跌排序
                    const changeA = typeof a.priceChangePercent === 'string' ? parseFloat(a.priceChangePercent || '0') : (a.priceChangePercent || 0);
                    const changeB = typeof b.priceChangePercent === 'string' ? parseFloat(b.priceChangePercent || '0') : (b.priceChangePercent || 0);
                    return sortDirection === 'asc'
                        ? changeA - changeB
                        : changeB - changeA;
                }
            } catch (error) {
                console.error('排序过程中出错:', error, '数据:', a, b);
            }
            return 0;
        });
    };
    
    // 确保在排序状态变化时重新计算排序结果
    const sortedPairList = React.useMemo(() => getSortedPairs(), [currencyPairs, sortField, sortDirection]);

    // 基于搜索和标签过滤排序后的结果
    const filteredPairs = React.useMemo(() => 
        sortedPairList.filter(pair => {
            // 搜索过滤
            const matchesSearch = pair.coinSymbol.toLowerCase().includes(searchValue.toLowerCase()) || 
                                 pair.baseSymbol.toLowerCase().includes(searchValue.toLowerCase());
            
            // 标签过滤
            const matchesTab = activeTab === 'all' ? true : pair.classLabel === activeTab;
            
            return matchesSearch && matchesTab;
        }), [sortedPairList, searchValue, activeTab]);




        
            const handleFavoriteChange = async (value: number, pair: any) => {
              const isFavorite = value === 1;
              const apiCall = isFavorite 
                ? addUserExchangeCoinType({ exchangeCoinId: pair.id, type: 1 })
                : canalUserExchangeCoinType({ exchangeCoinId: pair.id, type: 1 });
                
              const res = await apiCall;
              if (res.code === '0') {
                // 本地更新以提高性能 - 只使用一种更新方式避免冲突
                const updatedPairs = [...appStore.currencyPairs];
                const pairIndex = updatedPairs.findIndex(item => item.id === pair.id);
                if (pairIndex !== -1) {
                  updatedPairs[pairIndex] = {
                    ...updatedPairs[pairIndex],
                    isFavorite: isFavorite
                  };
                  appStore.setCurrencyPairs(updatedPairs);
                }
                
                // 如果当前选中的是被修改的币对，也要更新currentPair
                if (appStore.currentPair && appStore.currentPair.id === pair.id) {
                  const updatedCurrentPair = {...appStore.currentPair};
                  updatedCurrentPair.isFavorite = isFavorite;
                  appStore.setCurrentPair(updatedCurrentPair);
                }
              }
            };
            const handleTabClick = (key: string) => {
                setActiveTab(key);
            };

            const showChange = (e: React.MouseEvent)=>{
                e.stopPropagation(); // 阻止事件冒泡
                setShowVolume(!showVolume); // 切换显示状态
            }
           
        
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
                    Rate:{
                        starBg:"#A4A5AC",
                    }
                },
            }}
        >
      
            <div className={styles.container}>
                {/* 标签页导航 */}

                <SimpleScrollTabs
             items={tabsItem} 
             onChange={handleTabClick} 
             defaultActiveKey={activeTab}
             showAllTab={true}
             allTabLabel="全部"
            />
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
                    <div 
                        className={`${styles.tip_color} font-12 flex-1 flex-x align-center pointer`}
                        onClick={() => handleSort('price')}
                    >
                        <span>最新价</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify 
                                icon="fluent-mdl2:flick-down" 
                                className={`pointer ${sortField === 'price' && sortDirection === 'asc' ? styles.active_sort : ''}`} 
                                size={10} 
                                style={{marginBottom: 2}}
                            />
                            <Iconify 
                                icon="fluent-mdl2:flick-up" 
                                className={`pointer ${sortField === 'price' && sortDirection === 'desc' ? styles.active_sort : ''}`} 
                                size={10} 
                            />
                        </div>
                    </div>
                    <div 
                        className={`${styles.tip_color} font-12 flex-1 flex-x align-center pointer`}
                        onClick={() => handleSort('change')}
                    >
                        <span>{showVolume ? '24H成交量' : '24H涨跌'}</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify 
                                icon="fluent-mdl2:flick-down" 
                                className={`pointer ${sortField === 'change' && sortDirection === 'asc' ? styles.active_sort : ''}`} 
                                size={10} 
                                style={{marginBottom: 2}}
                            />
                            <Iconify 
                                icon="fluent-mdl2:flick-up" 
                                className={`pointer ${sortField === 'change' && sortDirection === 'desc' ? styles.active_sort : ''}`} 
                                size={10} 
                            />
                        </div>
                        <div className='ml-1 flex-y-cc' onClick={(e) => showChange(e)}>
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
                             <span 
                                className={styles.favorite}
                                onClick={(e: React.MouseEvent) => {
                                    // Stop event propagation to prevent parent click
                                    e.stopPropagation();
                                }}
                             >
                                 <Rate
                                    onChange={(value) => handleFavoriteChange(value, pair)}
                                    value={pair.isFavorite ? 1 : 0}
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
                             className={`${styles.pair_change} ${!showVolume && pair.priceChangePercent > 0 ? styles.success_icon : !showVolume && pair.priceChangePercent < 0 ? styles.error_icon : ''} flex-1`}
                         >
                             {showVolume ? pair.quantity : `${pair.priceChangePercent}%`}
                         </div>
                     </div>
                    ))}
                    {/* {renderPairList()} */}
                </div>
            </div>
        </ConfigProvider>
    );
};

export default observer(SpotSelect);