
import React from 'react';
import styles from  '@/styles/components/home/deal.module.css'
import Image from 'next/image'
import { useTranslation } from 'next-i18next';
export default function Experience() {
const { t } = useTranslation(['home']);
 
    return (
        <div className={`${styles.deal_page}`}>
        <div className={`${styles.deal_main} flex-column flex-ai-center`}>
            <h2 className={`${styles.deal_main_title1}`}>{t('detailTitle')}</h2>
            <h3 className={`${styles.deal_main_title2}`}>{t('detailTip')}</h3>
            <div className={`${styles.deal_main_pic}`}>
                <Image className='' src="/images/home/ipad.png" alt="" width={1020} height={610}/>
            </div>
        </div>
    </div>
    );
}
