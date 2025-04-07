import React from 'react';
import { withUserCenterLayout } from '@/components/sidebarLayout/UserCenterLayout';
import styles from '../../styles/identity.module.css';
import { Iconify } from "@/components/icon"
import Image from 'next/image';
import { useRouter } from 'next/router';
// import { identityInfoType } from '@/config/apiConfig';
import { getBenefitValue } from '@/utils/encrypt';
import { Skeleton } from 'antd';
import { useTranslation } from 'next-i18next';
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
    userId: number;
    id: number;
    levelId: number;
    createTime: number;
    updateTime: number;
    tenantId: string;
    status: number;
    value: string;
    benefitId: number;
    benefitName: string;
    status0?: number;
    value0?: string;
    params0?: string;
    status1?: number;
    value1?: string;
    params1?: string;
    remark?: string;
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
    remark?: string;
}
const NoAuthentication: React.FC<{ identityInfo: infoType, levelBenefit: levelBenefitType[] }> = ({ identityInfo, levelBenefit }) => {
    // console.log(identityInfo, 111);
    const router = useRouter();
    const { t } = useTranslation(['userCenter']);
    const goReAuth = (authStatus: number) => {
        localStorage.setItem('identity_authStatus', authStatus.toString())
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
            {identityInfo && identityInfo?.authStatus === 2 && <div className={`${styles.content_header} `}>
                <Image src="/images/userCenter/identity/icon_Identity.svg"
                    alt="identity" width={120} height={54}
                    className={`${styles.header_icon}`} />
                {/* 1.认证内容 */}

                <div className='flex-1 flex-col justify-between '  >
                    <div className={`font-18 font-w-500 flex align-center`} >
                        <p>
                            {/* 标准身份认证 */}
                            {t('identity.standardAuth.title')}
                        </p>
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
                            >{t('identity.status.unverified')}</span>
                        </div>


                    </div>
                    {/* 认证提示 */}
                    <div className={`font-14 font-w-400 mt-1 ${styles.tip_color}`} >
                        <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                        {/* 仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险 */}
                        {t('identity.standardAuth.unverifiedTip')}
                    </div>
                    {/* 认证提示 */}
                    <div className='mt-6'>
                        <p className={`font-18 font-w-500 flex align-center`}>
                            {/* 身份认证需要提供一下信息： */}
                            {t('identity.standardAuth.requiredInfo')}
                        </p>
                        <div className={`flex align-center mt-2`}>
                            <div className={`flex-x-cc ${styles.row_3} ${styles.tip_color}`}>
                                <Image src="/images/userCenter/identity/icon_baseInfo.svg" alt='' width={20} height={20} className='mr-1' />
                                <span>
                                    {/* 基本信息 */}
                                    {t('identity.standardAuth.basicInfo')}
                                </span>
                            </div>
                            <div className={`flex-x-cc ${styles.row_3} ${styles.tip_color} ml-5`}>
                                <Image src="/images/userCenter/identity/icon_baseAuth.svg" alt='' width={20} height={20} className='mr-1' />
                                <span>
                                    {/* 身份认证 */}
                                    {t('identity.standardAuth.idVerification')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 按钮 */}
                <div className={`${styles.btn_box} flex-col align-end justify-end`} >
                    <button type='button' className={`${styles.btn_style} default_btn`} onClick={() => goReAuth(identityInfo.authStatus)}>
                        {/* 去认证 */}
                        {t('identity.button.goVerify')}
                    </button>
                    {/* <button type='button' className={`${styles.btn_style} default_btn`}>审核中</button>
            <button type='button' className={`${styles.btn_style} disabled_btn`}>重新认证</button> */}
                </div>
            </div>}

            {/* 认证状态-重新认证 */}
            {identityInfo && identityInfo?.authStatus === 0 && <div className={`${styles.content_header} `}>
                <Image src="/images/userCenter/identity/icon_Identity.svg"
                    alt="identity" width={120} height={54}
                    className={`${styles.header_icon}`} />
                {/* 1.认证内容 */}
                <div className='flex-1 flex-col justify-center' >
                    {/* 认证状态 */}
                    <div className={`font-18 font-w-500 flex align-center`} >
                        <p>
                            {/* 标准身份认证 */}
                            {t('identity.standardAuth.title')}
                        </p>
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="jam:close-circle" className={`${styles.error_icon} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>
                                {/* 已驳回 */}
                                {t('identity.status.rejected')}
                            </span>
                        </div>
                    </div>
                    {/* 认证提示 */}
                    <div className={`font-14 font-w-400 mt-3 ${styles.error_icon} flex align-center`} >
                        <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                        <span>
                        {t('overview.identityAuth.reVerify')}
                        </span>
                        

                        {/* {identityInfo?.remark ? (<>
                            {identityInfo.remark.includes('&')
                                ? identityInfo.remark.split('&').map((item, index) => (<>
                                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                                    <span key={index} className={`${index > 0 ? 'mt-1' : ''}`}>
                                        {item.trim()}
                                    </span>
                                </>))
                                : identityInfo.remark
                            }
                        </>) : <div className='flex align-center'>
                            <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />--
                        </div>} */}
                    </div>
                </div>
                {/* 按钮 */}
                <div className={`${styles.btn_box} flex-col align-end justify-end`}>
                    <button type='button' className={`${styles.btn_style} default_btn`} onClick={() => goReAuth(identityInfo.authStatus)}>
                        {/* 重新认证 */}
                        {t('identity.button.reVerify')}
                    </button>
                </div>
            </div>}
            {/* 认证状态-审核中 */}
            {identityInfo && identityInfo?.authStatus === 3 && <div className={`${styles.content_header} `}>
                <Image src="/images/userCenter/identity/icon_Identity.svg"
                    alt="identity" width={120} height={54}
                    className={`${styles.header_icon}`} />
                {/* 1.认证内容 */}
                <div className='flex-1 flex-col justify-center' >
                    {/* 认证状态 */}
                    <div className={`font-18 font-w-500 flex align-center`} >
                        <p>
                            {/* 标准身份认证 */}
                            {t('identity.standardAuth.title')}
                        </p>
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="mingcute:time-line" className={`${styles.warning_color} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>
                                {/* 审核中 */}
                                {t('identity.status.reviewing')}
                            </span>
                        </div>
                    </div>
                    {/* 认证提示 */}
                    <div className={`font-14 font-w-400 mt-3 ${styles.tip_color}`} >
                        <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                        {/* 仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险 */}
                        {t('identity.standardAuth.unverifiedTip')}
                    </div>
                </div>
                {/* 按钮 */}
                <div className={`${styles.btn_box} flex-col align-end justify-end`}>
                    <button type='button' className={`${styles.btn_style} disabled_btn`} onClick={() => goReAuth(identityInfo.authStatus)}>
                        {/* 审核中 */}
                        {t('identity.button.reviewing')}
                    </button>
                </div>
            </div>}

            {/* 2.认证权益 */}
            <div className='mt-6'>
                <div className={`font-18 font-w-500 flex align-center `} >
                    <Image src="/images/userCenter/identity/icon_rights.svg" alt='' width={24} height={24} className='mr-1' />
                    <span>
                        {/* 认证权益 */}
                        {t('identity.benefits.title')}
                    </span>
                </div>
                <ul className='mb-2_5'>
                    <li className={`flex align-center justify-between  mt-2_5 font-12 ${styles.rights_header}`}>
                        <div className='ml-6 '>
                            {/* 服务 */}
                            {t('identity.benefits.service')}
                        </div>
                        <div className='flex-x-cc '>
                            {/* 尚未认证 */}
                            {t('identity.benefits.unverified')}
                        </div>
                        <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}>
                            {/* 完成标准身份认证后 */}
                            {t('identity.benefits.afterVerification')}
                        </div>
                    </li>
                    {levelBenefit && levelBenefit.length > 0 && levelBenefit.map((item: levelBenefitType) => (
                        <li key={item.id} className={`flex align-center justify-between mt-2_5 font-14 ${styles.rights_content}`}>
                            <div className='ml-6 font-w-500'>{item.benefitName}</div>
                            <div className='flex-x-cc font-w-500'>
                                {item.value0 ?
                                    <span>{(item.value0 && item.params0) ? getBenefitValue(item.value0) : item.value0}</span> :
                                    item.status0 === 0 ? <Image src="/images/userCenter/identity/fail.svg" alt='' width={20} height={20} className='' /> :
                                        <Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' />
                                }
                                {/* {item.status0 === 0 ? <Image src="/images/userCenter/identity/fail.svg" alt='' width={20} height={20} className='' />
                                    :
                                    item.value0 ?
                                        <span>{(item.value0 && item.params0) ? getBenefitValue(item.value0) : item.value0}</span>
                                        :
                                        <Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' />} */}
                            </div>
                            {/* <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}>50K USDT每日</div> */}
                            <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}>
                                {item.value1 ?
                                    <span>{(item.value1 && item.params1) ? getBenefitValue(item.value1) : item.value1}</span> :
                                    item.status1 === 0 ? <Image src="/images/userCenter/identity/fail.svg" alt='' width={20} height={20} className='' /> :
                                        <Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' />
                                }
                                {/* {item.status1 === 0 ? <Image src="/images/userCenter/identity/fail.svg" alt='' width={20} height={20} className='' />
                                    :
                                    item.value1 ?
                                        <span>{(item.value1 && item.params1) ? getBenefitValue(item.value1) : item.value1}</span>
                                        :
                                        <Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' />} */}
                            </div>
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
            </div>
        </div>


    </>);
};

export default NoAuthentication;