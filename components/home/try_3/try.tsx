import React from 'react';
import styles from '@/styles/components/home/try.module.css';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
export default function Experience() {
const { t } = useTranslation(['home']);
    return (
        <div className={`${styles.try_page}`}>
            <div className={`${styles.try_main} flex flex-ai-center flex-jc-around`}>
                <div className={`${styles.try_main_pic}`}>
                    <Image className='' src="/images/home/app.png" alt="" width={400} height={400} />
                </div>
                <div>
                    <h2 className={`${styles.try_main_title1}`}>{t('appTitle')}</h2>
                    <h3 className={`${styles.try_main_title2}`}>{t('tradeTip')}</h3>
                </div>
            </div>
        </div>
    );
}
