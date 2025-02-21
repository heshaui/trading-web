
import React from 'react';
import '@/styles/components/home/assistant.css'
import Image from 'next/image'
export default function Experience() {

    return (
        <div className='assistantPage'>
            <div className='assistant-main flex-column flex-ai-center flex-jc-center'>
                <div>
                    <div>
                        <h2 className='assistant_main-title1'>您数字货币之旅的得力助手</h2>
                        <h3 className='assistant_main-title2'>从数字货币交易初体验到第一次购买 NFT，IMBIT将助您轻松赚币</h3>
                    </div>
                </div>

                <div className='assistant_main-pic flex flex-jc-between'>
                    <div className='pic-box position-relative' >
                        <Image className='pic' src="/images/home/rectangle1.png" alt="" width={350} height={100}/>
                        <div className='text-icon flex-col flex-jc-between'>
                            <div className='text-right title-box'>
                                <p className='font-22 font-w-500'>何塞普·瓜迪奥拉教练</p>
                                <p className='font-16 font-w-400'>讲解“疯狂足球战术”</p>
                            </div>
                            <Image src="/images/home/viedo.png" alt="" width={350} height={100}/>
                        </div>
                    </div>
                    <div className='pic-box position-relative' >
                        <Image className='pic' src="/images/home/rectangle2.png" alt="" width={350} height={100}/>
                        <div className='text-icon flex-col flex-jc-between'>
                            <div className='text-right title-box'>
                                <p className='font-22 font-w-500'>重塑系统</p>
                                <p className='font-16 font-w-400'>欢迎来到 Web3</p>
                            </div>
                            <Image src="/images/home/viedo.png" alt=""width={350} height={100}/>
                        </div>
                    </div>
                    <div className='pic-box position-relative' >
                        <Image className='pic' src="/images/home/rectangle3.png" alt="" width={350} height={100}/>
                        <div className='text-icon flex-col flex-jc-between'>
                            <div className='text-right title-box'>
                                <p className='font-22 font-w-500'>单板滑雪运动员斯科特·詹姆斯练</p>
                                <p className='font-16 font-w-400'>带领全家欢聚</p>
                            </div>
                            <Image src="/images/home/viedo.png" alt="" width={350} height={100}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
