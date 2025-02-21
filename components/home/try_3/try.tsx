import React from 'react';
import '@/styles/components/home/try.css'
import Image from 'next/image';
export default function Experience() {

    return (
        <div className='tryPage'>
            {/* <div className='try-main'> */}
            <div className='try-main flex flex-ai-center flex-jc-around'>
                <div className='try_main-pic'>
                    <Image className='' src="/images/home/app.png" alt="" width={400} height={400}/>
                </div>
                <div>
                    <h2 className='try_main-title1'>IMBIT App，创造无限可能</h2>
                    <h3 className='try_main-title2'>初次交易？$5 即可小试牛刀，IMBIT和您一起步步登高</h3>
                </div>

            </div>
            {/* </div> */}
        </div>
    );
}
