// import { Button, Form, Input,Tabs } from "antd";
import {  Layout } from 'antd';
// import { type CSSProperties, useState, useRef } from "react";
import { ResetStateProvider } from "@/config/reset-providers/ResetStateProvider";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "./style/reset.module.css"
import { Iconify } from "@/components/icon/index";
import InputAcount from "./components/inputAcount";
import SentCode from "./components/sentCode";
import ResetPage from "./components/resetPage";
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

function ResetPassword() {
    const { t } = useTranslation(['resetPassword', 'common']);

    // const [tabsProps, setTabsProps] = useState('email');
    // const signIn = useSignIn();
    // const { loginType, setLoginType } = useLoginTypeContext();
    // const [authCode, setAuthCode] = useState('');
    // const inputRef = useRef<HTMLInputElement | null>(null);
    // 当状态不为 Authcode 时不渲染组件
    // if (loginType !== LoginTypeEnum.Authcode || registerType !== RegisterTypeEnum.Authcode) return null;
    // if (loginState !== LoginStateEnum.Googlecode) return null;


    return (
        <div className="relative flex h-overmax w-full flex-row page-box" >
            <div className=" flex-col flex-ai-center w-full  justify-center flex-1 position-relative">
                <div>
                    <h2 className="mb-6 font-w-500 font-36" >
                        {/* 重置密码 */}
                        {t('reset')}
                    </h2>
                    <div className={`mb-6 flex flex-ai-center  ${styles.warning_box}`} >
                        <Iconify icon="ep:warning-filled" className="mr-2" size={20} aria-hidden="true"/>
                        {/* 为确保您的账户安全，在您更改密码后48小时内禁出金。 */}
                        {t('resetTip')}
                    </div>
                    <ResetStateProvider>
                        <InputAcount />
                        <SentCode />
                        <ResetPage />
                    </ResetStateProvider>
                </div>

            </div>
        </div>

    );
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', [
				'resetPassword',  // 重置密码相关翻译
				'common',        // 通用翻译
			])),
		},
	};
};
export default ResetPassword;
