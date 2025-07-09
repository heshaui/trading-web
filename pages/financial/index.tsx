import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { observer } from "mobx-react-lite";
import MyFinancial from "./components/MyFinancial";
import TokenList from "./components/TokenList";
import Problem from "./components/Problem";
import { useEffect, useState } from "react";
import ConfirmModal from "@/components/Financial/ConfirmModal";
import SubscribeModal from "@/components/Financial/SubscribeModal";
import {
  FinancialPageTokenItem,
  FinancialPageTokenProductItem,
  FinancialType,
  getFinancialConfig,
} from "@/services/financial";
import { FunctionEnabledStatusEnum } from "@/services/financial";
import { useAuth } from "@/context/AuthContext";

export interface FinancialConfig {
  financialSwitch: FunctionEnabledStatusEnum | null;
  isRealname: FunctionEnabledStatusEnum | null;
  isDisplayAssets: FunctionEnabledStatusEnum | null;
  isDisplayBackground: FunctionEnabledStatusEnum | null;
}

interface ConfirmModalType {
  open: boolean;
  status: "error" | "success" | null;
  amount?: number;
  type?: FinancialType;
  unit?: string;
  endTime?: string | number;
}

export default observer(function FinancialPage() {
  const { isLoggedIn } = useAuth();
  
  // 确认弹窗
  const [confirmModal, setConfirmModal] = useState<ConfirmModalType>({
    open: false,
    status: null,
    amount: undefined,
    type: undefined,
    unit: undefined,
    endTime: undefined,
  });

  // 申购弹窗
  const [openSubscribe, setOpenSubscribe] = useState(false);

  // 当前记录
  const [curRecord, setCurRecord] = useState<{
    token: FinancialPageTokenItem;
    curProduct: FinancialPageTokenProductItem;
  } | null>(null);

  // 功能配置
  const [financialConfig, setFinancialConfig] = useState<FinancialConfig>({
    financialSwitch: null, //是否开启
    isRealname: null, //是否实名
    isDisplayAssets: null, //是否显示资产
    isDisplayBackground: null, //是否显示背景图片
  });

  // 初始化功能配置
  const initFinancialConfig = async () => {
    try {
      const res = await getFinancialConfig();
      if (res.code === "0") {
        setFinancialConfig(res.data);
        console.log("financialConfig", res.data);
      }
    } catch (error) {
      console.error("Failed to load financial config:", error);
    }
  };

  // 初始化功能配置
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window !== "undefined") {
      initFinancialConfig();
    }
  }, []);


  return (
    <>
      {/* 我的理财 */}
      <MyFinancial financialConfig={financialConfig} isLoggedIn={isLoggedIn} />
      {/* 理财产品列表 */}
      <TokenList
        setCurRecord={setCurRecord}
        setOpenSubscribe={setOpenSubscribe}
        financialConfig={financialConfig}
        isLoggedIn={isLoggedIn}
      />
      {/* 常见问题 */}
      <Problem />
      {/* 确认弹窗 */}
      <ConfirmModal
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
      />
      {/* 申购弹窗 */}
      <SubscribeModal
        curRecord={curRecord}
        openSubscribe={openSubscribe}
        setOpenSubscribe={setOpenSubscribe}
        setConfirmModal={setConfirmModal}
      />
    </>
  );
});

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "financial",
        "common",
      ])),
    },
  };
};
