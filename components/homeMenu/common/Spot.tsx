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
import { ROUTER_KEY_SPOT } from '@/config/apiConfig';
export default function SpotMenuItems() {
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
                        ? "/images/home_menu/icon_spot_day.png"
                        : "/images/home_menu/icon_spot_dark.png"}
                    h5Text={t('router.spotTrade')} //'现货交易'
                    spanText=""
                    onClick={() => {
                        router.push(ROUTER_KEY_SPOT.INDEX)
                    }}
                />
            ),
        },
        {
            key: '2',
            label: (
                <MenuItemLabel
                    src={isDayMode
                        ? "/images/home_menu/icon_bill_line.png"
                        : "/images/home_menu/icon_bill_line_dark.png"}
                    h5Text={t('router.spotOrder')} //'现货订单'
                    spanText=""
                    onClick={() => {
                        router.push(ROUTER_KEY_SPOT.SPOT_ORDER)
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
                        alt=""
                        width={20}  // 必须指定宽度
                        height={20} // 必须指定高度
                        src="/images/home_menu/icon_upload_line.png"
                        className={styles.iconCursor}
                    />
                </Space>
            </Dropdown>
        </>
    )
}
