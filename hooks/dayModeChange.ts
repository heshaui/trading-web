import { useState, useEffect } from 'react';
import { themeVariables } from './themes';

export const useDayModeChange = () => {
    // 获取系统主题偏好
    const getSystemTheme = () => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: light)').matches;
        }
        return true;
    };

    // 应用主题变量
    const applyTheme = (isDayMode: boolean) => {
        const theme = isDayMode ? themeVariables.light : themeVariables.dark;
        Object.entries(theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    };

    // 初始化主题状态
    const [isDayMode, setIsDayMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('isDayMode');
            // 如果没有保存过用户设置，直接使用系统主题
            if (savedMode === null) {
                return getSystemTheme();
            }
            // 如果有保存的设置，使用保存的设置
            return savedMode === 'true';
        }
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
                if (localStorage.getItem('isDayMode') === null) {
                    setIsDayMode(e.matches);
                    applyTheme(e.matches);
                }
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