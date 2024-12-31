import "@/styles/globals.css";
import "@/styles/public.css";
import type { AppProps } from "next/app";
import { useState } from 'react';
import { appWithTranslation } from 'next-i18next';


 function App({ Component, pageProps }: AppProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Component {...pageProps} />
    </div>
  );}

  export default appWithTranslation(App);