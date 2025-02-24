// import Link from 'next/link';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import { GetStaticProps } from 'next';

// import React, { useState } from 'react';
import React from 'react';
import styles from '@/styles/components/home/assistant.module.css';
// import { Input, Button } from "antd";
import Image from 'next/image'
import { useTranslation } from 'next-i18next';
export default function Experience() {
    const { t } = useTranslation(['home']);
    // const [email, setEmail] = useState('');
    // const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     console.log('Change:', e.target.value);
    //     setEmail(e.target.value)
    // };
    return (
        <div className={`${styles.assistant_page}`}>
            <div className={`${styles.assistant_main} flex-column flex-ai-center flex-jc-center`}>
                <h2 className={`${styles.assistant_main_title1}`}>{t('assistantTitle')}</h2>
                <h3 className={`${styles.assistant_main_title2}`}>{t('assistantTip')}</h3>
                <div className={`${styles.assistant_main_pic} flex flex-jc-between`}>
                    <Image className={`${styles.assistant_pic}`} src="/images/home/comup1.png" alt="" width={200} height={100} />
                    <Image className={`${styles.assistant_pic}`} src="/images/home/comup2.png" alt="" width={200} height={100} />
                    <Image className={`${styles.assistant_pic}`} src="/images/home/comup3.png" alt="" width={200} height={100} />
                </div>
            </div>
        </div>
    );
}
