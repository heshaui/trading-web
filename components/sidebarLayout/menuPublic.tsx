import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Menu, ConfigProvider } from 'antd';
import type { MenuProps } from 'antd';
import { Iconify } from '@/components/icon'
import { useRouter } from 'next/router';
import styles from "./styles/menu.module.css"
import debounce from 'lodash/debounce';
import { useThemeMode } from '@/hooks/useThemeMode';

type MenuItem = Required<MenuProps>['items'][number];

// 根据窗口宽度确定折叠状态
const getWidthBasedCollapsedState = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1208;
};
interface SidebarProps {
    menuItems: MenuItem[];
}

const UserCenterSidebar = ({menuItems}: SidebarProps) => {
    const router = useRouter();
    const { isDayMode } = useThemeMode(); // 使用 hook

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

    // 处理菜单项，为每个项添加onClick事件
    const processedMenuItems = useMemo(() => {
        if (!menuItems || !Array.isArray(menuItems)) return [];
        
        return menuItems.map(item => {
            if (!item) return item;
            
            const key = item.key?.toString();
            if (!key) return item;
            
            // 添加onClick事件，使用key作为参数
            return {
                ...item,
                onClick: () => handleMenuClick(key)
            };
        });
    }, [menuItems]); // 依赖项中不包含handleMenuClick，因为它会导致循环依赖

    // 处理选中状态的逻辑
    const getSelectedKey = () => {
        const currentPath = router.pathname;
        
        // 获取所有菜单项的路径
        const allPaths = menuItems
            .map(item => item?.key?.toString())
            .filter(Boolean) as string[];
        
        if (allPaths.length === 0) return currentPath;
        
        // 找出共同的前缀路径
        let prefixPath = '';
        
        // 检查是否存在共同前缀
        if (allPaths.length > 1) {
            // 获取第一个路径的各部分
            const parts = allPaths[0].split('/').filter(Boolean);
            
            // 逐级检查是否所有路径都有相同的前缀
            for (let i = 1; i <= parts.length; i++) {
                const potentialPrefix = '/' + parts.slice(0, i).join('/');
                
                // 检查所有路径是否都以这个前缀开头
                const allHavePrefix = allPaths.every(path => 
                    path === potentialPrefix || path.startsWith(potentialPrefix + '/')
                );
                
                if (allHavePrefix) {
                    prefixPath = potentialPrefix;
                } else {
                    break;
                }
            }
        }
        
        // 检查当前路径是否匹配任何菜单项
        for (const path of allPaths) {
            // 跳过前缀路径
            if (path === prefixPath) continue;
            
            // 检查当前路径是否匹配或是子路径
            if (currentPath === path || currentPath.startsWith(path + '/')) {
                return path;
            }
        }
        
        // 如果没有匹配的菜单项，但匹配前缀路径，则返回前缀路径
        if (prefixPath && (currentPath === prefixPath || currentPath.startsWith(prefixPath + '/'))) {
            return prefixPath;
        }
        
        // 如果都不匹配，返回当前路径
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

        // 特殊处理根路径
        if (path === router.basePath) {
            // 只有当当前不在根路径精确路径时才跳转
            if (currentPath !== router.basePath) {
                router.push(path);
            }
            return;
        }

        // 如果当前路径已经是目标路径，不进行跳转
        if (currentPath === path) {
            return;
        }

        // 执行路由跳转
        router.push(path);
    };

    // 检查窗口宽度并更新折叠状态
    const checkWindowWidth = useCallback(() => {
        // 如果刚刚完成路由切换，不进行自动调整
        if (justCompletedRouteChangeRef.current) {
            return;
        }

        const shouldCollapse = getWidthBasedCollapsedState();
        if (collapsed !== shouldCollapse) {
            updateCollapsed(shouldCollapse);
        }
    }, [collapsed, updateCollapsed]);

    // 创建防抖版本的检查函数
    const debouncedCheckWidth = useCallback(
        debounce(checkWindowWidth, 200),
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
                        // padding: 120,
                    },
                }}
            >
                <Menu
                    selectedKeys={[getSelectedKey()]}
                    mode="inline"
                    items={processedMenuItems}
                    className={`${styles.custom_menu} custom-menu`}
                    inlineCollapsed={collapsed}
                    theme="dark"
                />
            </ConfigProvider>
        </div>
    );
};

export default UserCenterSidebar;