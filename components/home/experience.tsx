import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

import React, { useState } from 'react';
import './experience.css'
import { Input } from "antd";
import { Button } from "antd";

export default function Home_experience() {
    const { t } = useTranslation('common');
    const [email, setEmail] = useState('');
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('Change:', e.target.value);
        setEmail(e.target.value)
      };
    return (
        <div className='experiencePage'>
            <div className='experience-main'>
                <div className='main-box'>
                    <div>IMBIT数字货币交易所更快、更好、更强</div>
                    <div className='flex flex-ai-center main-email'>
                        <Input type="text" placeholder="邮箱" onChange={onChange} />
                        <Button className='main-btn'>立即体验</Button>
                    </div>
                </div>
                <img className='' src="/images/home/phone.png" alt="" />

            </div>
        </div>
    );
}
