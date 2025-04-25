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
interface SelfSelectProps {
    currencyPairs: any[];
    onPairSelect?: (pair: any) => void;
    searchValue: string;
}
const SelfSelect = ({ currencyPairs, onPairSelect, searchValue }: SelfSelectProps) => {
    const { t } = useTranslation(['spot']);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [sortField, setSortField] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

 

    // 标签页配置
    const tabsItem: TabsProps['items'] = [
        { key: 'defi', label: 'Defi' },
        { key: 'main', label: '主流币' },
        { key: 'new', label: '新币种' },
        { key: 'ai', label: '人工智能' },
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
                // 24h涨跌排序
                const changeA = parseFloat(a.priceChangePercent) || 0;
                const changeB = parseFloat(b.priceChangePercent) || 0;
                return sortDirection === 'asc'
                    ? changeA - changeB
                    : changeB - changeA;
            }
            return 0;
        });
    };

    const sortedPairList = getSortedPairs();

    const filteredPairs = sortedPairList.filter(pair => 
        (pair.coinSymbol.toLowerCase().includes(searchValue.toLowerCase()) || 
        pair.baseSymbol.toLowerCase().includes(searchValue.toLowerCase()))
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
                        <span>24h涨跌</span>
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
                        <div className='ml-1 flex-y-cc'>
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
                        <div key={index} className={`${styles.pair_item}  px-4 flex-x align-center`}>
                            {/* 币种名称 */}
                            <div className={`${styles.pair_name} flex-1`}>
                                <span className={styles.favorite}>
                                    <Rate
                                        defaultValue={pair.isFavorite ? 1 : 0}
                                        count={1}
                                        disabled={true}
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
                </div>
            </div>
        </ConfigProvider>
    );
};

export default SelfSelect;