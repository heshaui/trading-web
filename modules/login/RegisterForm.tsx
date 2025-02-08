import { Button, Form, Input, Segmented } from "antd";
import { useTranslation } from "react-i18next";

import type { FormInstance } from "antd/es/form";
import type { CSSProperties } from "react";
import React, { useState } from "react";
import { toast } from "sonner";
// import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext, RegisterTypeEnum, useRegisterTypeContext } from "./providers/LoginStateProvider";
import Mailbox from "./components/register_mailbox"
import Phonebox from "./components/register_phonebox"
function RegisterForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();
	const formRef = React.useRef<FormInstance>(null); //  使用 ref 来存储 form 实例
	const [countdown, setCountdown] = useState(0);
	const [isCounting, setIsCounting] = useState(false);

	const fromStyle: CSSProperties = {
		borderRadius: "5px",
		boxShadow: "0px 0px 6px 0px rgba(235, 236, 241, 1)",
		padding: "25px",
	};
	const [tabsProps, setTabsProps] = useState('email');
	const { registerType, setRegisterType, backToRegisterType } = useRegisterTypeContext();
	if (loginState !== LoginStateEnum.REGISTER) return null;
	const tabsChange = (value: string) => {
		console.log(value);
		setTabsProps(value)
		if (value === "email") {
			setRegisterType(RegisterTypeEnum.EMAIL)
		} else if (value === "phone") {
			setRegisterType(RegisterTypeEnum.PHONE)
		} else if (value === "QRcode") {
			setRegisterType(RegisterTypeEnum.QRcode)
		}

	};
	// 验证码获取
	const sentCode = async () => {
		// 获取表单数据
		const formData = formRef.current?.getFieldsValue();
		if (!formData.email) return toast.error(t("sys.register.emailNullErr"));
		const data = {
			email: formData.email,
		};

	};
	const getRegister = async (formData: any) => {
		// if (!codeStart) return toast.error(t("sys.register.codeNullErr"));
		const param = {
			accountName: formData.accountName,
			email: formData.email,
			verificationCode: formData.verificationCode,
			passward: formData.password,
			countryCode: "",
			phoneNumber: "",
		};

	};

	const onFinish = async (values: any) => {
		// console.log("Received values of form: ", values);
		await getRegister(values);
		// backToLogin();
	};

	// const handleCaptchaSuccess = () => {
	// 	console.log("验证码通过");
	// };

	// const handleCaptchaFailure = () => {
	// 	console.log("验证码未通过");
	// };
	// const showVerify = () => {
	// 	captchaRef.current?.verify()

	// }

	return (
		<>

			<div className="flex-col" >
				<div className="w-full mb-6"><p className="title-box">注册</p> </div>
				<Segmented
					className="custom-segmented"
					options={[
						{
							label: (
								//  button-color
								<div className="tabs-label" >
									<div>邮箱</div>
								</div>

							),
							value: 'email',
						},
						{
							label: (
								<div className="tabs-label" >
									<div>手机</div>
								</div>

							),
							value: 'phone',
						},
					]}
					onChange={tabsChange}
					value={tabsProps}
				/>
				{/* <LoginTypeProvider>
				<Mailbox />
				<Phonebox />
			</LoginTypeProvider> */}
				{tabsProps === "email" && (<Mailbox />)}
				{tabsProps === "phone" && (<Phonebox />)}
			</div>
		</>
	);
}

export default RegisterForm;
