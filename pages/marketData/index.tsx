import React from "react";
import styles from "./styles/marketData.module.css";
import { ConfigProvider } from "antd";
import { useRouter } from "next/router";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useThemeConfig } from "@/hooks/useKv";
import { useState, useEffect } from "react";
import {FireFilled} from '@ant-design/icons'
import appStore from "@/store";

export default function MarketData() {
  const { t } = useTranslation("market");
  const { theme } = useThemeConfig();
  const [marketData, setMarketData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


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
              {/* 热门榜 */}
              <div className={`${styles.ranking_list}`}><FireFilled style={{width:'24px',height:"24px"}}/>{t("rankingList.hotCoins")}</div>
              {/* 涨幅榜 */}
              <div className={`${styles.ranking_list}`}>{t("rankingList.risingCoins")}</div>
              {/* 跌幅榜 */}
              <div className={`${styles.ranking_list}`}>{t("rankingList.fallingCoins")}</div>
            </div>
          </div>
            {/* 行情 */}
          <div className={`${styles.market_trends_box}`}>
            <p className={`${styles.section_title}`}>
              {t("marketData.marketTrends")}
            </p>
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
