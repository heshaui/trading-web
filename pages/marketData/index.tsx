import React from "react";
import styles from "./styles/marketData.module.css";
import { ConfigProvider } from "antd";
import { useRouter } from "next/router";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useThemeConfig } from "@/hooks/useKv";
import { useState, useEffect } from "react";
import { FireFilled } from "@ant-design/icons";
import appStore from "@/store";
import { CryptoRanking, HotMarketSymbol } from "@/type/marketData/marketData";
import CryptoTable from "./components/marketTable";
import TrendsTable from "./components/marketTrends";
import { getMarket, getHotData } from "@/services/marketData";
export default function MarketData() {
  const { t } = useTranslation("market");
  const { theme } = useThemeConfig();
  const [marketData, setMarketData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const cryptoRankings: CryptoRanking[] = [
    {
      title: t("rankingList.hotCoins"),
      data: [
        { id: 1, pair: "BTC/USDT", price: 82771.13, change24h: 1.44 },
        { id: 2, pair: "ETH/USDT", price: 4582.34, change24h: 2.31 },
        { id: 3, pair: "SOL/USDT", price: 142.56, change24h: 5.67 },
        { id: 4, pair: "BNB/USDT", price: 587.23, change24h: 0.89 },
        { id: 5, pair: "XRP/USDT", price: 0.5321, change24h: -0.45 },
        { id: 6, pair: "ADA/USDT", price: 0.4523, change24h: 3.21 },
        { id: 7, pair: "DOGE/USDT", price: 0.1234, change24h: 10.23 },
      ],
    },
    {
      title: t("rankingList.risingCoins"),
      data: [
        { id: 1, pair: "SHIB/USDT", price: 0.000023, change24h: 41.03 },
        { id: 2, pair: "DOGE/USDT", price: 0.1234, change24h: 35.02 },
        { id: 3, pair: "LUNA/USDT", price: 82.34, change24h: 30.01 },
        { id: 4, pair: "AVAX/USDT", price: 92.45, change24h: 28.03 },
        { id: 5, pair: "DOT/USDT", price: 18.67, change24h: 25.03 },
        { id: 6, pair: "MATIC/USDT", price: 1.45, change24h: 22.03 },
        { id: 7, pair: "LINK/USDT", price: 23.56, change24h: 20.03 },
      ],
    },
    {
      title: t("rankingList.fallingCoins"),
      data: [
        { id: 1, pair: "ICP/USDT", price: 23.45, change24h: -20.13 },
        { id: 2, pair: "FIL/USDT", price: 18.34, change24h: -18.12 },
        { id: 3, pair: "ETC/USDT", price: 42.56, change24h: -15.11 },
        { id: 4, pair: "XLM/USDT", price: 0.2345, change24h: -12.13 },
        { id: 5, pair: "EOS/USDT", price: 2.34, change24h: -10.13 },
        { id: 6, pair: "AAVE/USDT", price: 156.78, change24h: -8.13 },
        { id: 7, pair: "ALGO/USDT", price: 0.3456, change24h: -5.13 },
      ],
    },
  ];
  const [HotMarketList, setHotMarketList] = useState<HotMarketSymbol[]>([]);
  // 获取涨幅榜跌幅榜数据
  const fetchMarketData = async () => {
    try {
      const response = await getMarket();
      if (response?.code === "0" && response.dta) {
        console.log("获取榜单数据成功：", response.data);
        setMarketData(response.data);
      }
    } catch (error) {
      console.error("获取涨幅榜信息失败：", error);
    }
  };
  // 获取热门榜OK
  const fetchHotMarketData = async () => {
    try {
      const response = await getHotData();
      if (response?.code === "0" && response.data) {
        console.log("获取热门榜列表：", response);
        setHotMarketList(response.data);
      }
    } catch (error) {
      console.error("获取热门榜列表失败：", error);
    }
  };
  useEffect(() => {
    fetchHotMarketData();
    // console.log('1111')
    // fetchMarketData()
  }, []);
  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            inputFontSize: 12,
            colorTextPlaceholder: "var(--help-center-input-text)",
            colorBorder: "var(--border-color4)",
            activeBg: "transparent",
            hoverBg: "transparent",
            colorText: "var(--text-color5)",
          },
          Menu: {
            itemColor: "#A4A5AC",
            itemHoverBg: "var(--theme-color)",
            itemSelectedBg: "var(--theme-color)",
            itemHoverColor: "#FFFFFF",
            itemSelectedColor: "#FFFFFF",
            itemMarginInline: 20,
            itemMarginBlock: 0,
            itemBorderRadius: 10,
          },
          Pagination: {
            itemActiveBg: "var(--theme-color)",
          },
          Breadcrumb: {
            itemColor: "var(--text-color6)",
            lastItemColor: "var(--text-color5)",
            separatorColor: "var(--text-color6)",
            linkColor: "var(--text-color6)",
            linkHoverColor: "none",
          },
          Empty: {
            colorTextDescription: "var(--text-color6)",
          },
          Tabs: {
            itemActiveColor: "var(--tip-color)", //激活态颜色  
            itemSelectedColor: "var(--text-color5)", //选中态颜色
            horizontalMargin: "0 0 0 0",
            itemColor: "var(--text-color6)",
            inkBarColor: "var(--text-color5)", //指示条颜色
            itemHoverColor: "var(--text-color5)", //悬浮态颜色
          },
          Table: {
            headerBg: "transparent",
            headerColor: "var(--text-color6)",
            headerSplitColor: "transparent", // 表头分割线颜色
            rowExpandedBg: "var(--background10)", // 表格行展开背景色
            borderColor: "transparent",
            // stickyScrollBarBg:"transparent",
            headerBorderRadius: 0, // 表头圆角
            // rowHoverBg: "#f5f5f5", // 鼠标悬停在行上时的背景颜色
          },
        },
        token: {
          colorPrimary: "var(--theme-color)",
        },
      }}
    >
      <div className={`${styles.market_page} flex-y align-center`}>
        <div className={`${styles.main_page_box} font-16 fontw-400`}>
          {/* 榜单 */}
          <div className={`${styles.ranking_box}`}>
            <p className={`${styles.section_title}`}>
              {t("marketData.rankings")}
            </p>
            <div className={`${styles.rankings_grid}`}>
              {cryptoRankings.map((ranking) => (
                <div key={ranking.title} className={`${styles.ranking_list}`}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{ranking.title}</h3>
                  </div>
                  <CryptoTable data={ranking.data} />
                </div>
              ))}
            </div>
          </div>
          {/* 行情 */}
          <div className={`${styles.ranking_box}`}>
            <p className={`${styles.section_title}`}>
              {t("marketData.marketTrends")}
            </p>
            <div className={`${styles.trends_box}`}>
              <TrendsTable data={HotMarketList} />
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "market"])),
    },
  };
};
