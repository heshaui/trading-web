import React from 'react';
import styles from '../styles/experience.module.css'
import { Input, Button } from "antd";
import Image from 'next/image'
import { useTranslation } from 'next-i18next';
import { CSSProperties } from "react";
import { getPic2, getHomeImage } from "@/services/open";
import { useEffect, useState } from "react";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { useThemeMode } from '@/hooks/useThemeMode'
import appStore from '@/store';
import { getNextJsLocale } from '@/utils/filterLang';
// import { checkImageUrl } from '@/hooks/useKv'

const bgStyle: CSSProperties = {
    // backgroundImage: "url('/images/home/experience_bg.png')",
    backgroundSize: 'contain', // 改为contain以保持图像原始比例
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat', // 改为no-repeat防止重复
    width: '1440px',
    height: '820px',
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
    const { t, i18n } = useTranslation(['home']);
    const [homePic, setHomePic] = useState<LoginPicType | null>(null)
    const [homeImage, setHomeImage] = useState<string>('')
    // const [email, setEmail] = useState('');
    const { isDayMode } = useThemeMode()
    const langKey = appStore.getLang() || 'en_US';
    const token = appStore.getToken();

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
                const langCode = getNextJsLocale(langKey, 1)

                const langData = resdata[langCode]
                if (langData) {
                    setHomePic(resdata[langCode])
                } else {
                    setHomePic(resdata['en_US'])
                }

            }
        } catch (error) {

        }
    }
    const bgUrl = () => {
        // let isDayMode = '';
        let token = '';
        if (typeof window !== 'undefined') {
            // isDayMode = localStorage.getItem('isDayMode') || ''
            token = localStorage.getItem(LOCAL_STORAGE_KEY.USER_TOKEN) || ''
        }

        if (isDayMode) {
            if (token) {
                return homePic?.light.after_login
            } else {
                return homePic?.light.before_login
            }
        } else {
            if (token) {
                return homePic?.dark.after_login
            } else {
                return homePic?.dark.before_login
            }
        }
    }
    const picClick = (url: string) => {
        if (url) {
            window.open(url, '_blank', 'noopener')
        }
    }
    const defaultPic = () => {
        const lang = getNextJsLocale(langKey)
        if (lang === 'zh') {
            return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/zh_spot.png'
        } else {
            return 'https://meta2025.oss-ap-northeast-2.aliyuncs.com/homePic/en_spot.png'
        }
    }
    useEffect(() => {
        getBgc()
        // getHommePic()
    }, [i18n, langKey]);

    return (
        <div className={`${styles.experience_page} flex-y-cc`} >
            <div className={`${styles.experience_main} flex-y justify-between`}
                style={{ ...bgStyle, backgroundImage: `url(${bgUrl()?.image})` }}
            >
                <div className={`${styles.experience_main_box} flex-y mt-10 `}>
                    <div className='flex-y '>
                        <h2 className={``}>{bgUrl()?.title}</h2>
                        <h3 className={`font-28 font-w-400 ${styles.assistant_main_title2}`}>{bgUrl()?.subtitle}</h3>
                    </div>
                    <div className={`flex flex-ai-center ${styles.experience_main_email}`}>
                        {typeof window !== 'undefined' && !token &&
                            <Input type="text" placeholder={t('email')} onChange={onChange} className={`${styles.custom_input_home}`} />}
                            <Input type="text" placeholder={t('email')} onChange={onChange} className={`${styles.custom_input_home}`} />
                        <Button className={`${styles.experience_main_btn}`}
                            onClick={() => picClick(bgUrl()?.url || defaultPic())}
                        >{bgUrl()?.buttonText}</Button>
                    </div>
                </div>
                {/* <div
                    className={`${styles.experience_main_pic}`}
                // style={{ ...bgStyle, backgroundImage: `url(${bgUrl()?.image})` }}
                // style={{ ...bgStyle
                //     , backgroundImage: `url('https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png')` }}
                >
                </div> */}
            </div>
        </div>
    );
}
