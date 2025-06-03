import styles from '@/styles/components/HomeMenu.module.css';
// import { DownOutlined, SmileOutlined, SearchOutlined, QuestionCircleOutlined, DownloadOutlined, BellOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
// import { QuestionCircleOutlined, DownloadOutlined, BellOutlined, GlobalOutlined } from '@ant-design/icons';
// import { Dropdown, Space, Input, Button, Menu, Avatar, ConfigProvider, Row, Col, Drawer, Empty, MenuProps } from 'antd';
import { Dropdown, Space, Button, Avatar, ConfigProvider, Row, Col, Drawer, Empty, Tabs, TabsProps, Badge } from 'antd';
import { MenuProps } from 'antd';
import MenuItem from './HomeMenuItems'; // 顶部菜单
import MenuAdaptiveItem from './HomeMenuAdapiveItems'; // 自适应时顶部菜单变为侧边栏菜单
import MenuItemLabel from './HomeMenuLabel';
import MenuItemChildrenLabel from './HomeMenuChildrenLabel';
import TabsItem from './TabsItem';
import { MenuListItem, HomeMenuProps, IconName, TabsItemData, menuType, LanguageParams, ApiResponse, FormattedLanguage } from '@/type/types';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import store from "@/store"
import { useRouter } from 'next/router';

// Client-side only Image component to avoid hydration mismatch
const Image = dynamic(() => import('next/image'), { ssr: false });
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { exchangeRate, homeMenu, getLanguage } from '@/services/header'; // 引入封装好的 homeMenu 方法
// import { encryptWithPublicKey } from '@/utils/jsENcrypy'; // 引入加密方法
import { useLogoImage } from '@/hooks/useKv'; // 获取logo
import { useDayModeChange } from '@/hooks/dayModeChange'; // 使用 hook
import { useThemeMode } from '@/hooks/useThemeMode'; // 导入 useThemeMode 获取当前主题状态
import { getBulletinMessage } from '@/services/bulletinCenter';
import ThemeIcon from './ThemeIcon';
import { useNavigation } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import { getLoginInfo } from '@/services/overview';
import { encryptString } from '@/utils/encrypt';
import { toast } from 'sonner';
import UserInfoMenu from './common/UserInfo';
import AssetsMenu from './common/Assets';
import LangageMenu from './common/Langage';
import { getKvObject } from '@/services/kv'
import { NoData } from '@/components/noData';
import SpotMenu from './common/Spot';
import { getInformUserMessageList } from '@/services/bulletinCenter';
import appStore from '@/store';
export default function HomeMenu() {
    // 路由
    const router = useRouter();

    // t - 多语言
    const { t, i18n } = useTranslation('common');
    // 添加调试日志
    // console.log('Current language:', i18n.language);
    // console.log('Router locale:', router.locale);
    // console.log('Translation test:', t('title_1_1_h5'));

    // 使用全局导航数据
    const {
        menus = [],
        adaptiveMenuData = [],
        bulletinData = [],
        languageList = [],
        rateData = [],
        currentLang = '',
        unreadCount = 0,
        changeLanguage = () => { }
    } = useNavigation() || {};

    // 使用 useAuth 钩子获取登录状态
    const { isLoggedIn, logout } = useAuth();

    // 是否登录
    const [isLogin, setIsLogin] = useState<boolean>(false);

    // 获取主题状态
    const { isDayMode } = useThemeMode();

    // 持久化菜单数据
    useEffect(() => {
        // 只在客户端执行
        if (typeof window === 'undefined') return;

        // 如果有数据，存储到localStorage
        if (menus.length > 0) {
            localStorage.setItem('cachedMenus', JSON.stringify(menus));
        }
        if (adaptiveMenuData.length > 0) {
            localStorage.setItem('cachedAdaptiveMenuData', JSON.stringify(adaptiveMenuData));
        }
        if (bulletinData.length > 0) {
            localStorage.setItem('cachedBulletinData', JSON.stringify(bulletinData));
        }
        // if (languageList.length > 0) {
        //     // localStorage.setItem('cachedLanguageList', JSON.stringify(languageList));
        //     appStore.setLanguageList(languageList);

        // }
        if (rateData.length > 0) {
            localStorage.setItem('cachedRateData', JSON.stringify(rateData));
        }
    }, [menus, adaptiveMenuData, bulletinData, rateData]);

    // 从本地存储获取缓存的菜单数据
    const getCachedMenuData = useMemo(() => {
        // 只在客户端执行
        if (typeof window === 'undefined') {
            return {
                cachedMenus: [],
                cachedAdaptiveMenuData: [],
                cachedBulletinData: [],
                cachedLanguageList: [],
                cachedRateData: []
            };
        }

        try {
            // 检查是否刚刚切换了语言
            const languageChanged = sessionStorage.getItem('languageChanged');
            if (languageChanged === 'true') {
                // console.log('检测到语言已切换，跳过使用缓存数据');
                sessionStorage.removeItem('languageChanged'); // 清除标志
                return {
                    cachedMenus: [],
                    cachedAdaptiveMenuData: [],
                    cachedBulletinData: [],
                    cachedLanguageList: [],
                    cachedRateData: []
                };
            }

            const cachedMenus = JSON.parse(localStorage.getItem('cachedMenus') || '[]');
            const cachedAdaptiveMenuData = JSON.parse(localStorage.getItem('cachedAdaptiveMenuData') || '[]');
            const cachedBulletinData = JSON.parse(localStorage.getItem('cachedBulletinData') || '[]');
            const cachedLanguageList = JSON.parse(localStorage.getItem('cachedLanguageList') || '[]');
            const cachedRateData = JSON.parse(localStorage.getItem('cachedRateData') || '[]');

            return {
                cachedMenus,
                cachedAdaptiveMenuData,
                cachedBulletinData,
                cachedLanguageList,
                cachedRateData
            };
        } catch (error) {
            console.error('从缓存读取菜单数据失败:', error);
            return {
                cachedMenus: [],
                cachedAdaptiveMenuData: [],
                cachedBulletinData: [],
                cachedLanguageList: [],
                cachedRateData: []
            };
        }
    }, []);

    // 合并API数据和缓存数据
    const mergedMenus = useMemo(() => menus.length > 0 ? menus : getCachedMenuData.cachedMenus, [menus, getCachedMenuData.cachedMenus]);
    // console.log('mergedMenus', mergedMenus)
    const mergedAdaptiveMenuData = useMemo(() => adaptiveMenuData.length > 0 ? adaptiveMenuData : getCachedMenuData.cachedAdaptiveMenuData, [adaptiveMenuData, getCachedMenuData.cachedAdaptiveMenuData]);
    const bulletinDataList = useMemo(() => bulletinData.length > 0 ? bulletinData : getCachedMenuData.cachedBulletinData, [bulletinData, getCachedMenuData.cachedBulletinData]);
    const mergedLanguageList = useMemo(() => languageList.length > 0 ? languageList : getCachedMenuData.cachedLanguageList, [languageList, getCachedMenuData.cachedLanguageList]);
    const mergedRateData = useMemo(() => rateData.length > 0 ? rateData : getCachedMenuData.cachedRateData, [rateData, getCachedMenuData.cachedRateData]);

    // 初始化和同步登录状态
    useEffect(() => {
        // 从 AuthContext 获取登录状态
        setIsLogin(isLoggedIn);

        // 同时也检查本地存储中的 token
        const checkLocalToken = () => {
            const token = localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN);
            if (token && !isLogin) {
                // console.log('从本地存储检测到 token，设置登录状态为 true');
                setIsLogin(true);
            }
        };

        checkLocalToken();

        // 监听登录状态变化的事件
        const handleLoginChange = () => {
            checkLocalToken();
        };

        window.addEventListener('loginStatusChanged', handleLoginChange);

        return () => {
            window.removeEventListener('loginStatusChanged', handleLoginChange);
        };
    }, [isLoggedIn]);

    // 监听登录状态变化并打印日志
    useEffect(() => {
        // console.log('登录状态已更新:', isLogin);
    }, [isLogin]);
    // 获取logo
    const { logoUrl, setLogoUrl } = useLogoImage('/home_menu_logo.png');
    // 账户助手数据
    const [accountAssistantData, setAccountAssistantData] = useState<any[]>([]);
    // 账户助手加载状态
    const [accountAssistantLoading, setAccountAssistantLoading] = useState<boolean>(false);
    // 请求导航栏数据
    const [menuData, setMenuData] = useState<any>(null);
    // 语言
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        // 检查是否在浏览器环境
        if (typeof window !== 'undefined') {
            // 从localStorage获取已保存的语言设置
            const savedLanguage = localStorage.getItem('selectedLanguage');
            if (savedLanguage) return savedLanguage;

            // 获取系统语言
            const systemLang = navigator.language.toLowerCase();
            return systemLang.includes('zh') ? '简体中文' : 'English';
        }

        // 服务器端渲染时的默认值
        return '简体中文';
    });
    
    // 获取账户助手数据
    const fetchAccountAssistantData = useCallback(async () => {
        try {
            setAccountAssistantLoading(true);
            const response: any = await getInformUserMessageList({
                languageCode: typeof selectedLanguage === 'object' && selectedLanguage ? selectedLanguage : 'zh_CN',
                pageNum: 1,
                pageSize: 20,
                bizType:'account'
            });
            
            if (response && typeof response === 'object' && response.code === 0 && response.data) {
                const formattedData = response.data.list?.map((item: any) => ({
                    id: item.id,
                    h5Text: item.titleTemplate,
                    spanText: dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
                    link: item.link || '',
                    content: item.contentTemplate || ''
                })) || [];
                
                setAccountAssistantData(formattedData);
            } else {
                setAccountAssistantData([]);
            }
        } catch (error) {
            console.error('获取账户助手数据失败:', error);
            setAccountAssistantData([]);
        } finally {
            setAccountAssistantLoading(false);
        }
    }, [selectedLanguage]);
    
    // 使用 ref 跟踪是否已经获取过账户助手数据
    const hasFetchedAccountData = useRef(false);

    // 在登录状态变化时获取账户助手数据
    useEffect(() => {
        const fetchData = async () => {
            if (isLogin && isLoggedIn && !hasFetchedAccountData.current) {
                await fetchAccountAssistantData();
                hasFetchedAccountData.current = true;
            }
        };

        fetchData();
    }, [isLogin, isLoggedIn, fetchAccountAssistantData]);
    // 定义一个函数，根据 key 返回不同的图标
    const getIconByKey = (icon: IconName) => {
        switch (icon) {
            case 'img_horn':
                return <Col>
                    {typeof window !== 'undefined' && (
                        <Image
                            src="/images/home_menu/icon_horn_hover.png"
                            alt=""
                            width={20}
                            height={20}
                            priority
                        />
                    )}
                </Col>;
            case 'img_download':
                return <Col>
                    {typeof window !== 'undefined' && (
                        <Image
                            src="/images/home_menu/icon_download_line.png"
                            alt=""
                            width={20}
                            height={20}
                            priority
                        />
                    )}
                </Col>;
            // case 'img_change':
            //     // 使用记忆化的主题图标组件
            //     return <ThemeIcon />;
            case 'img_global':
                return <Col>
                    {typeof window !== 'undefined' && (
                        <Image
                            src="/images/home_menu/icon_earth_line.png"
                            alt=""
                            width={20}
                            height={20}
                            priority
                        />
                    )}
                </Col>;
            default:
                return null;
        }
    };
    const IconHtml = ({ icon }: { icon: IconName }) => {
        return getIconByKey(icon);
    };

    const goNotice = (id: string) => {
        // console.log(id);
        // 跳转到公告详情页面
        router.push(`/Notice/${id}`);
    }

    // 公告中心标签页 - 使用动态获取的数据
    const bulletinItems: TabsProps['items'] = [
        {
            key: '1',
            label: t('header.notice.notice'), //"公告"
            children:
                // 如果有公告数据则使用，否则使用默认数据
                bulletinDataList.length > 0
                    ? bulletinDataList.map((item: any, index: number) => (
                        <MenuItemLabel key={index} h5Text={item.h5Text} spanText={item.spanText} needHover onClick={() => {goNotice(item.id)}} />
                    ))
                    : (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '40px 0'
                        }}>
                            <NoData title={t('header.noNewNotice')} />
                        </div>
                    )
        },
        {
            key: '2',
            label: t('header.notice.accountAssistant'), //"账户助手"
            children: (
                accountAssistantLoading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '40px 0'
                    }}>
                        {/* 加载中... */}
                        {t('header.loading')}
                    </div>
                ) : accountAssistantData.length > 0 ? (
                    accountAssistantData.map((item: any, index: number) => (
                        <MenuItemLabel 
                            key={index} 
                            h5Text={item.h5Text} 
                            spanText={item.spanText} 
                            needHover 
                            onClick={() => { 
                                // 可以添加点击事件处理，例如跳转到详情页
                                router.push(`/account-assistant/${item.id}`);
                            }} 
                        />
                    ))
                ) : (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '40px 0'
                    }}>
                        <NoData title={t('header.noNewNotice')} />
                    </div>
                )
            ),
        },
        {
            key: '3',
            label: t('header.notice.assets'), //"资产"
            children: (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '40px 0'
                }}>
                    <NoData title={t('header.noNewNotice')} />
                </div>
            ),
        },
        {
            key: '4',
            label: t('header.notice.transaction'), //"交易"
            children: (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '40px 0'
                }}>
                    <NoData title={t('header.noNewNotice')} />
                </div>
            ),
        },
    ];

    // 根据登录状态创建不同的Tabs内容
    const loginAwareBulletinItems = useMemo(() => {
        // 添加调试日志
        // console.log('重新计算标签内容，当前登录状态:', isLogin);

        // 如果已登录，返回所有标签页；否则只返回公告标签页
        if (isLogin) {
            return bulletinItems;
        } else {
            return [bulletinItems[0]];
        }
    }, [isLogin, bulletinItems]);

    // 使用 useMemo 缓存菜单项配置
    const iconMenusLogin = useMemo(() => [
        {
            key: '1',
            title: (
                <Badge count={isLoggedIn ? unreadCount : 0} size="small" offset={[2, -4]}>
                    <IconHtml icon="img_horn" />
                </Badge>
            ),
            widthSet: 'bell',
            items: [
                {
                    key: '0',
                    type: 'group',
                    label: (
                        <Row align='middle' justify='space-between'>
                            <Col>
                                <span style={{
                                    fontSize: '16px',
                                    color: 'var(--text-color5)'
                                }}>
                                    {/* 消息 */}
                                    {t('header.notice.message')}
                                </span>
                            </Col>
                            <Col>
                                <Link href='/bulletinCenter'>
                                    <span
                                        style={{
                                            color: 'var(--theme-color)',
                                            fontSize: '14px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {/* 查看全部 */}
                                        {t('header.notice.viewAll')}
                                    </span>
                                </Link>
                            </Col>
                        </Row>
                    ),
                    children: [
                        {
                            key: '0-1',
                            type: 'group',
                            label: (
                                <ConfigProvider
                                    theme={{
                                        components: {
                                            Tabs: {
                                                inkBarColor: 'var(--text-color5)',
                                                itemColor: '#6D6F7A',
                                                itemActiveColor: 'var(--text-color5)',
                                                itemHoverColor: '#6D6F7A',
                                                itemSelectedColor: 'var(--text-color5)',
                                                colorBorderSecondary: 'var(--border-color4)'
                                            },
                                        },
                                    }}
                                >
                                    <Tabs
                                        defaultActiveKey="1"
                                        items={loginAwareBulletinItems}
                                        key={`tabs-${isLogin ? 'logged-in' : 'logged-out'}`}
                                    />
                                </ConfigProvider>
                            ),
                        }
                    ]
                },
            ],
        },
        {
            key: '2',
            title: <IconHtml icon="img_change" />,
            widthSet: 'question',
            items: [],
        },
    ], [isLogin, loginAwareBulletinItems]); // 添加所有需要的依赖

    // 使用 useMemo 缓存渲染结果
    const iconItemsLogin = useMemo(() =>
        iconMenusLogin.map(iconMenu =>
            <MenuItem key={iconMenu.key} menuList={iconMenu} haveArrow={true} />
        ),
        [iconMenusLogin]
    );

    // 解决服务端渲染和客户端渲染不一致的问题
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    const listItems = mergedMenus.map((menuList: MenuListItem) => {
        return <MenuItem key={menuList.key} menuList={menuList} haveArrow={false} isCascading />
    });

    // 左侧菜单展开
    const [open, setOpen] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(true);

    const showMenu = () => {
        setOpen(true);
        setLoading(true);

        // Simple loading mock. You should add cleanup logic in real world.
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    // 使用两种不同的渲染策略来避免水合错误
    const ServerContent = () => (
        <div className={styles.container}>
            <div className={styles.logo}>
                {/* 简化的静态内容 */}
                <div></div>
            </div>
            <div className={styles.menuContainer}>
                {/* 简化的静态内容 */}
                <div className={styles.menuListContainer}></div>
                <div className={styles.rightListContainer}></div>
            </div>
        </div>
    );

    // 如果在服务器端，或者客户端组件尚未挂载，返回简化版本
    if (typeof window === 'undefined' || !isMounted) {
        return (
            <ConfigProvider
                theme={{
                    components: {
                        Dropdown: {
                            colorBgElevated: 'var(--background-menu)',
                            colorText: 'var(--text-color5)'
                        },
                        Menu: {
                            itemBg: 'var(--background-menu)',
                            itemColor: 'var(--text-color5)',
                        }
                    }
                }}
            >
                <ServerContent />
            </ConfigProvider>
        );
    }

    // 客户端已挂载的完整内容
    return (
        <ConfigProvider
            theme={{
                components: {
                    Dropdown: {
                        colorBgElevated: 'var(--background-menu)',
                        colorText: 'var(--text-color5)'
                    },
                    Menu: {
                        itemBg: 'var(--background-menu)',
                        itemColor: 'var(--text-color5)',
                        colorSplit: 'var(--border-color4)'
                    },
                    Input: {
                        inputFontSize: 12,
                        colorTextPlaceholder: 'var(--help-center-input-text)',
                        colorBorder: 'var(--border-color4)',
                        activeBg: 'transparent',
                        hoverBg: 'transparent',
                        colorText: 'var(--text-color5)'
                    },
                    Empty: {
                        colorTextDescription: 'var(--text-color6)'
                    }
                }
            }}
        >
            <div style={{ position: 'relative', borderBottom: '0.5px solid #37373A' }}>
                <div className={styles.container}>
                    <div className={styles.logo}>
                        {typeof window !== 'undefined' && (
                            <Image
                                src={logoUrl}
                                alt=""
                                width={120}
                                height={40}
                                onError={() => setLogoUrl('/home_menu_logo.png')}
                                className='pointer'
                                onClick={() => router.push('/')}
                                priority
                            />
                        )}
                    </div>
                    <div className={styles.menuContainer}>
                        <div className={styles.menuListContainer}>
                            <Row align='middle'>
                                <Row>
                                    <Col style={{ cursor: 'pointer' }} onClick={showMenu}>
                                        {/* <img src='/images/home_menu/icon_classify_line.png' style={{ width: '18px', height: '18px', marginRight: '20px' }} /> */}
                                        {typeof window !== 'undefined' && (
                                            <Image
                                                src="/images/home_menu/icon_classify_line.png"
                                                alt=""
                                                width={18}  // 必须指定宽度
                                                height={18} // 必须指定高度
                                                style={{ marginRight: '20px' }}
                                                priority
                                            />
                                        )}
                                    </Col>
                                </Row>
                                <Row align='middle' className={styles.collapsedMenu}>
                                    <Col>{listItems}</Col>
                                </Row>
                            </Row>
                        </div>
                        <div className={styles.rightListContainer}>
                            <Dropdown
                                // menu={{
                                //     items: inputItems,
                                // }}
                                overlayStyle={{ top: '80px', maxWidth: '390px', width: '390px' }}
                            >
                                <a onClick={(e) => e.preventDefault()}>
                                    <Space>
                                        <ConfigProvider
                                            theme={{
                                                components: {
                                                    Input: {
                                                        activeBorderColor: 'var(--theme-color)',
                                                        hoverBorderColor: 'var(--theme-color)'
                                                    },
                                                },
                                                token: {
                                                    // colorTextPlaceholder: '#979897',
                                                    fontSize: 12
                                                }
                                            }}
                                        >

                                        </ConfigProvider>
                                    </Space>
                                </a>
                            </Dropdown>
                            <div className={`${styles.loginContent} customMenu`}>
                                <Row gutter={16} align='middle'>
                                    {
                                        isLogin ? (
                                            <>
                                                <Col>

                                                    <AssetsMenu />
                                                </Col>
                                                <Col>

                                                    <SpotMenu />
                                                </Col>
                                                <Col>

                                                    <UserInfoMenu />
                                                </Col>
                                                {iconItemsLogin}
                                                {/* <Col> */}
                                                <LangageMenu />
                                                {/* </Col> */}
                                            </>
                                        ) : (
                                            <>
                                                <Col><Link href='/register' className={styles.register}><span style={{ color: '#FFF' }}>{t('header.register')}</span></Link></Col>
                                                <Col><Link href='/login' className={styles.login}><span style={{ color: '#FFF' }}>{t('header.login')}</span></Link></Col>
                                                <div style={{ height: '20px', border: '1px solid #676867', margin: '0 12px' }}></div>

                                                {iconItemsLogin}

                                                <LangageMenu />

                                            </>
                                        )
                                    }
                                </Row>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className={styles.container}>
                    <div>{menuData ? JSON.stringify(menuData) : '暂无数据'}</div>
                </div> */}
                {/* 点击展开的左侧菜单栏 */}
                {/* <Drawer
                    closable
                    destroyOnClose
                    title={<p>菜单</p>}
                    placement="left"
                    open={open}
                    loading={loading}
                    onClose={() => setOpen(false)}
                    style={{ position: 'relative' }}
                    width={288}
                >
                    <Button type="primary" style={{ marginBottom: 16 }} onClick={showMenu}>
                        Reload
                    </Button>
                    <MenuAdaptiveItem menuList={adaptiveMenuData} />
                </Drawer> */}
                {/* <p>{t('home_menu:home_menu_title_2')}</p> */}
            </div>
        </ConfigProvider>
    );
}
