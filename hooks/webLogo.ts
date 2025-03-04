import { useState, useEffect } from 'react';
import { getLogo } from '@/services/open';
import { ApiResponse } from '@/type/types';

// 检查图片URL是否可用
const checkImageUrl = (url: string) => {
    return new Promise<boolean>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
};

export const useLogoImage = (defaultLogo: string = '/home_menu_logo.png') => {
    const [logoUrl, setLogoUrl] = useState(defaultLogo);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                // 从localStorage获取登录状态
                const isLoggedIn = !!localStorage.getItem('userToken');
                const loginStatus = isLoggedIn ? 'after_login' : 'before_login';
                console.log('是否登录：', loginStatus);

                // const response = await getLogo({ key: 'HomeBanner' }) as ApiResponse<string>;
                const response = await getLogo({ key: 'logo' }) as ApiResponse<string>;
                if (response?.data) {
                    // const parsedData = JSON.parse(response.data) as Record<string, any>;
                    // const imageUrl = parsedData?.zh_CN?.dark?.[loginStatus]?.image;
                    const fixedJsonString = response.data.replace(/([{,]\s*)([a-zA-Z0-9_]+):/g, '$1"$2":')
                        .replace(/:\s*'([^']*?)'/g, ':"$1"');
                    const parsedData = JSON.parse(fixedJsonString) as Record<string, any>;
                    const imageUrl = parsedData?.dark?.imageUrl;
                    console.log('imageUrl', imageUrl);
                    if (imageUrl) {
                        const isValidUrl = await checkImageUrl(imageUrl);
                        setLogoUrl(isValidUrl ? imageUrl : defaultLogo);
                    }
                }
            } catch (error) {
                console.error('获取图片失败:', error);
            }
        };

        fetchLogo();
    }, [defaultLogo]);

    return { logoUrl, setLogoUrl };;
};