import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { observer } from "mobx-react-lite";
import { MyFinancial } from "./compontents/MyFinancial";
import { TokenList } from "./compontents/TokenList";
import { Problem } from "./compontents/Problem";
import { useState } from "react";
import ConfirmModal from "./compontents/ConfirmModal";
import SubscribeModal from "./compontents/SubscribeModal";




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
