import { Layout } from "antd";
// import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
// import userStore from "@/store/userStore";
// import LocalePicker from "@/components/locale-picker";
import type { CSSProperties } from "react";
import appStore from '@/store';
// import SettingButton from "@/layouts/_common/setting-button";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
// import ResetForm from "./ResetForm";
import { LoginStateProvider } from "./providers/LoginStateProvider";


// const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;
const HOMEPAGE = '/';
const loginBgcStyle: CSSProperties = {
	backgroundImage: `url("/images/login/loginPic.png")`,
	backgroundRepeat: "no-repeat",
	backgroundSize: "cover",
	// height: "100%", width: "100%"
};
function Login() {
	// const { t } = useTranslation();
	const token = appStore.userToken;
	// 判断用户是否有权限/登录
	if (token) {
		// 如果有授权，则跳转到首页
		return <Navigate to={HOMEPAGE} replace />;
	}

	return (
		<Layout className="relative flex h-overmax w-full flex-row">
			<div
				className="hidden flex-1"
				style={loginBgcStyle}
			>
				{/* <img className="" src="/images/login/loginPic.png" alt="" /> */}
			</div>

			<div className="m-auto flex flex-ai-center w-full flex-col justify-center flex-1 position-relative">
				<div style={{ width: "368px" }}>
					<LoginStateProvider>
						<LoginForm />
						{/* <MobileForm />
						<QrCodeFrom /> */}
						<RegisterForm />
						{/* <ResetForm /> */}
					</LoginStateProvider>
				</div>
				{/* <div className="absolute " style={{ right: "45%", bottom: "14px" }}>
					©2025 IMBIT.
				</div> */}
			</div>

			{/* <div className="absolute right-2 top-0 flex flex-row">
				<LocalePicker />
				<SettingButton />
			</div> */}
		</Layout>
	);
}
export default Login;
