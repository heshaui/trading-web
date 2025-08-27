import { withOrderLayout } from "@/components/sidebarLayout/OrderLayout/userOrderLayout";
import {
  DatePickerTheme,
  SelectTheme,
  TableTheme,
  TabsTheme,
  TokenTheme,
} from "@/theme/publicThemeConfig";
import { ConfigProvider, Tabs } from "antd";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import CurrentCommission from "./components/CurrentCommission";
import PlanCommission from "./components/PlanCommission";
import HistoryCommission from "./components/HistoryCommission";
import HistoryPlanCommission from "./components/HistoryPlanCommission";
import HistoryDeal from "./components/HistoryDeal";

const ContractOrder = () => {
  const { t } = useTranslation(["contract"]);
  const [isClient, setIsClient] = useState(false);
  const [activeKey, setActiveKey] = useState("1");

  const items = [
    // 当前委托  CurrentCommission
    {
      key: "1",
      label: t("order.currentCommission"),
      children: <CurrentCommission activeKey={activeKey} />,
    },
    // 计划委托 PlanCommission
    // {
    //   key: "2",
    //   label: t("order.planCommission"),
    //   children: <PlanCommission activeKey={activeKey} />,
    // },
    // 历史委托 HistoryCommission
    {
      key: "3",
      label: t("order.historyCommission"),
      children: <HistoryCommission activeKey={activeKey} />,
    },
    // 历史计划委托 HistoryPlanCommission
    // {
    //   key: "4",
    //   label: t("order.historyPlanCommission"),
    //   children: <HistoryPlanCommission activeKey={activeKey} />,
    // },
    // 历史成交 HistoryDeal
    {
      key: "5",
      label: t("order.historyDeal"),
      children: <HistoryDeal activeKey={activeKey} />,
    },
  ];

  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: TabsTheme,
          Table: TableTheme,
          Select: SelectTheme,
          DatePicker: DatePickerTheme,
        },
        token: TokenTheme,
      }}
    >
      <div className="flex flex-col h-full">
        {/* title */}
        <div className="mb-[16px] text-[var(--text-color5)] font-[500] text-[20px]">
          {t("order.title")}
        </div>
        {/* tabs */}
        <div className="bg-[var(--btncolor7)] rounded-[10px] flex-1">
          <Tabs
            items={items}
            activeKey={activeKey}
            onChange={(key) => {
              setActiveKey(key);
            }}
            tabBarStyle={{ padding: "0 20px", height: "72px" }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default withOrderLayout(ContractOrder);
