import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { observer } from "mobx-react-lite";
import MyFinancial from "./components/MyFinancial";
import TokenList from "./components/TokenList";
import Problem from "./components/Problem";
import { useEffect, useState } from "react";
import ConfirmModal from "./components/ConfirmModal";
import SubscribeModal from "./components/SubscribeModal";
import { getFinancialConfig } from "@/services/financial";
import { StatusEnum } from "@/services/financial";

export interface FinancialConfig {
  financialSwitch: StatusEnum | null;
  isRealname: StatusEnum | null;
  isDisplayAssets: StatusEnum | null;
  isDisplayBackground: StatusEnum | null;
}

export default observer(function FinancialPage() {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSubscribe, setOpenSubscribe] = useState(false);
  const [financialConfig, setFinancialConfig] = useState<FinancialConfig>({
    financialSwitch: null, //是否开启
    isRealname: null, //是否实名
    isDisplayAssets: null, //是否显示资产
    isDisplayBackground: null, //是否显示背景图片
  });

  // 初始化功能配置
  const initFinancialConfig = async () => {
    const res = await getFinancialConfig();
    if (res.code === "0") {
      setFinancialConfig(res.data);
    }
  };

  useEffect(() => {
    initFinancialConfig();
  }, []);
  return (
    <>
      <MyFinancial financialConfig={financialConfig} />
      <TokenList setOpenSubscribe={setOpenSubscribe} financialConfig={financialConfig} />
      {
        financialConfig.isDisplayBackground && financialConfig.isDisplayBackground === StatusEnum.OPEN && (
          <Problem />
        )
      }
      <ConfirmModal openConfirm={openConfirm} setOpenConfirm={setOpenConfirm} />
      <SubscribeModal
        openSubscribe={openSubscribe}
        setOpenSubscribe={setOpenSubscribe}
        setOpenConfirm={setOpenConfirm}
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
