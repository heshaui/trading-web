import styles from '@/styles/components/HomeMenu.module.css';
import { Dropdown, Space, Button, Avatar, ConfigProvider, Row, Col, Drawer, Empty, Tabs, TabsProps, Badge } from 'antd';
import { MenuProps } from 'antd';
import MenuItemLabel from '../HomeMenuLabel'; import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
// import dayjs from 'dayjs';
// import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { useThemeMode } from '@/hooks/useThemeMode'; // 导入 useThemeMode 获取当前主题状态
import { useAuth } from '@/context/AuthContext';
import { getLoginInfo } from '@/services/overview';
import { encryptString } from '@/utils/encrypt';
import { toast } from 'sonner';
import { ROUTER_KEY_ASSETS } from '@/config/apiConfig';
export default function AssetsMenuItems() {
    // 路由
    const router = useRouter();

    // t - 多语言
    const { t, i18n } = useTranslation('common');
    // 获取主题状态
    const { isDayMode } = useThemeMode();
  
    // 资产 - 2版
    const itemsFunding = [
        {
            key: '1',
            label: (
                <MenuItemLabel
                    src={isDayMode
                        ? "/images/home_menu/icon_coin_line.png"
                        : "/images/home_menu/icon_coin_line_dark.png"}
                    h5Text={t('router.myAssets')} //'我的资产'
                    spanText=""
                    onClick={()=>{
                        router.push(ROUTER_KEY_ASSETS.ACCOUNT)
                    }}
                />
            ),
        },
        // {
        //     key: '2',
        //     label: (
        //         <MenuItemLabel
        //             src={isDayMode
        //                 ? "/images/home_menu/icon_deposit.png"
        //                 : "/images/home_menu/icon_deposit_dark.png"}
        //             h5Text={t('router.recharge')} //'充币'
        //             spanText=""
        //             onClick={()=>{
        //                 router.push(ROUTER_KEY_ASSETS.TOP_UP)
        //             }}
        //         />
        //     ),
        // },
        {
            key: '3',
            label: (
                <MenuItemLabel
                    src={isDayMode
                        ? "/images/home_menu/icon_cash.png"
                        : "/images/home_menu/icon_cash_dark.png"}
                    h5Text={t('router.withdraw')} //'提币'
                    spanText=""
                    onClick={()=>{
                        router.push(ROUTER_KEY_ASSETS.WITHDRAW_MONEY)
                    }}
                />
            ),
        },
        {
            key: '4',
            label: (
                <MenuItemLabel
                    src={isDayMode
                        ? "/images/home_menu/icon_bill_line.png"
                        : "/images/home_menu/icon_bill_line_dark.png"}
                    h5Text={t('router.bill')} //'账单明细'
                    spanText=""
                    onClick={()=>{
                        router.push(ROUTER_KEY_ASSETS.BILL)
                    }}
                />
            ),
        }
    ];

    return (
        <>
            <Dropdown
                menu={{
                    // items,
                    items: itemsFunding
                }}
                trigger={['click']}
                className={styles.dropDownList}
                overlayStyle={{ top: '80px', width: '180px' }}
            >
                {/* <a onClick={(e) => e.preventDefault()} className={styles.iconCursor}>
                                                        <Space style={{ columnGap: '3px' }}>
                                                            <img src="/images/home_menu/icon_wallet_line.png" className={styles.iconCursor} />
                                                        </Space>
                                                    </a> */}
                <Space style={{ columnGap: '3px' }}>
                    {/* <img onClick={(e) => e.preventDefault()} src="/images/home_menu/icon_wallet_line.png" className={styles.iconCursor} /> */}
                    <Image
                        onClick={(e) => e.preventDefault()}
                        src="/images/home_menu/icon_wallet_line.png"
                        className={styles.iconCursor}
                        alt=""
                        width={20}  // 必须指定宽度
                        height={20} // 必须指定高度
                    />
                </Space>
            </Dropdown>
        </>
    )
}
