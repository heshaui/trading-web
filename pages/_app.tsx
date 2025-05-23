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
// import defaultTheme, { getThemeConfig } from '@/theme/themeConfig';
import defaultTheme from '@/theme/themeConfig';
import { useThemeConfig } from '@/hooks/useKv';
import store from '@/store';
import { NavigationProvider } from '@/context/NavigationContext';
import { AuthProvider } from '@/context/AuthContext';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import { useAuthGuard } from '@/middleware';
// 定义公开路径（不需要登录即可访问的页面）
// const publicPaths = [
//   '/',
//   '/login',
//   '/register',
//   '/resetPassword',
//   // '/invite',
// ];
function App({ Component, pageProps }: AppProps) {
  // 使用自定义钩子获取主题
  const { theme } = useThemeConfig();
  // 是否登录
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // 添加认证检查状态

  // // 检查路径是否匹配公开路径
  // const isPublicPath = (path: string): boolean => {
  //   // 精确匹配
  //   if (publicPaths.includes(path)) return true;

  //   // 前缀匹配（例如 /news/ 开头的所有路径）
  //   for (const publicPath of publicPaths) {
  //     if (publicPath.endsWith('/*') && path.startsWith(publicPath.slice(0, -2))) {
  //       return true;
  //     }
  //   }

  //   return false;
  // };

  // 动态主题
  // const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  // // 获取动态主题
  // useEffect(() => {
  //   // 在客户端加载时获取动态主题
  //   const fetchTheme = async () => {
  //     const dynamicTheme = await getThemeConfig();
  //     setTheme(dynamicTheme);
  //   };

  //   fetchTheme();
  // }, []);

  const [isDarkMode, setIsDarkMode] = useState(false);
  // const { t } = useTranslation(['common', 'home_menu']);
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  // 使用 ready 状态来确保 i18n 已初始化
  useEffect(() => {
    if (i18n.isInitialized && router.locale) {
      // console.log('Changing language to:', router.locale);
    }
  }, [router.locale, i18n.isInitialized]);


  // 添加调试日志
  // console.log('App - i18n ready:', i18n.isInitialized);
  // console.log('App - Router locale:', router.locale);
  // console.log('App - pageProps:', pageProps);
  // console.log('App - Translation test:', t('title'));

  // 在客户端同步暗色模式状态
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedMode);
  }, []);
  // 监听登录状态变化
  useAuthGuard({
    isLoggedIn,
    setIsLoggedIn,
    isAuthChecking,
    setIsAuthChecking
  });
  // useEffect(() => {
  //   // 初始检查
  //   const checkLoginStatus = () => {
  //     const token = localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN);
  //     setIsLoggedIn(!!token);
  //     setIsAuthChecking(false); // 认证检查完成
  //   };

  //   checkLoginStatus();

  //   // 添加自定义事件监听器
  //   const handleLoginChange = () => {
  //     checkLoginStatus();
  //   };

  //   window.addEventListener('loginStatusChanged', handleLoginChange);

  //   return () => {
  //     window.removeEventListener('loginStatusChanged', handleLoginChange);
  //   };
  // }, []);
  // // 模拟路由守卫逻辑
  // useEffect(() => {
  //   // 等待认证状态检查完成
  //   if (isAuthChecking) return;

  //   const currentPath = router.pathname;
  //   const hasToken = localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN);

  //   // 如果已登录且在登录页，重定向到首页
  //   if (hasToken && currentPath === '/login') {
  //       router.push('/');
  //       return;
  //   }

  //   // 如果未登录且访问受保护页面，重定向到登录页
  //   if (!hasToken && !isPublicPath(currentPath)) {
  //       const returnUrl = encodeURIComponent(router.asPath);
  //       router.push({
  //           pathname: '/login',
  //           query: { returnUrl }
  //       });
  //   }
  // }, [isLoggedIn, router.pathname, isAuthChecking, router]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode.toString());
      return newMode;
    });
  };
  // 定义不需要显示 HomeMenu 和 Footer 的页面路径 //'/login', '/register',
  const excludePaths = ['/resetPassword'];
  const excludePathsFooter = ['/resetPassword','/exchange'];

  const shouldShowMenu = !excludePaths.includes(router.pathname);
  const shouldShowFooter = !excludePathsFooter.includes(router.pathname);

  // 添加最后更新时间状态
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  // 在应用加载时调用langFile API并设置定时检查
  useEffect(() => {
    const fetchLanguageFiles = async (checkTimestamp = false) => {
      try {
        console.log('正在获取语言文件...');
        // 如果是检查更新，则带上最后更新时间参数
        const url = checkTimestamp ? `/api/langFile?lastUpdated=${lastUpdated}` : '/api/langFile';
        const response = await fetch(url);

        if (!response.ok) {
          console.log('获取语言文件失败:', response);
          return;
        }

        const data = await response.json();

        if (checkTimestamp && data.updated) {
          console.log('语言文件有更新，正在刷新...');
          // 重新加载资源
          if (i18n.isInitialized) {
            i18n.reloadResources();
          }
          setLastUpdated(Date.now());
        } else if (!checkTimestamp) {
          // console.log('语言文件获取成功:', data);
          setLastUpdated(Date.now());
        } else {
          console.log('语言文件无更新');
        }
      } catch (error) {
        console.error('获取语言文件时出错:', error);
      }
    };

    // 初始加载
    fetchLanguageFiles();

    // 设置定期检查 - 每5分钟检查一次更新
    const interval = setInterval(() => {
      console.log('定时检查语言文件更新...');
      fetchLanguageFiles(true);
    }, 5 * 60 * 1000); // 5分钟 = 5 * 60 * 1000毫秒

    // 组件卸载时清除定时器
    return () => clearInterval(interval);
  }, []); // 空依赖数组确保只在组件挂载时执行一次

  return (
    <AuthProvider>
      <NavigationProvider>
        <ConfigProvider theme={theme}>
          <div className={isDarkMode ? 'dark' : ''}>
            {shouldShowMenu && <HomeMenu />}

            <Component {...pageProps} isLoggedIn={isLoggedIn} />

            {shouldShowFooter && <Footer />}
            <Toaster />
          </div>
        </ConfigProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}

export default appWithTranslation(App);