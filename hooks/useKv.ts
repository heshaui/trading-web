
import { useState, useEffect } from 'react';
import { getKvObject } from '@/services/kv';
import { useThemeMode } from '@/hooks/useThemeMode';
import defaultTheme from '@/theme/themeConfig';
import type { ThemeConfig } from 'antd';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
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
                    "fee_direction",
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
                const isLoggedIn = !!localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN);
                const loginStatus = isLoggedIn ? 'after_login' : 'before_login';

                // 获取logo配置
                const logoConfig = config.logo;
                // 根据主题模式选择不同的 Logo
                // 日间模式使用 dark 配置，夜间模式使用 light 配置
                const imageUrl = isDayMode
                    ? logoConfig?.dark?.headerLogo
                    : logoConfig?.light?.headerLogo;

                if (imageUrl) {
                    console.log(imageUrl,'imageUrl');
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

// 获取主题配置
export const useThemeConfig = () => {
    const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
    const { config, loading } = useWebConfig();

    useEffect(() => {
        // console.log('useThemeConfig effect 运行，loading:', loading, 'config:', config);

        if (!loading && config.theme) {
            // console.log('开始处理主题数据，config.theme:', config.theme, '类型:', typeof config.theme);

            try {
                let themeData = config.theme;

                // 检查返回的数据是否为字符串
                if (typeof themeData === 'string') {
                    // console.log('主题数据是字符串，开始解析');
                    try {
                        // 处理返回的数据字符串，确保是有效的 JSON 格式
                        const dataStr = themeData
                            .replace(/'/g, '"')       // 替换单引号为双引号
                            .replace(/([{,])\s*([a-zA-Z0-9_]+):/g, '$1"$2":'); // 确保属性名有引号
                        // console.log('处理后的字符串:', dataStr);
                        themeData = JSON.parse(dataStr);
                        // console.log('themeData 解析结果:', themeData);
                    } catch (parseError) {
                        console.error('解析主题数据失败:', parseError);
                        // 解析失败时使用默认主题
                        setTheme(defaultTheme);
                        return;
                    }
                } else {
                    console.log('主题数据不是字符串，直接使用');
                }

                // 检查主题数据
                // console.log('检查主题数据是否有 color 属性:', themeData);
                if (themeData && themeData.color) {
                    // console.log('找到颜色值:', themeData.color);
                    // 返回更新后的主题配置
                    setTheme({
                        token: {
                            ...defaultTheme.token,
                            colorPrimary: themeData.color,
                        },
                    });
                    return;
                } else {
                    console.log('未找到有效的颜色值');
                }
            } catch (error) {
                console.error('处理主题颜色失败:', error);
            }

            // 如果获取失败或解析失败，使用默认主题
            console.log('使用默认主题');
            setTheme(defaultTheme);
        }
    }, [config, loading]);

    return { theme, loading };
};


//获取手续费方向
export const useFeeDirection = () => {
    const { config, loading } = useWebConfig();
    const [feeDirection, setFeeDirection] = useState<string>('');

    useEffect(() => {
        if (config.fee_direction) { 
            setFeeDirection(config.fee_direction);
        }
    }, [config]);

    return { feeDirection, loading };
};


