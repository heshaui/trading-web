// import Link from 'next/link';
// import { useTranslation } from 'next-i18next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import { GetStaticProps } from 'next';

import React from 'react';
import '@/styles/components/home/experience.css'
import { Input,Button } from "antd";
import Image from 'next/image'
export default function Experience() {
    // const { t } = useTranslation('common');
    // const [email, setEmail] = useState('');
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('Change:', e.target.value);
        // setEmail(e.target.value)
      };
    return (
        <div className='experiencePage'>
            <div className='experience-main'>
                <div className='experience_main-box'>
                    <h2>IMBIT数字货币交易所更快、更好、更强</h2>
                    <div className='flex flex-ai-center experience_main-email'>
                        <Input type="text" placeholder="邮箱" onChange={onChange} className='custom-input-home' />
                        <Button className='experience_main-btn'>立即体验</Button>
                    </div>
                </div>
                <Image className='' src="/images/home/phone.png" alt="" width={620} height={600}/>

            </div>
        </div>
    );
}
