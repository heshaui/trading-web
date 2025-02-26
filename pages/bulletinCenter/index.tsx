import { Input, Col, Row, Checkbox, ConfigProvider, Menu, Card } from 'antd';
import type { MenuProps } from 'antd';
import Image from 'next/image';
import { useMemo, useState } from 'react'; // 导入 useState

import styles from './styles/bulletinCenter.module.css';
import MessageItem from './components/MessageItem';
import MessagePagination from './components/MessagePagination';
import { menuData, messageData } from '@/data/bulletinCenter/getItemsMessage';


const { Search } = Input;
type MenuItem = Required<MenuProps>['items'][number];

export default function BulletinCenter() {
    // 状态管理：跟踪悬浮的菜单项和选中的菜单项
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(['1']); // 默认选中 '1'
    const [selectedLabel, setSelectedLabel] = useState<string>('全部公告'); // 跟踪选中的菜单项标签，默认为“全部公告”

    // 动态生成菜单项
    const items: MenuItem[] = menuData.map((item) => ({
        key: item.key,
        icon: (
            <Image
                src={
                    hoveredKey === item.key || selectedKeys.includes(item.key)
                        ? item.hoverIcon
                        : item.defaultIcon
                }
                alt=""
                width={20}
                height={20}
            // unoptimized={true} // 禁用 Next.js 图像优化，确保直接加载
            />
        ),
        label: item.label,
        onMouseEnter: () => setHoveredKey(item.key), // 鼠标进入时设置悬浮状态
        onMouseLeave: () => setHoveredKey(null), // 鼠标离开时清除悬浮状态
    }));
    // 获取当前选中的消息数据（使用 useMemo 优化性能）
    const currentMessages = useMemo(() => {
        const currentKey = selectedKeys[0] || '1'; // 默认取第一个 key，如果没有则用 '1'
        return messageData[currentKey] || [
            { title: '默认公告标题', time: '2024-12-16 00:00:00' },
        ];
    }, [selectedKeys]);
    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: {
                    },
                    Menu: {
                        itemColor: '#A4A5AC',
                        itemHoverBg: '#FF5F1F',
                        itemSelectedBg: '#FF5F1F',
                        itemHoverColor: '#FFFFFF',
                        itemSelectedColor: '#FFFFFF',
                        itemMarginInline: 20,
                        itemMarginBlock: 0,
                        itemBorderRadius: 10
                    },
                    Pagination: {
                        // itemActiveBg: '#FF5F1F',
                        // itemBg: '#FF5F1F',
                    }
                },
                token: {
                    colorPrimary: '#FF5F1F',
                },
            }}
        >
            <div className={styles.bulletinContainer}>
                <div className={styles.bulletinTop}>
                    <Row align='middle' justify='space-between'>
                        <Col>
                            <Row gutter={16} align='middle'>
                                <Col><h5>通知</h5></Col>
                                <Col><Search placeholder="搜索" allowClear style={{ width: 200 }} /></Col>
                            </Row>
                        </Col>
                        <Col>
                            <Checkbox>
                                <span style={{ color: '#FFFFFF' }}>只看未读</span>
                            </Checkbox>
                            <span style={{ color: '#FF5F1F' }}>全部已读</span>
                        </Col>
                    </Row>
                </div>
                <div className={`${styles.bulletinContent} customMenu`}>
                    <Row justify='space-between' gutter={16}>
                        <Col flex={1}>
                            <Menu
                                defaultSelectedKeys={['1']}
                                selectedKeys={selectedKeys} // 绑定选中的键
                                onSelect={(info) => {
                                    setSelectedKeys([info.key]); // 更新选中的键
                                    // 根据选中的 key 找到对应的 label 并更新
                                    const selectedItem = menuData.find((item) => item.key === info.key);
                                    if (info.key === '1') {
                                        setSelectedLabel('全部公告'); // key 为 '1' 时显示“全部公告”
                                    } else {
                                        setSelectedLabel(selectedItem ? selectedItem.label : '全部公告'); // 其他 key 使用对应的 label
                                    }
                                }} // 选中时更新状态和标签
                                defaultOpenKeys={['sub1']}
                                mode="inline"
                                items={items}
                            />
                        </Col>
                        <Col flex={4}>
                            <Card>
                                <Row>
                                    <Col>
                                        <h5 style={{ fontSize: 18, fontWeight: 500, color: '#0C0D0C' }}>
                                            {selectedLabel}
                                        </h5>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col flex={1}>
                                        {currentMessages.map((message, index) => (
                                            <MessageItem
                                                key={index}
                                                title={message.title}
                                                time={message.time}
                                            />
                                        ))}
                                        <MessagePagination />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </ConfigProvider >
    );
}