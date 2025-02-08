import "@/styles/globals.css";
import "@/styles/public.css";
import type { AppProps } from "next/app";
import { useState } from 'react';
import { appWithTranslation, useTranslation } from 'next-i18next';
import HomeMenu from '@/components/homeMenu/HomeMenu';
import Footer from '@/components/footer/Footer';
import { useRouter } from 'next/router';
// import {  Toaster} from "sonner";
import Toaster from "@/components/toast";

function App({ Component, pageProps }: AppProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { t } = useTranslation(['common', 'home-menu']);
    const router = useRouter();

    // 定义不需要显示 HomeMenu 和 Footer 的页面路径
    const excludePaths = ['/login', '/register'];

    const shouldShowMenuAndFooter = !excludePaths.includes(router.pathname);

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            {shouldShowMenuAndFooter && <HomeMenu t={t} test={t('home_menu_title_1')} />}
            <Component {...pageProps} />
            <Toaster/> 
            {shouldShowMenuAndFooter && <Footer />}
        </div>
    );
}

export default appWithTranslation(App);