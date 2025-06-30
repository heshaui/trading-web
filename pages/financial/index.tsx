import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { observer } from "mobx-react-lite";
import { MyFinancial } from "./compontents/MyFinancial";
import { TokenList } from "./compontents/TokenList";
import { Problem } from "./compontents/Problem";
import { SubscribeModal } from "./compontents/SubscribeModal";



export default observer(function FinancialPage() {
  return (
    <>
      <MyFinancial />
      <TokenList />
      <Problem />
      <SubscribeModal />
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
