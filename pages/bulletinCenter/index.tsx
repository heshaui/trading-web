import { Input, Col, Row, Checkbox, ConfigProvider, Menu, Card, Breadcrumb } from 'antd';
import type { MenuProps } from 'antd';
import Image from 'next/image';
import { useMemo, useState } from 'react'; // 导入 useState

import styles from './styles/bulletinCenter.module.css';
import MessageItem from './components/MessageItem';
import MessagePagination from './components/MessagePagination';
import { menuData, messageData, detailMenuItems } from '@/data/bulletinCenter/getItemsMessage';
import { MessageData } from '@/type/bulletin_center/bc_types';
import MessageItemDetail from './components/MessageItemDetail';


const { Search } = Input;
type MenuItem = Required<MenuProps>['items'][number];

export default function BulletinCenter() {
    // 状态管理：跟踪悬浮的菜单项和选中的菜单项
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(['1']); // 默认选中 '1'
    const [selectedLabel, setSelectedLabel] = useState<string>('全部公告'); // 跟踪选中的菜单项标签，默认为“全部公告”
    // 使用对象存储每个菜单项的页码状态
    const [pagesState, setPagesState] = useState<Record<string, number>>({});
    // 每页显示的消息数量
    const pageSize = 5;
    // 获取当前菜单项的页码
    const getCurrentPage = (key: string) => pagesState[key] || 1;
    // 公告中心 - 详情页
    const [showDetail, setShowDetail] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<MessageData | null>(null);
    // 保存之前的菜单状态 - 公告部分
    const [previousState, setPreviousState] = useState<{
        selectedKeys: string[];
        selectedLabel: string;
    } | null>(null);
    const [detailSelectedKey, setDetailSelectedKey] = useState('latest'); // 默认选中 '最新动态'

    // 创建一个通用的生成菜单项的函数
    const generateMenuItems = (
        menuItemsData: Array<{
            key: string;
            label: string;
            defaultIcon: string;
            hoverIcon: string;
        }>,
        currentSelectedKey: string | string[]
    ): MenuItem[] => {
        return menuItemsData.map((item) => ({
            key: item.key,
            icon: (
                <Image
                    src={
                        hoveredKey === item.key || 
                        (Array.isArray(currentSelectedKey) 
                            ? currentSelectedKey.includes(item.key) 
                            : currentSelectedKey === item.key)
                            ? item.hoverIcon
                            : item.defaultIcon
                    }
                    alt=""
                    width={20}
                    height={20}
                />
            ),
            label: item.label,
            onMouseEnter: () => setHoveredKey(item.key),
            onMouseLeave: () => setHoveredKey(null),
        }));
    };
    // 生成公告中心顶层菜单项
    const items = generateMenuItems(menuData, selectedKeys);
    // 生成详情页菜单项
    const detailItems = generateMenuItems(detailMenuItems, detailSelectedKey);

    // 获取当前选中的消息数据
    const currentMessages = useMemo(() => {
        const currentKey = selectedKeys[0] || '1';
        const messages = messageData[currentKey] || [];
        const currentPage = getCurrentPage(currentKey);

        // 计算当前页的数据
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return {
            data: messages.slice(startIndex, endIndex),
            total: messages.length
        };
    }, [selectedKeys, pagesState, messageData]);
    // 处理页码变化
    const handlePageChange = (page: number) => {
        const currentKey = selectedKeys[0] || '1';
        setPagesState(prev => ({
            ...prev,
            [currentKey]: page
        }));
    };
    // 处理菜单选择变化
    const handleMenuSelect = (info: { key: string }) => {
        setSelectedKeys([info.key]);

        if (showDetail) {
            // 在详情页时更新详情页的选中状态
            setDetailSelectedKey(info.key);
            // 在详情页时的菜单选择逻辑
            if (info.key === 'latest') {
                setSelectedLabel('公告中心');
            } else {
                // 根据 key 设置对应的 label
                const selectedItem = detailMenuItems.find((item) => item.key === info.key);
                setSelectedLabel(selectedItem ? selectedItem.label : '公告中心');
            }
        } else {
            // 原有的菜单选择逻辑
            if (info.key === '1') {
                setSelectedLabel('全部公告');
            } else {
                const selectedItem = menuData.find((item) => item.key === info.key);
                setSelectedLabel(selectedItem ? selectedItem.label : '全部公告');
            }
        }
    };
    // 点击查看详情
    const handleMessageClick = (message: MessageData) => {
        if (selectedKeys[0] === '1') { // 只有公告类型可以查看详情
            // 保存当前状态
            setPreviousState({
                selectedKeys: selectedKeys,
                selectedLabel: selectedLabel
            });
            setCurrentMessage(message);
            setShowDetail(true);
            setDetailSelectedKey('latest'); // 重置为最新动态
            setSelectedLabel('公告中心'); // 确保进入详情页时设置为公告中心
        }
    };
    // 处理返回列表页
    const handleBack = () => {
        setShowDetail(false);
        // 恢复之前的状态
        if (previousState) {
            setSelectedKeys(previousState.selectedKeys);
            setSelectedLabel(previousState.selectedLabel);
        }
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
                                selectedKeys={showDetail ? [detailSelectedKey] : selectedKeys}
                                onSelect={handleMenuSelect}
                                mode="inline"
                                items={showDetail ? detailItems : items}
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
                                    {showDetail && currentMessage ? (
                                        <Col flex={1}>
                                            <MessageItemDetail
                                                message={currentMessage}
                                                onBack={handleBack}
                                                currentDetailLabel={selectedLabel || '最新动态'} // 传递当前选中的标签
                                            />
                                        </Col>
                                    ) : (
                                        <Col flex={1}>
                                            {currentMessages.data.map((message, index) => (
                                                <MessageItem
                                                    key={index}
                                                    title={message.title}
                                                    time={message.time}
                                                    onClick={() => handleMessageClick(message)}
                                                    isClickable={selectedKeys[0] === '1'}
                                                />
                                            ))}
                                            <MessagePagination
                                                current={getCurrentPage(selectedKeys[0] || '1')}
                                                total={currentMessages.total}
                                                onChange={handlePageChange}
                                                pageSize={pageSize}
                                            />
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </ConfigProvider >
    );
}