import React from "react";
import styles from "./styles/invite.module.css";
import { useThemeMode } from "@/hooks/useThemeMode";
import InviteBanner from "./components/invite_banner";
import InviteContent from "./components/invite_content";
import InviteModal from "./components/modal/invite_Modal";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import appStore from "@/store";

interface InviteInfoType {
  inviteCode: string;
  inviteLink: string;
}
const InvitePage = () => {
  const [open, setOpen] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<InviteInfoType>({
    inviteCode: "",
    inviteLink: "",
  });
  const userInfo = appStore.getUserInfo();
  const [isClient, setIsClient] = useState(false);

  const onInviteReturn = () => {
    setOpen(true);
  };
  const inviteModalOK = () => {
    setOpen(false);
  };
  
  useEffect(() => {
    const getBaseUrl = () => {
      return window.location.origin;
    };
    const param = {
      inviteCode: userInfo.inviteCode || "",
      inviteLink: `${getBaseUrl()}/register?inviteCode=${
        userInfo.inviteCode || ""
      }`,
    };
    setInviteInfo(param);
  }, [userInfo.inviteCode]);

  useEffect(() => {
    try {
      appStore.loadCurrencyPairs();
    } catch (error) {
      console.error("初始化货币对数据错误:", error);
    }
  }, []);

  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染

  return (
    <>
      <div className={`${styles.invite_page} flex-y align-center`}>
        <div className={`${styles.main_page_box} font-16 fontw-400`}>
          <InviteBanner onReturn={onInviteReturn} inviteInfo={inviteInfo} />
          <InviteContent onReturn={onInviteReturn} />
          <InviteModal
            open={open}
            inviteInfo={inviteInfo}
            onCancel={() => setOpen(false)}
            onOk={inviteModalOK}
          />
        </div>
      </div>
    </>
  );
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["invite", "common"])),
    },
  };
};
export default InvitePage;
