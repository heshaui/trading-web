import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

import React, { useState } from 'react';
import './questions.css'
import { Input, Button } from "antd";

export default function Questions() {
    const { t } = useTranslation('common');
    const [email, setEmail] = useState('');
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('Change:', e.target.value);
        setEmail(e.target.value)
    };
    return (
        <div className='questionsPage'>
                <div className='questions-main flex-column flex-ai-center flex-jc-center'>
                    <div className='questions_main-title1'>常见问题</div>
                    <div className='main-questions-box'>
                        <div className='main-questions-list flex flex-ai-center flex-jc-between'>
                            <p>IMBIT都提供哪些产品</p> 
                            <img src="/images/home/icon-add.png" alt="" />
                            </div>
                        <div className='main-questions-list flex flex-ai-center flex-jc-between'>
                            <p>如何通过IMBIT平台购买比特币？</p>
                            <img src="/images/home/icon-add.png" alt="" />
                            </div>
                        <div className='main-questions-list flex flex-ai-center flex-jc-between'>
                            <p>美国公民可以使用IMBIT吗？</p>
                            <img src="/images/home/icon-add.png" alt="" />
                            </div>
                        <div className='main-questions-list flex flex-ai-center flex-jc-between'>
                            什么是数字货币？
                            <img src="/images/home/icon-add.png" alt="" />
                            </div>
                    </div>
                </div>
        </div>
    );
}
