import React from 'react';
import styles from '../../styles/identity.module.css';
import { Iconify } from "@/components/icon"
import Image from 'next/image';
import { encryptIdCard, getBenefitValue } from '@/utils/encrypt';
import { useTranslation } from 'next-i18next';
import appStore from '@/store';
import { useEffect } from 'react';
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
    benefitValue: string
    status0?: number;
    value0?: string;
    params0?: string;
    status1?: number;
    value1?: string;
    params1?: string;
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
    const { t, i18n } = useTranslation(['userCenter']);
    const countryList = appStore.getCountryList();
    const cardTypeSeelect: { label: string, value: string }[] = [
        {
            label: t('identity.certified.idTypes.idCard'), // 居民身份证
            value: '1'
        },
        {
            label: t('identity.certified.idTypes.passport'), // 普通护照
            value: '2'
        },
        {
            label: t('identity.certified.idTypes.driverLicense'), // 驾驶证
            value: '3'
        },
        // {
        //     label: t('identity.certified.idTypes.hkMacauPass'), // 港澳通行证
        //     value: '3'
        // },
        // {
        //     label: t('identity.certified.idTypes.taiwanPass'), // 台湾通行证
        //     value: '4'
        // },
        // {
        //     label: t('identity.certified.idTypes.taiwanId'), // 台湾身份证
        //     value: '5'
        // },
        // {
        //     label: t('identity.certified.idTypes.foreignerId'), // 外国人永久居住身份证
        //     value: '6'
        // }
    ]
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
    const lableShow = (key: string) => {
        console.log(key, 999);

        if (key === 'cyptocurrency_withdrawal') {
            return t('identity.withdrawal')
        } else if (key === 'cyptocurrency_recharge') {
            return t('identity.recharge')
        } else {
            return key || '--'
        }

    }
    useEffect(() => {
        appStore.fetchCountryCodeList();
    }, [i18n.language]);
    return (< >
        <div className={`${styles.identity_content} flex-1`}>
            <div className={`${styles.content_header} `}>
                <Image src="/images/userCenter/identity/icon_Identity.svg"
                    alt="identity" width={120} height={54}
                    className={`${styles.header_icon}`} />
                {/* 1.认证内容 */}
                <div className='flex-1 flex-col justify-center'>
                    {/* 认证状态 */}
                    <div className={`font-18 font-w-500 flex align-center`} >
                        <p>
                            {/* 标准身份认证 */}
                            {t('identity.standardAuth.title')}
                        </p>
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="mingcute:safety-certificate-line" className={`${styles.success_icon} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>
                                {/* 已认证 */}
                                {t('identity.status.verified')}
                            </span>
                        </div>
                    </div>
                    {/* 认证提示 */}
                    <div className={`font-14 font-w-400 mt-3 ${styles.tip_color}`} >
                        <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                        {/* 已完成身份认证，开始您的货币之旅吧！ */}
                        {t('overview.identityAuth.verified')}
                    </div>
                </div>
                {/* 按钮 */}
                <div className={`${styles.btn_box} flex-col align-end justify-end`}>
                    {/* <button type='button' className={`${styles.btn_style} default_btn`}>去认证</button> */}
                    {/* <button type='button' className={`${styles.btn_style} default_btn`}>审核中</button>
            <button type='button' className={`${styles.btn_style} disabled_btn`}>重新认证</button> */}
                </div>
            </div>
            {/* 2.认证权益 */}
            <div className='mt-6'>
                <div className={`font-18 font-w-500 flex align-center `} >
                    <Image src="/images/userCenter/identity/icon_account.svg" alt='' width={24} height={24} className='mr-1' />
                    <span>
                        {/* 账户权益 */}
                        {t('identity.certified.accountBenefits')}
                    </span>
                </div>
                <ul className={`${styles.border_btm} mt-3`}>
                    {levelBenefit && levelBenefit.map((item: levelBenefitType) => (
                        <li className={`flex align-center justify-between font-14 ${styles.certified_box}`} key={item.benefitId}>
                            <div className={` font-w-400 ${styles.tip_color}`}>{lableShow(item.benefitValue)}</div>
                            <div className={` font-w-500`}>
                                {/* {(item.value1 && item.params1) ? getBenefitValue(item.value1) :
                                    item.status1 === 0 ? t('identity.certified.forbidden') : t('identity.certified.allow')
                                } */}
                                {
                                    item.status1 === 0 ?
                                        t('identity.certified.forbidden') : // 禁止
                                        (item.value1 && item.params1) ? getBenefitValue(item.value1) : t('identity.certified.allow') // 允许
                                }
                            </div>
                        </li>
                        // <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        //     <div className={` font-w-400 ${styles.tip_color}`}>加密货币充值</div>
                        //     <div className={` font-w-500`}>允许</div>
                        // </li>
                        // <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        //     <div className={` font-w-400 ${styles.tip_color}`}>C2C交易</div>
                        //     <div className={` font-w-500`}>禁止</div>
                        // </li>
                    ))}
                </ul>

            </div>
            <div className='mt-6'>
                <div className={`font-18 font-w-500 flex align-center `} >
                    <Image src="/images/userCenter/identity/icon_IDcard.svg" alt='' width={24} height={24} className='mr-1' />
                    <span>
                        {/* 个人信息 */}
                        {t('identity.certified.personalInfo')}
                    </span>
                </div>
                <ul className={`mt-3`}>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>
                            {/* 真实姓名 */}
                            {t('identity.certified.info.realName')}
                        </div>
                        <div className={` font-w-500`}>{'**'}&nbsp;{identityInfo?.firstName}</div>
                    </li>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>
                            {/* 证件类型 */}
                            {t('identity.certified.info.idType')}
                        </div>
                        <div className={` font-w-500`}>{cardTypeSeelect.find(item => item.value === identityInfo?.cardType.toString())?.label}</div>
                    </li>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>
                            {/* 国家 */}
                            {t('identity.certified.info.country')}
                        </div>
                        <div className={` font-w-500`}>{identityInfo?.countryId ?
                            countryList.find(item => item.id === identityInfo?.countryId)?.countryName :
                            '--'}</div>
                    </li>
                    <li className={`flex align-center justify-between font-14 ${styles.certified_box}`}>
                        <div className={` font-w-400 ${styles.tip_color}`}>
                            {/* 证件号 */}
                            {t('identity.certified.info.idNumber')}
                        </div>
                        <div className={` font-w-500`}>{encryptIdCard(identityInfo?.cardCode)}</div>
                    </li>
                </ul>

            </div>
        </div>


    </>);
};

export default NoAuthentication;