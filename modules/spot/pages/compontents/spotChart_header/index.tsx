import React from 'react';
import styles from '../styles/spotHeader.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form, Tabs, Spin, Button, Space, Tooltip, Dropdown } from 'antd';
import { Iconify } from "@/components/icon"
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import type { DropdownProps, MenuProps } from 'antd'


const SpotHeaderPage = () => {
    const { t } = useTranslation(['spot']);
    const [open, setOpen] = useState<boolean>(true);



    const items: MenuProps['items'] = [
        {
            key: '3',
            label: '3rd menu item (disabled)'
            ,
        },
        {
            key: '4',
            danger: true,
            label: 'a danger item',
        },
    ]
    const handleMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === '3') {
            setOpen(false);
        }
    };
    const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
        if (info.source === 'trigger' || nextOpen) {
            setOpen(nextOpen);
        }
    };
    return (<div className={`flex-x align-center`}>
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        // bodySortBg: "pink",
                        headerBg: "transparent",
                        headerColor: "var(--text-color6)",
                        headerSplitColor: "transparent", // 表头分割线颜色
                        rowExpandedBg: "var(--background10)", // 表格行展开背景色
                        borderColor: "transparent",
                        // stickyScrollBarBg:"transparent",
                        headerBorderRadius: 0, // 表头圆角
                    },
                    Pagination: {
                        itemActiveBg: "transparent",
                        itemBg: "transparent",
                    },

                    Select: {
                        activeBorderColor: "var(--border-color4)",
                        optionActiveBg: "transparent",
                        selectorBg: "transparent", //选框背景色
                    },
                    Tabs: {
                        itemActiveColor: "var(--tip-color)", //激活态颜色  
                        itemSelectedColor: "var(--text-color5)", //选中态颜色
                        horizontalMargin: "0 0 0 0",
                        itemColor: "var(--text-color6)",
                        inkBarColor: "var(--text-color5)", //指示条颜色
                    },
                },
            }}
        >
            {/* <Dropdown
                     menu={{ items }}
                    dropdownRender={(menu) => (
                            <div className={`${styles.card_bgc1} custom-dropdown`}>
                                    自定义1111
                                    {menu}
                            </div>
                        )
                    }
                >
                    <div>
                        {t('spot.select.placeholder')}
                        prime:sort-up-fill
                        <Iconify icon="prime:sort-down-fill" size={16} className={`${styles.tip_color2}`} />

                    </div>
                </Dropdown> */}
            <Dropdown
                menu={{
                    items,
                    onClick: handleMenuClick,
                }}
                trigger={['click']}
                dropdownRender={(menu) => (
                    <div style={{ backgroundColor: '#ffffff' }}>
                        {React.cloneElement(
                            menu as React.ReactElement<{
                                style: React.CSSProperties;
                            }>,
                            { style: { color: 'pink' } },
                        )}
                        {/* <Divider style={{ margin: 0 }} /> */}
                        <Space style={{ padding: 8 }}>
                            <Button type="primary">Click me!</Button>
                        </Space>
                    </div>
                )}
                onOpenChange={handleOpenChange}
                open={open}
            >
                <Space>
                    {t('spot.select.placeholder')}
                    {/* prime:sort-up-fill */}
                    <Iconify icon="prime:sort-down-fill" size={16} className={`${styles.tip_color2}`} />

                </Space>
            </Dropdown>
            <ul className={`${styles.tip_color} ${styles.header_content_msg} font-14 font-w-400 flex-x align-center  ml-5 flex-1`}>
                <li className='mr-9'>
                    <p className={`${styles.error_icon} font-16`}>27056.20</p>
                    <p>¥183,982.10</p>
                </li>
                <li className='mr-9'>
                    <p >24H  涨跌</p>
                    <p className={`${styles.success_icon} font-14`}>+7,156.36 +7.46%</p>
                </li>
                <li className='mr-9'>
                    <p >24H 最高价</p>
                    <p className={`${styles.title_color}`}>27,659.60</p>
                </li>
                <li className='mr-9'>
                    <p >24H 最低价</p>
                    <p className={`${styles.title_color}`} >26,857.90</p>
                </li>
                <li className='mr-9'>
                    <p >24H 成交量(BTC)</p>
                    <p className={`${styles.title_color}`} >3,667.17</p>
                </li>
                <li className='mr-9'>
                    <p >24H 交易额(USDT)</p>
                    <p className={`${styles.title_color}`}>1.00亿</p>
                </li>
            </ul>
            <div className='flex-cc'>
                <Iconify icon="mingcute:settings-5-line" size={26} className={`${styles.tip_color}`} />
            </div>
        </ConfigProvider>
    </div>
    );
};

export default SpotHeaderPage