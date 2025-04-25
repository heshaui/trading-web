'use client'
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
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { addUserExchangeCoinType,canalUserExchangeCoinType } from '@/services/spot';
import DrawerPop from '../DrawerPop';


const SpotHeaderPage = observer( ({coinData}:{coinData:any}) => {
    
    const { t } = useTranslation(['spot']);
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState('spot'); // 当前选中的tab
    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false); // 添加收藏状态
    const [dawerPopOpen, setDawerPopOpen] = useState(false); // 侧边抽屉
   
    // 解析K线数据
    const klineData = coinData?.data?.[0] || [];
    const [timestamp, open_price, high_price, low_price, close_price, volume] = klineData;
    
    // 计算涨跌幅
    const priceChange = close_price - open_price;
    const priceChangePercent = (priceChange / open_price * 100).toFixed(2);
    const isPriceUp = priceChange >= 0;


    // useEffect(() => {
    //     setMounted(true);
    //     // 加载数据时设置加载状态
    //     setIsLoading(true);
    //     appStore.loadCurrencyPairs()
    //         .then(() => setIsLoading(false))
    //         .catch((error) => {
    //             console.error('加载货币对数据失败:', error);
    //             setIsLoading(false);
    //         });
    // }, []);

    //  // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
    //  const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];




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

    // 添加新函数处理货币对选择
    const handlePairSelect = (pair: any) => {
        appStore.setCurrentPair(pair);
        setOpen(false); // 选择后关闭下拉菜单
    };

    // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
    const currencyPairsArray = appStore.currencyPairs || [];



    const tabsItem: TabsProps['items'] = [
        {
            key: 'favorites',
            label: '自选',
            children: <SelfSelect 
                currencyPairs={currencyPairsArray} 
                onPairSelect={handlePairSelect} 
                searchValue={searchValue}
            />
        },
        {
            key: 'spot',
            label: '现货',
            children: <SpotSelect 
                currencyPairs={currencyPairsArray} 
                onPairSelect={handlePairSelect} 
                searchValue={searchValue}
            />
        },
    ];
    // 添加处理收藏的函数
    const handleToggleFavorite = async () => {
        setIsFavorite(!isFavorite);
        if(!isFavorite){
            const data={
                exchangeCoinId:currentPair.id,
                type:1
            }
           const res= await addUserExchangeCoinType(data);
           if(res.code === '0'){
                // 更新currentPair
                appStore.setCurrentPair({
                    ...currentPair,
                    isFavorite: true
                });
                
                // 同时更新currencyPairs数组中的对应项
                const updatedPairs = [...appStore.currencyPairs];
                const pairIndex = updatedPairs.findIndex(pair => pair.id === currentPair.id);
                if (pairIndex !== -1) {
                    updatedPairs[pairIndex] = {
                        ...updatedPairs[pairIndex],
                        isFavorite: true
                    };
                    appStore.setCurrencyPairs(updatedPairs);
                }
           }
        }else{
            const data={
                exchangeCoinId:currentPair.id,
                type:2
            }
          const res= await canalUserExchangeCoinType(data);
            if(res.code === '0'){
                // 更新currentPair
                appStore.setCurrentPair({
                    ...currentPair,
                    isFavorite: false
                });
                
                // 同时更新currencyPairs数组中的对应项
                const updatedPairs = [...appStore.currencyPairs];
                const pairIndex = updatedPairs.findIndex(pair => pair.id === currentPair.id);
                if (pairIndex !== -1) {
                    updatedPairs[pairIndex] = {
                        ...updatedPairs[pairIndex],
                        isFavorite: false
                    };
                    appStore.setCurrencyPairs(updatedPairs);
                }
            }
        }
    };

    // 只在客户端渲染 Dropdown
    const renderDropdown = () => {
        

        return (


            <div>
            <Dropdown
                trigger={['hover']}
                open={open}
                onOpenChange={handleOpenChange}
                dropdownRender={() => (
                    <div className={styles.dropdown_container}>
                        <div className={`${styles.search_container} w-full`} >
                            <Input
                                placeholder="搜索"
                                prefix={<SearchOutlined />}
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                                className={`${styles.input_box} modal-input w-full`}
                                style={{width: '100%'}}
                            />
                        </div>
                        <div className={`${styles.tabs_container} w-full`}>
                            <div className={`${styles.tabs_list} w-full`}>
                                <Tabs items={tabsItem}
                                    className="custom-tabs2 w-full"
                                    activeKey={activeTab}
                                    onChange={handleTabClick}
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
                    {isLoading ? (
                        <Spin size="small" />
                    ) : (
                        <span>{currentPair?.coinSymbol}/{currentPair?.baseSymbol }</span>
                    )}
                    <Iconify icon="prime:sort-down-fill" size={16} className={styles.dropdown_icon} />
                       

                </Space>
            </Dropdown>
                
            <Tooltip title={currentPair?.isFavorite ? "取消收藏" : "添加收藏"}>
                <div onClick={handleToggleFavorite} className={`ml-2 cursor-pointer`}>
                    <Iconify 
                        icon={currentPair?.isFavorite ? "ic:round-star" : "ic:round-star-outline"} 
                        size={20} 
                        color={currentPair?.isFavorite ? "#FFD700" : "var(--text-color6)"} 
                    />
                </div>
            </Tooltip>
            </div>
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
                        Input: {
                            // color: '#FF5F1F',
                            activeBorderColor: 'var(--theme-color)',
                            hoverBorderColor: 'var(--theme-color)',
                            controlHeightLG: 50,
                            activeBg:'var(--background5)',
                            hoverBg:'var(--background5)',
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
                        <p>24H 成交量({currentPair?.coinSymbol})</p>
                        <p className={`${styles.title_color}`}>{volume ? volume.toFixed(2) : '--'}</p>
                    </li>
                    <li className='mr-9'>
                        <p>24H 交易额({currentPair?.baseSymbol})</p>
                        <p className={`${styles.title_color}`}>
                            {volume && close_price ? formatAmount(volume * close_price) : '--'}
                        </p>
                    </li>
                </ul>
                <button type='button' className='flex-cc' onClick={() => setDawerPopOpen(true)}>
                    <Iconify icon="mingcute:settings-5-line" size={26} className={`${styles.tip_color}`} />
                </button>
                <DrawerPop open={dawerPopOpen} onClose={() => setDawerPopOpen(false)} />
            </ConfigProvider>
        </div>
    );
});

// 辅助函数：格式化大额数字
const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
        return (amount / 100000000).toFixed(2) + '亿';
    } else if (amount >= 10000) {
        return (amount / 10000).toFixed(2) + '万';
    } else {
        return amount.toFixed(2);
    }
};

export default SpotHeaderPage;