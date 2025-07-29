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
import { addUserExchangeCoinType, canalUserExchangeCoinType } from '@/services/spot';
import appStore from '@/store';
import { observer } from "mobx-react-lite";
interface SelfSelectProps {
    currencyPairs: any[];
    onPairSelect?: (pair: any) => void;
    searchValue: string;
    wsData?: any;
}
const SelfSelect: React.FC<SelfSelectProps> = ({ currencyPairs, onPairSelect, searchValue, wsData }) => {
    const { t } = useTranslation(['spot']);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [sortField, setSortField] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showVolume, setShowVolume] = useState<boolean>(false);
    
    // 辅助函数：格式化大额数字
    const formatAmount = (amount: number) => {
        if (amount >= 100000000) {
            return (amount / 100000000).toFixed(2) + t('spot.header.billion');
        } else if (amount >= 10000) {
            return (amount / 10000).toFixed(2) + t('spot.header.tenThousand');
        } else {
            return amount.toFixed(2);
        }
    };
 

    // 标签页配置
    const tabsItem: TabsProps['items'] = [
        { key: '1', label: t('spot.header.mainArea') },
        { key: '2', label: t('spot.header.innovationArea') },
        { key: '3', label: t('spot.header.newCoinArea') },
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
        { key: '15', label: t('spot.header.gameMetaverse') },
        { key: '16', label: t('spot.header.storage') },
    ];

    // 处理展开/折叠行
    const handleExpand = (expanded: boolean, record: any) => {
        setExpandedRowKeys(expanded ? [record.id] : []);
    };

    // 子表格列配置
    const expandedColumns = [
        {
            title: t('spot.header.time'),
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: t('spot.header.price'),
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: t('spot.header.amount'),
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: t('spot.header.total'),
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

    // 合并WebSocket数据到币对数据中
    const enrichedPairs = filteredPairs.map(pair => {
        const symbol = `${pair.coinSymbol}_${pair.baseSymbol}_${pair.groupStatus}`;
        const wsKlineData = wsData?.[symbol];
        
        if (wsKlineData && Array.isArray(wsKlineData) && wsKlineData.length >= 8) {
            // 根据实际数据格式：[timestamp, open, high, low, close, volume, changePercent, amount]
            const [timestamp, open_price, high_price, low_price, close_price, volume, changePercent, amount] = wsKlineData;
            
            
            return {
                ...pair,
                realTimePrice: close_price,
                realTimeChange: changePercent ? changePercent.toFixed(2) : null, // 直接使用WebSocket返回的涨跌幅
                realTimeVolume: volume,
                realTimeAmount: amount
            };
        }
        
        return pair;
    });

    const handlePairClick = async (pair: any) => {
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
                const updatedCurrentPair = { ...appStore.currentPair };
                updatedCurrentPair.isFavorite = isFavorite;
                appStore.setCurrentPair(updatedCurrentPair);
            }
        }
    };

    const handleTabClick = (key: string) => {
        setActiveTab(key);
    };

    const showChange = (e: React.MouseEvent) => {
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
                    Rate: {
                        starBg: "#A4A5AC",
                    }
                },
            }}
        >
            <SimpleScrollTabs
                items={tabsItem}
                onChange={handleTabClick}
                defaultActiveKey={activeTab}
                showAllTab={true}
                allTabLabel={t('spot.header.all')}
            />

            <div className={styles.container}>

                {/* 列表头部 */}
                <div className={`${styles.list_header} px-4 py-4 flex-x align-center`}>
                    <div
                        className={`${styles.tip_color} font-12 flex-1 flex-x align-center pointer`}
                        onClick={() => handleSort('name')}
                    >
                        <span>{t('spot.header.name')}</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify
                                icon="fluent-mdl2:flick-down"
                                className={`pointer ${sortField === 'name' && sortDirection === 'asc' ? styles.active_sort : ''}`}
                                size={10}
                                style={{ marginBottom: 2 }}
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
                        <span>{t('spot.header.lastPrice')}</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify
                                icon="fluent-mdl2:flick-down"
                                className={`pointer ${sortField === 'price' && sortDirection === 'asc' ? styles.active_sort : ''}`}
                                size={10}
                                style={{ marginBottom: 2 }}
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
                        <span>{showVolume ? t('spot.header.volume24h') : t('spot.header.change24h')}</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify
                                icon="fluent-mdl2:flick-down"
                                className={`pointer ${sortField === 'change' && sortDirection === 'asc' ? styles.active_sort : ''}`}
                                size={10}
                                style={{ marginBottom: 2 }}
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
                    {enrichedPairs.map((pair, index) => (
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
                            <div className={`font-14 ${styles.title_color} flex-1 flex-x align-center`}>
                                <span>{pair.realTimePrice ? pair.realTimePrice.toFixed(2) : (pair.yesterdayPrice || 0)}</span>
                            </div>
                            {/* 24h涨跌/24h成交量 */}
                            <div
                                className={`${styles.pair_change} ${!showVolume && (pair.realTimeChange ? parseFloat(pair.realTimeChange) > 0 : pair.priceChangePercent > 0) ? styles.success_icon : !showVolume && (pair.realTimeChange ? parseFloat(pair.realTimeChange) < 0 : pair.priceChangePercent < 0) ? styles.error_icon : ''} flex-1`}
                            >
                                {showVolume 
                                    ? (pair.realTimeAmount ? formatAmount(pair.realTimeAmount) : (pair.realTimeVolume ? pair.realTimeVolume.toFixed(2) : Number(pair.quantity || 0).toFixed(2)))
                                    : (pair.realTimeChange ? `${pair.realTimeChange}%` : `${(pair.priceChangePercent || 0).toFixed(2)}%`)
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ConfigProvider>
    );
};

export default observer(SelfSelect);