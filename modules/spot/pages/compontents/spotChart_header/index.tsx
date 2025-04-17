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
const SpotHeaderPage = () => {
    const { t } = useTranslation(['spot']);
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState('spot'); // 当前选中的tab
    const [searchValue, setSearchValue] = useState('');

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
                        <p className={`${styles.error_icon} font-16`}>27056.20</p>
                        <p>¥183,982.10</p>
                    </li>
                    <li className='mr-9'>
                        <p >24H  涨跌</p>
                        <p className={`${styles.success_icon} font-14`}>+7,156.36 +7.46%</p>
                    </li>
                    <li className='mr-9'>
                        <p >24H 最高价</p>
                        <p className={`${styles.title_color}`}>27,659.60</p>
                    </li>
                    <li className='mr-9'>
                        <p >24H 最低价</p>
                        <p className={`${styles.title_color}`} >26,857.90</p>
                    </li>
                    <li className='mr-9'>
                        <p >24H 成交量(BTC)</p>
                        <p className={`${styles.title_color}`} >3,667.17</p>
                    </li>
                    <li className='mr-9'>
                        <p >24H 交易额(USDT)</p>
                        <p className={`${styles.title_color}`}>1.00亿</p>
                    </li>
                </ul>
                <div className='flex-cc'>
                    <Iconify icon="mingcute:settings-5-line" size={26} className={`${styles.tip_color}`} />
                </div>
            </ConfigProvider>
        </div>
    );
};

export default SpotHeaderPage;