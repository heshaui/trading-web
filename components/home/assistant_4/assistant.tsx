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
                    <div className='assistant_main-title1'>您数字货币之旅的得力助手</div>
                    <div className='assistant_main-title2'>从数字货币交易初体验到第一次购买 NFT，IMBIT将助您轻松赚币</div>
                    <div className='assistant_main-pic flex flex-jc-between'>
                        {/* <img className='' src="/images/home/rectangle1.png" alt="" />
                        <img className='' src="/images/home/rectangle2.png" alt="" />
                        <img className='' src="/images/home/rectangle3" alt="" /> */}
                        
                        <div className='pic'>图切不出来or播放器功能</div>
                        <div className='pic'>图切不出来or播放器功能</div>
                        <div className='pic'>图切不出来or播放器功能</div>
                    </div>
                </div>
        </div>
    );
}
