// import Link from 'next/link';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import { GetStaticProps } from 'next';

// import React, { useState } from 'react';
import React from 'react';
import '@/styles/components/home/assistant.css'
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
        <div className='assistantPage'>
                <div className='assistant-main flex-column flex-ai-center flex-jc-center'>
                    <h2 className='assistant_main-title1'>{t('assistantTitle')}</h2>
                    <h3 className='assistant_main-title2'>{t('assistantTip')}</h3>
                    <div className='assistant_main-pic flex flex-jc-between'>
                        <Image className='assistant-pic' src="/images/home/comup1.png" alt=""  width={200} height={100}/>
                        <Image className='assistant-pic' src="/images/home/comup2.png" alt="" width={200} height={100}/>
                        <Image className='assistant-pic' src="/images/home/comup3.png" alt="" width={200} height={100}/>
                    </div>
                </div>
        </div>
    );
}
