import React, { createContext, useContext, useState, useEffect } from 'react';
import { homeMenu, getLanguage, exchangeRate } from '@/services/header';
import { getBulletinMessage } from '@/services/bulletinCenter';
import dayjs from 'dayjs';
import { processMenuItems, formatMenus, formatAdaptiveMenus } from '@/utils/menuHooks';
import { useDayModeChange } from '@/hooks/dayModeChange';

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
    const [currentLang, setCurrentLang] = useState('');
    const { isDayMode } = useDayModeChange();

    // 初始化数据
    const initializeData = async (lang: string) => {
        try {
            // 获取菜单数据
            const menuResponse = await homeMenu({ lang }) as { data: any[] };
            if (menuResponse?.data) {
                const processedMenuData = processMenuItems(menuResponse.data);
                setMenuData(processedMenuData);
                // 传入 isDayMode 参数
                setMenus(formatMenus(processedMenuData.slice(0, 6), isDayMode));
                setAdaptiveMenuData(formatAdaptiveMenus(processedMenuData));
            }

            // 获取公告数据
            const bulletinResponse = await getBulletinMessage({ languageCode: lang }) as any;
            if (bulletinResponse?.code === '0' && bulletinResponse.data?.list) {
                const formattedBulletinData = bulletinResponse.data.list.map((item: any) => ({
                    h5Text: item.title,
                    spanText: dayjs(item.releaseTime).format('YYYY/MM/DD HH:mm:ss')
                }));
                setBulletinData(formattedBulletinData);
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
            }

            setIsDataLoaded(true);
        } catch (error) {
            console.error('数据初始化失败:', error);
        }
    };

    // 切换语言
    const changeLanguage = (lang: string) => {
        if (lang !== currentLang) {
            setCurrentLang(lang);
            initializeData(lang);
        }
    };

    // 首次加载
    useEffect(() => {
        const lang = localStorage.getItem('lang') || 'zh_CN';
        setCurrentLang(lang);
        initializeData(lang);
    }, []);

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