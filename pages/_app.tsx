import "@/styles/globals.css";
import "@/styles/public.css";
import "@/styles/public_custom.css";
// 公告中心
import '@/styles/bulletinCenterPublic.css';
import type { AppProps } from "next/app";
import { ConfigProvider } from 'antd';
import { useState, useEffect } from 'react';
import { appWithTranslation, useTranslation } from 'next-i18next';
import HomeMenu from '@/components/homeMenu/HomeMenu';
import Footer from '@/components/footer/Footer';
import { useRouter } from 'next/router';
// import {  Toaster} from "sonner";
import Toaster from "@/components/toast";
// import theme from '@/theme/themeConfig';
import type { ThemeConfig } from 'antd';
import defaultTheme, { getThemeConfig } from '@/theme/themeConfig';


function App({ Component, pageProps }: AppProps) {
  // 动态主题
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  // 获取动态主题
  useEffect(() => {
    // 在客户端加载时获取动态主题
    const fetchTheme = async () => {
      const dynamicTheme = await getThemeConfig();
      setTheme(dynamicTheme);
    };
    
    fetchTheme();
  }, []);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  // const { t } = useTranslation(['common', 'home_menu']);
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  // 使用 ready 状态来确保 i18n 已初始化
  useEffect(() => {
    if (i18n.isInitialized && router.locale) {
      console.log('Changing language to:', router.locale);
    }
  }, [router.locale, i18n.isInitialized]);


  // 添加调试日志
  console.log('App - i18n ready:', i18n.isInitialized);
  console.log('App - Router locale:', router.locale);
  console.log('App - pageProps:', pageProps);
  console.log('App - Translation test:', t('title'));

  // 在客户端同步暗色模式状态
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedMode);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode.toString());
      return newMode;
    });
  };
  // 定义不需要显示 HomeMenu 和 Footer 的页面路径
  const excludePaths = ['/login', '/register', '/resetPassword'];

  const shouldShowMenuAndFooter = !excludePaths.includes(router.pathname);

  // 在应用加载时调用langFile API
  useEffect(() => {
    const fetchLanguageFiles = async () => {
      try {
        console.log('正在获取语言文件...');
        const response = await fetch('/api/langFile');
        
        if (!response.ok) {
        console.log('获取语言文件失败:', response);
        }
        
        const data = await response.json();
        console.log('语言文件获取成功:', data);
      } catch (error) {
        console.error('获取语言文件时出错:', error);
      }
    };

    fetchLanguageFiles();
  }, []); // 空依赖数组确保只在组件挂载时执行一次

  return (

    <ConfigProvider theme={theme}>
      <div className={isDarkMode ? 'dark' : ''}>
        {shouldShowMenuAndFooter && <HomeMenu />}

        <Component {...pageProps} />

        {shouldShowMenuAndFooter && <Footer />}
        <Toaster />

      </div>
    </ConfigProvider>

  );
}

export default appWithTranslation(App);