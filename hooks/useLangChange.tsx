import { useCallback } from 'react';
import appStore from '@/store';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getNextJsLocale } from '@/utils/filterLang';

/**
 * 语言切换 Hook
 * @returns 返回语言切换函数
 */
export function useLangChange() {
    const { i18n } = useTranslation();
    const router = useRouter();
    
    /**
     * 处理语言切换
     * @param langCode 语言代码，例如 'en_US', 'zh_CN' 等
     */
    const handleLanguageChange = useCallback(async (langCode: string) => {
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
            // 强制刷新页面以确保所有内容使用新语言
            window.location.reload();
        });
    }, [i18n, router]);

    return { handleLanguageChange };
}

export default useLangChange;