import { useState, useEffect } from 'react';
import { themeVariables } from './themes';

export const useDayModeChange = () => {
    // 应用主题变量
    const applyTheme = (isDayMode: boolean) => {
        try {
            localStorage.setItem('isDayMode', String(isDayMode));
            const theme = isDayMode ? themeVariables.light : themeVariables.dark;
            Object.entries(theme).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
        } catch (e) {
            console.error('Failed to apply theme:', e);
        }
    };

    // 初始化主题状态，默认为白天模式
    const [isDayMode, setIsDayMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedMode = localStorage.getItem('isDayMode');
                if (savedMode !== null) {
                    const userTheme = savedMode === 'true';
                    applyTheme(userTheme);
                    return userTheme;
                }
            } catch (e) {
                console.error('Failed to load theme preference:', e);
            }
        }
        // 默认返回白天模式
        applyTheme(true);
        return true;
    });

    // 切换主题
    const toggleTheme = () => {
        const newMode = !isDayMode;
        setIsDayMode(newMode);
        // 保存用户手动设置的主题
        localStorage.setItem('isDayMode', String(newMode));
        applyTheme(newMode);
        window.dispatchEvent(new Event('themeChange'));
    };

    // 监听系统主题变化
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

            const handleSystemThemeChange = (e: MediaQueryListEvent) => {
                // 只有在没有用户手动设置时才跟随系统
                // if (localStorage.getItem('isDayMode') === null) {
                //     setIsDayMode(e.matches);
                //     applyTheme(e.matches);
                // }
            };

            // 初始化主题
            const savedMode = localStorage.getItem('isDayMode');
            if (savedMode === null) {
                // 如果没有保存的设置，应用系统主题
                applyTheme(getSystemTheme());
            } else {
                // 如果有保存的设置，应用保存的设置
                applyTheme(savedMode === 'true');
            }

            mediaQuery.addEventListener('change', handleSystemThemeChange);

            return () => {
                mediaQuery.removeEventListener('change', handleSystemThemeChange);
            };
        }
    }, []);

    return { isDayMode, toggleTheme };
};