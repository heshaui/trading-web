import React from 'react';
import styles from '../../styles/spotAccount.module.css'
import { useThemeMode } from '@/hooks/useThemeMode';
import Image from 'next/image'
import { useRouter } from 'next/router'

type NoUseComProps = {
    type: string
}
const NoUseCom = ({ type }: NoUseComProps) => {
    const { isDayMode } = useThemeMode(); // 使用 hook

    const router = useRouter()

    return <>

        {/* 谷歌未绑定禁止 */}
        {type === '2' && <div className={`${styles.card_bgc2} w-full mb-10 flex-x justify-between align-center`}>
            <div className={`flex-x align-center ${styles.card_content}`}>
                <Image src={'/images/assets/assets_account/icon_nosm_night.png'}
                    alt="logo" width={80} height={74} className={`${styles.icon_sm} mr-6`} />
                <p className='flex-y'>
                    <span className={` font-w-500 font-18`}>提币功能暂不可用</span>
                    <span className={`${styles.tip_color} font-w-400 font-14 mt-1`}>启用2FA以继续提现。为了您的资产安全起见，我们建议您尽快启用。</span>
                </p>
            </div>
            <button className={`default_btn ${styles.btn_style}`}
                onClick={() => {
                    router.push('/userCenter/safeCenter')
                }}
            >去设置</button>
        </div>}
        {/* 未认证禁止 */}
        {type === '1' && <div className={`${styles.card_bgc2} w-full mb-10 flex-x justify-between align-center`}>
            <div className={`flex-x align-center ${styles.card_content}`}>
                <Image src={'/images/assets/assets_account/icon_nosm_1.png'}
                    alt="logo" width={80} height={74} className={`${styles.icon_sm} mr-6`} />
                <p className='flex-y'>
                    <span className={` font-w-500 font-18`}>未完成身份认证</span>
                    <span className={`${styles.tip_color} font-w-400 font-14 mt-1`}>完成身份认证，解锁全部功能</span>
                </p>
            </div>
            <button className={`default_btn ${styles.btn_style}`}
                onClick={() => {
                    router.push('/userCenter/identity')
                }}
            >立即认证</button>
        </div>}
        {/* 提币禁止 */}
        {type === '3' && <div className={`${styles.card_bgc2} w-full mb-10 flex-x justify-between align-center`}>
            <div className={`flex-x align-center ${styles.card_content}`}>
                <Image src={'/images/assets/assets_account/icon_nosm_2.png'}
                    alt="logo" width={80} height={74} className={`${styles.icon_sm} mr-6`} />
                <p className='flex-y'>
                    <span className={` font-w-500 font-18`}>禁止提现</span>
                    <span className={`${styles.tip_color} font-w-400 font-14 mt-1`}>交易所禁止提现，如有问题请与客服联系！</span>
                </p>
            </div>
        </div>}

    </>;
};

export default NoUseCom;