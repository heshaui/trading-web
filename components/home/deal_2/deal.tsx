
import React from 'react';
import '@/styles/components/home/deal.css'
import Image from 'next/image'
import { useTranslation } from 'next-i18next';
export default function Experience() {
const { t } = useTranslation(['home']);
 
    return (
        <div className='dealPage'>
            {/* <div className='deal-main'> */}
                <div className='deal_main flex-column flex-ai-center'>
                    <h2 className='deal_main-title1'>{t('detailTitle')}</h2>
                    <h3 className='deal_main-title2'>{t('detailTip')}</h3>
                    <div className='deal_main-pic'>
                        <Image className='' src="/images/home/ipad.png" alt="" width={1020} height={610}/>
                    </div>
                </div>
            {/* </div> */}
        </div>
    );
}
