import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { observer } from "mobx-react-lite";
import { MyFinancial } from "./components/MyFinancial";
import { TokenList } from "./components/TokenList";
import { Problem } from "./components/Problem";
import { useState } from "react";
import ConfirmModal from "./components/ConfirmModal";
import SubscribeModal from "./components/SubscribeModal";




export default observer(function FinancialPage() {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSubscribe, setOpenSubscribe] = useState(false);

  return (
    <>
      <MyFinancial />
      <TokenList setOpenSubscribe={setOpenSubscribe} />
      <Problem />
      <ConfirmModal  openConfirm={openConfirm}  setOpenConfirm={setOpenConfirm} setOpenSubscribe={setOpenSubscribe} />
      <SubscribeModal openSubscribe={openSubscribe} setOpenSubscribe={setOpenSubscribe} setOpenConfirm={setOpenConfirm} />
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
