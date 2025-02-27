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

const bgStyle: CSSProperties = {
    backgroundImage: "url('/images/home/experience_bg.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
};
export default function Experience() {
    // const { t } = useTranslation('common');
    const { t } = useTranslation(['home']);
    // const [email, setEmail] = useState('');
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('Change:', e.target.value);
        // setEmail(e.target.value)
      };
    return (
        <div className={`${styles.experience_page} flex-y-cc`}>
            <div className={`${styles.experience_main}`} style={bgStyle}>
                <div className={`${styles.experience_main_box} flex flex-ai-center mt-10`}>
                    {/* <h2>{t('home')}</h2> */}
                    {/* <div className={`flex flex-ai-center ${styles.experience_main_email}`}> */}
                        <Input type="text" placeholder={t('email')} onChange={onChange} className={`${styles.custom_input_home}`} />
                        <Button className={`${styles.experience_main_btn}`}>{t('experience')}</Button>
                    {/* </div> */}
                </div>
                {/* <Image className={`${styles.experience_main_pic}`} src="/images/home/experience_bg.png" alt="" width={620} height={600}/> */}
            </div>
        </div>
    );
}
