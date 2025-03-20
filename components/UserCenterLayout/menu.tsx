/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, ConfigProvider } from 'antd';
import type { MenuProps } from 'antd';
import { Iconify } from '@/components/icon'
import { useRouter } from 'next/router';
import styles from "./styles/menu.module.css"
import debounce from 'lodash/debounce';

type MenuItem = Required<MenuProps>['items'][number];

// 根据窗口宽度确定折叠状态
const getWidthBasedCollapsedState = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1208;
};

const UserCenterSidebar = () => {
    const router = useRouter();

    // 记录当前路径，用于检测路由变化
    const currentPathRef = useRef(router.pathname);

    // 标记是否刚刚完成路由切换
    const justCompletedRouteChangeRef = useRef(true);

    // 初始化时，优先使用保存的状态，如果没有则根据窗口宽度决定
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;

        const savedState = sessionStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
            return JSON.parse(savedState);
        }

        return getWidthBasedCollapsedState();
    });

    // 菜单项定义
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
    ];

    // 处理选中状态的逻辑
    const getSelectedKey = () => {
        const currentPath = router.pathname;
        const parentPaths = [
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

    // 保存折叠状态到sessionStorage
    const saveCollapsedState = useCallback((value: boolean) => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('sidebarCollapsed', JSON.stringify(value));
        }
    }, []);

    // 更新折叠状态
    const updateCollapsed = useCallback((value: boolean) => {
        setCollapsed(value);
        saveCollapsedState(value);
    }, [saveCollapsedState]);

    // 选中项再次点击
    const handleMenuClick = (path: string) => {
        const currentPath = router.pathname;

        // 在路由切换前保存当前折叠状态
        saveCollapsedState(collapsed);

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

    // 检查窗口宽度并更新collapsed状态
    const checkWindowWidth = useCallback(() => {
        // 只有在不是刚刚完成路由切换的情况下，才根据窗口宽度自动调整
        if (!justCompletedRouteChangeRef.current) {
            const shouldCollapse = getWidthBasedCollapsedState();
            if (collapsed !== shouldCollapse) {
                console.log('Window width changed, updating collapsed state:', shouldCollapse);
                updateCollapsed(shouldCollapse);
            }
        }
    }, [collapsed, updateCollapsed]);

    // 使用防抖函数来减少不必要的更新
    const debouncedCheckWidth = useCallback(
        debounce(() => {
            checkWindowWidth();
        }, 100),
        [checkWindowWidth]
    );

    // 监听窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            debouncedCheckWidth();
        };

        // 添加监听器
        window.addEventListener('resize', handleResize);

        // 初始检查
        setTimeout(() => {
            justCompletedRouteChangeRef.current = false;
            checkWindowWidth();
        }, 500);

        // 清理监听器
        return () => {
            window.removeEventListener('resize', handleResize);
            debouncedCheckWidth.cancel();
        };
    }, [debouncedCheckWidth, checkWindowWidth]);

    // 监听路由变化
    useEffect(() => {
        const handleRouteChangeStart = () => {
            // 路由变化开始时保存当前状态
            saveCollapsedState(collapsed);
        };

        const handleRouteChangeComplete = () => {
            // 标记刚刚完成路由切换
            justCompletedRouteChangeRef.current = true;

            // 延迟重置标记，允许在短暂延迟后根据窗口大小自动调整
            setTimeout(() => {
                justCompletedRouteChangeRef.current = false;
                // 在重置标记后检查窗口大小
                checkWindowWidth();
            }, 500);
        };

        router.events.on('routeChangeStart', handleRouteChangeStart);
        router.events.on('routeChangeComplete', handleRouteChangeComplete);

        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart);
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, [router.events, collapsed, saveCollapsedState, checkWindowWidth]);

    // 检测路由变化并应用保存的状态
    useEffect(() => {
        // 如果路径发生变化，说明是新页面
        if (currentPathRef.current !== router.pathname) {
            // 更新路径引用
            currentPathRef.current = router.pathname;

            // 从sessionStorage获取保存的状态
            const savedState = sessionStorage.getItem('sidebarCollapsed');
            if (savedState !== null) {
                setCollapsed(JSON.parse(savedState));
            }

            // 标记刚刚完成路由切换
            justCompletedRouteChangeRef.current = true;

            // 延迟重置标记，允许在短暂延迟后根据窗口大小自动调整
            setTimeout(() => {
                justCompletedRouteChangeRef.current = false;
                // 在重置标记后检查窗口大小
                checkWindowWidth();
            }, 500);
        }
    }, [router.pathname, checkWindowWidth]);

    // 添加调试日志
    useEffect(() => {
        console.log('Collapsed state changed:', collapsed);
    }, [collapsed]);

    return (
        <div className={styles.sidebar_container} style={{
            width: collapsed ? '68px' : '260px',
            transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s'
        }}>
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
                    className={`${styles.custom_menu} custom-menu`}
                    inlineCollapsed={collapsed}
                    theme="dark"
                />
            </ConfigProvider>
        </div>
    );
};

export default UserCenterSidebar;