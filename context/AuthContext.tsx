import router from 'next/router';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import appStore from '@/store';
// 定义上下文类型
type AuthContextType = {
    isLoggedIn: boolean;
    login: (userToken: string) => void;
    logout: () => void;
};

// 创建上下文
const AuthContext = createContext<AuthContextType | null>(null);

// 创建 Provider 组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const userToken = appStore.getToken()
    // 初始化检查登录状态
    useEffect(() => {
        setIsLoggedIn(!!userToken);
    }, [userToken]);

    // 登录方法
    const login = (userToken: string) => {
        // localStorage.setItem(LOCAL_STORAGE_KEY.USER_TOKEN, userToken);
        setIsLoggedIn(true);
        appStore.setToken(userToken);
    };

    // 登出方法
    const logout = () => {
        // localStorage.removeItem(LOCAL_STORAGE_KEY.USER_TOKEN);
        // sessionStorage.removeItem(LOCAL_STORAGE_KEY.USER_TOKEN);
        appStore.clearToken();
        setIsLoggedIn(false);
        // 触发自定义事件
        window.dispatchEvent(new Event('loginStatusChanged'));
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 创建自定义钩子
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};