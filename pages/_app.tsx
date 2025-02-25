import "@/styles/globals.css";
import "@/styles/public.css";
import "@/styles/public_custom.css";
// import '@/styles/homeMenuPublic.css'
import type { AppProps } from "next/app";
import { ConfigProvider } from 'antd';
import { useState,useEffect } from 'react';
import { appWithTranslation, useTranslation } from 'next-i18next';
import HomeMenu from '@/components/homeMenu/HomeMenu';
import Footer from '@/components/footer/Footer';
import { useRouter } from 'next/router';
// import {  Toaster} from "sonner";
import Toaster from "@/components/toast";
import theme from '@/theme/themeConfig';


function App({ Component, pageProps }: AppProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    // const { t } = useTranslation(['common', 'home_menu']);
    const { t } = useTranslation(['home_menu']);
    const router = useRouter();
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

    return (

        <div className={isDarkMode ? 'dark' : ''}>
            {/* {shouldShowMenuAndFooter && <HomeMenu t={t} test={t('home_menu_title_1')} />} */}
            {shouldShowMenuAndFooter && <HomeMenu />}
            <ConfigProvider theme={theme}>
                <Component {...pageProps} />
            </ConfigProvider>
            {shouldShowMenuAndFooter && <Footer />}
            <Toaster />
        </div>


    );
}

export default appWithTranslation(App);