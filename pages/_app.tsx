import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from 'react';
import { appWithTranslation, useTranslation } from 'next-i18next';
import HomeMenu from '@/components/homeMenu/HomeMenu';
import Footer from '@/components/footer/Footer';


function App({ Component, pageProps }: AppProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { t } = useTranslation(['common', 'home-menu']);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {/* 导航栏和底部全局引入 */}
      <HomeMenu t={ t } test={t('home_menu_title_1')} />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}

export default appWithTranslation(App);