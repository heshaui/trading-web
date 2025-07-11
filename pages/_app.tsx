import "@/styles/globals.css";
import "@/styles/public.css";
import "@/styles/public_custom.css";
// 公告中心
import "@/styles/bulletinCenterPublic.css";
import type { AppProps } from "next/app";
import { ConfigProvider } from "antd";
import { useState, useEffect } from "react";
import { appWithTranslation, useTranslation } from "next-i18next";
import HomeMenu from "@/components/homeMenu/HomeMenu";
import Footer from "@/components/footer/Footer";
import { useRouter } from "next/router";
import Toaster from "@/components/toast";
import { useThemeConfig } from "@/hooks/useKv";
import { NavigationProvider } from "@/context/NavigationContext";
import { AuthProvider } from "@/context/AuthContext";
import { useAuthGuard } from "@/middleware";
import { initTheme } from "@/hooks/dayModeChange";
import { useFavicon } from "@/hooks/useFavicon";
import appStore from "@/store";

function App({ Component, pageProps }: AppProps) {
  // 使用自定义钩子获取主题
  const { theme } = useThemeConfig();
  // 是否登录
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // 添加认证检查状态

  const [isDarkMode, setIsDarkMode] = useState(false);
  // const { t } = useTranslation(['common', 'home_menu']);
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  // 使用 ready 状态来确保 i18n 已初始化
  useEffect(() => {
    if (i18n.isInitialized && router.locale) {
      // console.log('Changing language to:', router.locale);
    }
  }, [router.locale, i18n.isInitialized]);

  

  // 在客户端同步暗色模式状态并应用主题变量
  useEffect(() => {
    appStore.loadCurrencyPairs();
    initTheme();
  }, []);

  // 使用自定义钩子设置浏览器图标
  useFavicon();
  // 监听登录状态变化
  useAuthGuard({
    isLoggedIn,
    setIsLoggedIn,
    isAuthChecking,
    setIsAuthChecking,
  });

  useEffect(() => {
    if (isLoggedIn) {
      appStore.loadGetUserInfo("init");
    }
  }, [isLoggedIn]);


  // 定义不需要显示 HomeMenu 和 Footer 的页面路径 //'/login', '/register',
  const excludePaths = ["/resetPassword"];
  const excludePathsFooter = ["/resetPassword", "/exchange"];

  const shouldShowMenu = !excludePaths.includes(router.pathname);
  const shouldShowFooter = !excludePathsFooter.includes(router.pathname);

  // 不需要跟踪语言文件最后更新时间

  // 在应用加载时调用langFile API
  useEffect(() => {
    const fetchLanguageFiles = async () => {
      try {
        console.log("正在获取语言文件...");
        const response = await fetch("/api/langFile");

        if (!response.ok) {
          console.log("获取语言文件失败:", response);
          return;
        }

        const result = await response.json();

        // 确保有语言数据
        if (result.data) {
          console.log("获取到API语言数据，正在加载到i18next...");

          // 遍历所有语言
          Object.keys(result.data).forEach((lang) => {
            // 遍历每种语言的命名空间
            Object.keys(result.data[lang]).forEach((ns) => {
              console.log(`添加语言资源: ${lang}.${ns}`);
              // 添加资源到i18next实例
              i18n.addResourceBundle(
                lang,
                ns,
                result.data[lang][ns],
                true, // 合并现有资源
                true // 深度合并
              );
            });
          });

          // 重新加载资源以应用更改
          if (i18n.isInitialized) {
            console.log("重新加载i18next资源...");
            i18n.reloadResources().then(() => {
              // 强制更新当前语言，确保UI更新
              const currentLang = i18n.language;
              i18n.changeLanguage(currentLang);
              console.log(`已重新应用语言: ${currentLang}`);
            });
          }

          // 语言文件已加载完成
        } else {
          console.log("API返回无语言数据");
        }
      } catch (error) {
        console.error("获取语言文件时出错:", error);
      }
    };

    // 初始加载
    fetchLanguageFiles();
  }, [i18n]); // 仅将i18n作为依赖项

  return (
    <AuthProvider>
      <NavigationProvider>
        <ConfigProvider theme={theme}>
          <div className={isDarkMode ? "dark" : ""}>
            {shouldShowMenu && <HomeMenu />}

            <div
              style={{
                minHeight: "calc(100vh - 80px)",
                width: "100%",
              }}
            >
              <Component {...pageProps} isLoggedIn={isLoggedIn} />
            </div>

            {shouldShowFooter && <Footer />}
            <Toaster />
          </div>
        </ConfigProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}

export default appWithTranslation(App);
