import { Segmented, ConfigProvider } from "antd";
// import { useTranslation } from "react-i18next";

// import type { FormInstance } from "antd/es/form";
// import type { CSSProperties } from "react";
import React, { useState } from "react";
// import { toast } from "sonner";
// import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext, RegisterTypeEnum, useRegisterTypeContext } from "@/config/register-providers/LoginStateProvider";
import Mailbox from "./register_mailbox"
import Phonebox from "./register_phonebox"
// import PhoneEmailAuthcode from "./components/authCode_phoneAndMail";
import styles from '../styles/login.module.css'
import { useTranslation } from 'next-i18next';

function RegisterForm() {
	const { t } = useTranslation(['login']);

	const { loginState } = useLoginStateContext();

	const [tabsProps, setTabsProps] = useState('email');
	// const { registerType, setRegisterType, backToRegisterType } = useRegisterTypeContext();
	const { setRegisterType } = useRegisterTypeContext();
	const tabsChange = (value: string) => {
		console.log(value);
		setTabsProps(value)
		if (value === "email") {
			setRegisterType(RegisterTypeEnum.EMAIL)
		} else if (value === "phone") {
			setRegisterType(RegisterTypeEnum.PHONE)
		}

	};
	// 验证码获取
	// const sentCode = async () => {
	// 	// 获取表单数据
	// 	const formData = formRef.current?.getFieldsValue();
	// 	if (!formData.email) return toast.error(t("sys.register.emailNullErr"));
	// 	const data = {
	// 		email: formData.email,
	// 	};

	// };
	// const getRegister = async (formData: any) => {
	// 	// if (!codeStart) return toast.error(t("sys.register.codeNullErr"));
	// 	const param = {
	// 		accountName: formData.accountName,
	// 		email: formData.email,
	// 		verificationCode: formData.verificationCode,
	// 		passward: formData.password,
	// 		countryCode: "",
	// 		phoneNumber: "",
	// 	};

	// };

	// const onFinish = async (values: any) => {
	// 	// console.log("Received values of form: ", values);
	// 	await getRegister(values);
	// 	// backToLogin();
	// };

	if (loginState !== LoginStateEnum.REGISTER) return null;

	return (
		<>

			<div className="flex-col" >
				<div className="w-full mb-6"><p className={`${styles.title_box}`}>注册</p> </div>
				<ConfigProvider
					theme={{
						components: {
							Segmented: {
								itemHoverBg: "transparent", //鼠标悬停背景色
								itemHoverColor: "var(--text-color5)",//鼠标悬停颜色
								itemActiveBg:"transparent", //未选中背景色
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
									<div className={`${styles.tabs_label}`} >
										<div>
											{/* 邮箱 */}
											{t('email')}
										</div>
									</div>

								),
								value: 'email',
							},
							{
								label: (
									<div className={`${styles.tabs_label}`} >
										<div>
											{/* 手机 */}
											{t('phone')}
										</div>
									</div>

								),
								value: 'phone',
							},
						]}
						onChange={tabsChange}
						value={tabsProps}
					/>
				</ConfigProvider>
				<Mailbox />
				<Phonebox />

			</div>
		</>
	);
}

export default RegisterForm;
