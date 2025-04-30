'use client'
import React from 'react';
import styles from '../styles/spotHeader_select.module.css'
import { Input, Radio, ConfigProvider, Rate, Table, Select, Form, Spin, Button, Space, Tooltip, Dropdown } from 'antd';
import { Iconify } from "@/components/icon"
import { useState, useEffect } from "react";
import { useTranslation } from 'next-i18next';
import type { DropdownProps, MenuProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import SimpleScrollTabs from '@/components/ScrollableTabs';
import { addUserExchangeCoinType,canalUserExchangeCoinType } from '@/services/spot';
import appStore from '@/store';
import { observer } from "mobx-react-lite";
interface SelfSelectProps {
    currencyPairs: any[];
    onPairSelect?: (pair: any) => void;
    searchValue: string;
}
const SelfSelect: React.FC<SelfSelectProps> = ({ currencyPairs, onPairSelect, searchValue }) => {
    const { t } = useTranslation(['spot']);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [sortField, setSortField] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showVolume, setShowVolume] = useState<boolean>(false);

 

    // 标签页配置
    const tabsItem: TabsProps['items'] = [
        // 主流区、创新区、新币区、AI、Meme、NFT、DeFi、NFT、Web3、Payments、Launchpad、Layer2、Solana、RWA、Launchpool、游戏元宇宙、存储
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

    // 处理展开/折叠行
    const handleExpand = (expanded: boolean, record: any) => {
        setExpandedRowKeys(expanded ? [record.id] : []);
    };

    // 子表格列配置
    const expandedColumns = [
        {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: '数量',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: '成交额',
            dataIndex: 'total',
            key: 'total',
        }
    ];

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
            if (sortField === 'price') {
                // 最新价排序
                const priceA = parseFloat(a.yesterdayPrice) || 0;
                const priceB = parseFloat(b.yesterdayPrice) || 0;
                return sortDirection === 'asc' 
                    ? priceA - priceB
                    : priceB - priceA;
            }
            if (sortField === 'change') {
                if (showVolume) {
                    // 成交量排序
                    const volumeA = parseFloat(a.volume) || 0;
                    const volumeB = parseFloat(b.volume) || 0;
                    return sortDirection === 'asc'
                        ? volumeA - volumeB
                        : volumeB - volumeA;
                } else {
                    // 24h涨跌排序
                    const changeA = parseFloat(a.priceChangePercent) || 0;
                    const changeB = parseFloat(b.priceChangePercent) || 0;
                    return sortDirection === 'asc'
                        ? changeA - changeB
                        : changeB - changeA;
                }
            }
            return 0;
        });
    };

    const sortedPairList = getSortedPairs();

    const filteredPairs = sortedPairList.filter(pair => {
        // 必须是收藏的
        const isFavorite = pair.isFavorite;
        
        // 搜索过滤
        const matchesSearch = pair.coinSymbol.toLowerCase().includes(searchValue.toLowerCase()) || 
                            pair.baseSymbol.toLowerCase().includes(searchValue.toLowerCase());
        
        // 标签过滤
        const matchesTab = activeTab === 'all' ? true : pair.classLabel === activeTab;
        
        return isFavorite && matchesSearch && matchesTab;
    });

    const handlePairClick = async (pair: any) => {
        console.log(pair);  
        await appStore.setCurrentPair(pair);
    };

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
            <SimpleScrollTabs 
                items={tabsItem} 
                onChange={handleTabClick} 
                defaultActiveKey={activeTab}
                showAllTab={true}
                allTabLabel="全部"
            />

            <div className={styles.container}>
              
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
                        <span>{showVolume ? '成交量' : '24h涨跌'}</span>
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
                    {/* <Table
                        dataSource={pairList}
                        rowKey="id"
                        pagination={false}
                        expandable={{
                            expandedRowRender: (record) => (
                                <Table
                                    columns={expandedColumns}
                                    dataSource={record.children}
                                    pagination={false}
                                    rowKey="id"
                                />
                            ),
                            expandedRowKeys,
                            onExpand: handleExpand,
                        }}
                        columns={[
                            {
                                title: '',
                                dataIndex: 'name',
                                key: 'name',
                                render: (_, record) => (
                                    <div className={`${styles.pair_name} flex-1`}>
                                        <span className={styles.favorite}>
                                            <Rate count={1} style={{ fontSize: 14 }} />
                                        </span>
                                        <span className={styles.coin_icon}>{record.icon}</span>
                                        <span className={`font-14 ${styles.title_color}`}>{record.name}</span>
                                    </div>
                                ),
                            },
                            {
                                title: '',
                                dataIndex: 'price',
                                key: 'price',
                                render: (price) => (
                                    <div className={`font-14 ${styles.title_color} flex-1`}>
                                        {price}
                                    </div>
                                ),
                            },
                            {
                                title: '',
                                dataIndex: 'change',
                                key: 'change',
                                render: (change, record) => (
                                    <div className={`${styles.pair_change} ${record.isUp ? styles.success_icon : styles.error_icon} flex-1`}>
                                        {change}
                                    </div>
                                ),
                            },
                        ]}
                    /> */}
                    {filteredPairs.map((pair, index) => (
                        <div key={index} className={`${styles.pair_item}  px-4 flex-x align-center`} onClick={() => handlePairClick(pair)}>
                            {/* 币种名称 */}
                            <div className={`${styles.pair_name} flex-1`}>
                                <span className={styles.favorite}>

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
                                {showVolume ? pair.quantity : pair.priceChangePercent}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </ConfigProvider>
    );
};

export default observer(SelfSelect);