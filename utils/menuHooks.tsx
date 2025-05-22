import React from 'react';
import MenuItemLabel from '@/components/homeMenu/HomeMenuLabel';
import { MenuListItem } from '@/type/types';

// 定义菜单项类型
interface MenuItem {
  id: number | string;
  menuName: string | null;
  menuViceName?: string | null;
  menuDescription?: string;
  typeId: number;
  accessPath?: string | null;
  iconUrlDay?: string | null;
  iconUrlNight?: string | null;
  displayStatus?: number;
  children?: MenuItem[];
  [key: string]: any;
}

// 定义格式化的菜单项类型
interface FormattedMenuItem {
  key: string;
  type: 'group' | 'item' | 'divider';
  label: React.ReactNode;
  children?: FormattedMenuItem[];
  [key: string]: any;
}

/**
 * 检查字符串是否为空或只包含空格
 * @param str 要检查的字符串
 * @returns 如果字符串为null、undefined或只包含空格则返回true
 */
export const isEmptyOrWhitespace = (str: string | null | undefined): boolean => {
    return str === null || str === undefined || str.trim() === '';
};

/**
 * 处理菜单数据
 * @param menuItems 原始菜单项数组
 * @returns 处理后的菜单项数组
 */
/**
 * 处理菜单数据
 * @param menuItems 原始菜单项数组
 * @returns 处理后的菜单项数组
 */
export const processMenuItems = (menuItems: MenuItem[]): MenuItem[] => {
    if (!menuItems || !Array.isArray(menuItems)) {
        // console.log('processMenuItems: 输入不是有效数组', menuItems);
        return [];
    }

    // 首先处理子菜单
    const processedItems = menuItems.map(item => {
        // 创建新对象，避免直接修改原始数据
        const newItem = { ...item };
        
        // 递归处理子菜单
        if (newItem.children?.length) {
            newItem.children = processMenuItems(newItem.children);
        }
        
        return newItem;
    });

    // 然后过滤掉不需要的菜单项
    const filteredItems = processedItems.filter(item => {
        // 如果 displayStatus 为 0，则不显示
        if (item.displayStatus === 0) {
            // console.log(`过滤掉 displayStatus=0 的菜单项:`, item);
            return false;
        }
        
        // 对于分组类型(typeId=1)且没有访问路径的菜单，只要有子菜单就保留
        if (item.typeId === 1 && !item.accessPath) {
            const hasValidChildren = item.children?.some(child => 
                child.displayStatus !== 0 && !isEmptyOrWhitespace(child.menuName)
            );
            if (hasValidChildren) {
                return true;
            }
            // console.log(`过滤掉无效分组:`, item);
            return false;
        }
        
        // 对于普通菜单项，检查 menuName 是否有效
        if (isEmptyOrWhitespace(item.menuName)) {
            // console.log(`过滤掉 menuName 为空的菜单项:`, item);
            return false;
        }
        
        return true;
    });
    
    // console.log('处理后的菜单项:', filteredItems);
    return filteredItems.map(item => {
        const processedItem = { ...item };
        // 设置 spanText
        processedItem.spanText = isEmptyOrWhitespace(processedItem.menuViceName) 
            ? '' 
            : processedItem.menuViceName;
        return processedItem;
    });
};

/**
 * 格式化菜单数据为UI可用的格式
 * @param menuData 原始菜单数据
 * @param isDayMode 是否为日间模式
 * @returns 格式化后的菜单项数组
 */
export const formatMenus = (menuData: MenuItem[], isDayMode: boolean): MenuListItem[] => {
    /**
     * 获取图标路径
     * @param path 图标路径
     * @param isDayMode 是否为日间模式
     * @returns 处理后的图标路径
     */
    const getImagePath = (path: string | null, isDayMode: boolean): string => {
        if (!path) {
            return "/images/home_menu/Avatar.png";
        }
        // 如果是日间模式，使用日间图标，否则使用夜间图标
        // 注意：这里假设夜间图标的路径与日间不同，需要根据实际项目结构调整
        return isDayMode ? path : path.replace(/(\.\w+)$/, '_night$1');
    };
    

    /**
     * 递归处理菜单项及其子项
     * @param menuItem 要处理的菜单项
     * @returns 格式化后的菜单项数组
     */
    const processMenuItem = (menuItem: MenuItem): FormattedMenuItem[] => {
        // 如果是分组类型或者是带有子菜单且没有访问路径的菜单项，则处理为分组标题
        if (menuItem.typeId === 1 || (menuItem.children?.length && !menuItem.accessPath)) {
            const groupHeader: FormattedMenuItem = {
                key: `group_${menuItem.id}`,
                type: 'group',
                label: menuItem.menuName || ''
            };

            // 处理子菜单项
            if (menuItem.children?.length) {
                groupHeader.children = menuItem.children
                    .map(child => processMenuItem(child))
                    .flat();
            }

            // 如果父菜单有accessPath，也添加一个可点击的菜单项
            const result: FormattedMenuItem[] = [];
            if (menuItem.accessPath) {
                result.push({
                    key: `item_${menuItem.id}`,
                    type: 'item' as const,
                    label: (
                        <MenuItemLabel
                            src={getImagePath((isDayMode ? menuItem.iconUrlDay : menuItem.iconUrlNight) ?? null, isDayMode)}
                            h5Text={menuItem.menuName || ''}
                            spanText={menuItem.menuViceName || ''}
                        />
                    ),
                    accessPath: menuItem.accessPath
                });
            }
            
            result.push(groupHeader);
            return result;
        }

        // 创建菜单项
        const result: FormattedMenuItem[] = [];
        const menuItemObj: FormattedMenuItem = {
            key: String(menuItem.id),
            type: menuItem.typeId === 2 ? 'item' : 'divider',
            label: (
                <MenuItemLabel
                    src={getImagePath((isDayMode ? menuItem.iconUrlDay : menuItem.iconUrlNight) ?? null, isDayMode)}
                    h5Text={menuItem.menuName || ''}
                    spanText={menuItem.menuViceName || ''}
                />
            ),
            accessPath: menuItem.accessPath || undefined
        };
        
        // 处理子菜单
        if (menuItem.children?.length) {
            menuItemObj.children = menuItem.children.map(child => {
                // 处理子菜单中的分组类型
                if (child.typeId === 1) {
                    const groupItem: FormattedMenuItem = {
                        key: String(child.id),
                        type: 'group',
                        label: child.menuName || '',
                        children: child.children?.map(subChild => ({
                            key: String(subChild.id),
                            type: subChild.typeId === 2 ? 'item' : 'divider',
                            label: (
                                <MenuItemLabel
                                    src={getImagePath((isDayMode ? subChild.iconUrlDay : subChild.iconUrlNight) ?? null, isDayMode)}
                                    h5Text={subChild.menuName || ''}
                                    spanText={subChild.menuViceName || ''}
                                />
                            ),
                            accessPath: subChild.accessPath || undefined
                        })) || []
                    };
                    return groupItem;
                }
                // 普通子菜单项
                return {
                    key: String(child.id),
                    type: child.typeId === 2 ? 'item' : 'divider',
                    label: (
                        <MenuItemLabel
                            src={getImagePath((isDayMode ? child.iconUrlDay : child.iconUrlNight) ?? null, isDayMode)}
                            h5Text={child.menuName || ''}
                            spanText={child.menuViceName || ''}
                        />
                    ),
                    accessPath: child.accessPath || undefined
                };
            });
        }
        
        result.push(menuItemObj);
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

        if (!menu.children?.length) {
            // 对于没有子菜单的分组类型，创建一个组标签
            if (menu.typeId === 1) {
                menuItem.items = [{
                    key: `group_${menu.id}`,
                    type: 'group' as const,
                    label: menu.menuName || ''
                }];
            }
        } else {
            // 处理子菜单项
            const processedItems = menu.children
                .map(child => processMenuItem(child))
                .flat()
                .filter(Boolean); // 过滤掉可能的空项
            menuItem.items = processedItems;
        }

        return menuItem;
    });
};

/**
 * 格式化自适应菜单数据
 * @param menuData 原始菜单数据
 * @returns 格式化后的自适应菜单项数组
 */
/**
 * 格式化自适应菜单数据
 * @param menuData 原始菜单数据
 * @returns 格式化后的自适应菜单项数组
 */
export const formatAdaptiveMenus = (menuData: MenuItem[]): MenuListItem[] => {
    return menuData.map(menu => {
        const items = menu.children?.length 
            ? menu.children.map(child => ({
                key: String(child.id),
                type: 'item' as const,
                label: (
                    <MenuItemLabel
                        src={child.iconUrlDay || "/images/home_menu/Avatar.png"}
                        h5Text={child.menuName || child.menuDescription || ''}
                        spanText={child.menuViceName || ''}
                    />
                )
            }))
            : [{
                key: String(menu.id),
                type: 'item' as const,
                label: (
                    <MenuItemLabel
                        src={menu.iconUrlDay || "/images/home_menu/Avatar.png"}
                        h5Text={menu.menuName || menu.menuDescription || ''}
                        spanText={menu.menuViceName || ''}
                    />
                )
            }];

        return {
            key: String(menu.id),
            title: menu.menuName || menu.menuDescription || '',
            linkHref: menu.accessPath || '',
            items
        };
    });
};

// 导出所有工具函数
const menuUtils = {
    isEmptyOrWhitespace,
    processMenuItems,
    formatMenus,
    formatAdaptiveMenus
};

export default menuUtils;
