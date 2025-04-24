import { NextRouter } from 'next/router';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
// 定义公开路径（不需要登录即可访问的页面）
export const publicPaths = [
    '/',
    '/login',
    '/register',
    '/resetPassword',
    '/exchange'
];

// 检查路径是否匹配公开路径
export const isPublicPath = (path: string): boolean => {
    // 精确匹配
    if (publicPaths.includes(path)) return true;

    // 前缀匹配（例如 /news/ 开头的所有路径）
    for (const publicPath of publicPaths) {
        if (publicPath.endsWith('/*') && path.startsWith(publicPath.slice(0, -2))) {
            return true;
        }
    }

    return false;
};

interface AuthGuardOptions {
    isAuthChecking: boolean;
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    setIsAuthChecking: (value: boolean) => void;
}
// export const useAuthGuard = ()
export const useAuthGuard = 
({
  isAuthChecking,
  isLoggedIn,
  setIsLoggedIn,
  setIsAuthChecking
}: AuthGuardOptions) => {
    const router = useRouter();
    // 监听登录状态变化
    useEffect(() => {
        // 初始检查
        const checkLoginStatus = () => {
            const token = localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN);
            setIsLoggedIn(!!token);
            setIsAuthChecking(false); // 认证检查完成
        };

        checkLoginStatus();

        // 添加自定义事件监听器
        const handleLoginChange = () => {
            checkLoginStatus();
        };

        window.addEventListener('loginStatusChanged', handleLoginChange);

        return () => {
            window.removeEventListener('loginStatusChanged', handleLoginChange);
        };
    }, [setIsLoggedIn, setIsAuthChecking]);

    // 路由守卫逻辑
    useEffect(() => {
        // 等待认证状态检查完成
        if (isAuthChecking) return;

        const currentPath = router.pathname;
        const hasToken = localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN);

        // 如果已登录且在登录页，重定向到首页
        if (hasToken && currentPath === '/login') {
            router.push('/');
            return;
        }

        // 如果未登录且访问受保护页面，重定向到登录页
        if (!hasToken && !isPublicPath(currentPath)) {
            const returnUrl = encodeURIComponent(router.asPath);
            router.push({
                pathname: '/login',
                query: { returnUrl }
            });
        }
    }, [isLoggedIn, router.pathname, isAuthChecking, router]);

}; 