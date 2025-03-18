import React from 'react';
import MenuItemLabel from '@/components/homeMenu/HomeMenuLabel';
import { MenuListItem } from '@/type/types';

// 检查字符串是否为空或只包含空格
export const isEmptyOrWhitespace = (str: string | null | undefined): boolean => {
    return str === null || str === undefined || str.trim() === '';
};

// 处理菜单数据
export const processMenuItems = (menuItems: any[]): any[] => {
    if (!menuItems || !Array.isArray(menuItems)) {
        return [];
    }

    return menuItems.filter(item => {
        // 条件1: 如果menuName为null或为空或是空格，则不渲染
        if (isEmptyOrWhitespace(item.menuName)) {
            return false;
        }

        // 处理子菜单（如果有）
        if (item.children && Array.isArray(item.children)) {
            item.children = processMenuItems(item.children);
        }

        return true;
    }).map(item => {
        // 创建一个新对象，避免直接修改原始数据
        const processedItem = { ...item };

        // 条件2: 如果menuName有效但menuViceName为空，则不给spanText赋值menuViceName
        if (!isEmptyOrWhitespace(processedItem.menuName) && isEmptyOrWhitespace(processedItem.menuViceName)) {
            processedItem.spanText = ''; // 不赋值menuViceName
        } else {
            processedItem.spanText = processedItem.menuViceName;
        }

        return processedItem;
    });
};

// 格式化菜单 - 接收 isDayMode 作为参数，而不是使用钩子
export const formatMenus = (menuData: any[], isDayMode: boolean): MenuListItem[] => {
    return menuData.map(menu => {
        // 检查图片 URL 是否为本地路径
        const getImagePath = (url: string, isDay: boolean) => {
            // 如果没有URL，返回默认图片
            if (!url) return '/images/home_menu/Avatar.png';

            try {
                // 如果是完整的 URL，直接返回
                if (url.startsWith('http')) {
                    return url;
                }

                // 如果已经是本地路径，检查格式是否正确
                if (!url.startsWith('/')) {
                    // 如果不是以/开头，添加/
                    return `/${url}`;
                }

                // 返回有效的本地路径
                return url;
            } catch (error) {
                console.error('处理图片路径时出错:', error);
                return '/images/home_menu/Avatar.png'; // 出错时返回默认图片
            }
        };

        // 基本菜单项结构
        const menuItem = {
            key: String(menu.id),
            title: menu.menuName,
            linkHref: menu.accessPath,
            items: [] as any[]
        };

        // 处理二级菜单
        if (menu.children && menu.children.length > 0) {
            menuItem.items = menu.children.map((child: any) => {
                // 二级菜单项
                const secondLevelItem: {
                    key: string;
                    type: string;
                    label: React.ReactNode;
                    children?: any[]
                } = {
                    key: String(child.id),
                    type: child.typeId === 1 ? 'group' : (child.typeId === 2 ? 'item' : 'divider'),
                    label: (
                        <MenuItemLabel
                            src={getImagePath(isDayMode ? child.iconUrlDay : child.iconUrlNight, isDayMode)}
                            h5Text={child.menuName || ''}
                            spanText={child.menuViceName || ''}
                        />
                    )
                };

                // 处理三级菜单
                if (child.children && child.children.length > 0) {
                    secondLevelItem.children = child.children.map((grandChild: any) => ({
                        key: String(grandChild.id),
                        type: grandChild.typeId === 1 ? 'group' : (grandChild.typeId === 2 ? 'item' : 'divider'),
                        label: (
                            <MenuItemLabel
                                src={getImagePath(isDayMode ? grandChild.iconUrlDay : grandChild.iconUrlNight, isDayMode)}
                                h5Text={grandChild.menuName || ''}
                                spanText={grandChild.menuViceName || ''}
                            />
                        )
                    }));
                }

                return secondLevelItem;
            });
        } else {
            // 如果没有子菜单，创建一个默认项
            menuItem.items = [{
                key: String(menu.id),
                type: menu.typeId === 1 ? 'group' : (menu.typeId === 2 ? 'item' : 'divider'),
                label: (
                    <MenuItemLabel
                        src={getImagePath(isDayMode ? menu.iconUrlDay : menu.iconUrlNight, isDayMode)}
                        h5Text={menu.menuName || ''}
                        spanText={menu.menuViceName || ''}
                    />
                ),
            }];
        }

        return menuItem;
    });
};

// 新增格式化函数，按 HomeMenuAdaptiveItems 的 items 数据结构封装
export const formatAdaptiveMenus = (menuData: any[]): MenuListItem[] => {
    return menuData.map(menu => {
        return {
            key: String(menu.id),
            title: menu.menuName || menu.menuDescription, // 根据实际需求选择字段
            linkHref: menu.accessPath,
            items: (menu.children || []).length > 0
                ? menu.children.map((child: any) => ({
                    key: String(child.id),
                    type: 'item',
                    label: (
                        <MenuItemLabel
                            src={child.iconUrlDay || "/images/home_menu/Avatar.png"}
                            h5Text={child.menuName || child.menuDescription}
                            spanText={child.menuViceName || ''}
                        />
                    )
                }))
                : [{
                    key: String(menu.id),
                    type: 'item',
                    label: (
                        <MenuItemLabel
                            src="/images/home_menu/Avatar.png"
                            h5Text={menu.menuName || menu.menuDescription}
                            spanText={menu.menuViceName || ''}
                        />
                    )
                }]
        };
    });
};