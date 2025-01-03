import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

import React, { useState } from 'react';
import './deal.css'
import { Input, Button } from "antd";

export default function Experience() {
    const { t } = useTranslation('common');
    const [email, setEmail] = useState('');
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('Change:', e.target.value);
        setEmail(e.target.value)
    };
    return (
        <div className='dealPage'>
            {/* <div className='deal-main'> */}
                <div className='deal_main flex-column flex-ai-center'>
                    <div className='deal_main-title1'>数字货币交易，我们是专业的</div>
                    <div className='deal_main-title2'>最低的手续费，最快捷的交易，强劲的API以及更多</div>
                    <div className='deal_main-pic'>
                        <img className='' src="/images/home/ipad.png" alt="" />
                    </div>
                </div>
            {/* </div> */}
        </div>
    );
}
