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
import { useAuth } from '@/context/AuthContext';
import { NoLogin } from '@/components/noData';
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
    const { isLoggedIn} = useAuth();

    const router = useRouter();
    const [paramInfo, sePparamInfo] = useState({
        type: '',
        selsect: ''
    });
    const [total, setTotal] = useState(0);

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: <div>
                {/* 当前委托 */}
                {t('spot.tabs.now')}
                {total>0&&<span className={styles.tabs_span}>{`(${total})`}</span>}
            </div>,
            children: isLoggedIn ? <SpotOrderNow 
                returnNowOrder={(num: number) => setTotal(num)}
            /> :
                <div className='h-full' style={{ paddingTop: '100px' }}>
                <NoLogin />
            </div>
        },
        {
            key: '2',
            label: t('spot.tabs.history'), //'历史委托',
            children: isLoggedIn ? <SpotOrderHistory /> : <div className='h-full' style={{paddingTop:'100px'}}>
                <NoLogin />
            </div>
        },
        {
            key: '3',
            label: t('spot.tabs.historyDeal'), //'历史成交',
            children: isLoggedIn ? <SpotOrderDeal/> : <div className='h-full' style={{paddingTop:'100px'}}>
                <NoLogin />
            </div>
        },
        {
            key: '4',
            label: t('spot.tabs.asset'), //'资产',
            children: isLoggedIn ? <SpotOrderAssets/> : <div className='h-full' style={{paddingTop:'100px'}}>
                <NoLogin />
            </div>
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
                        destroyInactiveTabPane={true}
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