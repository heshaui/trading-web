// import { Layout } from "antd";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import { LoginTypeProvider } from "@/config/login-providers/LoginStateProvider";
import { useRouter } from 'next/router';
// import "./styles/login.css"
import styles from './styles/login.module.css'
import { getPic, getPic2 } from "@/services/open";
import Image from "next/image";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
// import { getKvObject } from "@/services/kv"
import { useWebConfig } from '@/hooks/useKv';
import appStore from '@/store';
const loginBgcStyle: CSSProperties = {
	// backgroundImage: `url("/images/login/banner.png")`,
	// backgroundImage: `url('https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/03/10/43f0ad3c-5e0f-4a5f-9c67-89cf77bb8673.png')`,
	backgroundColor: "var(--background11)",
	backgroundRepeat: "no-repeat",
	backgroundSize: "cover",
	// height: "100%",
	height: "100vh",
	// backgroundColor:"pink"
	width: "100px"
};
interface LoginPicType {
	[key: string]: {
		image: string,
		title: string,
		url: string
	}
}
function Login() {
	const router = useRouter();
	const { t } = useTranslation(['login']);
	const [loginPic, setLoginPic] = useState<LoginPicType | null>(null)
	const allConfig = appStore.getKvConfigAll();
	const token = appStore.getToken();
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
				if (lang === 'en' || lang === 'en_US'||lang.includes('en')) {
					setLoginPic(resdata['en_US'])
				} else if (lang === 'zh_CN' || lang === 'zh'||lang.includes('zh')) {
					setLoginPic(resdata['zh_CN'])
				} else if (lang === 'ko' || lang === 'ko-KR'||lang.includes('ko')) {
					setLoginPic(resdata['ko_KR'])
				} else if (lang === 'ja' || lang === 'jp' || lang === 'ja-JP'||lang.includes('ja')) {
					setLoginPic(resdata['ja_JP'])
				}else if (lang) {
					setLoginPic(resdata[lang])
				} else {
					setLoginPic(resdata['en_US'])
				}
			}
		} catch (error) {

		}
	}
	const picClick = () => {
		if (loginPic?.login.url) {
			window.open(loginPic?.login.url, '_blank', 'noopener')
		}
	}
	// const getUseBankKv = async () => {
	// 	const keys=['out_money']

	// 	const res=await getKvObject(keys)
	// 	if(res.code==='0'){
	// 		localStorage.setItem(LOCAL_STORAGE_KEY.OUT_MONEY,res.data.out_money)
	// 	}else{
	// 		console.log(res.msg,123);
	// 	}

	// }
	// 如果有授权，则跳转到首页
	// useEffect(() => {
	// 	if (token) {
	// 		router.push('/');
	// 	}
	// 	getBgc()
	// }, [token, router]);
	// useEffect(() => {
	// 	if (!allConfig) {
	// 		// useWebConfig();
	// 		appStore.getKvConfigAllFromApi()
	// 	}
	// }, [allConfig]);
	useEffect(() => {
		getBgc()
		// getUseBankKv()
	}, []);

	return (
		<div className={`relative flex h-overmax w-full flex-row ${styles.page_box}`} >

			{/* <div className="relative flex h-overmax w-full flex-row page-box "> */}
			<div
				className="isHidden flex-1"
				// style={{...loginBgcStyle, backgroundImage: `url(${loginPic?.login.image})`}}
				style={{ ...loginBgcStyle, backgroundImage: `url(${loginPic?.login.image?loginPic?.login.image:'/images/login/banner.png'})` }}
				// style={loginBgcStyle}'
				onClick={picClick}
			>
				{/* {loginPic?.login.url} */}
				{/* <Image className="" src='https://meta2025.oss-ap-northeast-2.aliyuncs.com/2025/03/10/43f0ad3c-5e0f-4a5f-9c67-89cf77bb8673.png' alt="" width={1920} height={1080}/> */}
			</div>

			<div className="m-auto flex flex-ai-center w-full flex-col flex-1 position-relative">
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

// 添加此导出函数以支持服务端翻译加载
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', ['login', 'common'])),
		},
	};
};

export default Login;

