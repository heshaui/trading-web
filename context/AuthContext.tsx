import store from '@/store';
import router from 'next/router';
import React, { createContext, useContext, useState, useEffect } from 'react';

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

    // 初始化检查登录状态
    useEffect(() => {
        const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        setIsLoggedIn(!!userToken);
    }, []);

    // 登录方法
    const login = (userToken: string) => {
        localStorage.setItem('userToken', userToken);
        setIsLoggedIn(true);
    };

    // 登出方法
    const logout = () => {
        localStorage.removeItem('userToken');
        sessionStorage.removeItem('userToken');
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