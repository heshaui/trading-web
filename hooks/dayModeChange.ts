import { useState, useEffect } from 'react';
import { themeVariables } from './themes';

const isClient = typeof window !== 'undefined';

const getSystemTheme = (): boolean => {
    if (!isClient) return true; // Default to light mode for SSR
    return window.matchMedia('(prefers-color-scheme: light)').matches;
};

export const useDayModeChange = () => {
    // 应用主题变量
    const applyTheme = (isDayMode: boolean) => {
        if (!isClient) return; // Skip during SSR
        
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
    const [isDayMode, setIsDayMode] = useState<boolean>(true); // Default to light mode initially

    // Initialize theme on mount (client-side only)
    useEffect(() => {
        if (!isClient) return;
        
        try {
            const savedMode = localStorage.getItem('isDayMode');
            if (savedMode !== null) {
                const userTheme = savedMode === 'true';
                setIsDayMode(userTheme);
                applyTheme(userTheme);
            } else {
                // If no saved preference, use system theme
                const systemTheme = getSystemTheme();
                setIsDayMode(systemTheme);
                applyTheme(systemTheme);
            }
        } catch (e) {
            console.error('Failed to load theme preference:', e);
        }
    }, []);

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
        if (!isClient) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            // Only follow system theme if user hasn't set a preference
            try {
                if (localStorage.getItem('isDayMode') === null) {
                    const systemTheme = e.matches;
                    setIsDayMode(systemTheme);
                    applyTheme(systemTheme);
                }
            } catch (e) {
                console.error('Error handling system theme change:', e);
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, []);

    return { isDayMode, toggleTheme };
};