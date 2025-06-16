import { Col, Row, ConfigProvider, Menu, Card, Empty, Pagination } from 'antd';
import type { MenuProps } from 'antd';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import MessageItem from './components/MessageItem';
import MessagePagination from './components/MessagePagination';
import styles from './styles/bulletinCenter.module.css';
import { menuData as staticMenuData } from '@/data/bulletinCenter/getItemsMessage';
import { MessageData } from '@/type/bulletin_center/bc_types';
import { highlightText } from '@/utils/highlight';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@/context/NavigationContext';
import { useRouter } from 'next/navigation';
import { getBulletinMessageLogined, getBulletinDetailLogined, readBulletinMessageLogined, getBulletinMessageUnreadCount, getInformUserMessageList } from '@/services/bulletinCenter';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


type MenuItem = Required<MenuProps>['items'][number];

export default function BulletinCenter() {
    // 获取登录状态
    const { isLoggedIn } = useAuth();
    // 获取导航上下文中的公告数据
    const { bulletinData } = useNavigation();
    const { t, i18n } = useTranslation(['builetinCenter', 'common']);

    // API请求状态跟踪
    const apiRequestRef = useRef({
        unreadCountLoading: false,
        unreadCountTimestamp: 0,
        bulletinLoading: false,
        lastBulletinTimestamp: 0
    });

    // 状态管理：跟踪悬浮的菜单项和选中的菜单项
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(['all']); // 默认选中 'all'
    const [selectedLabel, setSelectedLabel] = useState<string>(t('bulletinCenter.menu.all')); // 跟踪选中的菜单项标签，默认为"全部公告"
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
    const router = useRouter();

    // 站内信相关状态管理
    const [accountLoading, setAccountLoading] = useState(false);
    const [assetsLoading, setAssetsLoading] = useState(false);
    const [transactionLoading, setTransactionLoading] = useState(false);
    const [bizData, setBizData] = useState<any[]>([]);
    const pagesParam = useRef({
        page: 1,
        pageSize: 5,
        pageTotal: 0
    })

    // 定义消息数据接口
    interface MessageData {
        id?: string;
        title?: string;
        time?: string;
        content?: string;
        isRead?: boolean;
        classMenu?: string;
        onTop?: number; // 置顶状态：1表示置顶，0表示不置顶
    }

    // 定义详情列表数据接口
    interface DetailListItem {
        title: string;
        time: string;
        content?: string;
        key?: string;
    }

    // 定义本地详情页数据
    const localDetailListData: Record<string, Array<DetailListItem>> = {
        'latest': [
            { title: t('bulletinCenter.test.latest1.title'), time: '2024-12-16 10:00:00', content: t('bulletinCenter.test.latest1.content') },
            { title: t('bulletinCenter.test.latest2.title'), time: '2024-12-16 09:30:00', content: t('bulletinCenter.test.latest2.content') }
        ],
        'new': [
            { title: t('bulletinCenter.test.new1.title'), time: '2024-12-15 11:00:00', content: t('bulletinCenter.test.new1.content') }
        ],
        'delist': [
            { title: t('bulletinCenter.test.delist1.title'), time: '2024-12-14 15:30:00', content: t('bulletinCenter.test.delist1.content') }
        ],
        'suspension': [
            { title: t('bulletinCenter.test.suspension1.title'), time: '2024-12-13 17:45:00', content: t('bulletinCenter.test.suspension1.content') }
        ]
    };

    const [filteredData, setFilteredData] = useState<Record<string, MessageData[]>>({});
    const [filteredDetailData, setFilteredDetailData] = useState<Record<string, Array<{ title: string; time: string; content?: string }>>>(localDetailListData);
    // 添加登录后的公告数据状态
    const [loginedMessageData, setLoginedMessageData] = useState<Record<string, MessageData[]>>({
        'all': []
    });
    // 当前公告详情内容
    const [currentMessageContent, setCurrentMessageContent] = useState<string>('');
    // 是否正在加载数据
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // 未读公告数量
    const [unreadCount, setUnreadCount] = useState<number>(0);
    // 自定义菜单数据
    const [menuData, setMenuData] = useState(() => {
        // 在初始化时就对菜单标签进行翻译
        return staticMenuData.map(item => ({
            ...item,
            label: t(item.label) // 翻译菜单标签
        }));
    });
    // 标记是否已从NavigationContext获取过数据
    const [hasInitializedFromContext, setHasInitializedFromContext] = useState(false);

    // 获取未读公告数量 - 带防抖和缓存
    const fetchUnreadCount = useCallback(async (forceRefresh = false) => {
        if (!isLoggedIn) {
            setUnreadCount(0);
            return;
        }

        const now = Date.now();
        // 如果上次请求在3秒内，且不是强制刷新，则跳过
        if (
            apiRequestRef.current.unreadCountLoading ||
            (!forceRefresh && now - apiRequestRef.current.unreadCountTimestamp < 3000)
        ) {
            return;
        }

        try {
            apiRequestRef.current.unreadCountLoading = true;
            apiRequestRef.current.unreadCountTimestamp = now;

            const response = await getBulletinMessageUnreadCount() as any;
            if (response?.code === '0' && response.data !== undefined) {
                setUnreadCount(response.data);
                // 更新菜单数据中的公告数量
                const updatedMenuData = staticMenuData.map((item, index) => {
                    if (index === 0) {
                        // 只更新第一个菜单项（公告）的标签来显示未读数量
                        return {
                            ...item,
                            label: t('bulletinCenter.message.unreadCount', { count: response.data || 0 })
                        };
                    }
                    // 其他菜单项保持翻译后的标签
                    return {
                        ...item,
                        label: t(item.label)
                    };
                });
                setMenuData(updatedMenuData);
            }
        } catch (error) {
            console.error('获取未读公告数量失败:', error);
        } finally {
            apiRequestRef.current.unreadCountLoading = false;
        }
    }, [isLoggedIn, i18n.language]);

    // 通用的站内信数据获取函数
    const fetchUserMessageData = useCallback(async (bizType: 'account' | 'assets' | 'transaction') => {
        try {
            // 设置对应的加载状态
            switch (bizType) {
                case 'account':
                    setAccountLoading(true);
                    break;
                case 'assets':
                    setAssetsLoading(true);
                    break;
                case 'transaction':
                    setTransactionLoading(true);
                    break;
            }

            const lang = localStorage.getItem('lang') || 'en_US';
            const response: any = await getInformUserMessageList({
                languageCode: lang,
                pageNum: pagesParam.current.page,
                pageSize: pagesParam.current.pageSize,
                bizType
            });

            if (response.code === '0' && response.data) {
                const formattedData = response.data.list?.map((item: any) => ({
                    id: item.id,
                    title: item.titleTemplate,
                    time: dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
                    content: item.contentTemplate || '',
                    isRead: item.isRead || false,
                    link: item.link || ''
                })) || [];

                // 根据bizType设置对应的数据
                // switch (bizType) {
                //     case 'account':
                //         setAccountData(formattedData);
                //         break;
                //     case 'assets':
                //         setAssetsData(formattedData);
                //         break;
                //     case 'transaction':
                //         setTransactionData(formattedData);
                //         break;

                // }
                pagesParam.current.pageTotal = response.data.count;
                setBizData(formattedData)
            } else {
                // 如果没有数据，设置为空数组
                // switch (bizType) {
                //     case 'account':
                //         setAccountData([]);
                //         break;
                //     case 'assets':
                //         setAssetsData([]);
                //         break;
                //     case 'transaction':
                //         setTransactionData([]);
                //         break;
                // }
                setBizData([])
            }
        } catch (error) {
            console.error(`获取${bizType}消息数据失败:`, error);
            // 错误时设置为空数组
            // switch (bizType) {
            //     case 'account':
            //         setAccountData([]);
            //         break;
            //     case 'assets':
            //         setAssetsData([]);
            //         break;
            //     case 'transaction':
            //         setTransactionData([]);
            //         break;
            // }
            setBizData([])
        } finally {
            // 清除加载状态
            switch (bizType) {
                case 'account':
                    setAccountLoading(false);
                    break;
                case 'assets':
                    setAssetsLoading(false);
                    break;
                case 'transaction':
                    setTransactionLoading(false);
                    break;
            }
        }
    }, []);

    // 使用NavigationContext中的数据初始化公告数据
    useEffect(() => {
        if (isLoggedIn && bulletinData && bulletinData.length > 0 && !hasInitializedFromContext) {
            // 从NavigationContext转换数据格式
            const formattedData = bulletinData.map((item: { id: string; h5Text: string; spanText: string }, index: number) => ({
                id: item.id, // Use the ID from context
                title: item.h5Text,
                time: item.spanText,
                isRead: false // 初始假设所有消息未读
            }));

            // 更新数据
            setLoginedMessageData({
                'all': formattedData
            });

            // 更新筛选数据
            if (searchKeyword) {
                handleSearch(searchKeyword);
            } else {
                setFilteredData({
                    'all': formattedData
                });
            }

            // 标记已从Context获取过数据
            setHasInitializedFromContext(true);

            // 获取未读公告数量
            fetchUnreadCount();
        }
    }, [isLoggedIn, bulletinData]);

    // 监听登录状态变化，确保在登录状态变化时重置菜单选择并获取未读数量
    useEffect(() => {
        // 如果未登录，或者选择的菜单不是公告（key='all'），则重置为公告菜单
        if (!isLoggedIn && selectedKeys[0] !== 'all') {
            setSelectedKeys(['all']);
            setSelectedLabel(t('bulletinCenter.menu.all'));
            // 重置页码
            setPagesState(prev => ({
                ...prev,
                '1': 1
            }));
            // 重置为默认菜单数据，并确保标签被翻译
            setMenuData(staticMenuData.map(item => ({
                ...item,
                label: t(item.label)
            })));
            // 清理站内信数据
            // setAccountData([]);
            // setAssetsData([]);
            // setTransactionData([]);
            setBizData([]);
        } else if (isLoggedIn && selectedKeys[0] === 'all') {
            // 只有在登录状态且选择公告菜单时才获取未读公告数量
            fetchUnreadCount(true);
        }
    }, [isLoggedIn, readMessageIds, fetchUnreadCount, selectedKeys]);

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

    // 定义详情页菜单项
    const localDetailMenuItems = [
        {
            key: 'latest',
            label: t('bulletinCenter.menu.latest'),
            defaultIcon: '/images/bulletin_center/icon_Dynamic state.png',
            hoverIcon: '/images/bulletin_center/icon_Dynamic state_hover.png',
        },
        {
            key: 'new',
            label: t('bulletinCenter.menu.new'),
            defaultIcon: '/images/bulletin_center/icon_Top line.png',
            hoverIcon: '/images/bulletin_center/icon_Top line_hover.png',
        },
        {
            key: 'delist',
            label: t('bulletinCenter.menu.delist'),
            defaultIcon: '/images/bulletin_center/icon_downline.png',
            hoverIcon: '/images/bulletin_center/icon_downline_hover.png',
        },
        {
            key: 'suspension',
            label: t('bulletinCenter.menu.suspension'),
            defaultIcon: '/images/bulletin_center/icon_charging.png',
            hoverIcon: '/images/bulletin_center/icon_charging_hover.png',
        }
    ];

    // 生成公告中心顶层菜单项（根据登录状态过滤）
    const items = generateMenuItems(filteredMenuData, selectedKeys);
    // 生成详情页菜单项
    const detailItems = generateMenuItems(localDetailMenuItems, detailSelectedKey);

    // 判断消息是否已读
    const isMessageRead = (messageId: string) => {
        // 只有公告菜单项的消息才判断已读状态
        if (selectedKeys[0] === 'all') {
            return readMessageIds.has(messageId);
        }
        return false; // 其他菜单项始终返回 false，保持原有颜色
    };

    // 获取经过筛选和排序的消息列表：先按置顶状态，再按已读状态，最后按时间排序
    const getFilteredAndSortedMessages = (messages: MessageData[]) => {
        if (selectedKeys[0] === 'all') {
            let filteredMessages = [...messages];

            // 如果开启了只看未读，过滤出未读消息
            if (showUnreadOnly) {
                filteredMessages = filteredMessages.filter(message => !isMessageRead(message.id || ''));
            }

            // 按置顶状态、已读状态和时间排序
            return filteredMessages.sort((a, b) => {
                // 首先按置顶状态排序
                const aOnTop = a.onTop === 1;
                const bOnTop = b.onTop === 1;

                if (aOnTop !== bOnTop) {
                    return aOnTop ? -1 : 1; // 置顶的排在前面
                }

                // 其次按已读状态排序
                const aRead = isMessageRead(a.id || '');
                const bRead = isMessageRead(b.id || '');

                if (aRead !== bRead) {
                    return aRead ? 1 : -1; // 未读的排在前面
                }

                // 最后按时间排序
                const timeA = dayjs(a.time);
                const timeB = dayjs(b.time);
                return timeB.diff(timeA); // 新的排在前面
            });
        }
        return messages;
    };

    // 获取当前应该显示的消息数据源
    const currentDataSource = useMemo(() => {
        // 如果已登录，根据选择的菜单返回对应的数据
        if (isLoggedIn) {
            const currentKey = selectedKeys[0];
            switch (currentKey) {
                case 'all':
                    return {
                        ...filteredData,
                        'all': loginedMessageData['all']
                    };
                case 'account':
                    return {
                        'account': bizData
                    };
                case 'assets':
                    return {
                        'assets': bizData
                    };
                case 'trading':
                    return {
                        'trading': bizData
                    };
                default:
                    return filteredData || {};
            }
        }
        // 其他情况使用筛选数据或空对象
        return filteredData || {};
    }, [isLoggedIn, selectedKeys, filteredData, loginedMessageData, bizData]);

    // 获取当前应该显示的消息
    const currentMessages = useMemo(() => {
        const currentKey = selectedKeys[0] || 'all';
        // 使用当前数据源
        const messages = currentDataSource[currentKey as keyof typeof currentDataSource] || [];

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
    }, [selectedKeys, currentDataSource, getCurrentPage]);

    // 处理页码变化
    const handlePageChange = (page: number) => {
        const currentKey = selectedKeys[0] || 'all';
        setPagesState(prev => ({
            ...prev,
            [currentKey]: page
        }));
    };

    // 处理站内信分页变化
    const handleBizPageChange = (page: number) => {
        pagesParam.current.page = page;
        const currentKey = selectedKeys[0];
        if (currentKey === 'account') {
            fetchUserMessageData('account');
        } else if (currentKey === 'assets') {
            fetchUserMessageData('assets');
        } else if (currentKey === 'trading') {
            fetchUserMessageData('transaction');
        }
    };

    // 获取公告详情 - 添加防抖和缓存
    const fetchMessageDetail = useCallback(async (messageId: string) => {
        if (!isLoggedIn || !messageId) return;

        // 如果已经在加载中，则不重复请求
        if (isLoading) return;

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

                // 仅在消息标记为已读后才更新未读计数
                fetchUnreadCount(true);
            }
        } catch (error) {
            console.error('获取公告详情失败:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, isLoading, currentMessage, fetchUnreadCount]);

    // 处理菜单选择变化
    const handleMenuSelect = (info: { key: string }) => {
        // 如果未登录且试图选择非公告菜单项，不执行操作
        if (!isLoggedIn && info.key !== 'all') {
            return;
        }

        setSelectedKeys([info.key]);

        if (showDetail) {
            // 在详情页时更新详情页的选中状态
            setDetailSelectedKey(info.key);
            setShowArticle(false); // 切换到列表视图
            // 在详情页时的菜单选择逻辑
            if (info.key === 'latest') {
                setSelectedLabel(t('bulletinCenter.menu.announcement'));
            } else {
                // 根据 key 设置对应的 label
                const selectedItem = localDetailMenuItems.find((item) => item.key === info.key);
                setSelectedLabel(selectedItem ? selectedItem.label : t('bulletinCenter.menu.announcement'));
            }
        } else {
            // 原有的菜单选择逻辑
            if (info.key === 'all') {
                setSelectedLabel(t('bulletinCenter.menu.all'));
            } else {
                const selectedItem = menuData.find((item) => item.key === info.key);
                setSelectedLabel(selectedItem ? selectedItem.label : t('bulletinCenter.menu.all'));

                // 根据选择的菜单项获取对应的站内信数据，每次切换都重新请求
                if (info.key === 'account') {
                    pagesParam.current.page = 1; // 重置页码
                    fetchUserMessageData('account');
                } else if (info.key === 'assets') {
                    pagesParam.current.page = 1; // 重置页码
                    fetchUserMessageData('assets');
                } else if (info.key === 'trading') {
                    pagesParam.current.page = 1; // 重置页码
                    fetchUserMessageData('transaction');
                }
            }
        }
    };

    // 点击查看详情
    const handleMessageClick = (message: MessageData, type: string = 'notice') => {
        console.log(message)
        // 跳转到Notice
        router.push(`/Notice/${message.id}`);

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
        setSelectedLabel(t('bulletinCenter.menu.announcement')); // 设置标签为最新动态
        setShowArticle(false);  // 切换到列表视图
    };

    // 处理 只看未读 变化
    const handleUnreadChange = (checked: boolean) => {
        setShowUnreadOnly(checked);
        // 重置当前选中菜单的页码为1
        const currentKey = selectedKeys[0] || 'all';
        setPagesState(prev => ({
            ...prev,
            [currentKey]: 1
        }));
    };

    // 判断是否有未读消息
    const hasUnreadMessages = useMemo(() => {
        if (selectedKeys[0] === 'all') {
            // 如果是在公告菜单
            if (isLoggedIn) {
                // 登录状态下，检查未读数量或检查 loginedMessageData 是否包含未读消息
                if (unreadCount > 0) {
                    return true;
                }

                // 未读数可能未更新，检查数据中是否有未读消息
                return loginedMessageData['all'].some(message => !message.isRead);
            } else {
                // 未登录状态下，检查 readMessageIds 是否包含所有消息的 ID
                const messages: MessageData[] = currentDataSource['all' as keyof typeof currentDataSource] || []; // Use currentDataSource instead of static messageData
                return messages.some(message => !readMessageIds.has(message.id || ''));
            }
        }
        return false; // 不是公告菜单，没有未读消息
    }, [selectedKeys, isLoggedIn, unreadCount, loginedMessageData, readMessageIds, currentDataSource]);

    // 当"只看未读"选项被选中且没有未读消息时，需要自动关闭该选项
    useEffect(() => {
        if (showUnreadOnly && !hasUnreadMessages) {
            setShowUnreadOnly(false);
        }
    }, [hasUnreadMessages, showUnreadOnly]);

    // 全部已读处理
    const handleReadAll = async () => {
        // 如果没有未读消息，直接返回
        if (!hasUnreadMessages) {
            return;
        }

        if (currentMessages && selectedKeys[0] === 'all') {
            if (isLoggedIn) {
                // 登录状态下，调用API标记所有公告为已读
                try {
                    setIsLoading(true);

                    // 获取所有公告ID
                    const messageIds = loginedMessageData['all']
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
                        const updatedFormattedData = loginedMessageData['all'].map(item => ({
                            ...item,
                            isRead: true
                        }));

                        // 更新数据
                        setLoginedMessageData({
                            'all': updatedFormattedData
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
                                'all': updatedFormattedData
                            });
                        }

                        // 强制刷新未读公告数量
                        fetchUnreadCount(true);
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
                const messages: MessageData[] = currentDataSource['all' as keyof typeof currentDataSource] || []; // Use currentDataSource instead of static messageData
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
                        'all': updatedMessages
                    });
                }
            }

            // 重置当前页码为1
            setPagesState(prev => ({
                ...prev,
                'all': 1  // 只重置公告菜单（key='all'）的页码
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
                    'all': loginedMessageData['all']
                });
            } else {
                setFilteredData({});
                setFilteredDetailData(localDetailListData);
            }
            return;
        }

        // 确定要搜索的源数据
        const sourceData = isLoggedIn ?
            {
                ...filteredData,
                'all': loginedMessageData['all']
            } :
            filteredData;

        // 过滤消息数据
        const newFilteredData = Object.keys(sourceData).reduce((acc, key) => {
            const filtered = sourceData[key].filter(item =>
                (item.title?.toLowerCase().includes(keyword.toLowerCase()) || false) ||
                (item.content && item.content.toLowerCase().includes(keyword.toLowerCase()))
            );
            if (filtered.length > 0) {
                acc[key] = filtered;
            }
            return acc;
        }, {} as Record<string, MessageData[]>);

        // 通过reduce函数将localDetailListData中所有的数组合并为一个单一的数组
        const newFilteredDetailData = Object.keys(localDetailListData).reduce((acc, key) => {
            const filtered = localDetailListData[key].filter(item =>
                (item.title?.toLowerCase().includes(keyword.toLowerCase()) || false) ||
                (item.content && item.content.toLowerCase().includes(keyword.toLowerCase()))
            );
            if (filtered.length > 0) {
                acc[key] = filtered;
            }
            return acc;
        }, {} as Record<string, DetailListItem[]>);

        setFilteredData(newFilteredData);
        setFilteredDetailData(newFilteredDetailData);
    };

    // 渲染带高亮的标题
    const renderHighlightedTitle = (title?: string) => {
        if (!title) return '';
        // 确保return类型是string
        const highlighted = searchKeyword ? highlightText(title, searchKeyword) : title;
        return (typeof highlighted === 'string') ? highlighted : String(highlighted);
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
            <div className={styles.bulletinContainer} >
                {/* <RenderBulletinTop
                    showDetail={showDetail}
                    onBack={handleBack}
                    onReadAll={handleReadAll}
                    onUnreadChange={handleUnreadChange}
                    onSearch={handleSearch}
                    hasUnreadMessages={hasUnreadMessages}
                    disableUnreadCheckbox={!hasUnreadMessages}
                /> */}
                <div className={`${styles.bulletinContent} customMenu`}>
                    <Row justify='space-between' gutter={16} wrap={false} >
                        <Col flex={1}>
                            <Menu
                                defaultSelectedKeys={['all']}
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

                                    <Col flex={1}>
                                        {(() => {
                                            // 根据当前选择的菜单确定加载状态
                                            const currentKey = selectedKeys[0];
                                            let currentLoading = isLoading;

                                            if (currentKey === 'account') {
                                                currentLoading = accountLoading;
                                            } else if (currentKey === 'assets') {
                                                currentLoading = assetsLoading;
                                            } else if (currentKey === 'trading') {
                                                currentLoading = transactionLoading;
                                            }

                                            if (currentLoading) {
                                                return (
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        padding: '40px 0'
                                                    }}>
                                                        {t('bulletinCenter.message.loading')}
                                                    </div>
                                                );
                                            }

                                            if (filteredAndSortedMessages.length > 0 && selectedKeys[0] === 'all') {
                                                return <>
                                                {filteredAndSortedMessages.map((message) => (
                                                    <MessageItem
                                                        key={message.id}
                                                        title={renderHighlightedTitle(message.title) || ''}
                                                        time={message.time || ''}
                                                        onClick={() => handleMessageClick(message)}
                                                        isClickable={selectedKeys[0] === 'all'}
                                                        isRead={isMessageRead(message.id || '')} classMenu={''} />
                                                ))}
                                                <MessagePagination
                                                current={getCurrentPage(selectedKeys[0] || 'all')}
                                                total={currentMessages.total}
                                                onChange={handlePageChange}
                                                pageSize={pageSize}
                                            />
                                            </>
                                            }
                                            if (bizData.length > 0) {
                                                return <>
                                                    <div>
                                                        {bizData.map((message) => (
                                                            <MessageItem
                                                                key={message.id}
                                                                title={renderHighlightedTitle(message.title) || ''}
                                                                // time={message.time || ''}
                                                                content={message.content}
                                                                onClick={() => handleMessageClick(message, 'biz')}
                                                                isClickable={false}
                                                                isDetail={false}
                                                                isRead={isMessageRead(message.id || '')} classMenu={''} />
                                                        ))}
                                                        <MessagePagination
                                                            current={pagesParam.current.page}
                                                            total={pagesParam.current.pageTotal}
                                                            onChange={handleBizPageChange}
                                                            pageSize={pagesParam.current.pageSize}
                                                            showSizeChanger={false}
                                                            align="end"
                                                            size='small'
                                                            className='mt-5'
                                                            hideOnSinglePage // 当只有一页时隐藏分页器
                                                        />
                                                        {/* <Pagination
                                                        showSizeChanger={false},
                                                            pageSize={pagesParam.current.pageSize}
                                                            current={pagesParam.current.page}
                                                            total={pagesParam.current.pageTotal}
                                                            onChange={handleBizPageChange}
                                                            align="end"
                                                            size='small'
                                                            className='mt-5'
                                                            hideOnSinglePage // 当只有一页时隐藏分页器
                                                        /> */}
                                                    </div>
                                                </>;
                                            }
                                            return (
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    padding: '40px 0'
                                                }}>
                                                    <Empty image='/images/bulletin_center/chat.png' description={t('bulletinCenter.message.noData')} />
                                                </div>
                                            );
                                        })()}
                                       
                                    </Col>

                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </ConfigProvider>
    );
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'en', ['builetinCenter', 'common'])),
        },
    };
};