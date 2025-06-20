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
import { addUserExchangeCoinType, canalUserExchangeCoinType } from '@/services/spot';
import DrawerPop from '../DrawerPop';
import { useRouter } from 'next/router';



const SpotHeaderPage = observer(({ coinData }: { coinData: any }) => {
    const { t } = useTranslation(['spot']);


    const router = useRouter();
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
    const priceChange = close_price && open_price ? close_price - open_price : 0;
    const priceChangePercent = open_price && open_price !== 0 ? (priceChange / open_price * 100).toFixed(2) : '0.00';
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

    // 获取当前选中的货币对，如果没有则使用币对列表的第一个数据
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
    const currencyPairsArray = appStore.currencyPairs || [];
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
    // 当currentPair变化时同步收藏状态
    useEffect(() => {
        if (currentPair) {
            setIsFavorite(!!currentPair.isFavorite);
        }
    }, [currentPair]);

    // 处理路由参数变化，包括页面内跳转
    useEffect(() => {
        if (!router.isReady) return;

        const { symbol } = router.query;

        if (symbol && typeof symbol === 'string') {
            // 解析symbol参数 (格式: BTC/USDT)
            const [coinSymbol, baseSymbol] = symbol.split('/');

            if (coinSymbol && baseSymbol) {
                // 使用store的方法获取匹配的币对
                const matchedPairs = appStore.getCurrencyPairsByBase(baseSymbol);
                const matchedPair = matchedPairs.find(pair =>
                    pair.coinSymbol === coinSymbol && pair.baseSymbol === baseSymbol
                );

                // 如果找到匹配的币对，使用store的方法更新当前币对
                if (matchedPair) {
                    appStore.setCurrentPair(matchedPair);
                }
            }

            // 清除路由中的 symbol 参数
            const newQuery = { ...router.query };
            delete newQuery.symbol;
            router.replace({
                pathname: router.pathname,
                query: newQuery
            }, undefined, { shallow: true });
        }
    }, [router.isReady, router.query]); // 监听路由准备状态和查询参数变化

    // // 当币对改变时更新URL
    // useEffect(() => {
    //     if (currentPair && router.isReady) {
    //         const newSymbol = `${currentPair.coinSymbol}/${currentPair.baseSymbol}`;
    //         const currentSymbol = router.query.symbol;

    //         // 只有当URL中的symbol与当前币对不匹配时才更新
    //         if (currentSymbol !== newSymbol) {
    //             router.push({
    //                 pathname: router.pathname,
    //                 query: { ...router.query, symbol: newSymbol }
    //             }, undefined, { shallow: true });
    //         }
    //     }
    // }, [currentPair, router.isReady]);

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

    // 修改handlePairSelect，不再更新URL
    const handlePairSelect = (pair: any) => {
        appStore.setCurrentPair(pair);
        setOpen(false);
    };

    const tabsItem: TabsProps['items'] = [
        {
            key: 'favorites',
            label: t('spot.header.favorites'),
            children: <SelfSelect
                currencyPairs={currencyPairsArray}
                onPairSelect={handlePairSelect}
                searchValue={searchValue}
            />
        },
        {
            key: 'spot',
            label: t('spot.header.spot'),
            children: <SpotSelect
                currencyPairs={currencyPairsArray}
                onPairSelect={handlePairSelect}
                searchValue={searchValue}
            />
        },
    ];
    // 添加处理收藏的函数
    const handleToggleFavorite = async () => {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState); // 先更新UI状态，提高响应速度

        const data = {
            exchangeCoinId: currentPair.id,
            type: 1
        };

        try {
            let res;
            if (newFavoriteState) {
                // 添加收藏
                res = await addUserExchangeCoinType(data);
            } else {
                // 取消收藏
                res = await canalUserExchangeCoinType(data);
            }

            if (res.code === '0') {
                // 请求成功后更新store中的状态
                appStore.setCurrentPair({
                    ...currentPair,
                    isFavorite: newFavoriteState
                });

                // 更新币对列表中的收藏状态
                const updatedPairs = [...appStore.currencyPairs];
                const pairIndex = updatedPairs.findIndex(item => item.id === currentPair.id);
                if (pairIndex !== -1) {
                    updatedPairs[pairIndex] = {
                        ...updatedPairs[pairIndex],
                        isFavorite: newFavoriteState
                    };
                    appStore.setCurrencyPairs(updatedPairs);
                }
            } else {
                // 如果API失败，恢复UI状态
                setIsFavorite(!newFavoriteState);
                console.error('更新收藏状态失败:', res);
            }
        } catch (error) {
            // 发生错误时恢复UI状态
            setIsFavorite(!newFavoriteState);
            console.error('收藏操作发生错误:', error);
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
                                    placeholder={t('spot.header.search')} // "搜索"
                                    prefix={<SearchOutlined />}
                                    value={searchValue}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className={`${styles.input_box} modal-input2 w-full`}
                                    style={{ width: '100%' }}
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
                            <span>{currentPair?.coinSymbol}/{currentPair?.baseSymbol}</span>
                        )}
                        <Iconify icon="prime:sort-down-fill" size={16} className={styles.dropdown_icon} />


                    </Space>
                </Dropdown>

                <Tooltip title={currentPair?.isFavorite ? t('spot.header.removeFromFavorites') : t('spot.header.addToFavorites')}>
                    <div onClick={handleToggleFavorite} className={`ml-2 cursor-pointer`} style={{width:'20px'}}>
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
                            activeBg: 'var(--background5)',
                            hoverBg: 'var(--background5)',
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
                        <p>{t('spot.header.change24h')}</p>
                        <p className={`${priceChange === 0 ? styles.default_icon : (isPriceUp ? styles.success_icon : styles.error_icon)} font-14`}>
                            {priceChange && !isNaN(priceChange) && priceChange !== 0 ? (isPriceUp ? '+' : '') + priceChange.toFixed(2) : '--'} {priceChangePercent && priceChangePercent !== 'NaN' && priceChange !== 0 ? (isPriceUp ? '+' : '') + priceChangePercent + '%' : '--'}
                        </p>
                    </li>
                    <li className='mr-9'>
                        <p>{t('spot.header.high24h')}</p>
                        <p className={`${styles.title_color}`}>{high_price ? high_price.toFixed(2) : '--'}</p>
                    </li>
                    <li className='mr-9'>
                        <p>{t('spot.header.low24h')}</p>
                        <p className={`${styles.title_color}`}>{low_price ? low_price.toFixed(2) : '--'}</p>
                    </li>
                    <li className='mr-9'>
                        <p>{t('spot.header.volume24h')}({currentPair?.coinSymbol})</p>
                        <p className={`${styles.title_color}`}>{volume ? volume.toFixed(2) : '--'}</p>
                    </li>
                    <li className='mr-9'>
                        <p>{t('spot.header.amount24h')}({currentPair?.baseSymbol})</p>
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



export default SpotHeaderPage;