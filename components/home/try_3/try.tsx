import React from 'react';
import '@/styles/components/home/try.css'
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
export default function Experience() {
const { t } = useTranslation(['home']);
    return (
        <div className='tryPage'>
            {/* <div className='try-main'> */}
            <div className='try-main flex flex-ai-center flex-jc-around'>
                <div className='try_main-pic'>
                    <Image className='' src="/images/home/app.png" alt="" width={400} height={400}/>
                </div>
                <div>
                    <h2 className='try_main-title1'>{t('appTitle')}</h2>
                    <h3 className='try_main-title2'>{t('tradeTip')}</h3>
                </div>

            </div>
            {/* </div> */}
        </div>
    );
}
