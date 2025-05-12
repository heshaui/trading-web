import { Col, Row, ConfigProvider, Menu, Card, Empty } from 'antd';
import type { MenuProps } from 'antd';
import { useCallback, useMemo, useState, useEffect, useRef, SetStateAction } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import MessageItem from './components/MessageItem';
import MessagePagination from './components/MessagePagination';
import MessageItemDetail from './components/MessageItemDetail';
import RenderBulletinTop from './components/RenderBulletinTop';
import styles from './styles/bulletinCenter.module.css';
// 使用API获取菜单数据
import { MessageData } from '@/type/bulletin_center/bc_types';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@/context/NavigationContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getBulletinMessageLogined, getBulletinDetailLogined, readBulletinMessageLogined, getBulletinMessageUnreadCount, getInformClassMenuList } from '@/services/bulletinCenter';
import { set } from 'mobx';
import { useThemeMode } from '@/hooks/useThemeMode';


type MenuItem = Required<MenuProps>['items'][number];

export default function Notice() {
    // 获取登录状态
    const { isLoggedIn } = useAuth();
    // 获取导航上下文中的公告数据
    const { bulletinData } = useNavigation();
    // 获取路由参数
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    // API请求状态跟踪
    const apiRequestRef = useRef({
        unreadCountLoading: false,
        unreadCountTimestamp: 0,
        bulletinLoading: false,
        lastBulletinTimestamp: 0,
        menuDataLoading: false,
        menuDataTimestamp: 0
    });

    // 状态管理：公告详情、菜单数据等
    const [currentMessage, setCurrentMessage] = useState<MessageData | null>(null);
    const [currentMessageContent, setCurrentMessageContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true); // 初始状态设为加载中
    const [isDataInitialized, setIsDataInitialized] = useState<boolean>(false); // 数据是否已初始化
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [selectedLabel, setSelectedLabel] = useState<string>('公告中心');
    const [menuList, setMenuList] = useState<Array<{
        classDesc: SetStateAction<string>;id: number, classMenu: string, languageContent: string, serialNum: number
}>>([]);
    const [filteredAndSortedMessages, setFilteredAndSortedMessages] = useState<MessageData[]>([]);
    const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set());
    const [showContent, setShowContent] = useState(false);
    // 存储公告数据的映射关系，同时以id和serialNum为键存储，提高访问成功率
    const [announcementData, setAnnouncementData] = useState<Record<string, any>>({});
      const { isDayMode } = useThemeMode();

    // 获取菜单数据 - 加强错误处理和调试信息
    const fetchMenuList = useCallback(async () => {
        if (apiRequestRef.current.menuDataLoading) {
            console.log('已经有一个正在进行的菜单数据请求，等待完成');
            return Promise.resolve([]);
        }
        
        console.log('开始请求菜单数据');
        apiRequestRef.current.menuDataLoading = true;
        try {
            const lang = localStorage.getItem('lang') || 'zh_CN';
            // 确保用户看到加载过程
            await new Promise(resolve => setTimeout(resolve, 300));
            
            console.log('调用getInformClassMenuList API...');
            const response = await getInformClassMenuList({ languageCode: lang }) as any;
            console.log('完整API响应:', response);
            
            if (response?.code === '0' && Array.isArray(response.data) && response.data.length > 0) {
                console.log('获取菜单数据成功, 条目数:', response.data.length);
                console.log('第一个菜单项:', response.data[0]);
                
                // 保存菜单数据
                setMenuList(response.data);
                return response.data;
            } else {
                console.warn('菜单数据为空或格式错误:', response);
                // 确保清空当前菜单列表，避免显示旧数据
                setMenuList([]);
                return [];
            }
        } catch (error) {
            console.error('获取菜单数据失败，错误信息:', error);
            // 确保清空当前菜单列表
            setMenuList([]);
            return [];
        } finally {
            apiRequestRef.current.menuDataLoading = false;
            console.log('菜单数据请求完成');
        }
    }, []);

    // 获取公告详情
    const fetchAnnouncementDetail = useCallback(async (noticeId: string) => {
        if (!noticeId) return Promise.resolve();
        
        try {
            const lang = localStorage.getItem('lang') || 'zh_CN';
            console.log(`获取公告详情, ID: ${noticeId}`);
            
            const response = await getBulletinDetailLogined({
                languageCode: lang,
                id: parseInt(noticeId, 10)
            }) as any;

            if (response?.code === '0' && response.data) {
                const detailData = response.data;
                
                // 更新当前消息的内容
                setCurrentMessage({
                    id: detailData.id.toString(),
                    title: detailData.title,
                    time: detailData.createTimeStr,
                    content: detailData.content,
                    isRead: true,
                    classMenu: detailData.classMenu
                });
                
                setCurrentMessageContent(detailData.content || '');
                
                // 找到匹配的菜单
                const matchedMenu = menuList.find(menu => menu.id === detailData.classMenu);
                if (matchedMenu) {
                    setSelectedKeys([matchedMenu.serialNum.toString()]);
                    setSelectedLabel(matchedMenu.classDesc);
                }
                
                console.log('获取公告详情成功:', detailData);
            }
        } catch (error) {
            console.error('获取公告详情失败:', error);
        }
        return Promise.resolve();
    }, [menuList]);

    // 根据菜单ID获取公告列表，修复serialNum和id混淆的问题
    const fetchAnnouncementByMenuId = useCallback(async ({ key, id }: { key: string, id: number }) => {
        if (apiRequestRef.current.bulletinLoading) return;
        
        // 先设置加载状态
        setIsLoading(true);
        apiRequestRef.current.bulletinLoading = true;
        
        try {
            const lang = localStorage.getItem('lang') || 'zh_CN';
            console.log(`[Notice] Fetching announcements for menu key: ${key}, ID: ${id}`);
            
            const response = await getBulletinMessageLogined({
                languageCode: lang,
                classMenu: id  // 使用正确的菜单ID
            }) as any;

            console.log(`[Notice] Raw API response for menu ID ${id}:`, response);

            if (response?.code === '0') {
                // 处理返回的数据
                const announcements = Array.isArray(response.data.list) ? response.data.list.map((item: any) => ({
                    id: item.id.toString(),
                    title: item.title,
                    time: item.releaseTime,
                    content: item.content,
                    isRead: item.isRead,
                    onTop: item.onTop,
                    classMenu: item.classMenu  // 保存classMenu属性以便后续匹配
                })) : [];

                console.log(`[Notice] Processed announcements for menu ID ${id}:`, announcements);

                // 多键存储数据 - 同时存储到serialNum键和ID键下
                setAnnouncementData(prev => ({
                    ...prev,
                    [key]: announcements,  // 以serialNum为键存储
                    [id]: announcements   // 以ID为键存储
                }));
                console.log(`[Notice] Announcement data set for menu ID ${id}:`, announcements);
                // 更新当前显示的消息
                setFilteredAndSortedMessages(announcements);
                console.log(`[Notice] Successfully fetched and set announcements for menu ID ${id}. Count: ${announcements.length}`);
            } else {
                console.warn(`[Notice] API error or no data for menu ID ${id}. Response code: ${response?.code}, Response data:`, response?.data);
                // API返回错误，清空当前消息列表
                setFilteredAndSortedMessages([]);
            }
        } catch (error) {
            console.error(`[Notice] Failed to fetch announcements for menu ID ${id}:`, error);
            // 出错时设置空数组，避免显示旧数据
            setFilteredAndSortedMessages([]);
        } finally {
            // 完成后关闭加载状态
            setTimeout(() => {
                setIsLoading(false);
                apiRequestRef.current.bulletinLoading = false;
                setIsDataInitialized(true);
            }, 500);
        }
    }, []);

    // 处理返回公告列表页
    const handleBack = () => {
        router.push('/bulletinCenter');
    };



    // 处理菜单选择变化
    const handleMenuSelect = (info: { key: string }) => {
        setCurrentMessage(null); // Clear current message to hide detail view
        setSelectedKeys([info.key]);
        
        // 找到选中的菜单项
        const selectedMenu = menuList.find(menu => menu.serialNum.toString() === info.key);
        if (selectedMenu) {
            setSelectedLabel(selectedMenu.languageContent);
            
            // 使用包含正确key和id的对象调用fetchAnnouncementByMenuId
            fetchAnnouncementByMenuId({
                key: info.key,  // serialNum作为key
                id: selectedMenu.id  // 实际菜单ID
            });
        }
    };

    // 标记消息为已读
    const handleMessageClick = (message: MessageData) => {
        if (!message || !message.id) return;
        setShowContent(true);
        setCurrentMessage(message);
        setReadMessageIds(prev => new Set([...prev, message.id || '']));
        fetchAnnouncementDetail(message.id);
    };

    // 判断消息是否已读
    const isMessageRead = (messageId: string) => {
        return readMessageIds.has(messageId);
    };

    // 全部已读处理 (未实现)
    const handleReadAll = async () => {
        // 暂未实现
    };

    // 处理只看未读变化 (未实现)
    const handleUnreadChange = (checked: boolean) => {
        // 暂未实现
    };

    const onBack = () => {
        router.push('/bulletinCenter');
    };

    
    // 包装fetch函数以避免在依赖数组中添加内联函数
    const fetchData = useCallback(async () => {
        // 设置加载状态
        setIsLoading(true);
        setIsDataInitialized(false);
        
        try {
            // 获取菜单数据
            console.log('开始获取菜单数据');
            const menus = await fetchMenuList();
            console.log('成功获取菜单数据:', menus);
            
            // 获取公告详情
            const noticeId = params?.index as string;
            if (noticeId) {
                await fetchAnnouncementDetail(noticeId);
            } else if (menus && menus.length > 0) {
                // 如果没有特定公告详情ID，获取第一个菜单的公告列表
                const firstMenu = menus[0];
                console.log('选中第一个菜单项:', firstMenu);
                setSelectedKeys([firstMenu.serialNum.toString()]);
                await fetchAnnouncementByMenuId({
                    key: firstMenu.serialNum.toString(),
                    id: firstMenu.id
                });
            }
        } catch (error) {
            console.error('加载数据失败:', error);
        } finally {
            // 设置延迟以避免状态频繁切换
            setTimeout(() => {
                setIsDataInitialized(true);
                setIsLoading(false);
            }, 500);
        }
    }, [fetchAnnouncementByMenuId, fetchAnnouncementDetail, fetchMenuList, params?.index]);

    // 初始化加载
    useEffect(() => {
        fetchData();
    }, []);

    // 准备菜单项 - 确保菜单项始终有内容
    const items = useMemo(() => {
        // 如果没有菜单数据，显示加载提示
        if (menuList.length === 0) {
            return [{
                key: 'loading',
                icon: <Image src="/images/bulletin_center/icon_notice.png" alt="" width={20} height={20} />,
                label: '加载中...',
                disabled: true
            }];
        }
        
        // 使用API返回的菜单数据
        return menuList.map(menu => ({
            key: menu.serialNum.toString(),
            label: menu.languageContent,
        }));
    }, [menuList]);

    // 判断是否有未读消息 (未实现)
    const hasUnreadMessages = false;

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
                <div className={`${styles.bulletinContent} customMenu`}>
                      <div className={styles.bulletinTop}>
                                    <Image
                                        src={isDayMode
                                            ? "/images/bulletin_center/icon_arrow_left.png"
                                            : "/images/bulletin_center/icon_arrow_left_white.png"}
                                        alt=""
                                        width={24}
                                        height={24}
                                        style={{ cursor: 'pointer' }}
                                        onClick={onBack}  // 添加点击事件
                                    />
                                </div>
                    <Row justify="space-between" gutter={16}>
                        <Col flex={1}>
                            <Menu
                                selectedKeys={selectedKeys}
                                onSelect={handleMenuSelect}
                                mode="inline"
                                items={items}
                                className={styles.noticeMenu}
                            />
                        </Col>
                        <Col flex={4}>
                            <Card style={{ backgroundColor: 'transparent' }}>
                                <Row>
                                    <Col>
                                    <h5 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-color5)' ,marginBottom: 10}}>
                                            公告中心
                                        </h5>
                                        <h5 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-color5)' }}>
                                            <span style={{ color: '#676867' }}>公告</span>  /  {selectedLabel}
                                        </h5>
                                    </Col>
                                </Row>
                                <Row>

                                    {isLoading && !isDataInitialized ? (
                                        <Col span={24}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                padding: '40px 0'
                                            }}>
                                                <Empty 
                                                    image="/images/bulletin_center/chat.png" 
                                                    description="正在加载数据..."
                                                />
                                            </div>
                                        </Col>
                                    ) : currentMessage ? (
                                        <Col span={24}>
                                            <MessageItemDetail
                                                    message={{
                                                        ...currentMessage,
                                                        content: currentMessageContent || currentMessage.content || '',
                                                    }}
                                                    isDetail={showContent}
                                                    onBack={handleBack} currentDetailLabel={''} currentDetailKey={''} onLatestClick={function (): void {
                                                        throw new Error('Function not implemented.');
                                                    } } showArticle={false}                                            />
                                        </Col>
                                    ) : menuList.length === 0 ? (
                                        <Col span={24}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                padding: '40px 0'
                                            }}>
                                                <Empty 
                                                    image="/images/bulletin_center/chat.png" 
                                                    description="暂无菜单数据"
                                                />
                                            </div>
                                        </Col>
                                    ) : filteredAndSortedMessages.length > 0 ? (
                                        <Col span={24}>
                                            {filteredAndSortedMessages.map((message) => (
                                                <>
                                                <MessageItem
                                                        key={message.id}
                                                        title={message.title || ''}
                                                        time={message.time || ''}
                                                        onClick={() => handleMessageClick(message)}
                                                        isClickable={true}
                                                        isRead={isMessageRead(message.id || '')} classMenu={''}                                                />
                                                </>
                                            ))}
                                            <MessagePagination
                                                current={1}
                                                total={filteredAndSortedMessages.length}
                                                onChange={() => {}}
                                                pageSize={5}
                                            />
                                        </Col>
                                    ) : (
                                        <Col span={24}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                padding: '40px 0'
                                            }}>
                                                <Empty 
                                                    image="/images/bulletin_center/chat.png" 
                                                    description="暂无通知"
                                                />
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </ConfigProvider>
    );
}
