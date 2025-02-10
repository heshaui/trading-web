import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

import React, { useState } from 'react';
import '@/styles/components/home/assistant.css'
import { Input, Button } from "antd";

export default function Experience() {
    const { t } = useTranslation('common');
    const [email, setEmail] = useState('');
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('Change:', e.target.value);
        setEmail(e.target.value)
    };
    return (
        <div className='assistantPage'>
                <div className='assistant-main flex-column flex-ai-center flex-jc-center'>
                    <h2 className='assistant_main-title1'>您数字货币之旅的得力助手</h2>
                    <h3 className='assistant_main-title2'>从数字货币交易初体验到第一次购买 NFT，IMBIT将助您轻松赚币</h3>
                    <div className='assistant_main-pic flex flex-jc-between'>
                        <img className='assistant-pic' src="/images/home/comup1.png" alt="" />
                        <img className='assistant-pic' src="/images/home/comup2.png" alt="" />
                        <img className='assistant-pic' src="/images/home/comup3.png" alt="" />
                    </div>
                </div>
        </div>
    );
}
