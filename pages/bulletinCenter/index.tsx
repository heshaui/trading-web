import { Col, Row, ConfigProvider, Menu, Card, Empty } from 'antd';
import type { MenuProps } from 'antd';
import { useCallback, useMemo, useState } from 'react'; // 导入 useState
import Image from 'next/image';
import dayjs from 'dayjs';

import MessageItem from './components/MessageItem';
import MessagePagination from './components/MessagePagination';
import MessageItemDetail from './components/MessageItemDetail';
import RenderBulletinTop from './components/RenderBulletinTop';
import styles from './styles/bulletinCenter.module.css';
import { menuData, messageData, detailMenuItems } from '@/data/bulletinCenter/getItemsMessage';
import { MessageData } from '@/type/bulletin_center/bc_types';


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
    const getCurrentPage = useCallback((key: string) => {
        return pagesState[key] || 1;
    }, [pagesState]);
    // 公告中心 - 详情页
    const [showDetail, setShowDetail] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<MessageData | null>(null);
    // 保存之前的菜单状态 - 公告部分
    const [previousState, setPreviousState] = useState<{
        selectedKeys: string[];
        selectedLabel: string;
    } | null>(null);
    const [detailSelectedKey, setDetailSelectedKey] = useState('latest'); // 默认选中 '最新动态'
    // 添加状态来控制是否显示文章详情
    const [showArticle, setShowArticle] = useState(true);
    // 存储已读消息的 ID
    const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set());
    // 添加状态来控制是否只显示未读消息
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

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

    // 判断消息是否已读
    const isMessageRead = (messageId: string) => {
        // return readMessageIds.has(messageId);
        
        // 只有公告菜单项的消息才判断已读状态
        if (selectedKeys[0] === '1') {
            return readMessageIds.has(messageId);
        }
        return false; // 其他菜单项始终返回 false，保持原有颜色
    };
    // 获取经过筛选和排序的消息列表：先按已读状态，再按时间排序
    const getFilteredAndSortedMessages = (messages: MessageData[]) => {
        if (selectedKeys[0] === '1') {
            let filteredMessages = [...messages];

            // 如果开启了只看未读，过滤出未读消息
            if (showUnreadOnly) {
                filteredMessages = filteredMessages.filter(message => !isMessageRead(message.id || ''));
            }

            // 按已读状态和时间排序
            return filteredMessages.sort((a, b) => {
                const aRead = isMessageRead(a.id || '');
                const bRead = isMessageRead(b.id || '');

                if (aRead !== bRead) {
                    return aRead ? 1 : -1;
                }

                const timeA = dayjs(a.time);
                const timeB = dayjs(b.time);
                return timeB.diff(timeA);
            });
        }
        return messages;
    };
    const currentMessages = useMemo(() => {
        const currentKey = selectedKeys[0] || '1';
        const messages = messageData[currentKey] || [];
        
        // 先进行筛选和排序
        const processedMessages = getFilteredAndSortedMessages(messages);
        
        // 然后进行分页
        const currentPage = getCurrentPage(currentKey);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        return {
            data: processedMessages.slice(startIndex, endIndex),
            total: processedMessages.length
        };
    }, [selectedKeys, pagesState, messageData, showUnreadOnly, readMessageIds]);

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
            setShowArticle(false); // 切换到列表视图
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
        if (selectedKeys[0] === '1') {
            setReadMessageIds(prev => new Set([...prev, message.id || '']));
            setPreviousState({
                selectedKeys: selectedKeys,
                selectedLabel: selectedLabel
            });
            setCurrentMessage(message);
            setShowDetail(true);
            setShowArticle(true);
            setDetailSelectedKey('latest');
            setSelectedLabel('公告中心');
        }
    };
    // 处理返回公告列表页
    const handleBack = () => {
        setShowDetail(false);
        // 恢复之前的状态
        if (previousState) {
            setSelectedKeys(previousState.selectedKeys);
            setSelectedLabel(previousState.selectedLabel);
        }
    };
    // 处理点击最新动态
    const handleLatestClick = () => {
        setDetailSelectedKey('latest'); // 设置为最新动态菜单项
        setSelectedLabel('公告中心'); // 设置标签为最新动态
        setShowArticle(false);  // 切换到列表视图
    };

    // 处理 只看未读 变化
    const handleUnreadChange = (checked: boolean) => {
        setShowUnreadOnly(checked);
        // 重置当前选中菜单的页码为1
        const currentKey = selectedKeys[0] || '1';
        setPagesState(prev => ({
            ...prev,
            [currentKey]: 1
        }));
    };
    // 全部已读处理
    const handleReadAll = () => {
        if (currentMessages && selectedKeys[0] === '1') {
            const newReadIds = new Set(readMessageIds);
            messageData['1'].forEach(message => {
                newReadIds.add(message.id || '');
            });
            setReadMessageIds(newReadIds);
            // 重置当前页码为1
            setPagesState(prev => ({
                ...prev,
                '1': 1  // 只重置公告菜单（key='1'）的页码
            }));
        }
    };
    // 在渲染列表时使用筛选和排序后的数据
    const filteredAndSortedMessages = getFilteredAndSortedMessages(currentMessages.data);


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
                    Pagination: {}
                },
                token: {
                    colorPrimary: '#FF5F1F',
                },
            }}
        >
            <div className={styles.bulletinContainer}>
                <RenderBulletinTop
                    showDetail={showDetail}
                    onBack={handleBack}
                    onReadAll={handleReadAll}
                    onUnreadChange={handleUnreadChange}
                />
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
                                                currentDetailLabel={selectedLabel === '公告中心' ? '最新动态' : selectedLabel} // 传递当前选中的标签
                                                currentDetailKey={detailSelectedKey} // 传递当前选中的 key
                                                onLatestClick={handleLatestClick} // 传递点击最新动态的处理函数
                                                showArticle={showArticle} // 传递是否显示文章详情的状态
                                            />
                                        </Col>
                                    ) : (
                                        <Col flex={1}>
                                            {filteredAndSortedMessages.length > 0 ? (
                                                filteredAndSortedMessages.map((message) => (
                                                    <MessageItem
                                                        key={message.id}
                                                        title={message.title}
                                                        time={message.time}
                                                        onClick={() => handleMessageClick(message)}
                                                        isClickable={selectedKeys[0] === '1'}
                                                        isRead={isMessageRead(message.id || '')}
                                                    />
                                                ))
                                            ) : (
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    padding: '40px 0'
                                                }}>
                                                    <Empty image='/images/bulletin_center/chat.png' description='暂无通知' />
                                                </div>
                                            )}
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