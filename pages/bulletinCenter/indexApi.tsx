import { Col, Row, ConfigProvider, Menu, Card, Empty } from 'antd';
import type { MenuProps } from 'antd';
import { useCallback, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';

import MessageItem from './components/MessageItem';
import MessagePagination from './components/MessagePagination';
import MessageItemDetail from './components/MessageItemDetail';
import RenderBulletinTop from './components/RenderBulletinTop';
import styles from './styles/bulletinCenter.module.css';
import { menuData as staticMenuData, messageData, detailMenuItems, detailListData } from '@/data/bulletinCenter/getItemsMessage';
import { MessageData } from '@/type/bulletin_center/bc_types';
import { highlightText } from '@/utils/highlight';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@/context/NavigationContext';
import { getBulletinMessageLogined, getBulletinDetailLogined, readBulletinMessageLogined, getBulletinMessageUnreadCount } from '@/services/bulletinCenter';


type MenuItem = Required<MenuProps>['items'][number];

export default function BulletinCenter() {
    // 获取登录状态
    const { isLoggedIn } = useAuth();
    // 获取导航上下文中的公告数据
    const { bulletinData } = useNavigation();

    // 状态管理：跟踪悬浮的菜单项和选中的菜单项
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(['1']); // 默认选中 '1'
    const [selectedLabel, setSelectedLabel] = useState<string>('全部公告'); // 跟踪选中的菜单项标签，默认为"全部公告"
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
    // 添加搜索值
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredData, setFilteredData] = useState(messageData);
    const [filteredDetailData, setFilteredDetailData] = useState(detailListData);
    // 添加登录后的公告数据状态
    const [loginedMessageData, setLoginedMessageData] = useState<Record<string, MessageData[]>>({
        '1': []
    });
    // 当前公告详情内容
    const [currentMessageContent, setCurrentMessageContent] = useState<string>('');
    // 是否正在加载数据
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // 未读公告数量
    const [unreadCount, setUnreadCount] = useState<number>(0);
    // 自定义菜单数据
    const [menuData, setMenuData] = useState(staticMenuData);
    // 标记是否已从NavigationContext获取过数据
    const [hasInitializedFromContext, setHasInitializedFromContext] = useState(false);

    // 获取未读公告数量
    const fetchUnreadCount = async () => {
        if (!isLoggedIn) {
            setUnreadCount(0);
            return;
        }

        try {
            const response = await getBulletinMessageUnreadCount() as any;
            if (response?.code === '0' && response.data !== undefined) {
                setUnreadCount(response.data);
                // 更新菜单数据中的公告数量
                const updatedMenuData = [...staticMenuData];
                updatedMenuData[0] = {
                    ...updatedMenuData[0],
                    label: `公告（${response.data}）`
                };
                setMenuData(updatedMenuData);
            }
        } catch (error) {
            console.error('获取未读公告数量失败:', error);
        }
    };

    // 使用NavigationContext中的数据初始化公告数据
    useEffect(() => {
        if (isLoggedIn && bulletinData && bulletinData.length > 0 && !hasInitializedFromContext) {
            // 从NavigationContext转换数据格式
            const formattedData = bulletinData.map((item: { h5Text: string; spanText: string }, index: number) => ({
                id: (index + 1).toString(), // 假设没有实际ID，用索引代替
                title: item.h5Text,
                time: item.spanText,
                isRead: false // 初始假设所有消息未读
            }));

            // 更新数据
            setLoginedMessageData({
                '1': formattedData
            });

            // 更新筛选数据
            if (searchKeyword) {
                handleSearch(searchKeyword);
            } else {
                setFilteredData({
                    ...messageData,
                    '1': formattedData
                });
            }

            // 标记已从Context获取过数据
            setHasInitializedFromContext(true);

            // 获取未读公告数量
            fetchUnreadCount();
        }
    }, [isLoggedIn, bulletinData]);

    // 监听登录状态变化，确保在登录状态变化时重置菜单选择
    useEffect(() => {
        // 如果未登录，或者选择的菜单不是公告（key='1'），则重置为公告菜单
        if (!isLoggedIn && selectedKeys[0] !== '1') {
            setSelectedKeys(['1']);
            setSelectedLabel('全部公告');
            // 重置页码
            setPagesState(prev => ({
                ...prev,
                '1': 1
            }));
            // 重置为默认菜单数据
            setMenuData(staticMenuData);
        } else if (isLoggedIn) {
            // 获取未读公告数量
            fetchUnreadCount();
        }
    }, [isLoggedIn, selectedKeys]);

    // 仅在NavigationContext没有提供数据时才获取登录后的公告数据
    useEffect(() => {
        const fetchLoginedBulletinData = async () => {
            // 仅当已登录且未从NavigationContext初始化过数据时才请求
            if (isLoggedIn && !hasInitializedFromContext && (!bulletinData || bulletinData.length === 0)) {
                setIsLoading(true);
                try {
                    const lang = localStorage.getItem('lang') || 'zh_CN';
                    const response = await getBulletinMessageLogined({ languageCode: lang }) as any;

                    if (response?.code === '0' && response.data?.list && Array.isArray(response.data.list)) {
                        // 转换API返回的数据格式为应用所需的格式
                        const formattedData = response.data.list.map((item: {
                            id: number;
                            title: string;
                            releaseTime: number;
                            onTop: number;
                            classMenu: number;
                            isRead: boolean;
                        }) => ({
                            id: item.id.toString(),
                            title: item.title,
                            time: dayjs(item.releaseTime).format('YYYY-MM-DD HH:mm:ss'),
                            isRead: item.isRead || false,
                            // content会在点击查看详情时获取
                        }));

                        // 更新数据
                        setLoginedMessageData({
                            '1': formattedData
                        });

                        // 标记已读的消息
                        const newReadIds = new Set(readMessageIds);
                        formattedData.forEach((item: {
                            id: string;
                            title: string;
                            time: string;
                            isRead: boolean;
                        }) => {
                            if (item.isRead) {
                                newReadIds.add(item.id);
                            }
                        });
                        setReadMessageIds(newReadIds);

                        // 更新筛选数据
                        if (searchKeyword) {
                            handleSearch(searchKeyword);
                        } else {
                            // 如果没有搜索关键词，则使用完整的数据
                            setFilteredData({
                                ...messageData,
                                '1': formattedData
                            });
                        }

                        // 获取未读公告数量
                        fetchUnreadCount();
                    }
                } catch (error) {
                    console.error('获取登录后公告数据失败:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchLoginedBulletinData();
    }, [isLoggedIn, hasInitializedFromContext, bulletinData]);

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

    // 根据登录状态筛选菜单项
    const filteredMenuData = useMemo(() => {
        if (isLoggedIn) {
            // 已登录状态，显示所有菜单项
            return menuData;
        } else {
            // 未登录状态，仅显示第一项（公告）
            return [menuData[0]];
        }
    }, [isLoggedIn, menuData]);

    // 生成公告中心顶层菜单项（根据登录状态过滤）
    const items = generateMenuItems(filteredMenuData, selectedKeys);
    // 生成详情页菜单项
    const detailItems = generateMenuItems(detailMenuItems, detailSelectedKey);

    // 判断消息是否已读
    const isMessageRead = (messageId: string) => {
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

    // 获取当前应该显示的消息数据源
    const currentDataSource = useMemo(() => {
        // 如果已登录并且选择了公告菜单（key='1'），使用从API获取的数据
        if (isLoggedIn && selectedKeys[0] === '1') {
            return {
                ...filteredData,
                '1': loginedMessageData['1']
            };
        }
        // 其他情况使用静态数据
        return filteredData;
    }, [isLoggedIn, selectedKeys, filteredData, loginedMessageData]);

    // 获取当前应该显示的消息
    const currentMessages = useMemo(() => {
        const currentKey = selectedKeys[0] || '1';
        // 使用当前数据源
        const messages = currentDataSource[currentKey] || [];

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
    }, [selectedKeys, pagesState, currentDataSource, showUnreadOnly, readMessageIds, getCurrentPage]);

    // 处理页码变化
    const handlePageChange = (page: number) => {
        const currentKey = selectedKeys[0] || '1';
        setPagesState(prev => ({
            ...prev,
            [currentKey]: page
        }));
    };

    // 获取公告详情
    const fetchMessageDetail = async (messageId: string) => {
        if (!isLoggedIn || !messageId) return;

        setIsLoading(true);
        try {
            const lang = localStorage.getItem('lang') || 'zh_CN';
            const response = await getBulletinDetailLogined({
                languageCode: lang,
                id: parseInt(messageId, 10) // 将字符串 ID 转换为数字
            }) as any;

            if (response?.code === '0' && response.data) {
                setCurrentMessageContent(response.data.content || '');

                // 更新当前消息对象，添加内容
                if (currentMessage) {
                    setCurrentMessage({
                        ...currentMessage,
                        content: response.data.content
                    });
                }

                // 标记该消息为已读
                setReadMessageIds(prev => new Set([...prev, messageId]));

                // 更新未读公告数量
                fetchUnreadCount();
            }
        } catch (error) {
            console.error('获取公告详情失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 处理菜单选择变化
    const handleMenuSelect = (info: { key: string }) => {
        // 如果未登录且试图选择非公告菜单项，不执行操作
        if (!isLoggedIn && info.key !== '1') {
            return;
        }

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
            // 记录为已读
            setReadMessageIds(prev => new Set([...prev, message.id || '']));

            // 保存当前状态
            setPreviousState({
                selectedKeys: selectedKeys,
                selectedLabel: selectedLabel
            });

            // 设置当前消息并显示详情页
            setCurrentMessage(message);
            setShowDetail(true);
            setShowArticle(true);
            setDetailSelectedKey('latest');
            setSelectedLabel('公告中心');

            // 获取消息详情内容 - 只有在消息没有内容时才请求
            if (isLoggedIn && message.id && !message.content) {
                fetchMessageDetail(message.id);
            } else if (message.content) {
                // 如果消息已有内容，直接设置
                setCurrentMessageContent(message.content);
            }
        }
    };

    // 处理返回公告列表页
    const handleBack = () => {
        setShowDetail(false);
        setCurrentMessageContent('');
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
    const handleReadAll = async () => {
        if (currentMessages && selectedKeys[0] === '1') {
            if (isLoggedIn) {
                // 登录状态下，调用API标记所有公告为已读
                try {
                    setIsLoading(true);

                    // 获取所有公告ID
                    const messageIds = loginedMessageData['1']
                        .filter(item => !item.isRead) // 只获取未读消息的ID
                        .map(item => parseInt(item.id || '0', 10)) // 将字符串ID转换为数字
                        .filter(id => id > 0); // 过滤掉无效ID

                    // 如果没有未读消息，则不需要调用API
                    if (messageIds.length === 0) {
                        setIsLoading(false);
                        return;
                    }

                    // 调用批量已读API
                    const response = await readBulletinMessageLogined({ ids: messageIds }) as any;

                    if (response === true || (response?.code === '0')) {
                        // 将所有消息标记为已读状态
                        const updatedFormattedData = loginedMessageData['1'].map(item => ({
                            ...item,
                            isRead: true
                        }));

                        // 更新数据
                        setLoginedMessageData({
                            '1': updatedFormattedData
                        });

                        // 标记所有消息为已读
                        const newReadIds = new Set(readMessageIds);
                        updatedFormattedData.forEach(item => {
                            if (item.id) {
                                newReadIds.add(item.id);
                            }
                        });
                        setReadMessageIds(newReadIds);

                        // 更新筛选数据
                        if (searchKeyword) {
                            handleSearch(searchKeyword);
                        } else {
                            setFilteredData({
                                ...messageData,
                                '1': updatedFormattedData
                            });
                        }

                        // 更新未读公告数量
                        fetchUnreadCount();
                    }
                } catch (error) {
                    console.error('标记全部已读失败:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // 未登录状态下，仅在本地标记已读
                const newReadIds = new Set(readMessageIds);

                // 使用当前数据源的消息
                const messages = messageData['1'];
                // 更新消息状态
                const updatedMessages = messages.map(message => ({
                    ...message,
                    isRead: true
                }));

                // 添加所有ID到已读集合
                updatedMessages.forEach(message => {
                    if (message.id) {
                        newReadIds.add(message.id);
                    }
                });

                setReadMessageIds(newReadIds);

                // 更新筛选数据
                if (searchKeyword) {
                    handleSearch(searchKeyword);
                } else {
                    setFilteredData({
                        ...filteredData,
                        '1': updatedMessages
                    });
                }
            }

            // 重置当前页码为1
            setPagesState(prev => ({
                ...prev,
                '1': 1  // 只重置公告菜单（key='1'）的页码
            }));
        }
    };

    // 在渲染列表时使用筛选和排序后的数据
    const filteredAndSortedMessages = getFilteredAndSortedMessages(currentMessages.data);

    // 处理搜索
    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword);

        if (!keyword.trim()) {
            // 如果搜索关键词为空，恢复原始数据
            if (isLoggedIn) {
                setFilteredData({
                    ...messageData,
                    '1': loginedMessageData['1']
                });
            } else {
                setFilteredData(messageData);
            }
            setFilteredDetailData(detailListData);
            return;
        }

        // 确定要搜索的源数据
        const sourceData = isLoggedIn ?
            { ...messageData, '1': loginedMessageData['1'] } :
            messageData;

        // 过滤消息数据
        const newFilteredData = Object.keys(sourceData).reduce((acc, key) => {
            const filtered = sourceData[key].filter(item =>
                item.title.toLowerCase().includes(keyword.toLowerCase()) ||
                (item.content && item.content.toLowerCase().includes(keyword.toLowerCase()))
            );
            if (filtered.length > 0) {
                acc[key] = filtered;
            }
            return acc;
        }, {} as typeof messageData);

        // 过滤详情列表数据
        const newFilteredDetailData = Object.keys(detailListData).reduce((acc, key) => {
            const filtered = detailListData[key].filter(item =>
                item.title.toLowerCase().includes(keyword.toLowerCase()) ||
                (item.content && item.content.toLowerCase().includes(keyword.toLowerCase()))
            );
            if (filtered.length > 0) {
                acc[key] = filtered;
            }
            return acc;
        }, {} as typeof detailListData);

        setFilteredData(newFilteredData);
        setFilteredDetailData(newFilteredDetailData);
    };

    // 渲染带高亮的标题
    const renderHighlightedTitle = (title: string) => {
        return searchKeyword ? highlightText(title, searchKeyword) : title;
    };

    // 渲染带高亮的内容
    const renderHighlightedContent = (content?: string) => {
        if (!content) return null;
        return searchKeyword ? highlightText(content, searchKeyword) : content;
    };


    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: {
                        inputFontSize: 12,
                        colorTextPlaceholder: 'var(--help-center-input-text)',
                        colorBorder: 'var(--border-color4)',
                        activeBg: 'transparent',
                        hoverBg: 'transparent',
                        colorText: 'var(--text-color5)'
                    },
                    Menu: {
                        itemColor: '#A4A5AC',
                        itemHoverBg: 'var(--theme-color)',
                        itemSelectedBg: 'var(--theme-color)',
                        itemHoverColor: '#FFFFFF',
                        itemSelectedColor: '#FFFFFF',
                        itemMarginInline: 20,
                        itemMarginBlock: 0,
                        itemBorderRadius: 10
                    },
                    Pagination: {
                        itemActiveBg: 'var(--theme-color)',
                    },
                    Breadcrumb: {
                        itemColor: 'var(--text-color6)',
                        lastItemColor: 'var(--text-color5)',
                        separatorColor: 'var(--text-color6)',
                        linkColor: 'var(--text-color6)',
                        linkHoverColor: 'none',
                    },
                    Empty: {
                        colorTextDescription: 'var(--text-color6)'
                    }
                },
                token: {
                    colorPrimary: 'var(--theme-color)',
                },
            }}
        >
            <div className={styles.bulletinContainer}>
                <RenderBulletinTop
                    showDetail={showDetail}
                    onBack={handleBack}
                    onReadAll={handleReadAll}
                    onUnreadChange={handleUnreadChange}
                    onSearch={handleSearch}
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
                            <Card style={{ backgroundColor: 'transparent' }}>
                                <Row>
                                    <Col>
                                        <h5 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-color5)' }}>
                                            {selectedLabel}
                                        </h5>
                                    </Col>
                                </Row>
                                <Row>
                                    {showDetail && currentMessage ? (
                                        <Col flex={1}>
                                            <MessageItemDetail
                                                message={{
                                                    ...currentMessage,
                                                    content: currentMessageContent || currentMessage.content
                                                }}
                                                onBack={handleBack}
                                                currentDetailLabel={selectedLabel === '公告中心' ? '最新动态' : selectedLabel} // 传递当前选中的标签
                                                currentDetailKey={detailSelectedKey} // 传递当前选中的 key
                                                onLatestClick={handleLatestClick} // 传递点击最新动态的处理函数
                                                showArticle={showArticle} // 传递是否显示文章详情的状态
                                            />
                                        </Col>
                                    ) : (
                                        <Col flex={1}>
                                            {isLoading ? (
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    padding: '40px 0'
                                                }}>
                                                    正在加载...
                                                </div>
                                            ) : filteredAndSortedMessages.length > 0 ? (
                                                filteredAndSortedMessages.map((message) => (
                                                    <MessageItem
                                                        key={message.id}
                                                        title={renderHighlightedTitle(message.title) as string}
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