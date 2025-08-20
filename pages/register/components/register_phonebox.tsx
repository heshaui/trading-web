"use client";
import { Form, Input, Checkbox, ConfigProvider } from "antd";
import { type CSSProperties, useState, useEffect } from "react";
import {
  LoginStateEnum,
  useLoginStateContext,
  RegisterTypeEnum,
  useRegisterTypeContext,
} from "@/config/register-providers/LoginStateProvider";
import { toast } from "sonner";
import { Iconify } from "@/components/icon/index";
import store from "@/store";
import PhoneCodeSelector from "@/components/PhoneCodeSelector";
import { useRouter } from "next/router";
import styles from "../styles/login.module.css";
import { useTranslation } from "next-i18next";
import { windowOpen } from "@/utils/windowOpen";

const fromStyle: CSSProperties = {
  borderRadius: "5px",
  width: "100%",
  minWidth: "350px",
};

function RegisterPhone() {
  const [isOpen, setIsOpen] = useState(true); //是否展开
  const { t } = useTranslation(["login"]);
  // 密码校验状态
  const [lengthValid, setLengthValid] = useState(false);
  const [charValid, setCharValid] = useState(false);
  const [numValid, setNumValid] = useState(false);

  const [showLengthCheck, setShowLengthCheck] = useState(false);
  const [showCharCheck, setShowCharCheck] = useState(false);
  const [showNumCheck, setShowNumCheck] = useState(false);

  const [showRules, setShowRules] = useState(false);

  const [phoneCodeInputValue, setPhoneCodeInputValue] = useState("");
  const router = useRouter();
  const { setLoginState } = useLoginStateContext();
  const { registerType } = useRegisterTypeContext();
  const allConfig = store.getKvConfigAll();

  const [form] = Form.useForm();

  useEffect(() => {
    // 确保路由已准备好
    if (router.isReady) {
      const { inviteCode } = router.query;
      // 如果 URL 中有 inviteCode，设置到表单的 referee 字段
      if (inviteCode) {
        form.setFieldValue("referee", inviteCode);
      }
    }
  }, [router.isReady, router.query, form]);
  const goLogin = () => {
    router.push("/login");
  };

  const onFinish = async () => {
    form.validateFields().then(async (values) => {
      // console.log(values, 111);
      if (!values.agree) return toast.error(t('registerForm.agreeErr'))
      const data = {
        type: "p",
        phone: values.phoneNumber,
        password: values.password,
        parentInviteCode: isOpen ? values.referee : "",
        countryCode: values.areaCode,
      };
      store.updateRegisterInfo(data);
      goAuthCode();
    });
  };
  // 跳转规则
  const goAuthCode = () => {
    store.setAuthcodeState(LoginStateEnum.REGISTER, RegisterTypeEnum.PHONE); //存储跳转前状态
    setLoginState(LoginStateEnum.Authcode); //设置跳转状态
  };

  // 自定义密码验证规则
  const validatePassword = (_: any, value: string) => {
    if (typeof value === "string") {
      value = value.trim();
    }
    if (!value) {
      return Promise.reject(new Error(t("registerForm.passwordNull")));
    }
    // 检查长度是否在 8 - 100 位之间
    if (value.length < 8 || value.length > 100) {
      return Promise.reject(new Error(t("registerForm.passwordRule1")));
    }
    // 检查是否包含数字
    const hasNumber = /.*\d+.*/;
    if (!hasNumber.test(value)) {
      return Promise.reject(new Error(t("registerForm.passwordnum")));
    }
    // 检查是否包含大写字母
    const hasUpperCase = /.*[A-Z].*/;
    if (!hasUpperCase.test(value)) {
      return Promise.reject(new Error(t("registerForm.passwordletter")));
    }

    return Promise.resolve();
  };
  // 监听密码输入变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 0) {
      setShowRules(true);
    }

    // 检查长度是否在 8 - 100 位之间
    if (value.length < 8 || value.length > 100) {
      setLengthValid(false);
    } else {
      setLengthValid(true);
    }

    // 检查是否包含数字
    const hasNumber = /.*\d+.*/;
    if (!hasNumber.test(value)) {
      setNumValid(false);
    } else {
      setNumValid(true);
    }

    // 检查是否包含大写字母
    const hasUpperCase = /.*[A-Z].*/;
    if (!hasUpperCase.test(value)) {
      setCharValid(false);
    } else {
      setCharValid(true);
    }
  };

  const showRule = () => {
    setShowLengthCheck(true);
    setShowCharCheck(true);
    setShowNumCheck(true);
  };

  const hideRule = () => {
    setShowRules(false);
    setShowLengthCheck(false);
    setShowCharCheck(false);
    setShowNumCheck(false);
  };

  // 过滤输入，只允许数字和字母
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // 只保留数字和字母
    const filteredValue = value.replace(/[^0-9]/g, "");
    setPhoneCodeInputValue(filteredValue);
    form.setFieldsValue({ phoneNumber: filteredValue });
  };
  const goLink = (type: 'user' | 'policy') => {
    if (type === 'user') {
      windowOpen(allConfig?.user_agreement_url || '');
    } else {
      windowOpen(allConfig?.privacy_policy_url || '');
    }
  }
  if (registerType !== RegisterTypeEnum.PHONE) return null;

  return (
    <div className="flex-y-cc mt-7">
      <ConfigProvider
        theme={{
          components: {
            Form: {
              itemMarginBottom: 20, // 去除表单项之间的间距
            },
            Input: {
              controlHeightLG: 50,
              activeBorderColor: "var(--border-color4)",
              hoverBorderColor: "var(--border-color4)",
              activeBg: "var(--background11)",
              hoverBg: "var(--background11)",
            },
            Select: {
              selectorBg: "var(--background11)",
            },
          },
          token: {
            colorBgContainer: "transparent",
          },
        }}
      >
        <Form style={fromStyle} name="login" size="large" form={form}>
          <div className={`${styles.title_color} mb-3 font-16 font-w-500`}>
            {/* 手机号 */}
            {t("phoneTitle")}
          </div>
          <Form.Item>
            <div className="flex">
              <Form.Item noStyle name="areaCode" >
                <PhoneCodeSelector />
              </Form.Item>
              <Form.Item
                noStyle
                name="phoneNumber"
                rules={[{ required: true, message: t("phoneNull") }]}
              >
                <Input
                  placeholder={t("phoneInputPlaceholder")}
                  allowClear={true}
                  className={`${styles.mail_input} ml-2 modal-input`}
                  onChange={handleInputChange}
                  value={phoneCodeInputValue}
                />
              </Form.Item>
            </div>
          </Form.Item>
          <div className={`${styles.title_color} mb-3 mt-5 font-16 font-w-500`}>
            {/* 密码 */}
            {t("passwordTitle")}
          </div>
          <Form.Item name="password" rules={[{ validator: validatePassword }]}>
            <Input.Password
              type="password"
              placeholder={t("registerForm.passwordPlaceholder")}
              maxLength={100}
              allowClear={true}
              size="large"
              className={`${styles.mail_input} modal-input`}
              onChange={handlePasswordChange}
              onFocus={showRule}
              onBlur={hideRule}
            // prefix={
            // 	<Iconify icon="solar:lock-password-linear" className="icon-color" />
            // }
            />
          </Form.Item>
          {showRules && (
            <div className={`mt-1`}>
              {showLengthCheck && (
                <div
                  className={`font-12 font-w-400 ${styles.ruleItem} ${lengthValid ? styles.tip_title : styles.tip_color
                    }`}
                >
                  <Iconify
                    icon="iconoir:check-circle-solid"
                    size={16}
                    className={`mr-1 ${lengthValid ? styles.tip_title : styles.tip_color
                      }`}
                  />
                  {/* 8-100个字符 */}
                  {t("registerForm.passwordRule1")}
                </div>
              )}
              {showNumCheck && (
                <div
                  className={`font-12 mt-0_5 font-w-400 ${styles.ruleItem} ${numValid ? styles.tip_title : styles.tip_color
                    }`}
                >
                  <Iconify
                    icon="iconoir:check-circle-solid"
                    size={16}
                    className={`mr-1 ${numValid ? styles.tip_title : styles.tip_color
                      }`}
                  />
                  {/* 至少包含一个数字 */}
                  {t("registerForm.passwordnum")}
                </div>
              )}
              {showCharCheck && (
                <div
                  className={`font-12 mt-0_5 font-w-400 ${styles.ruleItem} ${charValid ? styles.tip_title : styles.tip_color
                    }`}
                >
                  <Iconify
                    icon="iconoir:check-circle-solid"
                    size={16}
                    className={`mr-1 ${charValid ? styles.tip_title : styles.tip_color
                      }`}
                  />
                  {/* 至少包含一个大写字母 */}
                  {t("registerForm.passwordletter")}
                </div>
              )}
            </div>
          )}

          <div
            className={`${styles.title_color} mb-3 mt-5 font-16 font-w-500 flex-x algin-center  cursor-pointer`}
          >
            {/* 推荐人的邀请码(选填) */}
            {t("registerForm.refereeTitle")}
            <Iconify
              icon={
                isOpen ? "cuida:caret-up-outline" : "cuida:caret-down-outline"
              }
              className={`${styles.tip_icon} ml-1`}
              size={20}
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            />
          </div>
          {isOpen && (
            <Form.Item name="referee" rules={[{ required: false }]}>
              <Input
                type="referee"
                placeholder={t("registerForm.refereePlaceholder")}
                allowClear={true}
                size="large"
                className={`${styles.mail_input} modal-input`}
                maxLength={8}
              />
            </Form.Item>
          )}
          <Form.Item
            noStyle
            name="agree"
            valuePropName="checked"
            rules={[{ required: false }]}
          >
            <Checkbox className="custom-checkbox  text-color-default ">
              <p className={`${styles.title_color}`}>
                {/* 我已阅读并同意 */}
                {t("agree")}&nbsp;
                <button type="button" className="text-color" onClick={(event) => {
                  event.stopPropagation();
                  goLink('user')
                }}>{t('protocol')}</button>&nbsp;{t('and')}&nbsp;<button type="button" className="text-color" onClick={(event) => {
                  event.stopPropagation();
                  goLink('policy')
                }}>{t('policy')}</button>
              </p>
            </Checkbox>
          </Form.Item>
        </Form>
        {/* <Button type="primary" htmlType="submit" className="w-full button-color login-button mt-8" loading={loading}
				onClick={onFinish}>
				{"注册"}
			</Button> */}
        <button
          type="submit"
          className={`${styles.login_button} w-full button-color mt-8`}
          onClick={onFinish}
        >
          {t("registerForm.registerButton")}
        </button>
        {/* <p className="tip-color2 mt-5">或者</p>
			<Button className="w-full google-btn mt-5" loading={loading}
				icon={<Iconify icon="fa6-brands:google" className="icon-color1" />}
				onClick={() => goAuthCode()}
			>
				使用Google继续
			</Button> */}
        <div className="flex-cc mt-4">
          <p>
            {/* {"已有账号？"} */}
            {t("registerForm.hasAccount")}
            <button type="button" className="text-color" onClick={goLogin}>
              {/* {"登录"} */}
              {t("login")}
            </button>
          </p>
        </div>
      </ConfigProvider>
    </div>
  );
}

export default RegisterPhone;
