import { Input, Col, Row, Checkbox, ConfigProvider, Menu, Card } from 'antd';
import type { GetProps, MenuProps } from 'antd';
import Image from 'next/image';
import { useMemo, useState } from 'react'; // 导入 useState

import styles from './styles/bulletinCenter.module.css';
import MessageItem from './components/MessageItem';
import { MessageData } from '@/type/bulletin_center/bc_types';

type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

type MenuItem = Required<MenuProps>['items'][number];

export default function BulletinCenter() {
    // 状态管理：跟踪悬浮的菜单项和选中的菜单项
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(['1']); // 默认选中 '1'
    const [selectedLabel, setSelectedLabel] = useState<string>('全部公告'); // 跟踪选中的菜单项标签，默认为“全部公告”
    // 定义菜单项数据，使用循环生成四个菜单项
    const menuData = [
        { key: '1', defaultIcon: '/images/bulletin_center/icon_horn.png', hoverIcon: '/images/bulletin_center/icon_horn_hover.png', label: '公告（4）' },
        { key: '2', defaultIcon: '/images/bulletin_center/icon_contacts.png', hoverIcon: '/images/bulletin_center/icon_contacts_hover.png', label: '账户助手' },
        { key: '3', defaultIcon: '/images/bulletin_center/icon_assets.png', hoverIcon: '/images/bulletin_center/icon_assets_hover.png', label: '资产' },
        { key: '4', defaultIcon: '/images/bulletin_center/icon_Trading.png', hoverIcon: '/images/bulletin_center/icon_Trading_hover.png', label: '交易' },
    ];
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
    // 定义消息数据（可以根据实际需求从 API 或其他数据源加载）
    const messageData: Record<string, MessageData> = {
        '1': {
            title: '这是一个公告标题XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            time: '2024-12-12 12:12:12',
        },
        '2': {
            title: '账户助手通知内容',
            time: '2024-12-13 14:30:00',
        },
        '3': {
            title: '资产更新信息',
            time: '2024-12-14 09:00:00',
        },
        '4': {
            title: '交易动态提醒',
            time: '2024-12-15 16:45:00',
        },
    };
    // 获取当前选中的消息数据（使用 useMemo 优化性能）
    const currentMessage = useMemo(() => {
        const currentKey = selectedKeys[0] || '1'; // 默认取第一个 key，如果没有则用 '1'
        return messageData[currentKey] || {
            title: '默认公告标题',
            time: '2024-12-16 00:00:00',
        };
    }, [selectedKeys]);

    // 获取当前选中的消息数据函数（保持兼容性）
    const getMessageData = (key: string): MessageData => {
        return messageData[key] || {
            title: '默认公告标题',
            time: '2024-12-16 00:00:00',
        };
    };
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
                                        <MessageItem
                                            title={currentMessage.title}
                                            time={currentMessage.time}
                                        />
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