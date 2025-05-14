import styles from '@/styles/components/HomeMenu.module.css';
import { Dropdown, Space, Button, Avatar, ConfigProvider, Row, Col, Drawer, Empty, Tabs, TabsProps, Badge } from 'antd';
import { MenuProps } from 'antd';
import MenuItem from '../HomeMenuItems'; // 顶部菜单
import MenuItemLabel from '../HomeMenuLabel';
import { IconName } from '@/type/types';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { useThemeMode } from '@/hooks/useThemeMode'; // 导入 useThemeMode 获取当前主题状态
import ThemeIcon from '../ThemeIcon';
import { useNavigation } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import {NoData} from '@/components/noData';
import appStore from '@/store';
export default function LangageMenuItems() {
    // 路由
    const router = useRouter();
    const langKey=appStore.getLang();

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
            // 存储语言列表
            appStore.setLanguageList(languageList);
            
            // 检查并设置当前语言
            const storedLang = localStorage.getItem(LOCAL_STORAGE_KEY.LANG);
            
            if (storedLang) {
                // 如果本地存储有语言设置，使用它
                appStore.setLang(storedLang);
            } else if (langKey) {
                // 如果有 langKey，使用它
                appStore.setLang(langKey);
            } else {
                // 都不存在，设置默认值 en_US
                appStore.setLang('en_US');
            }
        }
        if (rateData.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY.CACHED_RATE_DATA, JSON.stringify(rateData));
        }
    }, [menus, adaptiveMenuData, bulletinData, languageList, rateData, langKey]);

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
            const cachedRateData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.CACHED_RATE_DATA) || '[]');

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




    // 语言
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');

    // 初始化选中的语言显示
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const currentLang = appStore.getLang() || 'en_US';
        // 从语言列表中找到对应的语言名称
        const currentLanguage = mergedLanguageList.find((lang:any) => lang.key === currentLang);
        if (currentLanguage) {
            setSelectedLanguage(currentLanguage.span as string);
        } else {
            // 如果找不到对应的语言，使用默认值
            setSelectedLanguage('English');
        }
    }, [mergedLanguageList]);




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
                // 'cachedRateData',
                LOCAL_STORAGE_KEY.CACHED_RATE_DATA
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
        appStore.setRateKey(rate);
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
            label: <NoData title="暂无语言数据" />
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
            label: <NoData title="暂无汇率数据" />
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
                    label: <NoData title="暂无匹配结果" />,
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
                    label: <NoData title="暂无匹配结果" />,
                },
            ];
        }

        return filtered;
    };
    // 定义语言状态变量
    const [searchLanguageValue, setSearchLanguageValue] = useState<string>("");
    // 定义汇率状态变量
    const [searchRateValue, setSearchRateValue] = useState<string>("");






    const itemsLangage = {
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
    }


    // 客户端已挂载的完整内容
    return (
        <>
            <MenuItem menuList={itemsLangage} haveArrow={true} />
        </>

    );
}
