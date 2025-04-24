// pages/userCenter/pages/index.tsx
import React from 'react';
import Image from 'next/image';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './styles/modal.module.css';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ROUTER_KEY_OPEN } from '@/config/apiConfig';
type NoDataProps = {
    title?: string;
    textColor?: string;
}
const NoLogin = ({title,textColor}:NoDataProps) => {
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { t } = useTranslation('common');
    const router = useRouter();
    return (<div className='flex-y-cc h-full'>
        <Image
            src={isDayMode ? "/images/pubic_icon/icon_nologin_day.png" : "/images/pubic_icon/icon_nologin_dark.png"}
            alt="empty" width={160} height={160} />
        <div className={`font-14 font-w-400 ${styles.title_color}`}
        style={{color:textColor?textColor:''}}
        >{title?title:
            <div>
                <button className={styles.theme_color}
                onClick={()=>{
                    router.push(ROUTER_KEY_OPEN.LOGIN)
                }}
                >{t('noLogin.tip2')}</button>
                <span>{t('noLogin.or')}</span>
                <button className={styles.theme_color}
                onClick={()=>{
                    router.push(ROUTER_KEY_OPEN.REGISTER)
                }}
                >{t('noLogin.tip3')}</button>
                <span >{t('noLogin.tip1')}</span>
            </div>
        }</div>
    </div>
    );
};

export default NoLogin;