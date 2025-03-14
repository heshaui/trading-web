
import { useState, useEffect } from 'react';
import { getKvObject } from '@/services/kv';
import { useThemeMode } from '@/hooks/useThemeMode';

// 检查图片URL是否可用
const checkImageUrl = (url: string) => {
    return new Promise<boolean>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
};

// 处理JSON字符串
const parseJsonString = (jsonString: string) => {
    try {
        // 修复JSON格式问题
        const fixedJsonString = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+):/g, '$1"$2":')
            .replace(/:\s*'([^']*?)'/g, ':"$1"');
        return JSON.parse(fixedJsonString);
    } catch (error) {
        console.error('解析JSON失败:', error);
        return null;
    }
};
// 获取网站配置
export const useWebConfig = () => {
    const [config, setConfig] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; // 添加组件挂载状态标志

        const fetchConfig = async () => {
            try {
                if (!isMounted) return; // 检查组件是否仍然挂载

                setLoading(true);
                // 请求多个配置项
                const keys = [
                    "theme",
                    "logo",
                    "footer_setting",
                    // 可以根据需要添加更多配置项
                ];

                const response = await getKvObject(keys) as { code: string; data: Record<string, any> };

                if (!isMounted) return; // 再次检查组件是否仍然挂载

                if (response?.code === '0' && response.data) {
                    const parsedConfig: Record<string, any> = {};

                    // 处理每个配置项
                    Object.entries(response.data).forEach(([key, value]) => {
                        if (typeof value === 'string') {
                            const parsedValue = parseJsonString(value);
                            if (parsedValue) {
                                parsedConfig[key] = parsedValue;
                            }
                        } else {
                            parsedConfig[key] = value;
                        }
                    });

                    setConfig(parsedConfig);
                }
            } catch (error) {
                console.error('获取网站配置失败:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchConfig();

        // 清理函数
        return () => {
            isMounted = false;
        };
    }, []); // 确保依赖数组为空

    return { config, loading };
};

// 保留原有的 Logo 获取逻辑，但使用新的配置获取方式
export const useLogoImage = (defaultLogo: string = '/home_menu_logo.png') => {
    const [logoUrl, setLogoUrl] = useState(defaultLogo);
    const { config, loading } = useWebConfig();
    const { isDayMode } = useThemeMode(); // 获取当前主题模式

    useEffect(() => {
        let isMounted = true;
        const processLogo = async () => {
            try {
                if (loading || !config.logo) return;

                // 从localStorage获取登录状态
                const isLoggedIn = !!localStorage.getItem('userToken');
                const loginStatus = isLoggedIn ? 'after_login' : 'before_login';

                // 获取logo配置
                const logoConfig = config.logo;

                // 根据主题模式选择不同的 Logo
                // 日间模式使用 dark 配置，夜间模式使用 light 配置
                const imageUrl = isDayMode 
                    ? logoConfig?.dark?.headerLogo 
                    : logoConfig?.light?.headerLogo;

                if (imageUrl) {
                    const isValidUrl = await checkImageUrl(imageUrl);
                    setLogoUrl(isValidUrl ? imageUrl : defaultLogo);
                }
            } catch (error) {
                console.error('处理Logo失败:', error);
            }
        };
        // 处理Logo
        processLogo();
        
        return () => {
            isMounted = false;
        };

    }, [config, loading, defaultLogo, isDayMode]);

    return { logoUrl, setLogoUrl };
};