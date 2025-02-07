import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

import React, { useState } from 'react';
import '@/styles/components/home/try.css'
import { Input, Button } from "antd";

export default function Experience() {
    const { t } = useTranslation('common');
    const [email, setEmail] = useState('');
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('Change:', e.target.value);
        setEmail(e.target.value)
    };
    return (
        <div className='tryPage'>
            {/* <div className='try-main'> */}
            <div className='try-main flex flex-ai-center flex-jc-around'>
                <div className='try_main-pic'>
                    <img className='' src="/images/home/app.png" alt="" />
                </div>
                <div>
                    <div className='try_main-title1'>IMBIT App，创造无限可能</div>
                    <div className='try_main-title2'>初次交易？$5 即可小试牛刀，IMBIT和您一起步步登高</div>
                </div>

            </div>
            {/* </div> */}
        </div>
    );
}
