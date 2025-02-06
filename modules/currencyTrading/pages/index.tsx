import { Menu, ConfigProvider } from "antd"
import {
    ContainerOutlined,
    DesktopOutlined,
    MailOutlined,
    PieChartOutlined,
} from '@ant-design/icons';
import React, { useState } from 'react';
import FundingOverview from "../components/FundingOverview"
import styles from '../styles/currencyTrading.module.css';

export default function CurrencyTrading() {
    // 定义一个状态来存储 title 值
    const [title, setTitle] = useState('资金总览');
    // 根据 key 查找对应的 label 值
    const findLabelByKey = (key: string) => {
        const item = items.find((item) => item.key === key);
        if (item) {
            return item.label;
        }
        // 处理子项的情况
        for (const item of items) {
            if (item.children) {
                const childItem = item.children.find((child) => child.key === key);
                if (childItem) {
                    return childItem.label;
                }
            }
        }
        return ''; // 如果没有找到对应的 key，则返回空字符串
    };

    const items = [
        {
            key: '1',
            // icon: <PieChartOutlined />,
            icon: <img style={{ width: '18px', height: '18px' }} src='/images/currency_trading/icon-General view-gray.png' />,
            label: '资金总览',
        },
        {
            key: '2',
            icon: <DesktopOutlined />,
            label: '现货账户',
        },
        {
            key: '3',
            icon: <ContainerOutlined />,
            label: '合约账户',
        },
        {
            key: '4',
            icon: <ContainerOutlined />,
            label: '资金账户',
        },
        {
            key: 'sub1',
            label: '账单明细',
            icon: <MailOutlined />,
            children: [
                {
                    key: '6',
                    label: 'Option 6',
                },
                {
                    key: '7',
                    label: 'Option 7',
                },
                {
                    key: '8',
                    label: 'Option 8',
                },
                {
                    key: '9',
                    label: 'Option 9',
                },
            ],
        },
    ];
    // const getMenuContent = (item) => {
    //     console.log('item', item);
    // };
    return (
        <ConfigProvider
            theme={{
                components: {
                    Menu: {
                        // darkItemHoverBg: 'linear-gradient(90deg, rgba(31, 64, 255, 0) 0%, rgba(31, 64, 255, 0.5) 100%)',
                        // darkItemSelectedBg: 'linear-gradient(90deg, rgba(31, 64, 255, 0) 0%, rgba(31, 64, 255, 0.5) 100%)',
                        // itemMarginInline: 19,
                        itemHeight: 50,
                        itemPaddingInline: 0
                    },
                },
            }}
        >
            <div className={styles.CTContainer}>
                <Menu
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    theme="dark"
                    items={items}
                    style={{ width: 240, marginTop: '20px', marginRight: '16px' }}
                    onClick={(info) => {
                        const newTitle = findLabelByKey(info.key);
                        setTitle(newTitle);
                        console.log('info', info);
                        console.log('key', info.key);
                    }}
                />
                <FundingOverview title={ title } />
            </div>
        </ConfigProvider>
    )
}