import { Layout } from "antd";
import type { CSSProperties } from "react";
import { useEffect } from "react";
import LoginForm from "./components/LoginForm";
import {  LoginTypeProvider } from "@/config/login-providers/LoginStateProvider";
import { useRouter } from 'next/router';
// import "./styles/login.css"
import styles from './styles/login.module.css'
const loginBgcStyle: CSSProperties = {
	backgroundImage: `url("/images/login/banner.png")`,
	backgroundColor: "pink",
	backgroundRepeat: "no-repeat",
	backgroundSize: "cover",
	height: "100%",
	// backgroundColor:"pink"
	// width: "100%"
};
function Login() {
	const router = useRouter();
	// const { t } = useTranslation();
	// const token = appStore.userToken;
	// const token=localStorage.getItem('userToken')
	// // 如果有授权，则跳转到首页
	// if (token) {
	// 	router.push('/') 
	// }
	let token = null;

    // // 判断是否为浏览器环境
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('userToken');
    }

    // 如果有授权，则跳转到首页
    useEffect(() => {
        if (token) {
            router.push('/');
        }
    }, [token, router]);


	return (
		<div className={`relative flex h-overmax w-full flex-row ${styles.page_box}`} >
		{/* <div className="relative flex h-overmax w-full flex-row page-box "> */}
			<div
				className="isHidden flex-1"
				style={loginBgcStyle}
			>
				{/* <img className="" src="/images/login/loginPic.png" alt="" /> */}
			</div>

			<div className="m-auto flex flex-ai-center w-full flex-col justify-center flex-1 position-relative">
				<div style={{ width: "368px" }}>
					{/* <LoginStateProvider> */}
						{/* 登录注册切换 */}
						<LoginTypeProvider>
							<LoginForm />
						</LoginTypeProvider>
						{/* <PhoneEmailAuthcode /> */}
						{/* <GoogleAuthcode /> */}
					{/* </LoginStateProvider> */}
				</div>
			</div>
		</div>
	);
}
export default Login;
