import React from 'react';
import { withSpotLayout } from '@/components/sidebarLayout/SpotLayout/userSpotLayout';
import styles from '../../styles/billDetails.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { TabsProps } from 'antd';
import SpotChartTables from '../compontents/spotChart_table'
import SpotChartAssets from '../compontents/spotChart_assets'
import SpotChartTrade from '../compontents/spotChart_trade'
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
    const [form] = Form.useForm();
    const [tableData, setTableData] = useState<DataType[]>([
        {
            id: 1,
            userId: 1,
            platformType: 1,
            deviceNo: 'BTC',
            ip: '123.45.67.89',
            address: '123.45.67.89',
            token: 23.3,
            tokenTime: 123,
            createTime: 1234567890,
            updateTime: 1234567890,
            tenantId: '1234567890'
        }, {
            id: 2,
            userId: 1,
            platformType: 1,
            deviceNo: 'POINT',
            ip: '123.45.67.89',
            address: '123.45.67.89',
            token: 1234567890,
            tokenTime: 23.0,
            createTime: 1234567892,
            updateTime: 1234567889,
            tenantId: '1234567890'
        }
    ]);
    const router = useRouter();
    const [paramInfo, sePparamInfo] = useState({
        type: '',
        selsect: ''
    });
    const [total, setTotal] = useState(0);
    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10,
    })
    const paramdataRef = useRef(pageParam);


    return (<div className={`${styles.page_box} w-full`}>
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
            <div className={`${styles.card_bgc} w-full mb-1`}>
                header

            </div>
            <div className={`flex ${styles.grid_layout} mb-1`}>
                <div className={`flex-1`}>

                    <div className={`${styles.card_bgc3} w-full mb-1`} style={{ height: '45vh' }}>

                        图表
                    </div>
                    <div className={`${styles.card_bgc1}  flex-1`}>
                        <SpotChartTables />
                    </div>
                </div>

                {/* Second row: Assets and Deposit */}
                <div className={` ${styles.grid_item} `}>


                    <div className={`${styles.card_bgc} mb-1`} style={{ height: '45vh' }}>

                        <SpotChartTrade />
                    </div>
                    <div className={`${styles.card_bgc1} flex-1 `} style={{height:'calc(100% - 45vh)'}}>
                        <SpotChartAssets />
                    </div>
                </div>
            </div>
        </ConfigProvider>
    </div>
    );
};

export default SpotOrderPage