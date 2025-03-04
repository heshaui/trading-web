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

const loginBgcStyle: CSSProperties = {
	backgroundImage: `url("/images/login/banner.png")`,
	backgroundColor: "#ffffff",
	backgroundRepeat: "no-repeat",
	backgroundSize: "cover",
	height: "100%",
	// backgroundColor:"pink"
	// width: "100%"
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
	const [loginPic, setLoginPic] = useState<LoginPicType | null>(null)
	// localStorage.getItem('localeLanguage')
	let token = null;

	// // 判断是否为浏览器环境
	if (typeof window !== 'undefined') {
		token = localStorage.getItem('userToken');
	}
	const getBgc = async () => {
		try {
			// const res=await getPic(['pcLogin'])
			const res = await getPic2('pcLogin')
			if (res.code === '0') {
				const a = JSON.stringify({
					"en": {
						"login": {
							"title": "MBTI Personality Test",
							"image": "https://via.placeholder.com/80",
							"url": "https://images.pexels.com/photos/4836103/pexels-photo-4836103.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
						},
						"register": {
							"title": "New User Promotion",
							"image": "https://via.placeholder.com/80",
							"url": "https://www.mbti.com/register-promotion"
						}
					},
					"zh_CN": {
						"login": {
							"title": "MBTI性格测试",
							"image": "https://via.placeholder.com/80",
							"url": "https://www.mbti.com/test"
						},
						"register": {
							"title": "新用户注册优惠",
							"image": "https://via.placeholder.com/80",
							"url": "https://www.mbti.com/register-promotion"
						}
					},
					"zh_TW": {
						"login": {
							"title": "MBTI性格測試",
							"image": "https://via.placeholder.com/80",
							"url": "https://www.mbti.com/test"
						},
						"register": {
							"title": "新用戶註冊優惠",
							"image": "https://via.placeholder.com/80",
							"url": "https://www.mbti.com/register-promotion"
						}
					},
					"ja": {
						"login": {
							"title": "MBTI性格診断テスト",
							"image": "https://via.placeholder.com/80",
							"url": "https://www.mbti.com/test"
						},
						"register": {
							"title": "新規登録キャンペーン",
							"image": "https://via.placeholder.com/80",
							"url": "https://www.mbti.com/register-promotion"
						}
					},
					"ko": {
						"login": {
							"title": "MBTI 성격 검사",
							"image": "https://via.placeholder.com/80",
							"url": "https://www.mbti.com/test"
						},
						"register": {
							"title": "신규 회원 혜택",
							"image": "https://via.placeholder.com/80",
							"url": "https://www.mbti.com/register-promotion"
						}
					}
				});
				const resdata = JSON.parse(res.data)
				console.log(resdata, 121);
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
				}else if (lang === 'ja'||lang === 'jp'||lang === 'ja-JP') {
					setLoginPic(resdata['ja_JP'])
				}
                else if(lang){
					setLoginPic(resdata[lang])
				}else{
					setLoginPic(resdata['en_US'])
				}
			}
		} catch (error) {

		}
	}

	// 如果有授权，则跳转到首页
	useEffect(() => {
		if (token) {
			router.push('/');
		}
		getBgc()
	}, [token, router]);


	return (
		<div className={`relative flex h-overmax w-full flex-row ${styles.page_box}`} >
			{/* <div className="relative flex h-overmax w-full flex-row page-box "> */}
			<div
				className="isHidden flex-1"
				style={{...loginBgcStyle, backgroundImage: `url(${loginPic?.login.url})`}}
				// style={loginBgcStyle}
			>
				{/* {loginPic?.login.url} */}
				{/* <Image className="" src={loginPic?.login.image||'/images/login/banner.png'} alt="" width={1920} height={1080}/> */}
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
