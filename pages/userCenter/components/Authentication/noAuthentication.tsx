import React from 'react';
import { withUserCenterLayout } from '@/components/UserCenterLayout/UserCenterLayout';
import styles from '../../styles/identity.module.css';
import { Iconify } from "@/components/icon"
import Image from 'next/image';
import { useRouter } from 'next/router';
// import { identityInfoType } from '@/config/apiConfig';
import { getBenefitValue } from '@/utils/encrypt';

// 按钮配置接口
interface ButtonConfig {
    title: string;
    onok?: () => void;
    onbind?: () => void;
}
interface textType {
    amountLimit: number;
    coin: string;
    time: number;
}
interface levelBenefitType {
    id: number;
    levelId: number;
    createTime: number;
    updateTime: number;
    tenantId: string;
    status: number;
    // value: textType;
    value: string;
    benefitId: number;
    benefitName: string;
}
interface infoType {
    id: number;
    userId: number;
    surname: string;
    firstName: string;
    countryId: number;
    cardType: number;
    cardCode: string;
    cardName: string;
    birthday: string;
    currentLanguage: string;
    firstCheckTime: number;
    currentCheckTime: number;
    authStatus: number;
    frontUrl: string;
    backUrl: string;
    selfieUrl: string;
    createTime: number;
    updateTime: number;
    tenantId: string;
}
const NoAuthentication: React.FC<{ identityInfo: infoType, levelBenefit: levelBenefitType[] }> = ({ identityInfo, levelBenefit }) => {
    // console.log(identityInfo, 111);
    const router = useRouter();

    const goReAuth = (authStatus: number) => {
        router.push(`/userCenter/identity/${identityInfo.userId}?authStatus=${authStatus}`)
    }
    // const getBenefitValue = (text: string) => {
    //     let text1 = JSON.parse(text);
    //     const amount = Number(text1.amountLimit);
    //     let amountRes = '';
    //     if (!isNaN(amount) && amount > 1000) {
    //         // 去掉末尾三个 0 并添加 'K' 后缀
    //         amountRes=(amount / 1000).toString() + 'K';
    //     }else{
    //         amountRes = amount.toString();
    //     }
    //     return `${amountRes} ${text1.coin} ${text1.time}h`

    // }
    return (< >
        <div className={`${styles.identity_content} flex-1`}>
            {/* 认证状态-未认证 */}
            {identityInfo&&identityInfo?.authStatus === 2 && <div className={`${styles.content_header} `}>
                <Image src="/images/userCenter/identity/icon_Identity.svg"
                    alt="identity" width={120} height={54}
                    className={`${styles.header_icon}`} />
                {/* 1.认证内容 */}

                <div className='flex-1 flex-col justify-between '  >
                    <div className={`font-18 font-w-500 flex align-center`} >
                        <p>标准身份认证</p>
                        {/* <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="mingcute:safety-certificate-line" className={`${styles.success_icon} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>已认证</span>
                        </div>
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="mingcute:time-line" className={`${styles.warning_color} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>审核中</span>
                        </div>
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="jam:close-circle" className={`${styles.error_icon} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>已驳回</span>
                        </div> */}
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="mingcute:safe-alert-line" className={`${styles.default_icon} mr-1`} size={20} />
                            <span className={`${styles.default_icon} font-14 font-w-500`}
                            >未认证</span>
                        </div>


                    </div>
                    {/* 认证提示 */}
                    <div className={`font-14 font-w-400 mt-1 ${styles.tip_color}`} >
                        <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                        仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险
                    </div>
                    {/* 认证提示 */}
                    <div className='mt-6'>
                        <p className={`font-18 font-w-500 flex align-center`}>身份认证需要提供一下信息：</p>
                        <div className={`flex align-center mt-2`}>
                            <div className={`flex-x-cc ${styles.row_3} ${styles.tip_color}`}>
                                <Image src="/images/userCenter/identity/icon_baseInfo.svg" alt='' width={20} height={20} className='mr-1' />
                                <span>基本信息</span>
                            </div>
                            <div className={`flex-x-cc ${styles.row_3} ${styles.tip_color} ml-5`}>
                                <Image src="/images/userCenter/identity/icon_baseAuth.svg" alt='' width={20} height={20} className='mr-1' />
                                <span>身份认证</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 按钮 */}
                <div className={`${styles.btn_box} flex-col align-end justify-end`} >
                    <button type='button' className={`${styles.btn_style} default_btn`} onClick={() => goReAuth(identityInfo.authStatus)}>去认证</button>
                    {/* <button type='button' className={`${styles.btn_style} default_btn`}>审核中</button>
            <button type='button' className={`${styles.btn_style} disabled_btn`}>重新认证</button> */}
                </div>
            </div>}

            {/* 认证状态-重新认证 */}
            {identityInfo&&identityInfo?.authStatus === 0 && <div className={`${styles.content_header} `}>
                <Image src="/images/userCenter/identity/icon_Identity.svg"
                    alt="identity" width={120} height={54}
                    className={`${styles.header_icon}`} />
                {/* 1.认证内容 */}
                <div className='flex-1 flex-col justify-center' >
                    {/* 认证状态 */}
                    <div className={`font-18 font-w-500 flex align-center`} >
                        <p>标准身份认证</p>
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="jam:close-circle" className={`${styles.error_icon} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>已驳回</span>
                        </div>
                    </div>
                    {/* 认证提示 */}
                    <div className={`font-14 font-w-400 mt-3 ${styles.error_icon}`} >
                        <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                        该证件号已存在，请登录原有账号完成认证！！
                    </div>
                </div>
                {/* 按钮 */}
                <div className={`${styles.btn_box} flex-col align-end justify-end`}>
                    <button type='button' className={`${styles.btn_style} default_btn`} onClick={() => goReAuth(identityInfo.authStatus)}>重新认证</button>
                </div>
            </div>}
            {/* 认证状态-审核中 */}
            {identityInfo&&identityInfo?.authStatus === 3 && <div className={`${styles.content_header} `}>
                <Image src="/images/userCenter/identity/icon_Identity.svg"
                    alt="identity" width={120} height={54}
                    className={`${styles.header_icon}`} />
                {/* 1.认证内容 */}
                <div className='flex-1 flex-col justify-center' >
                    {/* 认证状态 */}
                    <div className={`font-18 font-w-500 flex align-center`} >
                        <p>标准身份认证</p>
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="mingcute:time-line" className={`${styles.warning_color} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>审核中</span>
                        </div>
                    </div>
                    {/* 认证提示 */}
                    <div className={`font-14 font-w-400 mt-3 ${styles.tip_color}`} >
                        <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                        仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险
                    </div>
                </div>
                {/* 按钮 */}
                <div className={`${styles.btn_box} flex-col align-end justify-end`}>
                    <button type='button' className={`${styles.btn_style} disabled_btn`} onClick={() => goReAuth(identityInfo.authStatus)}>审核中</button>
                </div>
            </div>}

            {/* 2.认证权益 */}
            {levelBenefit&&levelBenefit.length > 0 && <div className='mt-6'>
                <div className={`font-18 font-w-500 flex align-center `} >
                    <Image src="/images/userCenter/identity/icon_rights.svg" alt='' width={24} height={24} className='mr-1' />
                    <span>认证权益</span>
                </div>
                <ul>
                    <li className={`flex align-center justify-between  mt-2_5 font-12 ${styles.rights_header}`}>
                        <div className='ml-6 '>服务</div>
                        <div className='flex-x-cc '>尚未认证</div>
                        <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}>完成标准身份认证后</div>
                    </li>
                    {levelBenefit&&levelBenefit.map((item: levelBenefitType) => (
                        <li key={item.benefitId} className={`flex align-center justify-between mt-2_5 font-14 ${styles.rights_content}`}>
                            <div className='ml-6 font-w-500'>{item.benefitName}</div>
                            <div className='flex-x-cc font-w-500'>
                                {item.status === 1 ? <Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' />
                                    :
                                    <Image src="/images/userCenter/identity/fail.svg" alt='' width={20} height={20} className='' />}
                            </div>
                            {/* <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}>50K USDT每日</div> */}
                            <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}>{
                                item.status === 0 ? <Image src="/images/userCenter/identity/fail.svg" alt='' width={20} height={20} className='' />
                                    :
                                    item.value ? getBenefitValue(item.value) :
                                        <Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' />
                            }</div>
                        </li>
                        // <li className={`flex align-center justify-between mt-2_5 font-14 ${styles.rights_content}`}>
                        //     <div className='ml-6 font-w-500'>加密货币充值</div>
                        //     <div className='flex-x-cc font-w-500'>
                        //         <Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' />
                        //     </div>
                        //     <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}><Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' /></div>
                        // </li>
                        // <li className={`flex align-center justify-between mt-2_5 font-14 ${styles.rights_content}`}>
                        //     <div className='ml-6 font-w-500'>C2C交易</div>
                        //     <div className='flex-x-cc font-w-500'>
                        //         <Image src="/images/userCenter/identity/fail.svg" alt='' width={20} height={20} className='' />
                        //     </div>
                        //     <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}><Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' /></div>
                        // </li>
                    ))}
                </ul>
            </div>}
        </div>


    </>);
};

export default NoAuthentication;