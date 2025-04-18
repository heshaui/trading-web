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

const SpotSelect = () => {
    const { t } = useTranslation(['spot']);
    const [activeTab, setActiveTab] = useState('all');
    const [searchValue, setSearchValue] = useState('');
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

    // 模拟的交易对数据
    const pairList = [
        {
            id: 1,
            name: 'GT/USDT',
            price: '4.9829',
            change: '-3.05%',
            isUp: false,
            isFavorite: true,
            icon: <Iconify icon="cryptocurrency-color:btc" size={16} />,
            children: [
                {
                    id: 11,
                    price: '4.9820',
                    amount: '1000',
                    total: '4982',
                    time: '2024-02-28 10:00:00'
                },
                {
                    id: 12,
                    price: '4.9835',
                    amount: '500',
                    total: '2491.75',
                    time: '2024-02-28 10:01:00'
                }
            ]
        },
        {
            id: 2,
            name: 'BTC/USDT',
            price: '270246.20',
            change: '+3.05%',
            isUp: true,
            isFavorite: true,
            icon: <Iconify icon="cryptocurrency-color:btc" size={16} />,
            children: [
                {
                    id: 21,
                    price: '270246.00',
                    amount: '0.1',
                    total: '27024.60',
                    time: '2024-02-28 10:02:00'
                }
            ]
        }
    ];

    // 标签页配置
    const tabsItem: TabsProps['items'] = [
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
                    <div className={`${styles.tip_color} font-12  flex-1 flex-x align-center`}>
                        <span>名称</span>
                        <div className='ml-1 flex-y-cc'>
                            <Iconify icon="fluent-mdl2:flick-down" className='pointer' size={10} style={{marginBottom: 2}}/>
                            <Iconify icon="fluent-mdl2:flick-up" className='pointer' size={10} />
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
                    {pairList.map((pair, index) => (
                        <div key={index} className={`${styles.pair_item}  px-4 flex-x align-center`}>
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
                                <span className={`font-14 ${styles.title_color}`}>{pair.name}</span>
                            </div>
                            {/* 最新价 */}
                            <div className={`font-14 ${styles.title_color} flex-1`}>
                                {pair.price}
                            </div>
                            {/* 24h涨跌/24h成交量 */}
                            <div
                                className={`${styles.pair_change} ${pair.isUp ? styles.success_icon : styles.error_icon} flex-1`}
                            >
                                {pair.change}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ConfigProvider>
    );
};

export default SpotSelect;