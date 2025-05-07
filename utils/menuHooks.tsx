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
    // 获取图标路径
    const getImagePath = (path: string | null, isDayMode: boolean) => {
        if (!path) {
            // 返回默认图标
            return "/images/home_menu/Avatar.png";
        }
        if (isDayMode) {
            // 日间模式使用原始图标
            return path;
        } else {
            // 夜间模式，使用夜间图标
            return path;
        }
    };
    

    // 递归处理菜单项及其子项
    const processMenuItem = (menuItem: any): any => {
        // 如果是typeId=1（group类型）或者是带有子菜单且accessPath为null的菜单项，则将其处理为分组标题
        if (menuItem.typeId === 1 || (menuItem.children && menuItem.children.length > 0 && menuItem.accessPath === null)) {
            // 组标题
            const groupHeader = {
                key: `group_${String(menuItem.id)}`,
                type: 'group',
                label: menuItem.menuName || ''
            };

            // 如果有子菜单，递归处理每个子项
            if (menuItem.children && menuItem.children.length > 0) {
                // 将子菜单直接作为同级项返回，而非作为组的子项
                const childItems = menuItem.children.map((child: any) => processMenuItem(child)).flat();
                return [groupHeader, ...childItems];
            }

            // 如果没有子项，只返回组标题
            return [groupHeader];
        }

        // 如果是普通菜单项
        const result: any = {
            key: String(menuItem.id),
            type: menuItem.typeId === 2 ? 'item' : 'divider',
            label: (
                <MenuItemLabel
                    src={getImagePath(isDayMode ? menuItem.iconUrlDay : menuItem.iconUrlNight, isDayMode)}
                    h5Text={menuItem.menuName || ''}
                    spanText={menuItem.menuViceName || ''}
                />
            )
        };

        // 如果有子菜单，递归处理
        if (menuItem.children && menuItem.children.length > 0) {
            // 重要: 使用children属性存储子菜单项，而不是展平子项
            // Ant Design Menu支持多级嵌套菜单，但需要正确的属性嵌套
            result.children = menuItem.children.map((child: any) => {
                // 对于子菜单中的group类型特殊处理
                if (child.typeId === 1) {
                    return {
                        key: String(child.id),
                        type: 'group',
                        label: child.menuName || '',
                        // 如果该group有子项，递归处理子项
                        children: child.children && child.children.length > 0 ?
                            child.children.map((subChild: any) => processMenuItem(subChild)).flat() :
                            undefined
                    };
                }

                // 为普通子菜单项创建标准的菜单项结构
                const childItem: any = {
                    key: String(child.id),
                    type: child.typeId === 2 ? 'item' : 'divider',
                    label: (
                        <MenuItemLabel
                            src={getImagePath(isDayMode ? child.iconUrlDay : child.iconUrlNight, isDayMode)}
                            h5Text={child.menuName || ''}
                            spanText={child.menuViceName || ''}
                        />
                    )
                };

                // 继续递归处理更深层级的子菜单
                if (child.children && child.children.length > 0) {
                    childItem.children = child.children.map((grandChild: any) => {
                        return {
                            key: String(grandChild.id),
                            type: grandChild.typeId === 2 ? 'item' : 'divider',
                            label: (
                                <MenuItemLabel
                                    src={getImagePath(isDayMode ? grandChild.iconUrlDay : grandChild.iconUrlNight, isDayMode)}
                                    h5Text={grandChild.menuName || ''}
                                    spanText={grandChild.menuViceName || ''}
                                />
                            )
                        };
                    });
                }

                return childItem;
            });
        }

        return result;
    };

    // 处理所有一级菜单项
    return menuData.map(menu => {
        // 创建一级菜单项
        const menuItem: MenuListItem = {
            key: String(menu.id),
            title: menu.menuName || '',
            linkHref: menu.accessPath || '',
            widthSet: undefined,
            items: [],
        };

        // 如果完全没有子菜单，创建一个默认的子项
        if (!menu.children || menu.children.length === 0) {
            if (menu.typeId === 1) {
                // 对于typeId=1，显示为组标签
                menuItem.items = [
                    {
                        key: `group_${String(menu.id)}`,
                        type: 'group',
                        label: menu.menuName || ''
                    },
                ];
            }
        } else {
            // 如果有子菜单，递归处理所有子项
            const processedItems = menu.children.map((child: any) => processMenuItem(child)).flat();
            menuItem.items = processedItems;
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

// 新增格式化函数，按 HomeMenuAdaptiveItems 的 items 数据结构封装
