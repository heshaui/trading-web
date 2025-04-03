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
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import store from "@/store"
import { useRouter } from 'next/router';
import Image from 'next/image';
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
import {encryptString} from '@/utils/encrypt';
import { toast } from 'sonner';
import UserInfoMenu from './common/UserInfo';
import AssetsMenu from './common/Assets';
export default function HomeMenu() {
    // 路由
    const router = useRouter();

    // t - 多语言
    const { t, i18n } = useTranslation('home_menu');
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
        if (languageList.length > 0) {
            localStorage.setItem('cachedLanguageList', JSON.stringify(languageList));
        }
        if (rateData.length > 0) {
            localStorage.setItem('cachedRateData', JSON.stringify(rateData));
        }
    }, [menus, adaptiveMenuData, bulletinData, languageList, rateData]);

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
    const mergedAdaptiveMenuData = useMemo(() => adaptiveMenuData.length > 0 ? adaptiveMenuData : getCachedMenuData.cachedAdaptiveMenuData, [adaptiveMenuData, getCachedMenuData.cachedAdaptiveMenuData]);
    const mergedBulletinData = useMemo(() => bulletinData.length > 0 ? bulletinData : getCachedMenuData.cachedBulletinData, [bulletinData, getCachedMenuData.cachedBulletinData]);
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

    // 切换语言
    const handleLanguageChange = (lang: string) => {
        localStorage.setItem('lang', lang);
        localStorage.setItem('selectedLanguage', lang);
        changeLanguage(lang);
    };

    // 退出登录
    const handleLogout = () => {
        // store.clearUserToken();  // 清除 token
        // setIsLogin(false);
        // // 触发自定义事件
        // window.dispatchEvent(new Event('loginStatusChanged'));
        // router.push('/login');
        logout();
    };
    // 获取logo
    const { logoUrl, setLogoUrl } = useLogoImage('/home_menu_logo.png');
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

    // 资产 - 2版
    const itemsFunding = [
        {
            key: '1',
            label: (
                <MenuItemLabel 
                    src={isDayMode 
                        ? "/images/home_menu/icon_coin_line.png" 
                        : "/images/home_menu/icon_coin_line_dark.png"} 
                    h5Text="我的资产" 
                    spanText="" 
                />
            ),
        },
        {
            key: '2',
            label: (
                <MenuItemLabel 
                    src={isDayMode 
                        ? "/images/home_menu/icon_deposit.png" 
                        : "/images/home_menu/icon_deposit_dark.png"} 
                    h5Text="充币" 
                    spanText="" 
                />
            ),
        },
        {
            key: '3',
            label: (
                <MenuItemLabel 
                    src={isDayMode 
                        ? "/images/home_menu/icon_cash.png" 
                        : "/images/home_menu/icon_cash_dark.png"} 
                    h5Text="提币" 
                    spanText="" 
                />
            ),
        },
        {
            key: '4',
            label: (
                <MenuItemLabel 
                    src={isDayMode 
                        ? "/images/home_menu/icon_bill_line.png" 
                        : "/images/home_menu/icon_bill_line_dark.png"} 
                    h5Text="账单明细" 
                    spanText="" 
                />
            ),
        }
    ];
    // const moreItems = [
    //     {
    //         key: '1',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/Group (2).png" h5Text="活动中心" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '2',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_trophy.png" h5Text="我的奖励" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '3',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_invite.png" h5Text="邀请好友" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '4',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_sitemap.png" h5Text="节点计划" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '5',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_plugin.png" h5Text="IMBIT ventures" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '6',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon-Trading.png" h5Text="使用 TradingView 交易" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '7',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_file_upload.png" h5Text="上币申请" spanText="" />
    //         ),
    //     },
    // ];
    // const UserIcon = () => <UserOutlined style={{ marginLeft: '12px', fontSize: '16px', cursor: 'pointer', color: '#ffffff' }} />;
    const userItems = [
        {
            key: '1',
            type: 'item',
            label: (
                <MenuItemLabel 
                    src={isDayMode 
                        ? '/images/home_menu/icon_layout_line.png' 
                        : '/images/home_menu/icon_layout_line_dark.png'} 
                    h5Text="总览"
                    onClick={()=>{
                        router.push('/userCenter')
                    }} 
                />
            ),
        },
        {
            key: '2',
            type: 'item',
            label: (
                <MenuItemLabel 
                    src={isDayMode 
                        ? '/images/home_menu/icon_user.png' 
                        : '/images/home_menu/icon_user_dark.png'} 
                    h5Text="个人中心" 
                    onClick={()=>{
                        router.push('/userCenter/userSettings')
                    }}
                />
            ),
        },
        {
            key: '3',
            type: 'item',
            label: (
                <MenuItemLabel 
                    src={isDayMode 
                        ? '/images/home_menu/icon_safety_certificate_line.png' 
                        : '/images/home_menu/icon_safety_certificate_line_dark.png'} 
                    h5Text="安全中心" 
                    onClick={()=>{
                        router.push('/userCenter/safeCenter')
                    }}
                />
            ),
        },
        {
            key: '4',
            type: 'item',
            label: (
                <MenuItemLabel 
                    src={isDayMode 
                        ? '/images/home_menu/icon_IDcard_line.png' 
                        : '/images/home_menu/icon_IDcard_line_dark.png'} 
                    h5Text="身份认证" 
                    onClick={()=>{
                        router.push('/userCenter/identity')
                    }}
                />
            ),
        },
        // {
        //     key: '5',
        //     type: 'item',
        //     label: (
        //         <MenuItemLabel 
        //             src={isDayMode 
        //                 ? '/images/home_menu/icon_world.png' 
        //                 : '/images/home_menu/icon_world_dark.png'} 
        //             h5Text="国家/地区" 
        //         />
        //     ),
        // },
        // {
        //     key: '6',
        //     type: 'item',
        //     label: (
        //         <MenuItemLabel 
        //             src={isDayMode 
        //                 ? '/images/home_menu/icon_settings.png' 
        //                 : '/images/home_menu/icon_settings_dark.png'} 
        //             h5Text="偏好设置" 
        //         />
        //     ),
        // },
        // {
        //     key: '7',
        //     type: 'item',
        //     label: (
        //         <MenuItemLabel 
        //             src={isDayMode 
        //                 ? '/images/home_menu/icon_sub-account.png' 
        //                 : '/images/home_menu/icon_sub-account_dark.png'} 
        //             h5Text="子账户" 
        //         />
        //     ),
        // },
        // {
        //     key: '8',
        //     type: 'item',
        //     label: (
        //         <MenuItemLabel 
        //             src={isDayMode 
        //                 ? '/images/home_menu/icon_API.png' 
        //                 : '/images/home_menu/icon_API_dark.png'} 
        //             h5Text="API" 
        //         />
        //     ),
        // },
        // {
        //     key: '9',
        //     type: 'item',
        //     label: (
        //         <MenuItemLabel 
        //             src={isDayMode 
        //                 ? '/images/home_menu/icon_Third party authorization.png' 
        //                 : '/images/home_menu/icon_Third party authorization_dark.png'} 
        //             h5Text="第三方授权管理" 
        //         />
        //     ),
        // },
        {
            key: '10',
            type: 'divider',
            label: '',
        },
        {
            key: '11',
            type: 'item',
            label: (
                <MenuItemLabel 
                    src={isDayMode 
                        ? '/images/home_menu/icon_exit.png' 
                        // : '/images/home_menu/icon_exit_dark.png'} 
                        : '/images/home_menu/icon_exit_dark.png'} 
                    h5Text="退出登录" 
                    onClick={() => handleLogout()} 
                />
            ),
        },
    ];
    const [userInfo, setUserInfo] = useState<any>({});
    const userInfoOpenChange = async(open: boolean) => {
        // if(open){
        //     if(typeof window !== 'undefined'){
        //         const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || '{}')
        //         setUserInfo(userInfo)
        //     }
        // }
        const res=await getLoginInfo()
        if(res.code === "0"){
            setUserInfo(res.data)
        }else{
            toast.error(res.message)
        }
    }
    // nav***@gmail.com
    const userItemsAll = [
        {
            key: '1',
            type: 'group',
            label: (
                <MenuItemLabel src={userInfo.avatarUrl?userInfo.avatarUrl:isDayMode?'/images/home_menu/Avatar.png':'/images/home_menu/Avatar_night.png'} 
                h5Text={userInfo.registerAccount?encryptString(userInfo.registerAccount):'--'} 
                spanText={`UID：${userInfo.userId?userInfo.userId:'--'}`} 
                nickName={`${t('overview.nickname')}：${userInfo.nickname?userInfo.nickname:`IMUSER-${userInfo.userId||'--'}`}`} level='V0' />
            ),
        },
        {
            key: '2',
            type: 'group',
            label: (
                <MenuItemLabel myWords_1='近30天交易量' myWords_2='0.00' myWords_3='USD' h5Text="切换账户" isUser />
            ),
        },
        {
            key: '3',
            type: 'divider',
            label: '',
        },
        {
            key: '4',
            type: 'group',
            label: (
                <MenuItemLabel items={userItems} isUserList />
            ),
        },
    ];
    // 添加判断正负的通用函数
    function mapArray<T extends { normalNum?: string }, U extends { isPositive: boolean }>(
        array: T[],
        mapper: (item: T) => U
    ): (T & U)[] {
        return array.map(mapper) as (T & U)[];
    }
    // 处理包含normalNum属性的数组
    function addIsPositiveProperty<T extends { normalNum?: string }>(item: T): T & { isPositive: boolean } {
        return {
            ...item,
            isPositive: item.normalNum?.includes('+') || false,
        };
    }
    // 定义过滤函数
    const filterData = (data: TabsItemData[], searchValue: string) => {
        const lowerSearchValue = searchValue.toLowerCase();
        return data.filter(item =>
            item.h5Text.toLowerCase().includes(lowerSearchValue)
        );
    };

    // 定义一个函数，根据 key 返回不同的图标
    const getIconByKey = (icon: IconName) => {
        switch (icon) {
            case 'img_horn':
                return <Col>
                    <Image
                        src="/images/home_menu/icon_horn_hover.png"
                        alt=""
                        width={20}
                        height={20}
                    />
                </Col>;
            case 'img_download':
                return <Col>
                    <Image
                        src="/images/home_menu/icon_download_line.png"
                        alt=""
                        width={20}
                        height={20}
                    />
                </Col>;
            case 'img_change':
                // 使用记忆化的主题图标组件
                return <ThemeIcon />;
            case 'img_global':
                return <Col>
                    <Image
                        src="/images/home_menu/icon_earth_line.png"
                        alt=""
                        width={20}
                        height={20}
                    />
                </Col>;
            default:
                return null;
        }
    };
    const IconHtml = ({ icon }: { icon: IconName }) => {
        return getIconByKey(icon);
    };

    // 语言菜单
    const spanArr = mergedLanguageList.length > 0 ? mergedLanguageList : []

    // 使用实际数据替换静态数据
    const spanRateArr = mergedRateData.length > 0 ? mergedRateData : [];
    // 语言点击
    const [selectedRate, setSelectedRate] = useState<string>('');
    const handleLanguageClick = async (language: string, langEncode: string) => {
        // 保存选中的语言到状态和本地存储
        setSelectedLanguage(language);
        localStorage.setItem('lang', langEncode);
        localStorage.setItem('selectedLanguage', language);

        try {
            // 强制清除所有缓存 - 使用更彻底的方式
            // console.log('开始清除缓存数据...');
            
            // 方法1: 直接删除指定的缓存项
            const keysToRemove = [
                'cachedMenus',
                'cachedAdaptiveMenuData', 
                'cachedBulletinData', 
                'cachedLanguageList', 
                'cachedRateData'
            ];
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                // console.log(`已删除缓存: ${key}`);
            });
            
            // 方法2: 添加时间戳使缓存失效
            localStorage.setItem('cacheInvalidationTimestamp', Date.now().toString());
            
            // 方法3: 如果有必要，也可以考虑清除所有以'cached'开头的项
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('cached')) {
                    localStorage.removeItem(key);
                    // console.log(`已删除额外缓存: ${key}`);
                }
            });
            
            // console.log('缓存清除完成');
        } catch (error) {
            console.error('清除缓存时出错:', error);
        }

        // 直接设置i18n实例的语言
        if (typeof i18n.changeLanguage === 'function') {
            i18n.changeLanguage(langEncode.split('-')[0]);
        } else {
            // console.warn('i18n.changeLanguage 不是一个函数，可能需要检查 i18n 的初始化');
            // 使用替代方法
            localStorage.setItem('i18nextLng', langEncode.split('-')[0]);
        }

        // 根据语言编码确定Next.js的locale值
        let nextLocale = 'en';
        if (langEncode.startsWith('zh')) {
            nextLocale = 'zh'; // 简体中文 / 繁体中文
        } else if (langEncode.startsWith('ja')) {
            nextLocale = 'ja';
        } else if (langEncode.startsWith('ko')) {
            nextLocale = 'ko';
        }

        // 分发自定义事件
        const event = new CustomEvent('langChange', { detail: langEncode });
        window.dispatchEvent(event);

        // 添加调试信息
        // console.log(`切换语言: ${language}, 编码: ${langEncode}, Next.js locale: ${nextLocale}, 数据缓存已清除`);

        // 使用硬刷新确保语言切换生效并保持路径
        const currentPath = router.asPath;
        const baseUrl = window.location.origin;

        // 保存当前路径到会话存储，以便在重定向后恢复
        sessionStorage.setItem('lastPath', currentPath);
        
        // 添加标志表明这是一个语言切换，需要刷新数据
        sessionStorage.setItem('languageChanged', 'true');

        // 构建新URL时保留查询参数和哈希，并添加时间戳以防止缓存
        const url = new URL(`${baseUrl}/${nextLocale}${currentPath.startsWith('/') ? currentPath : '/' + currentPath}`);
        url.searchParams.append('t', Date.now().toString()); // 添加时间戳参数
        window.location.href = url.toString();
    };
    // 汇率点击
    const handleRateClick = (rate: string) => {
        setSelectedRate(rate);
        // 可以在这里添加其他逻辑，例如更新语言设置
    };
    // 定义语言菜单项
    const languageItems = spanArr.length > 0 ? spanArr.map((item: { span: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; key: any; }, index: number) => ({
        key: `1-${index + 1}`, // 动态生成 key
        type: 'item',
        title: `${item.span}`,
        label: (
            <span style={{
                fontWeight: selectedLanguage === item.span ? '500' : '400',
                cursor: 'pointer',
                display: 'block',
                width: '100%',
                height: '100%'
            }}
                onClick={() => handleLanguageClick(item.span as string, item.key as string)}
            >
                {item.span}
            </span> // 动态赋值
        ),
    })) : [
        {
            key: 'empty-language',
            type: 'group',
            label: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无语言数据" />
        }
    ];
    // 定义汇率菜单项
    const rateItems = spanRateArr.length > 0 ? spanRateArr.map((item: { span: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; key: any; }, index: number) => ({
        key: `3-${index + 1}`, // 动态生成 key
        type: 'item',
        title: `${item.span}`,
        label: (
            <span style={{
                fontWeight: selectedRate === item.span ? '500' : '400',
                cursor: 'pointer',
                display: 'block',
                width: '100%',
                height: '100%'
            }}
                onClick={() => handleRateClick(item.span as string)}>{item.span}
            </span> // 动态赋值
        ),
    })) : [
        {
            key: 'empty-rate',
            type: 'group',
            label: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无汇率数据" />
        }
    ];
    // 语言过滤(模糊搜索)
    const filterLanguages = (languages: any[], searchValue: string) => {
        if (!searchValue) return languages; // 如果没有搜索值，直接返回所有语言项

        const regex = new RegExp(searchValue.trim(), 'i');
        const filtered = languages.filter((lang) => {
            return regex.test(lang.label.props.children); // 匹配 label 中的 <span> 内容
        });

        // 如果过滤后的结果为空，返回空状态组件
        if (filtered.length === 0) {
            return [
                {
                    key: 'empty',
                    type: 'group',
                    label: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配结果" />,
                },
            ];
        }

        return filtered;
    };
    // 汇率过滤(模糊搜索)
    const filterRates = (rates: any[], searchValue: string) => {
        if (!searchValue) return rates; // 如果没有搜索值，直接返回所有语言项

        const regex = new RegExp(searchValue.trim(), 'i');
        const filtered = rates.filter((lang) => {
            return regex.test(lang.label.props.children); // 匹配 label 中的 <span> 内容
        });

        // 如果过滤后的结果为空，返回空状态组件
        if (filtered.length === 0) {
            return [
                {
                    key: 'empty',
                    type: 'group',
                    label: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配结果" />,
                },
            ];
        }

        return filtered;
    };
    // 定义语言状态变量
    const [searchLanguageValue, setSearchLanguageValue] = useState<string>("");
    // 定义汇率状态变量
    const [searchRateValue, setSearchRateValue] = useState<string>("");
    // 公告中心 - 公告部分测试数据
    const bulletinArr = [
        { h5Text: "IMBIT关于上线 Pendle (PENDLE) 现货交易的公告", spanText: "2024/09/27 11:00:00" },
        { h5Text: "ETH/BTC 币对现已上线双币赢！", spanText: "2024/09/27 14:30:00" },
        { h5Text: "IMBIT关于延迟上线 USDC 交易币对的公告", spanText: "2024/09/27 14:30:00" },
        { h5Text: "IMBIT关于 HMSTR 杠杆交易、永续合约及简单赚币正式上线的公告", spanText: "2024/09/27 14:30:00" },
        { h5Text: "IMBIT关于完成发放 Hamster Kombat (HMSTR) 空投币的公告", spanText: "2024/09/27 11:00:00" },
    ];
    // 公告中心标签页 - 使用动态获取的数据
    const bulletinItems: TabsProps['items'] = [
        {
            key: '1',
            label: '公告',
            children:
                // 如果有公告数据则使用，否则使用默认数据
                mergedBulletinData.length > 0
                    ? mergedBulletinData.map((item: any, index: number) => (
                        <MenuItemLabel key={index} h5Text={item.h5Text} spanText={item.spanText} needHover />
                    ))
                    : (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '40px 0'
                        }}>
                            <Empty image='/images/bulletin_center/chat.png' description='暂无新的通知' />
                        </div>
                    )
        },
        {
            key: '2',
            label: '账户助手',
            children: 'Content of Tab Pane 2',
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
                                    消息
                                </span>
                            </Col>
                            <Col>
                                <Link href='/bulletinCenter'>
                                    <span
                                        style={{
                                            color: '#FF5F1F',
                                            fontSize: '14px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        查看全部
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
        {
            key: '3',
            title: <IconHtml icon="img_global" />,
            widthSet: 'global',
            items: [
                {
                    key: '0',
                    type: 'group',
                    label: (
                        <h6 style={{ color: 'var(--text-color5)', marginBottom: '-10px' }}>语言</h6>
                    )
                },
                {
                    key: '1',
                    type: 'group',
                    label: (
                        <MenuItemLabel isInput onInputChange={(value) => setSearchLanguageValue(value)} h5Text='中文' />
                    ),
                    children: [
                        ...filterLanguages(languageItems, searchLanguageValue),
                    ],
                },
                {
                    key: '2',
                    type: 'group',
                    label: (
                        <h6 style={{ color: 'var(--text-color5)', marginBottom: '-10px' }}>汇率</h6>
                    )
                },
                {
                    key: '3',
                    type: 'group',
                    label: (
                        <MenuItemLabel isInput onInputChange={(value) => setSearchRateValue(value)} h5Text='搜索' />
                    ),
                    children: [
                        ...filterRates(rateItems, searchRateValue),
                    ],
                },

            ],
        },
    ], [isLogin, loginAwareBulletinItems, languageItems, searchLanguageValue, rateItems, searchRateValue]); // 添加所有需要的依赖
    
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
        }, 2000);
    };

    // 使用两种不同的渲染策略来避免水合错误
    const ServerContent = () => (
        <div className={styles.container}>
            <div className={styles.logo}>
                {/* 简化的静态内容 */}
                <div style={{ width: 126, height: 30 }}></div>
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
            <div style={{ position: 'relative',borderBottom: '0.5px solid #37373A' }}>
                <div className={styles.container}>
                    <div className={styles.logo}>
                        <Image
                            src={logoUrl}
                            alt=""
                            width={126}
                            height={30}
                            onError={() => setLogoUrl('/home_menu_logo.png')}
                        />
                    </div>
                    <div className={styles.menuContainer}>
                        <div className={styles.menuListContainer}>
                            <Row align='middle'>
                                <Row>
                                    <Col style={{ cursor: 'pointer' }} onClick={showMenu}>
                                        {/* <img src='/images/home_menu/icon_classify_line.png' style={{ width: '18px', height: '18px', marginRight: '20px' }} /> */}
                                        <Image
                                            src="/images/home_menu/icon_classify_line.png"
                                            alt=""
                                            width={18}  // 必须指定宽度
                                            height={18} // 必须指定高度
                                            style={{ marginRight: '20px' }}
                                        />
                                    </Col>
                                </Row>
                                <Row align='middle' className={styles.collapsedMenu}>
                                    <Col>{listItems}</Col>
                                    {/* <Link href='/currencyTrading' style={{ marginRight: '20px', cursor: 'pointer' }}>
                                        <Row gutter={4} align='middle'>
                                            <Col><img src="/images/home_menu/icon_fire_fill.png" className={styles.iconCursor} /></Col>
                                            <Col><span>Web3</span></Col>
                                        </Row>
                                    </Link>
                                    <Col>
                                        <Dropdown
                                            menu={{
                                                items: moreItems,
                                            }}
                                            trigger={['click']}
                                            overlayStyle={{ top: '80px' }}
                                        >
                                            <a style={{ cursor: 'pointer', position: 'relative' }} onClick={(e) => e.preventDefault()}>
                                                <Space style={{ columnGap: '3px' }}>
                                                    打新专区
                                                    <img src="/images/home_menu/new.png" style={{ width: '40px', height: '20px', position: 'absolute', right: '-35px', top: '-20px' }} />
                                                </Space>
                                            </a>
                                        </Dropdown>
                                    </Col> */}
                                </Row>
                            </Row>
                        </div>
                        <div className={styles.rightListContainer}>
                            <Dropdown
                                // menu={{
                                //     items: inputItems,
                                // }}
                                trigger={['click']}
                                overlayStyle={{ top: '80px', maxWidth: '390px', width: '390px' }}
                            >
                                <a onClick={(e) => e.preventDefault()}>
                                    <Space>
                                        <ConfigProvider
                                            theme={{
                                                components: {
                                                    Input: {
                                                        activeBorderColor: '#FF5F1F',
                                                        hoverBorderColor: '#FF5F1F'
                                                    },
                                                },
                                                token: {
                                                    // colorTextPlaceholder: '#979897',
                                                    fontSize: 12
                                                }
                                            }}
                                        >
                                            {/* <Input
                                                style={{ width: '188px', minWidth: '188px', backgroundColor: '#1C1E1C', color: '#979897', borderColor: '#979897' }}
                                                placeholder="搜索币对和其他产品"
                                                prefix={<SearchOutlined />}
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                            /> */}
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
                                                    {/* <Dropdown
                                                        menu={{
                                                            // items,
                                                            items: itemsFunding
                                                        }}
                                                        trigger={['click']}
                                                        className={styles.dropDownList}
                                                        overlayStyle={{ top: '80px', width: '180px' }}
                                                    >
                                                        <Space style={{ columnGap: '3px' }}>
                                                            <Image
                                                                onClick={(e) => e.preventDefault()}
                                                                src="/images/home_menu/icon_wallet_line.png"
                                                                className={styles.iconCursor}
                                                                alt=""
                                                                width={20}  // 必须指定宽度
                                                                height={20} // 必须指定高度
                                                            />
                                                        </Space> */}
                                                    {/* </Dropdown> */}
                                                    <AssetsMenu/>
                                                </Col>
                                                <Col>
                                                    <Dropdown
                                                        menu={{
                                                            items: [
                                                                {
                                                                    key: '1',
                                                                    label: '订单中心',
                                                                },
                                                            ],
                                                        }}
                                                        trigger={['click']}
                                                        overlayStyle={{ top: '80px', maxWidth: '200px', width: '180px' }}
                                                    >
                                                        {/* <a onClick={(e) => e.preventDefault()}> */}
                                                        <Space>
                                                            {/* <img onClick={(e) => e.preventDefault()} src="/images/home_menu/icon_search_line.png" className={styles.iconCursor} /> */}
                                                            <Image
                                                                onClick={(e) => e.preventDefault()}
                                                                alt=""
                                                                width={20}  // 必须指定宽度
                                                                height={20} // 必须指定高度
                                                                src="/images/home_menu/icon_upload_line.png"
                                                                className={styles.iconCursor}
                                                            />
                                                        </Space>
                                                        {/* </a> */}
                                                    </Dropdown>
                                                </Col>
                                                <Col>
                                                    {/* <Dropdown
                                                        menu={{
                                                            items: userItemsAll as MenuProps['items'],
                                                            triggerSubMenuAction: 'click',
                                                        }}
                                                        placement="bottomLeft"
                                                        trigger={['click']}
                                                        overlayStyle={{ top: '80px', maxWidth: '240px', minWidth: '240px' }}
                                                        overlayClassName='customUserAllMenu'
                                                        onOpenChange={userInfoOpenChange}
                                                    >
                                                        <Space>
                                                            <Image
                                                                onClick={(e) => e.preventDefault()}
                                                                src="/images/home_menu/icon_user_line.png"
                                                                className={styles.userCursor}
                                                                alt="avatar"
                                                                width={20}  // 必须指定宽度
                                                                height={20} // 必须指定高度
                                                            />
                                                        </Space>
                                                    </Dropdown> */}
                                                    <UserInfoMenu />
                                                </Col>
                                                {iconItemsLogin}
                                            </>
                                        ) : (
                                            <>
                                                <Col><Link href='/login' className={styles.register}><span style={{ color: '#FFF' }}>注册</span></Link></Col>
                                                <Col><Link href='/login' className={styles.login}><span style={{ color: '#FFF' }}>登录</span></Link></Col>
                                                <div style={{ height: '20px', border: '1px solid #676867', margin: '0 12px' }}></div>
                                                {/* <Col> */}
                                                {/* <Dropdown */}
                                                {/* menu={{
                                                        items: inputItems,
                                                    }}
                                                        trigger={['click']}
                                                        overlayStyle={{ top: '80px', maxWidth: '390px', width: '390px' }} */}
                                                {/* > */}
                                                {/* <a onClick={(e) => e.preventDefault()}> */}
                                                {/* <Space> */}
                                                {/* <img onClick={(e) => e.preventDefault()} src="/images/home_menu/icon_search_line.png" className={styles.iconCursor} />
                                                            <Image
                                                                onClick={(e) => e.preventDefault()}
                                                                alt=""
                                                                width={20}  // 必须指定宽度
                                                                height={20} // 必须指定高度
                                                                src="/images/home_menu/icon_search_line.png"
                                                                className={styles.iconCursor}
                                                            /> */}
                                                {/* </Space> */}
                                                {/* </a> */}
                                                {/* </Dropdown> */}
                                                {/* </Col> */}
                                                {iconItemsLogin}
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
