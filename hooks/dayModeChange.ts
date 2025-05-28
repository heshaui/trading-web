import { useState, useEffect } from 'react';
import { getThemeVariables } from '@/hooks/themes';


const isClient = typeof window !== 'undefined';

const getSystemTheme = (): boolean => {
    if (!isClient) return true; // Default to light mode for SSR
    return window.matchMedia('(prefers-color-scheme: light)').matches;
};

// 确保导出 useDayModeChange 函数
export const useDayModeChange = () => {
    // 应用主题变量
    const applyTheme = (isDayMode: boolean) => {
        if (!isClient) return; // Skip during SSR
        
        try {
            localStorage.setItem('isDayMode', String(isDayMode));
            // 获取主题变量并立即应用
            const themeVars = getThemeVariables();
            const theme = isDayMode ? themeVars.light : themeVars.dark;
            
            // 将主题变量应用到 CSS 变量
            Object.entries(theme).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
            
            // 触发主题变更事件，通知其他组件
            window.dispatchEvent(new Event('themeChange'));
        } catch (e) {
            console.error('应用主题变量失败:', e);
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
// 初始化主题函数
export const initTheme = () => {
    if (typeof window !== 'undefined') {
        // 获取暗色模式状态
        const savedMode = localStorage.getItem("darkMode") === "true";
        // 获取当前主题模式（白天/黑夜）
        const isDayMode = localStorage.getItem('isDayMode') === 'true' || true; // 默认为白天模式
        
        // 应用主题变量
        try {
          const themeVars = getThemeVariables();
          const theme = isDayMode ? themeVars.light : themeVars.dark;
          
          // 将主题变量应用到 CSS 变量
          Object.entries(theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
          });
        
          // 触发主题变更事件，通知其他组件
          window.dispatchEvent(new Event('themeChange'));
          
          console.log('初始化主题变量成功');
        } catch (e) {
          console.error('初始化应用主题变量失败:', e);
        }
      }
}