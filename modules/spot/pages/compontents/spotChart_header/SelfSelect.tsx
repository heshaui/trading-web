import React from 'react';
import styles from '../styles/spotHeader_select.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs, Spin, Button, Space, Tooltip, Dropdown } from 'antd';
import { Iconify } from "@/components/icon"
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import type { DropdownProps, MenuProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';

const SelfSelect = () => {
    const { t } = useTranslation(['spot']);
    const [activeTab, setActiveTab] = useState('all'); // 当前选中的tab
    const [searchValue, setSearchValue] = useState('');

    // 模拟的交易对数据
    const pairList = [
        { 
            name: 'GT/USDT', 
            price: '4.9829', 
            change: '-3.05%',
            isUp: false,
            isFavorite: true,
            icon: '🔴'
        },
        { 
            name: 'BTC/USDT', 
            price: '27056.20', 
            change: '+3.05%',
            isUp: true,
            isFavorite: true,
            icon: '🟡'
        }
    ];

    // 标签页配置
    const items = [
        { key: 'all', label: '全部' },
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

    // 渲染交易对列表
    const renderPairList = () => {
        return pairList.map((pair, index) => (
            <div key={index} className={styles.pair_item}>
                <div className={styles.pair_name}>
                    <span className={styles.favorite}>⭐</span>
                    <span className={styles.coin_icon}>{pair.icon}</span>
                    <span>{pair.name}</span>
                </div>
                <div className={styles.pair_price}>{pair.price}</div>
                <div className={`${styles.pair_change} ${pair.isUp ? styles.up : styles.down}`}>
                    {pair.change}
                </div>
            </div>
        ));
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
                {/* 搜索框 */}
                <div className={styles.search_box}>
                    <Input
                        placeholder="搜索"
                        prefix={<SearchOutlined />}
                        value={searchValue}
                        onChange={handleSearch}
                        className={styles.search_input}
                    />
                </div>

                {/* 标签页导航 */}
                <div className={styles.tabs_wrapper}>
                    <Radio.Group 
                        value={activeTab} 
                        onChange={(e) => handleTabChange(e.target.value)}
                        className={styles.tabs_group}
                    >
                        {items.map(item => (
                            <Radio.Button key={item.key} value={item.key} className={styles.tab_button}>
                                {item.label}
                            </Radio.Button>
                        ))}
                    </Radio.Group>
                </div>

                {/* 列表头部 */}
                <div className={styles.list_header}>
                    <div className={styles.header_item}>名称</div>
                    <div className={styles.header_item}>最新价</div>
                    <div className={styles.header_item}>24h涨跌</div>
                </div>

                {/* 交易对列表 */}
                <div className={styles.pair_list}>
                    {renderPairList()}
                </div>
            </div>
        </ConfigProvider>
    );
};

export default SelfSelect;