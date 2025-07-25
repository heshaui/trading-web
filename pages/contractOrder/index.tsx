import { withSpotLayout } from "@/components/sidebarLayout/SpotLayout/userSpotLayout";
import { financialThemeConfig } from "@/theme/financialThemeConfig";
import { ConfigProvider, Tabs } from "antd";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import CurrentCommission from "./components/CurrentCommission";
import PlanCommission from "./components/PlanCommission";
import HistoryCommission from "./components/HistoryCommission";
import HistoryPlanCommission from "./components/HistoryPlanCommission";
import HistoryDeal from "./components/HistoryDeal";

const ContractOrder = () => {
  const { t } = useTranslation(["common"]);
  const [isClient, setIsClient] = useState(false);

  const items = [
    // 当前委托  CurrentCommission
    {
      key: "1",
      label: "当前委托",
      children: <CurrentCommission />,
    },
    // 计划委托 PlanCommission
    {
      key: "2",
      label: "计划委托",
      children: <PlanCommission />,
    },
    // 历史委托 HistoryCommission
    {
      key: "3",
      label: "历史委托",
      children: <HistoryCommission />,
    },
    // 历史计划委托 HistoryPlanCommission
    {
      key: "4",
      label: "历史计划委托",
      children: <HistoryPlanCommission />,
    },
    // 历史成交 HistoryDeal
    {
      key: "5",
      label: "历史成交",
      children: <HistoryDeal />,
    },
  ];

  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染
  return (
    <ConfigProvider theme={financialThemeConfig}>
      <div className="flex flex-col h-full">
        {/* title */}
        <div className="mb-[16px] text-[var(--text-color5)] font-[500] text-[20px]">
          {"合约订单"}
        </div>
        {/* tabs */}
        <div className="bg-[var(--btncolor7)] rounded-[10px] flex-1">
          <Tabs
            items={items}
            tabBarStyle={{ padding: "0 20px", height: "72px" }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default withSpotLayout(ContractOrder);

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "contract"])),
    },
  };
};
