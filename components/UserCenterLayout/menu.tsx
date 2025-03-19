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
    
    // 使用localStorage来持久化collapsed状态
    const [collapsed, setCollapsed] = useState(() => {
        // 尝试从localStorage获取状态，如果没有则根据窗口宽度初始化
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebarCollapsed');
            if (savedState !== null) {
                return JSON.parse(savedState);
            }
            return window.innerWidth < 1208;
        }
        return false;
    });

    // 更新collapsed状态的函数，同时保存到localStorage
    const updateCollapsed = useCallback((value: boolean) => {
        setCollapsed(value);
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', JSON.stringify(value));
        }
    }, []);
    
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
        
        // 特殊处理根路径 /userCenter
        if (path === '/userCenter') {
            // 只有当当前不在 /userCenter 精确路径时才跳转
            if (currentPath !== '/userCenter') {
                router.push(path, undefined, { shallow: true })
                    .catch(err => console.error('Navigation failed:', err));
            }
            return;
        }
        
        // 处理其他路径
        if (currentPath === path || currentPath.startsWith(path + '/')) {
            // 如果当前路径和要跳转的路径相同或者是其子路径，则不进行跳转
            return;
        }

        // 使用 router.push 的回调确保导航完成
        router.push(path, undefined, { shallow: true })
            .catch(err => console.error('Navigation failed:', err));
    };
    
    // 使用 useCallback 来记忆防抖函数
    const debouncedCheckWidth = useCallback(
        debounce(() => {
            const shouldCollapse = window.innerWidth < 1208;
            updateCollapsed(shouldCollapse);
        }, 200),  // 200ms 延迟
        [updateCollapsed]
    );

    // 只在客户端初始化时和窗口大小变化时执行
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // 添加监听器
            window.addEventListener('resize', debouncedCheckWidth);

            // 清理监听器
            return () => {
                window.removeEventListener('resize', debouncedCheckWidth);
                debouncedCheckWidth.cancel();  // 取消未执行的防抖函数
            };
        }
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