// import { Button, Form, Input,Tabs } from "antd";
import { Segmented, ConfigProvider } from "antd";
import { useState } from "react";
import Mailbox from "./loginMailbox";
import Phonebox from "./loginPhonebox";
import {
  LoginStateEnum,
  useLoginStateContext,
} from "@/config/login-providers/LoginStateProvider";
import {
  LoginTypeEnum,
  useLoginTypeContext,
} from "@/config/login-providers/LoginStateProvider";
import NoteModal from "@/components/myModal/noteModal";
// import { useTranslation } from 'next-i18next';
import styles from "../styles/login.module.css";
import { useTranslation } from "next-i18next";
function LoginForm() {
  const { t } = useTranslation(["login"]);
  const [noteModelOpen, setNoteModelOpen] = useState(false);

  const [tabsProps, setTabsProps] = useState("email");
  const { loginState } = useLoginStateContext();
  // const signIn = useSignIn();
  const { setLoginType } = useLoginTypeContext();
  // 当登录状态不为 LOGIN 时不渲染组件

  const handCancel = () => {
    setNoteModelOpen(false);
  };

  // const handOk = () => {
  // 	setNoteModelOpen(true);
  // 	// 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
  // };

  // const handleFinish = async (values: any) => {
  // 	setLoading(true);
  // };

  // const usernameChange = (changedValues: any) => {
  // 	Object.keys(changedValues).forEach((key) => {
  // 		if (key === "username" && preCheck) {
  // 			setpreCheck(false);
  // 		}
  // 	});

  // }
  const tabsChange = (value: string) => {
    // console.log(value);
    setTabsProps(value);
    if (value === "email") {
      setLoginType(LoginTypeEnum.EMAIL);
    } else if (value === "phone") {
      setLoginType(LoginTypeEnum.PHONE);
    } else if (value === "QRcode") {
      setLoginType(LoginTypeEnum.QRcode);
    }
  };
  if (loginState !== LoginStateEnum.LOGIN) return null;

  return (
    <div className="flex-col" style={{ minHeight: "70vh" }}>
      {/* {t('login')} */}
      <div className="w-full mb-6">
        <p className={`${styles.title_box}`}>
          {/* 登录 */}
          {t("login")}
        </p>
      </div>
      <ConfigProvider
        theme={{
          components: {
            Segmented: {
              itemHoverBg: "transparent", //鼠标悬停背景色
              itemHoverColor: "var(--text-color5)", //鼠标悬停颜色
              itemActiveBg: "transparent", //未选中背景色
            },
          },
        }}
      >
        <Segmented
          className={`${styles.custom_segmented} custom-segmented`}
          options={[
            {
              label: (
                //  button-color
                <div className={`${styles.tabs_label}`}>
                  <div>
                    {/* 邮箱 */}
                    {t("email")}
                  </div>
                </div>
              ),
              value: "email",
            },
            {
              label: (
                <div className={`${styles.tabs_label}`}>
                  <div>
                    {/* 手机 */}
                    {t("phone")}
                  </div>
                </div>
              ),
              value: "phone",
            },
            // {
            // 	label: (
            // 		<div className="tabs-label" >
            // 			<div>QRcode</div>
            // 		</div>
            // 	),
            // 	value: 'QRcode',
            // },
          ]}
          onChange={tabsChange}
          value={tabsProps}
        />
      </ConfigProvider>
      <Mailbox />
      <Phonebox />
      {/* <QRCodebox/> */}
      <NoteModal open={noteModelOpen} onCancel={handCancel} />
    </div>
  );
}

export default LoginForm;
