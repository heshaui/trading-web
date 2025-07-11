import { withAssetsLayout } from "@/components/sidebarLayout/AssetsLayout/userAssetsLayout";
import { ConfigProvider, Tabs } from "antd";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import NumberToken from "./numberToken";
import Financial from "./financial";
import styles from "../../../styles/components/Financial.module.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
const BillDetails = () => {
  const { t } = useTranslation(["financial"]);

  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染
  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            horizontalMargin: "0px",
            inkBarColor: "var(--text-color5)", // 指示条颜色
            itemSelectedColor: "var(--text-color5)", // 选中文本颜色
            itemColor: "var(--text-color6)", // 文本颜色
            itemHoverColor: "var(--text-color5)", // 悬停文本颜色
          },
        },
      }}
    >
      <div>
        <div className="text-[20px] text-[var(--text-color5)] font-[500] mb-[16px]">
          {t("common.billDetails")}
        </div>
        <div className="rounded-[8px] bg-[var(--btncolor7)]">
          <Tabs
            className={styles.tabs}
            defaultActiveKey="1"
            tabBarStyle={{
              padding: "0px 20px",
              height: "72px",
            }}
            items={[
              {
                key: "1",
                label: t("common.digitalCurrency"),
                children: <NumberToken />,
              },
              {
                key: "2",
                label: t("common.financial"),
                children: <Financial />,
              },
            ]}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "assets",
        "common",
        "financial",
      ])),
    },
  };
};
export default withAssetsLayout(BillDetails);
