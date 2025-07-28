import { withAssetsLayout } from "@/components/sidebarLayout/AssetsLayout/userAssetsLayout";
import { ConfigProvider, Tabs } from "antd";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import NumberToken from "./numberToken";
import Financial from "./financial";
import styles from "@/styles/components/Financial.module.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { financialThemeConfig } from "@/theme/financialThemeConfig";
import { FunctionSwitchStatusEnum } from "@/services/financial";
import appStore from "@/store";
import { withSpotLayout } from "@/components/sidebarLayout/SpotLayout/userSpotLayout";
import { observer } from "mobx-react-lite";

const BillDetails = observer(() => {
  const { t } = useTranslation(["financial"]);
  const financialConfig = appStore.financialConfig;
  const [isClient, setIsClient] = useState(false);
  const [activeKey, setActiveKey] = useState(1);

  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染
  return (
    <ConfigProvider theme={financialThemeConfig}>
      <div className="flex flex-col h-full">
        <div className="text-[20px] text-[var(--text-color5)] font-[500] mb-[16px]">
          {t("common.billDetails")}
        </div>
        <div className="rounded-[8px] bg-[var(--btncolor7)] flex-1">
          <Tabs
            className={styles.tabs}
            activeKey={String(activeKey)}
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
              ...(financialConfig.financialSwitch ===
              FunctionSwitchStatusEnum.OPEN
                ? [
                    {
                      key: "2",
                      label: t("common.financial"),
                      children: <Financial activeKey={activeKey} />,
                    },
                  ]
                : []),
            ]}
            onChange={(key) => {
              const newType = Number(key);
              setActiveKey(newType);
            }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
});

export default withSpotLayout(BillDetails);
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "common",
        "financial",
        "assets",
      ])),
    },
  };
};
