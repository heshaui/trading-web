import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { observer } from "mobx-react-lite";
import MyFinancial from "./components/MyFinancial";
import TokenList from "./components/TokenList";
import Problem from "./components/Problem";
import { useEffect, useState } from "react";
import ConfirmModal from "@/components/Financial/SubscribeConfirmModal";
import SubscribeModal from "@/components/Financial/SubscribeModal";
import {
  FinancialPageTokenItem,
  FinancialPageTokenProductItem,
  getFinancialConfig,
} from "@/services/financial";
import { FunctionEnabledStatusEnum } from "@/services/financial";
import { useAuth } from "@/context/AuthContext";
import appStore from "@/store";

export interface FinancialConfig {
  financialSwitch: FunctionEnabledStatusEnum | null;
  isRealname: FunctionEnabledStatusEnum | null;
  isDisplayAssets: FunctionEnabledStatusEnum | null;
  isDisplayBackground: FunctionEnabledStatusEnum | null;
}

export default observer(function FinancialPage() {
  const { isLoggedIn } = useAuth();

  // 申购弹窗
  const [openSubscribeModal, setOpenSubscribeModal] = useState(false);

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

  const [isClient, setIsClient] = useState(false);

  // 初始化功能配置
  useEffect(() => {
    if (isClient) {
      setFinancialConfig(appStore.financialConfig);
    }
  }, [isClient]);

  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染

  return (
    <>
      {/* 我的理财 */}
      <MyFinancial />

      {/* 理财产品列表 */}
      <TokenList
        setCurRecord={setCurRecord}
        setOpenSubscribeModal={setOpenSubscribeModal}
      />
      {/* 常见问题 */}
      <Problem />

      {/* 申购弹窗 */}
      <SubscribeModal
        curRecord={curRecord}
        openSubscribeModal={openSubscribeModal}
        setOpenSubscribeModal={setOpenSubscribeModal}
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
