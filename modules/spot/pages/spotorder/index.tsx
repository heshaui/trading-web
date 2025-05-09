import React from 'react';
import { withSpotLayout } from '@/components/sidebarLayout/SpotLayout/userSpotLayout';
import styles from '../../styles/billDetails.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form ,Tabs} from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { TabsProps } from 'antd';
import SpotOrderNow from '../compontents/NowOrder'
import SpotOrderHistory from '../compontents/HistoryOrder'
import SpotOrderDeal from '../compontents/HistoryDeal'
import appStore from '@/store';

interface DataType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: number,
    tokenTime: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
}
const SpotOrderPage = () => {
    const { t } = useTranslation(['spot']);

    const [isClient, setIsClient] = useState(false);
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10,
    })
    const paramdataRef = useRef(pageParam);

    const items: TabsProps['items'] = [
        {
            key: '1',
            label:t('spot.tabs.now') , //"当前委托",
            children: <SpotOrderNow />,
        },
        {
            key: '2',
            label: t('spot.tabs.history'), //'历史委托',
            children: <SpotOrderHistory />,
        },
        {
            key: '3',
            label: t('spot.tabs.historyDeal'), //'历史成交',
            children: <SpotOrderDeal/>,
        },
    ];
    useEffect(() => {
        // 只在客户端执行
        if (typeof window === 'undefined') return;

        try {
            appStore.loadCurrencyPairs()
        } catch (error) {
            console.error('初始化货币对数据错误:', error);
        }
    }, [isClient]);
    return (<>
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        // bodySortBg: "pink",
                        headerBg: "transparent",
                        headerColor: "var(--text-color6)",
                        headerSplitColor: "transparent", // 表头分割线颜色
                        rowExpandedBg: "var(--background10)", // 表格行展开背景色
                        borderColor: "transparent",
                        // stickyScrollBarBg:"transparent",
                        headerBorderRadius: 0, // 表头圆角
                        // stickyScrollBarBg:"transparent",
                    },
                    Pagination: {
                        itemActiveBg: "transparent",
                        itemBg: "transparent",
                    },

                    Select: {
                        activeBorderColor: "var(--border-color4)",
                        optionActiveBg: "transparent",
                        selectorBg: "transparent", //选框背景色
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
            <div className='flex justify-between align-center'>
                <h2 className={`font-w-500 font-20`}>
                    {t('spot.spotOrder')}
                </h2>
            </div>
            <div className={`${styles.card_bgc5}  mt-3 `}>
                {/* 充值 */}
                <div className={`${styles.table_box} w-full `}>
                    <div className={`${styles.table_box_inner} `}
                    style={{minHeight:"50vh"}}>
                        <Tabs items={items} 
                        className="custom-tabs2" 
                        destroyInactiveTabPane={true}
                        indicator={{ size: (origin) => origin - 35, align: 'center' }}/>
                    </div>
                    {/* <div className={`${styles.table_header} w-full my-4 flex align-center`}>
                        <Form
                            form={form}
                            layout="inline"
                            initialValues={{
                                direction: '',
                                symbol: ''
                            }}
                        >
                            <Form.Item name="direction" >
                                <Select allowClear
                                    placeholder={t('spot.select.direction')}
                                    options={directionSelect}
                                    className={`${styles.select_box} custom-select`}
                                />
                            </Form.Item>
                            <Form.Item name="symbol" >
                                <Select allowClear
                                    placeholder={t('spot.select.symbol')}
                                    options={symbolSelect}
                                    className={`${styles.select_box} custom-select`}
                                />
                            </Form.Item>
                        </Form>
                    </div>
                    <div className={`${styles.table_content} w-full `}>

                        <Table
                            columns={columns}
                            dataSource={tableData}
                            size="large"
                            scroll={{ x: "max-content", y: 300 }}
                            className={` table-box`}
                            pagination={{
                                position: ["bottomRight"],
                                showSizeChanger: true,
                                total: total,
                                size: "default",
                                onChange: (page, pageSize) => pageChange(page, pageSize),
                            }}
                        // loading={loading}
                        />

                    </div> */}
                </div>
            </div>
        </ConfigProvider>
    </>
    );
};

export default withSpotLayout(SpotOrderPage);