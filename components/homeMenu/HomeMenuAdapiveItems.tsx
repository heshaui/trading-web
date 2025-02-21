import React from 'react';
import { Menu } from 'antd';

// import { MenuListItem, LabelComponentProps } from '@/type/types';
import { MenuListItem } from '@/type/types';
import styles from '@/styles/components/HomeMenu.module.css';

interface MenuAdaptiveItemProps {
    menuList: MenuListItem[];
}

export default function MenuAdaptiveItem({ menuList }: MenuAdaptiveItemProps) {
    // 防护：如果 menuList 未定义或不是数组，返回空内容
    if (!menuList || !Array.isArray(menuList)) {
        return <div>暂无菜单数据</div>;
    }

    const menuItems = menuList.map(menu => ({
        key: menu.key,
        label: menu.title, // 保持标题为字符串或 ReactNode
        children: menu.items?.map(item => ({
            key: item.key,
            // label: item.label, // 直接使用 item.label（<MenuItemLabel> 组件）
            label: menu.title,
            type: item.type === 'group' || item.type === 'divider' ? item.type : undefined,
        })) || [], // 防止 items 未定义
    }));
    // const menuItems = menuList.map(menu => ({
    //     key: menu.key,
    //     label: menu.title, // 保持标题为字符串或 ReactNode
    //     children: menu.items?.map(item => {
    //         // 解析 <MenuItemLabel> 组件，提取图标和文本
    //         let icon = null;
    //         let title = null;
    //         let description = null;

    //         if (React.isValidElement(item.label)) {
    //             // 假设 item.label 是 <MenuItemLabel> 组件
    //             const labelProps = (item.label as React.ReactElement).props as LabelComponentProps;
    //             icon = labelProps.src ? (
    //                 <img src={labelProps.src} alt="" style={{ width: 20, height: 20 }} />
    //             ) : null;
    //             title = labelProps.h5Text || '未命名';
    //             description = labelProps.spanText || '';
    //         }

    //         return {
    //             key: item.key,
    //             icon: icon, // 单独设置图标
    //             label: (
    //                 <div style={{ display: 'flex', flexDirection: 'column' }}>
    //                     <span style={{ fontSize: '14px', lineHeight: '20px' }}>{title}</span>
    //                     {description && (
    //                         <span style={{ color: '#999', fontSize: '12px', lineHeight: '16px' }}>
    //                             {description}
    //                         </span>
    //                     )}
    //                 </div>
    //             ), // 单独设置文本内容
    //             type: item.type === 'group' || item.type === 'divider' ? item.type : undefined,
    //         };
    //     }) || [],
    // }));

    return (
        <Menu
            mode="vertical"
            items={menuItems}
            style={{ width: 264 }}
            triggerSubMenuAction="click"
            className='customMenu'
        />
    );
}