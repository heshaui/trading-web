import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { homeMenu, getLanguage, exchangeRate } from '@/services/header';
import { getBulletinMessage, getBulletinMessageLogined } from '@/services/bulletinCenter';
import dayjs from 'dayjs';
import { processMenuItems, formatMenus, formatAdaptiveMenus } from '@/utils/menuHooks';
import { useDayModeChange } from '@/hooks/dayModeChange';
import { useAuth } from '@/context/AuthContext';
import { getKvObject } from '@/services/kv'
import appStore from '@/store';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import { useTranslation } from 'next-i18next';
import { getNextJsLocale } from '@/utils/filterLang';
import { useLangChange } from '@/hooks/useLangChange';
import { useRouter } from 'next/router';
// 创建上下文
const NavigationContext = createContext<any>(null);

// 导出 Provider 组件
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t, i18n } = useTranslation('common');
    const router = useRouter();
    const [menuData, setMenuData] = useState<any>(null);
    const [menus, setMenus] = useState<any[]>([]);
    const [adaptiveMenuData, setAdaptiveMenuData] = useState<any[]>([]);
    const [bulletinData, setBulletinData] = useState<any[]>([]);
    const [languageList, setLanguageList] = useState<any[]>([]);
    const [rateData, setRateData] = useState<any[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    // const [currentLang, setCurrentLang] = useState('');
    const currentLang = useRef('')
    const { isDayMode } = useDayModeChange();
    const { isLoggedIn } = useAuth();
    // 不在组件初始化时使用 useLangChange，避免无限循环
    // const { handleLanguageChange } = useLangChange();
    // 使用 ref 记录已请求的状态
    const dataFetchStatusRef = useRef({
        loggedInFetched: false,  // 是否已经获取过登录后的数据
        loggedOutFetched: false, // 是否已经获取过登录前的数据
        lastLoginState: null as boolean | null // 上次请求时的登录状态
    });

    // 初始化数据
    const initializeData = async (lang: string) => {
        try {
             const langs = localStorage.getItem('lang')||'en_US'
            // 获取菜单数据
            const menuResponse = await homeMenu({ lang }) as { code: string; data: any[] };
            //  console.log(menuResponse, 'menuResponse');
            if (menuResponse.code === '0') {
                const processedMenuData = processMenuItems(menuResponse.data);
                // console.log('processedMenuData', processedMenuData);
                setMenuData(processedMenuData);
                console.log('processedMenuData的内容',processedMenuData)
                // 传入 isDayMode 参数
                setMenus(formatMenus(processedMenuData.slice(0, 10), isDayMode));
                setAdaptiveMenuData(formatAdaptiveMenus(processedMenuData));


            }

            // 记录当前的登录状态
            dataFetchStatusRef.current.lastLoginState = isLoggedIn;

            // 根据登录状态获取公告数据
            if (isLoggedIn) {
                // 如果已登录但未获取过登录状态的数据
               const langs = localStorage.getItem('lang')||'en_US'
                if (!dataFetchStatusRef.current.loggedInFetched) {
                    const bulletinResponse = await getBulletinMessageLogined({ languageCode: langs }) as any;
                    if (bulletinResponse?.code === '0' && bulletinResponse.data?.list) {
                        const formattedBulletinData = bulletinResponse.data.list.map((item: any) => ({
                            id: item.id,
                            h5Text: item.title,
                            spanText: dayjs(item.releaseTime).format('YYYY/MM/DD HH:mm:ss')
                        }));
                        setBulletinData(formattedBulletinData);
                        dataFetchStatusRef.current.loggedInFetched = true;
                    }
                }
            } else {
                // 如果未登录但未获取过未登录状态的数据
                if (!dataFetchStatusRef.current.loggedOutFetched) {
                    const langs = localStorage.getItem('lang')||'en_US'
                    const bulletinResponse = await getBulletinMessage({ languageCode: lang }) as any;
                    if (bulletinResponse?.code === '0' && bulletinResponse.data?.list) {
                        const formattedBulletinData = bulletinResponse.data.list.map((item: any) => ({
                            id: item.id,
                            h5Text: item.title,
                            spanText: dayjs(item.releaseTime).format('YYYY/MM/DD HH:mm:ss')
                        }));
                        setBulletinData(formattedBulletinData);
                        dataFetchStatusRef.current.loggedOutFetched = true;
                    }
                }
            }

            // 获取语言数据
            // const languageResponse = await getLanguage({ lang: '' }) as any;
            // if (languageResponse?.code === '0' && languageResponse.data) {
            //     const formattedLanguageData = languageResponse.data.map((item: any) => ({
            //         span: `${item.lang}`,
            //         key: `${item.langEncode}`
            //     }));
            //     setLanguageList(formattedLanguageData);
            // }

            // 获取汇率数据
            const rateResponse = await exchangeRate({ id: 0, shortName: "", status: 1 }) as any;
            if (rateResponse?.data) {
                const formattedRateData = rateResponse.data.map((item: any) => ({
                    span: `${item.shortName} - ${item.symbol}`,
                    key: `${item.shortName}`
                }));
                setRateData(formattedRateData);
                appStore.setRateData(rateResponse.data);
            }

            setIsDataLoaded(true);
        } catch (error) {
            console.error('数据初始化失败:', error);
        }
    };

    // 切换语言
    const changeLanguage = async (lang: string) => {
        if (lang !== currentLang.current) {
            // 设置当前语言
            currentLang.current = lang;
            appStore.setLang(lang);
            localStorage.setItem(LOCAL_STORAGE_KEY.LANG, lang);

            // 更新 i18n 的语言设置
            if (i18n.isInitialized && typeof i18n.changeLanguage === 'function') {
                const nextLocale = getNextJsLocale(lang);
                console.log('Changing language to:', nextLocale, 'from lang:', lang);
                await i18n.changeLanguage(nextLocale);
            }

            // 切换语言时重置数据获取状态
            dataFetchStatusRef.current = {
                loggedInFetched: false,
                loggedOutFetched: false,
                lastLoginState: null
            };

            // 初始化数据
            initializeData(lang);
        }
    };
    // 先获取语言数据，然后再进行语言判断
    const fetchLanguageDataAndInitialize = async () => {
        try {
            // 获取语言数据
            const languageResponse = await getLanguage({ lang: '' }) as any;
            if (languageResponse?.code === '0' && languageResponse.data) {
                const formattedLanguageData = languageResponse.data.map((item: any) => ({
                    span: `${item.lang}`,
                    key: `${item.langEncode}`
                }));

                // 保存语言列表到本地存储和状态
                setLanguageList(formattedLanguageData);
                localStorage.setItem(LOCAL_STORAGE_KEY.LANGUAGE_LIST, JSON.stringify(formattedLanguageData));
                // appStore.setLanguageList(formattedLanguageData);
                // 获取本地存储的语言设置
                let lang: string = appStore.getLang() || localStorage.getItem(LOCAL_STORAGE_KEY.LANG) || '';

                if (lang) {
                    // 如果有本地存储的语言，检查是否与语言列表中的某一项匹配
                    const isValidLang = formattedLanguageData.some((item: any) => item.key === lang);

                    if (!isValidLang) {
                        // 如果不匹配，设置为默认英语
                        lang = 'en_US';
                        // localStorage.setItem(LOCAL_STORAGE_KEY.LANG, lang);
                        // appStore.setLang(lang);
                        // 更新 i18n 的语言设置
                        if (i18n.isInitialized && typeof i18n.changeLanguage === 'function') {

                            // await i18n.changeLanguage('en');
                            handleLanguageChange('en_US');
                        }
                    } else {
                        // 如果匹配成功，确保 i18n 使用正确的语言
                        const nextLocale = getNextJsLocale(lang);
                        if (i18n.isInitialized && typeof i18n.changeLanguage === 'function') {

                            // await i18n.changeLanguage(nextLocale);
                            handleLanguageChange(lang);
                        }
                    }
                } else {
                    // 如果没有本地存储的语言，获取浏览器语言
                    const browserLang = navigator.language.toLowerCase();

                    // 尝试匹配浏览器语言与语言列表
                    const matchedLang = formattedLanguageData.find((item: any) => {
                        const itemKey = item.key.toLowerCase();
                        return browserLang.startsWith(itemKey.split('_')[0]);
                    });

                    if (matchedLang) {
                        // 如果匹配成功，使用匹配的语言
                        lang = matchedLang.key;
                        // localStorage.setItem(LOCAL_STORAGE_KEY.LANG, lang);
                        // appStore.setLang(lang);

                        // 更新 i18n 的语言设置
                        if (i18n.isInitialized && typeof i18n.changeLanguage === 'function') {
                            const nextLocale = getNextJsLocale(lang);

                            // await i18n.changeLanguage(nextLocale);
                            handleLanguageChange(lang);
                        }
                    } else {
                        // 如果匹配失败，设置为默认英语
                        lang = 'en_US';
                        // localStorage.setItem(LOCAL_STORAGE_KEY.LANG, lang);
                        // appStore.setLang(lang);

                        // 更新 i18n 的语言设置
                        if (i18n.isInitialized && typeof i18n.changeLanguage === 'function') {

                            // await i18n.changeLanguage('en');
                            handleLanguageChange('en_US');
                        }
                    }
                }

                // 设置当前语言并初始化数据
                currentLang.current = lang;
                // appStore.setLang(lang);
                // localStorage.setItem(LOCAL_STORAGE_KEY.LANG, lang);
                
                // 确保 i18n 的语言与本地存储的语言一致
                if (i18n.isInitialized && typeof i18n.changeLanguage === 'function') {
                    const nextLocale = getNextJsLocale(lang);

                    // await i18n.changeLanguage(nextLocale);
                    handleLanguageChange(lang);
                }

                initializeData(lang);
            }
        } catch (error) {
            console.error('获取语言数据失败:', error);
            // 如果获取语言数据失败，使用默认语言
            const defaultLang = 'en_US';
            currentLang.current = defaultLang;
            // localStorage.setItem(LOCAL_STORAGE_KEY.LANG, defaultLang);
            // appStore.setLang(defaultLang);
            handleLanguageChange('en_US');
            initializeData(defaultLang);
        }
    };
        const handleLanguageChange = async(langCode: string) => {
            // 更新全局状态
            appStore.setLang(langCode);
    
            // 更新 i18n
            if (i18n.changeLanguage) {
                await i18n.changeLanguage(langCode.split('_')[0]);
            }
    
            // 获取 Next.js 的 locale
            const nextLocale = getNextJsLocale(langCode);
    
            // 触发自定义事件，通知其他组件语言已更改
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: langCode }));
    
            // 刷新页面以应用语言更改
            const { pathname, query } = router;
            router.push(
                { pathname, query },
                undefined,
                { locale: nextLocale }
            ).then(() => {
            });
        }
    // 首次加载
    useEffect(() => {


        fetchLanguageDataAndInitialize();
    }, []);

    // 监听登录状态变化
    useEffect(() => {
        if (currentLang && dataFetchStatusRef.current.lastLoginState !== isLoggedIn) {
            // 只有在登录状态改变且已设置语言时才获取数据
            const fetchBulletinData = async () => {
                try {
                    if (isLoggedIn && !dataFetchStatusRef.current.loggedInFetched) {
                        // 登录状态变为已登录，且未获取过登录状态的数据
                        const langs = localStorage.getItem('lang')||'en_US'
                        const bulletinResponse = await getBulletinMessageLogined({ languageCode: langs }) as any;
                        if (bulletinResponse?.code === '0' && bulletinResponse.data?.list) {
                            const formattedBulletinData = bulletinResponse.data.list.map((item: any) => ({
                                id: item.id,
                                h5Text: item.title,
                                spanText: dayjs(item.releaseTime).format('YYYY/MM/DD HH:mm:ss')
                            }));
                            setBulletinData(formattedBulletinData);
                            dataFetchStatusRef.current.loggedInFetched = true;
                        }
                    } else if (!isLoggedIn && !dataFetchStatusRef.current.loggedOutFetched) {
                        // 登录状态变为未登录，且未获取过未登录状态的数据
                        const bulletinResponse = await getBulletinMessage({ languageCode: currentLang.current }) as any;
                        if (bulletinResponse?.code === '0' && bulletinResponse.data?.list) {
                            const formattedBulletinData = bulletinResponse.data.list.map((item: any) => ({
                                id: item.id,
                                h5Text: item.title,
                                spanText: dayjs(item.releaseTime).format('YYYY/MM/DD HH:mm:ss')
                            }));
                            setBulletinData(formattedBulletinData);
                            dataFetchStatusRef.current.loggedOutFetched = true;
                        }
                    }

                    // 更新上次的登录状态
                    dataFetchStatusRef.current.lastLoginState = isLoggedIn;
                } catch (error) {
                    console.error('获取公告数据失败:', error);
                }
            };

            fetchBulletinData();
        }
    }, [isLoggedIn, currentLang]);

    return (
        <NavigationContext.Provider value={{
            menuData,
            menus,
            adaptiveMenuData,
            bulletinData,
            languageList,
            rateData,
            isDataLoaded,
            currentLang,
            changeLanguage
        }}>
            {children}
        </NavigationContext.Provider>
    );
};

// 导出 hook
export const useNavigation = () => useContext(NavigationContext);