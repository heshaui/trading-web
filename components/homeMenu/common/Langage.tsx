import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Col } from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import MenuItem from '../HomeMenuItems';
import MenuItemLabel from '../HomeMenuLabel';
import { NoData } from '@/components/noData';
import appStore from '@/store';
import styles from '@/styles/components/HomeMenu.module.css';
import {getNextJsLocale} from '@/utils/filterLang';
import { useLangChange } from '@/hooks/useLangChange';
export default function LanguageMenu() {
    const router = useRouter();
    const { t,i18n } = useTranslation('common');
    const { languageList = [], rateData = [] } = useNavigation() || {};
    const { isLoggedIn } = useAuth();
    const { handleLanguageChange } = useLangChange();
    // 使用全局状态中的语言列表
    const mergedLanguageList = useMemo(() => 
        languageList.length > 0 ? languageList : appStore.languageList, 
        [languageList]
    );

    // 处理语言切换
    const languageChange = useCallback(async (langCode: string) => {
        handleLanguageChange(langCode);
    }, [handleLanguageChange]);
    // const handleLanguageChange = useCallback(async (langCode: string) => {
    //     // 更新全局状态
    //     appStore.setLang(langCode);
        
    //     // 更新 i18n
    //     if (i18n.changeLanguage) {
    //         await i18n.changeLanguage(langCode.split('_')[0]);
    //     }

    //     // 获取 Next.js 的 locale
    //     const nextLocale = getNextJsLocale(langCode);
        
    //     // 触发自定义事件，通知其他组件语言已更改
    //     window.dispatchEvent(new CustomEvent('languageChanged', { detail: langCode }));
        
    //     // 刷新页面以应用语言更改
    //     const { pathname, query } = router;
    //     router.push(
    //         { pathname, query },
    //         undefined,
    //         { locale: nextLocale }
    //     ).then(() => {
    //         // 强制刷新页面以确保所有内容使用新语言
    //         window.location.reload();
    //     });
    // }, [i18n, router]);






    // 渲染语言选项
    const languageItems = useMemo(() => {
        if (mergedLanguageList.length === 0) {
            return [{
                key: 'empty-language',
                type: 'group' as const,
                label: <NoData title={t('header.noLanguageData')} />
            }];
        }

        return mergedLanguageList.map((item: any, index: number) => ({
            key: `lang-${index}`,
            type: 'item' as const,
            label: (
                <span 
                    style={{
                        fontWeight: appStore.lang === item.key ? '500' : '400',
                        cursor: 'pointer',
                        display: 'block',
                        width: '100%',
                        height: '30px'
                    }}
                    className='flex-x align-center'
                    onClick={() => languageChange(item.key as string)}
                >
                    {item.span}
                </span>
            )
        }));
    }, [mergedLanguageList, handleLanguageChange]);

    // 汇率菜单项（保持原有逻辑）
    const rateItems = useMemo(() => {
        if (rateData.length === 0) {
            return [{
                key: 'empty-rate',
                type: 'group' as const,
                label: <NoData title={t('header.noRateData')} />
            }];
        }
        
        return rateData.map((item: any, index: number) => ({
            key: `rate-${index}`,
            type: 'item' as const,
            label: (
                <span 
                    style={{
                        fontWeight: appStore.rateKey === item.key ? '500' : '400',
                        cursor: 'pointer',
                        display: 'block',
                        width: '100%',
                        height: '30px'
                    }}
                    className='flex-x align-center'
                    onClick={() => appStore.setRateKey(item.key as string)}
                >
                    {item.span}
                </span>
            )
        }));
    }, [rateData]);
    
    // 搜索相关状态
    const [searchLanguageValue, setSearchLanguageValue] = useState<string>("");
    const [searchRateValue, setSearchRateValue] = useState<string>("");
    // 过滤语言选项
    const filteredLanguageItems = useMemo(() => {
        if (!searchLanguageValue) return languageItems;
        
        const regex = new RegExp(searchLanguageValue.trim(), 'i');
        const filtered= languageItems.filter((item: any) => 
            item.type === 'group' || 
            (typeof item.label?.props?.children === 'string' && 
             regex.test(item.label.props.children))
         );
         return filtered.length === 0 ? [
            {
                key: 'empty-language',
                type: 'group',
                label: <NoData title={t('header.noLanguageData')} />,
            },
        ]:filtered;
    }, [languageItems, searchLanguageValue]);
    
    // 过滤汇率选项
    const filteredRateItems = useMemo(() => {
        if (!searchRateValue) return rateItems;
        
        const regex = new RegExp(searchRateValue.trim(), 'i');
       const filtered=  rateItems.filter((item: any) => 
            item.type === 'group' || 
            (typeof item.label?.props?.children === 'string' && 
             regex.test(item.label.props.children))
         );
         return filtered.length === 0 ? [
            {
                key: 'empty-rate',
                type: 'group',
                label: <NoData title={t('header.noRateData')} />,
            },
        ]:filtered;
    }, [rateItems, searchRateValue]);
    
    // 构建菜单项
    const itemsLangage = useMemo(() => ({
        key: 'language-menu',
        title: (
            <Col>
                <Image
                    src="/images/home_menu/icon_earth_line.png"
                    alt="Language"
                    width={20}
                    height={20}
                />
            </Col>
        ),
        items: [
            {
                key: 'language-section',
                type: 'group' as const,
                label: (
                    <h6 style={{ color: 'var(--text-color5)', marginBottom: '8px' }}>
                        {/* 语言 */}
                        {t('header.language')}
                    </h6>
                ),
                children: [
                    {
                        key: 'language-search',
                        type: 'group' as const,
                        label: (
                            <MenuItemLabel 
                                isInput 
                                onInputChange={setSearchLanguageValue} 
                                h5Text={t('header.searchLanguage')} 
                            />
                        ),
                        children: filteredLanguageItems
                    }
                ]
            },
            {
                key: 'rate-section',
                type: 'group' as const,
                label: (
                    <h6 style={{ color: 'var(--text-color5)', margin: '16px 0 8px 0' }}>
                        {/* 汇率 */}
                        {t('header.rate')}
                    </h6>
                ),
                children: [
                    {
                        key: 'rate-search',
                        type: 'group' as const,
                        label: (
                            <MenuItemLabel 
                                isInput 
                                onInputChange={setSearchRateValue} 
                                h5Text={t('header.searchRate')} 
                            />
                        ),
                        children: filteredRateItems
                    }
                ]
            }
        ]
    }), [filteredLanguageItems, filteredRateItems]);


    return <MenuItem menuList={itemsLangage} haveArrow={true} />;
}
