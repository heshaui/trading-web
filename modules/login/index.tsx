import { Layout } from "antd";
import { Navigate } from "react-router";
import type { CSSProperties } from "react";
import appStore from '@/store';
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
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
		<Layout className="relative flex h-overmax w-full flex-row page-box" >
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
						<RegisterForm />
					</LoginStateProvider>
				</div>
			</div>
		</Layout>
	);
}
export default Login;
