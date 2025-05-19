import { Layout } from "antd";
// import { Navigate } from "react-router";
import type { CSSProperties } from "react";
// import store from "@/store"
// import appStore from '@/store';
// import LoginForm from "./LoginForm";
import RegisterForm from "./components/RegisterForm";
// import { LoginStateProvider, LoginTypeProvider, RegisterTypeProvider } from "./providers/LoginStateProvider";
import { LoginStateProvider, RegisterTypeProvider } from "@/config/register-providers/LoginStateProvider";
// import "./styles/login.css"
import styles from './styles/login.module.css'
import PhoneEmailAuthcode from "./components/authCode_phoneAndMail";
// import GoogleAuthcode from "./components/authCode_google";
// const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;
// const HOMEPAGE = '/';
import {  getPic2 } from "@/services/open";
import { useEffect, useState } from "react";
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useWebConfig } from '@/hooks/useKv';
import appStore from '@/store';
const loginBgcStyle: CSSProperties = {
	// backgroundImage: `url("/images/login/banner.png")`,
	backgroundColor: "var(--background11)",
	backgroundRepeat: "no-repeat",
	backgroundSize: "cover",
	height: "100vh",
	// backgroundColor:"pink"
	width: "100%"
};
interface LoginPicType {
	[key: string]: {
			image: string,
			title: string,
			url: string
	}
}
function Register() {
	const [loginPic, setLoginPic] = useState<LoginPicType | null>(null)
	const allConfig = appStore.getKvConfigAll();
	const getBgc = async () => {
		try {
			// const res=await getPic(['pcLogin'])
			const res = await getPic2('pcLogin')
			if (res.code === '0') {
			
				const resdata = JSON.parse(res.data)
				
				let lang = '';
                if (typeof window !== 'undefined') {
                    lang = localStorage.getItem('localeLanguage') || '';
                }
				if (lang === 'en'||lang === 'en_US') {
					setLoginPic(resdata['en_US'])
				} else if (lang === 'zh_CN' || lang === 'zh') {
					setLoginPic(resdata['zh_CN'])	
				} else if (lang === 'ko'||lang === 'ko-KR') {
					setLoginPic(resdata['ko_KR'])
				}else if (lang === 'ja'||lang === 'jp'||lang === 'ja_JP') {
					setLoginPic(resdata['ja_JP'])
				}else if(lang){
					setLoginPic(resdata[lang])
				}else{
					setLoginPic(resdata['en_US'])
				}
			}
		} catch (error) {

		}
	}
	const picClick = () => {
		if(loginPic?.register.url){
			window.open(loginPic?.register.url, '_blank','noopener')
		}
	}
	// useEffect(() => {
	// 	if (!allConfig) {
	// 		// useWebConfig();
	// 		appStore.getKvConfigAllFromApi()
	// 	}
	// }, [allConfig]);
	useEffect(() => {
		getBgc()
	}, []);
	return (
		<div className={`relative flex h-overmax w-full flex-row ${styles.page_box}`} >
			<div
				className="isHidden flex-1"
				// style={loginBgcStyle}
				style={{...loginBgcStyle, backgroundImage: `url(${loginPic?.register.image})`}}
				onClick={picClick}
			>
				{/* <img className="" src="/images/login/loginPic.png" alt="" /> */}
			</div>

			<div className="m-auto flex flex-ai-center w-full flex-col justify-center flex-1 position-relative">
				<div style={{ width: "368px" }}>
					<LoginStateProvider>
						{/* 登录注册切换
						<LoginTypeProvider>
							<LoginForm />
						</LoginTypeProvider> */}
						<RegisterTypeProvider>
							<RegisterForm />
						</RegisterTypeProvider>
						<PhoneEmailAuthcode />
						{/* <GoogleAuthcode /> */}
					</LoginStateProvider>
				</div>
			</div>
		</div>
	);
}
// 添加此导出函数以支持服务端翻译加载
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', ['login','common'])),
		},
	};
};
export default Register;
