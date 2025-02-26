import React from 'react';
import Link from 'next/link';
import { Menu, ConfigProvider } from 'antd';
import type { MenuProps } from 'antd';
import { Iconify } from '@/components/icon'
import { useRouter } from 'next/router';
import styles from "./styles/menu.module.css"

type MenuItem = Required<MenuProps>['items'][number];
const UserCenterSidebar = () => {
    const router = useRouter();
    const items: MenuItem[] = [
        {
            key: '/userCenter',
            icon: <Iconify icon="pixelarticons:dashboard" size={24} className={`mr-2`} />,
            label: '总览',
            onClick: () => router.push('/userCenter')
        },
        {
            key: '/userCenter/safeCenter',
            icon: <Iconify icon="mingcute:safety-certificate-line" size={24} className={`mr-2`} />,
            label: '安全中心',
            onClick: () => router.push('/userCenter/safeCenter')
        },
        {
            key: '/userCenter/identity',
            icon: <Iconify icon="mingcute:idcard-line" size={24} className={`mr-2`} />,
            label: '身份认证',
            onClick: () => router.push('/userCenter/identity')
        },
        {
            key: '/userCenter/userSettings',
            icon: <Iconify icon="icon-park-outline:setting-two" size={24} className={`mr-2`} />,
            label: '用户设置',
            onClick: () => router.push('/userCenter/userSettings')
        },
        // mingcute:invite-line //邀请
        // icon-park:api-app //api
        // mingcute:location-line //地址
    ]
    return (<>
        {/* <nav className="sidebar">
            <ul>
                <li><Link href="/userCenter">总揽</Link></li>
                <li><Link href="/userCenter/safeCenter">安全中心</Link></li>
                <li><Link href="/userCenter/identity">身份认证</Link></li>
                <li><Link href="/userCenter/userSettings">用户设置</Link></li>
            </ul>
            
        </nav> */}

        <ConfigProvider
            theme={{
                components: {
                    Menu: {
                        darkItemBg:"#0C0D0C",
                        itemHeight:50,
                        colorSplit:"#FFFFFF00",
                        // itemBorderRadius:50,
                        /* 这里是你的组件 token */

                        // itemSelectedBg: "#FF5F1F55",
                        // itemSelectedColor: '#FF5F1F',
                        // itemSelectedBg: "linear-gradient(90deg, rgba(255, 95, 31, 0) 0%, rgba(255, 95, 31, 0.5) 100%)",
                        // itemColor: '#A4A5AC',
                        // itemHoverBg: '#FF5F1F',
                        // itemSelectedBg: '#FF5F1F',
                        // itemHoverColor: '#FFFFFF',
                        // itemSelectedColor: '#FFFFFF',
                        // itemMarginInline: 20,
                        // itemMarginBlock: 0,
                        // itemBorderRadius: 10,
                    },
                },
                token: {
                    colorPrimary: '#FF5F1F',
                },
            }}
        >
            <Menu
                selectedKeys={[router.pathname]}
                mode="inline"
                items={items}
                style={{ width: '15%', height: '100%',minWidth:"240px" }}
                className={`${styles.custom_menu} custom-menu`}
            />
        </ConfigProvider>
    </>
    );
};

export default UserCenterSidebar;