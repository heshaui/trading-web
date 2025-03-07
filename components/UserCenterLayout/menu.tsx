/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { Menu, ConfigProvider } from 'antd';
import type { MenuProps } from 'antd';
import { Iconify } from '@/components/icon'
import { useRouter } from 'next/router';
import styles from "./styles/menu.module.css"
// import debounce from 'lodash/debounce';
import debounce from 'lodash/debounce';

type MenuItem = Required<MenuProps>['items'][number];
const UserCenterSidebar = () => {
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const items: MenuItem[] = [
        {
            key: '/userCenter',
            icon: <Iconify icon="pixelarticons:dashboard" size={24} className={`mr-2`} />,
            label: '总览',
            onClick: () => handleMenuClick('/userCenter')
        },
        {
            key: '/userCenter/safeCenter',
            icon: <Iconify icon="mingcute:safety-certificate-line" size={24} className={`mr-2`} />,
            label: '安全中心',
            onClick: () => handleMenuClick('/userCenter/safeCenter')
        },
        {
            key: '/userCenter/identity',
            icon: <Iconify icon="mingcute:idcard-line" size={24} className={`mr-2`} />,
            label: '身份认证',
            onClick: () => handleMenuClick('/userCenter/identity')
        },
        {
            key: '/userCenter/userSettings',
            icon: <Iconify icon="icon-park-outline:setting-two" size={24} className={`mr-2`} />,
            label: '用户设置',
            onClick: () => handleMenuClick('/userCenter/userSettings')
        },
        // mingcute:invite-line //邀请
        // icon-park:api-app //api
        // mingcute:location-line //地址
    ]
    // 处理选中状态的逻辑
    // 处理选中状态的逻辑
    const getSelectedKey = () => {
        // const currentPath = router.pathname;
        // if (currentPath.startsWith('/userCenter/safeCenter')) {
        //     return '/userCenter/safeCenter';
        // }
        // return currentPath;
        const currentPath = router.pathname;
        const parentPaths = [
            // '/userCenter',
            '/userCenter/safeCenter',
            '/userCenter/identity',
            '/userCenter/userSettings'
        ];
        for (const path of parentPaths) {
            if (currentPath.startsWith(path)) {
                return path;
            }
        }
        return currentPath;
    };
    // 选中项再次点击
    const handleMenuClick = (path: string) => {
        const currentPath = router.pathname;
        // console.log(currentPath,1234);

        if (path === '/userCenter') {
            router.push(path);
        } else if (currentPath === path || currentPath.startsWith(path)) {
            // 如果当前路径和要跳转的路径相同或者是其子路径，则不进行跳转
            return;
        }
        router.push(path);
    };
    // 使用 useCallback 来记忆防抖函数
    const debouncedCheckWidth = useCallback(
        debounce(() => {
            setCollapsed(window.innerWidth < 1208);
        }, 200),  // 200ms 延迟
        []
    );

    useEffect(() => {
        // 初始检查
        debouncedCheckWidth();

        // 添加监听器
        window.addEventListener('resize', debouncedCheckWidth);

        // 清理监听器
        return () => {
            window.removeEventListener('resize', debouncedCheckWidth);
            debouncedCheckWidth.cancel();  // 取消未执行的防抖函数
        };
    }, [debouncedCheckWidth]);
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
                        itemHeight: 50,
                        colorSplit: "#FFFFFF00",
                        collapsedWidth: 68,
                        itemHoverBg: 'var(--bgc-color)', //白天模式下鼠标滑过bg
                        darkItemHoverBg: 'var(--bgc-color)', //黑夜模式下鼠标滑过bg
                        darkItemHoverColor: "rgba(255, 95, 31, 0.5)",
                        // darkItemBg:"#0C0D0C",
                        // itemBg:"#FFFFFF"
                        darkItemBg: "var(--background9)",
                        itemBg: "var(--background9)",
                        darkItemColor: "var(--text-color7)",
                        darkItemSelectedColor: "var(--text-color3)"
                    },
                },
                token: {
                    padding: 120,
                },
            }}
        >
            <Menu
                selectedKeys={[getSelectedKey()]}
                mode="inline"
                items={items}
                // style={{ width: '15%', height: '100%',minWidth:"240px" }}
                className={`${styles.custom_menu} custom-menu`}
                inlineCollapsed={collapsed}
                theme="dark"
            />
        </ConfigProvider>
    </>
    );
};

export default UserCenterSidebar;