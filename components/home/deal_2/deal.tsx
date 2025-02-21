
import React from 'react';
import '@/styles/components/home/deal.css'
import Image from 'next/image'

export default function Experience() {
 
    return (
        <div className='dealPage'>
            {/* <div className='deal-main'> */}
                <div className='deal_main flex-column flex-ai-center'>
                    <h2 className='deal_main-title1'>数字货币交易，我们是专业的</h2>
                    <h3 className='deal_main-title2'>最低的手续费，最快捷的交易，强劲的API以及更多</h3>
                    <div className='deal_main-pic'>
                        <Image className='' src="/images/home/ipad.png" alt="" width={1020} height={610}/>
                    </div>
                </div>
            {/* </div> */}
        </div>
    );
}
