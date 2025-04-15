import React from 'react';
import styles from '../styles/spotChartCom.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form ,Tabs} from 'antd';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import type { TabsProps } from 'antd';
import SpotOrderNow from './now_table'
import SpotOrderHistory from './pastDeals_table'
import SpotOrderDeal from './historyDeal_table'
import SpotOrderAssets from './assets_table'

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
const SpotTablePage = () => {
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


    const items: TabsProps['items'] = [
        {
            key: '1',
            label:t('spot.tabs.now') , //"当前委托",
            children: <SpotOrderNow />, //<div>123</div>, //
        },
        {
            key: '2',
            label: t('spot.tabs.history'), //'历史委托',
            children: <SpotOrderHistory />, //<SpotOrderHistory />,
        },
        {
            key: '3',
            label: t('spot.tabs.historyDeal'), //'历史成交',
            children: <SpotOrderDeal/>, //<SpotOrderDeal/>,
        },
        {
            key: '4',
            label: t('spot.tabs.asset'), //'资产',
            children: <SpotOrderAssets/>, //<SpotOrderAssets/>,
        },
    ];
 
    return (<>
        <ConfigProvider
            theme={{
                components: {
                    Tabs: {
                        itemActiveColor: "var(--tip-color)", //激活态颜色  
                        itemSelectedColor: "var(--text-color5)", //选中态颜色
                        horizontalMargin: "0 0 0 0",
                        itemColor: "var(--text-color6)",
                        inkBarColor: "var(--text-color5)", //指示条颜色
                        horizontalItemPaddingLG:"24px 8px",
                        horizontalItemPadding:"24px 8px",
                        horizontalItemPaddingSM:"24px 8px",
                    },
                },
            }}
        >
            {/* <div className='flex justify-between align-center'>
                <h2 className={`font-w-500 font-20`}>
                    {t('spot.spotOrder')}
                </h2>
            </div>
            <div className={`${styles.card_bgc}  mt-3 `}> */}
                {/* 充值 */}
                {/* <div className={`${styles.table_box} w-full `}>
                    <div className={`${styles.table_box_inner} `}> */}
                    <div className='position-relative'>
                        <Tabs items={items} 
                        className="custom-tabs2" 
                       
                        indicator={{ size: (origin) => origin - 35, align: 'center' }}/>
                    </div>
                    {/* </div>
                  
                </div> */}
            {/* </div> */}
        </ConfigProvider>
    </>
    );
};

export default SpotTablePage