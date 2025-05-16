import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { homeMenu, getLanguage, exchangeRate } from '@/services/header';
import { getBulletinMessage, getBulletinMessageLogined } from '@/services/bulletinCenter';
import dayjs from 'dayjs';
import { processMenuItems, formatMenus, formatAdaptiveMenus } from '@/utils/menuHooks';
import { useDayModeChange } from '@/hooks/dayModeChange';
import { useAuth } from '@/context/AuthContext';
import { getKvObject } from '@/services/kv'
import appStore from '@/store';

// 创建上下文
const NavigationContext = createContext<any>(null);

// 导出 Provider 组件
export const NavigationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
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
    
    // 使用 ref 记录已请求的状态
    const dataFetchStatusRef = useRef({
        loggedInFetched: false,  // 是否已经获取过登录后的数据
        loggedOutFetched: false, // 是否已经获取过登录前的数据
        lastLoginState: null as boolean | null // 上次请求时的登录状态
    });

    // 初始化数据
    const initializeData = async (lang: string) => {
        try {
            // 获取菜单数据
            const menuResponse = await homeMenu({ lang }) as { data: any[] };
            // console.log(menuResponse, 'menuResponse');
            if (menuResponse?.data) {
                const processedMenuData = processMenuItems(menuResponse.data);
                setMenuData(processedMenuData);
                // 传入 isDayMode 参数
                setMenus(formatMenus(processedMenuData.slice(0, 6), isDayMode));
                setAdaptiveMenuData(formatAdaptiveMenus(processedMenuData));
                // console.log(processedMenuData, 'processedMenuData');
                setTimeout(() => {  
                    // console.log(menus, 'menus');
                }, 1000);
            }

            // 记录当前的登录状态
            dataFetchStatusRef.current.lastLoginState = isLoggedIn;
            
            // 根据登录状态获取公告数据
            if (isLoggedIn) {
                // 如果已登录但未获取过登录状态的数据
                if (!dataFetchStatusRef.current.loggedInFetched) {
                    const bulletinResponse = await getBulletinMessageLogined({ languageCode: lang }) as any;
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
            const languageResponse = await getLanguage({ lang: '' }) as any;
            if (languageResponse?.code === '0' && languageResponse.data) {
                const formattedLanguageData = languageResponse.data.map((item: any) => ({
                    span: `${item.lang}`,
                    key: `${item.langEncode}`
                }));
                setLanguageList(formattedLanguageData);
            }

            // 获取汇率数据
            const rateResponse = await exchangeRate({ id: 0, shortName: "", status: 1 }) as any;
            if (rateResponse?.data) {
                const formattedRateData = rateResponse.data.map((item: any) => ({
                    span: `${item.shortName} - ${item.symbol}`
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
    const changeLanguage = (lang: string) => {
        if (lang !== currentLang.current) {
            // setCurrentLang(lang);
            currentLang.current = lang;
            // appStore.setLang(lang);
            // 切换语言时重置数据获取状态
            dataFetchStatusRef.current = {
                loggedInFetched: false,
                loggedOutFetched: false,
                lastLoginState: null
            };
            initializeData(lang);
        }
    };

    // 首次加载
    useEffect(() => {
        const lang = localStorage.getItem('lang') || 'zh_CN';
        // setCurrentLang(lang);
        currentLang.current = lang;
        initializeData(lang);
    }, []);

    // 监听登录状态变化
    useEffect(() => {
        if (currentLang && dataFetchStatusRef.current.lastLoginState !== isLoggedIn) {
            // 只有在登录状态改变且已设置语言时才获取数据
            const fetchBulletinData = async () => {
                try {
                    if (isLoggedIn && !dataFetchStatusRef.current.loggedInFetched) {
                        // 登录状态变为已登录，且未获取过登录状态的数据
                        const bulletinResponse = await getBulletinMessageLogined({ languageCode: currentLang.current }) as any;
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