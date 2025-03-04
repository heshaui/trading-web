// import Link from 'next/link';
// import { useTranslation } from 'next-i18next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import { GetStaticProps } from 'next';

import React from 'react';
import styles from '@/styles/components/home/experience.module.css'
import { Input,Button } from "antd";
import Image from 'next/image'
import { useTranslation } from 'next-i18next';
import { CSSProperties } from "react";
import {  getPic2 } from "@/services/open";
import { useEffect, useState } from "react";

const bgStyle: CSSProperties = {
    // backgroundImage: "url('/images/home/experience_bg.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
};
interface isLoginType {
        buttonText: string,
        image: string,
        subtitle: string,
        title: string,
        url: string
}
interface isDayModeType {
       before_login: isLoginType,
       after_login: isLoginType
    }
interface LoginPicType {
	dark: isDayModeType,
    light: isDayModeType
}
export default function Experience() {
    // const { t } = useTranslation('common');
    const { t } = useTranslation(['home']);
	const [homePic, setHomePic] = useState<LoginPicType | null>(null)
    const isDayMode=localStorage.getItem('isDayMode')
    const token = localStorage.getItem('userToken');
    // const [email, setEmail] = useState('');
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('Change:', e.target.value);
        // setEmail(e.target.value)
      };

	const getBgc = async () => {
		try {
			// const res=await getPic(['pcLogin'])
			const res = await getPic2('HomeBanner')
			if (res.code === '0') {
				const resdata = JSON.parse(res.data)
				console.log(resdata, 121);
				
				const lang = localStorage.getItem('localeLanguage')||''
				if (lang === 'en') {
					setHomePic(resdata['en_US'])
				} else if (lang === 'zh_CN' || lang === 'zh') {
					setHomePic(resdata['zh_CN'])	
				} else if (lang === 'ko'||lang === 'ko-KR') {
					setHomePic(resdata['ko_KR'])
				}else if (lang === 'ja'||lang === 'jp'||lang === 'ja-JP') {
					setHomePic(resdata['ja_JP'])
				}else if(lang){
					setHomePic(resdata[lang])
				}else{
                    setHomePic(resdata['English']?resdata['English']:resdata['en_US'])
                }
               
			}
		} catch (error) {

		}
	}
    const bgUrl=()=>{
        if(isDayMode){
            if(token){
                return homePic?.light.after_login
            }else{
                return homePic?.light.before_login
            }
        }else{
            if(token){
                return homePic?.dark.after_login
            }else{
                return homePic?.dark.before_login
            }
        }
    }
    useEffect(() => {
		getBgc()
	}, []);

    return (
        <div className={`${styles.experience_page} flex-y-cc`}>
            <div className={`${styles.experience_main}`} 
            // style={{...bgStyle, backgroundImage: `url(${homePic?.url})`}}
            >
                <div className={`${styles.experience_main_box} flex-y flex-ai-center mt-10 `}>
                    <h2>{bgUrl()?.title}</h2>
                    <div className={`flex flex-ai-center ${styles.experience_main_email}`}>
                        <Input type="text" placeholder={t('email')} onChange={onChange} className={`${styles.custom_input_home}`} />
                        <Button className={`${styles.experience_main_btn}`}>{bgUrl()?.buttonText}</Button>
                    </div>
                </div>
                <div 
                className={`${styles.experience_main_pic}`} 
                style={{...bgStyle,backgroundImage: `url(${bgUrl()?.url})`}}
               >
               </div>
            </div>
        </div>
    );
}
