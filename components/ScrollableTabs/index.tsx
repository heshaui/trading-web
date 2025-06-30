'use client'
import React, { useState } from 'react';
import { Iconify } from "@/components/icon";
import styles from './styles.module.css';
import { useTranslation } from 'next-i18next';
interface TabItem {
    key: string;
    label: React.ReactNode;
}

interface CustomTabsProps {
    items: TabItem[];
    onChange?: (key: string) => void;
    defaultActiveKey?: string;
    showAllTab?: boolean;
    allTabLabel?: string;
    className?: string;
    visibleNum?: number;
    hideSwitchNoContent?: boolean; //无切换时是否隐藏
    allBtnIsThemeColor?: boolean; //所有按钮是否为主题色
}
// const { t } = useTranslation(['common']);
const CustomTabs: React.FC<CustomTabsProps> = ({
    items = [],
    onChange,
    defaultActiveKey = 'all',
    showAllTab = true,
    allTabLabel = 'All' , //
    className = '',
    visibleNum=6,
    hideSwitchNoContent = false,
    allBtnIsThemeColor= false
}) => {
    const [activeKey, setActiveKey] = useState(defaultActiveKey);
    const [startIndex, setStartIndex] = useState(0);
    
    // 一次显示的标签数量
    const visibleCount = visibleNum
    
    // 处理标签点击
    const handleTabClick = (key: string) => {
        setActiveKey(key);
        if (onChange) {
            onChange(key);
        }
    };
    
    // 向左滚动
    const handleScrollLeft = () => {
        setStartIndex(prev => Math.max(0, prev - 2));
        console.log('左滚动', { newIndex: Math.max(0, startIndex - 2) });
    };
    
    // 向右滚动
    const handleScrollRight = () => {
        const maxStartIndex = Math.max(0, items.length - visibleCount);
        setStartIndex(prev => Math.min(maxStartIndex, prev + 2));
        console.log('右滚动', { 
            newIndex: Math.min(maxStartIndex, startIndex + 2),
            maxIndex: maxStartIndex
        });
    };
    
    // 计算可见的标签项
    const visibleItems = items.slice(startIndex, startIndex + visibleCount);
    
    // 判断是否到达边界
    const isAtStart = startIndex === 0;
    const isAtEnd = startIndex + visibleCount >= items.length;
    
    return (
        <div className={`${styles.custom_tabs_container} ${className}`}>
            <div className={styles.tabs_nav} >
                {/* 全部标签 */}
                {showAllTab && (
                    <div 
                    //styles.active_tab
                        className={` ${styles.all_tab} 
                        ${activeKey === 'all' ? (allBtnIsThemeColor?styles.default_btn:styles.active_tab) : styles.title_color} `}
                        onClick={() => handleTabClick('all')}
                    >
                        {allTabLabel}
                    </div>
                )}
                
                {/* 左箭头 */}
               { (hideSwitchNoContent&&(!isAtStart||!isAtEnd))&&<div 
                    className={`${styles.scroll_button} ${isAtStart ? `${styles.disabled_button } cursor-disable`: ''}`}
                    onClick={handleScrollLeft}
                >
                    <Iconify icon="mingcute:left-line" size={16} />
                </div>}
                
                {/* 标签容器 */}
                <div className={styles.tabs_scroll_container}>
                    <div className={styles.tabs_list}>
                        {visibleItems.map((item) => (
                            <div
                                key={item.key}
                                className={`${styles.tab_item} ${activeKey === item.key ? styles.active_tab : ''}`}
                                onClick={() => handleTabClick(item.key)}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* 右箭头 */}
                {(hideSwitchNoContent&&(!isAtStart||!isAtEnd))&&<div 
                    className={`${styles.scroll_button} ${isAtEnd ? styles.disabled_button : ''}`}
                    onClick={handleScrollRight}
                >
                    <Iconify icon="mingcute:right-line" size={16} />
                </div>}
            </div>
        </div>
    );
};

export default CustomTabs;
