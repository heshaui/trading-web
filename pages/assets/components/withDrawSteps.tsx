import React from 'react';
import styles from '../styles/spotAccount.module.css'
import { useTranslation } from 'next-i18next';
import { observer } from 'mobx-react-lite';
import WithdrawStepsModal from './modal/withdrawAndToUpSteps_Modal'
import { useState } from 'react';

type WithdrawStepsProps = {
    type?: 'withdraw' | 'topUp',
    className?: string,
    style?: React.CSSProperties
}
const WithdrawAndTopUpSteps = observer(({
    type = 'withdraw',
    className = '',
    style = {}
}: WithdrawStepsProps) => {
    const { t } = useTranslation('assets');
    const [open, setOpen] = useState(false);

    return (<>
        {type === 'withdraw' && <div className={`${styles.notice_box} ${className}`} style={style}>
            <div>
                <h5 className={`font-w-500 font-16 mb-4`}>
                    {/* 常见问题 */}
                    {t('withdrawMoney.faq')}
                </h5>
                <ul className={`font-14 font-w-400 ${styles.tip_color}`}>
                    {/* <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item1')}</li>
                                    <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item2')}</li>
                                    <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item3')}</li>
                                    <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item4')}</li>
                                    <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item5')}</li> */}
                    <li className={`mb-2_5`}>
                        <button
                            onClick={() => { setOpen(true) }}
                        >{t('withdrawMoney.faqList.item6')}</button>
                    </li>
                </ul>
            </div>
            <div className=''>
                <h5 className={`font-w-500 font-16 mb-4`}>
                    {/* 提现须知 */}
                    {t('withdrawMoney.notice')}
                </h5>
                <ul className={`font-14 font-w-400 ${styles.tip_color}`}>
                    <li className={`mb-2_5`}>{t('withdrawMoney.noticeList.item1')}</li>
                    <li className={`mb-2_5`}>{t('withdrawMoney.noticeList.item2')}</li>
                    <li className={`mb-2_5`}>{t('withdrawMoney.noticeList.item3')}</li>
                </ul>
            </div>
        </div>}
        {type === 'topUp' && <div className={`${styles.notice_box} ${className}`}>
            <div>
                <h5 className={`font-w-500 font-16 mb-4`}>
                    {/* 常见问题 */}
                    {t('withdrawMoney.faq')}
                </h5>
                <ul className={`font-14 font-w-400 ${styles.tip_color}`}>
                    {/* <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item1')}</li>
                                    <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item2')}</li>
                                    <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item3')}</li>
                                    <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item4')}</li>
                                    <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item5')}</li> */}
                    <li className={`mb-2_5`}>
                        <button
                            onClick={() => { setOpen(true) }}
                        >{t('withdrawMoney.faqList.item2')}</button>
                    </li>
                </ul>
            </div>
            <div className=''>
                <h5 className={`font-w-500 font-16 mb-4`}>
                    {/* 充值须知 */}
                    {t('withdrawMoney.notice2')}
                </h5>
                <ul className={`font-14 font-w-400 ${styles.tip_color}`}>
                    <li className={`mb-2_5`}>{t('withdrawMoney.noticeList.item4')}</li>
                    <li className={`mb-2_5`}>{t('withdrawMoney.noticeList.item5')}</li>
                    <li className={`mb-2_5`}>{t('withdrawMoney.noticeList.item6')}</li>
                </ul>
            </div>
        </div>}
        <WithdrawStepsModal open={open} onCancel={() => { setOpen(false) }} type={type} />
        {/* <ToUpStepsModal open={openToUp} onCancel={() => { setOpenToUp(false) }} /> */}
    </>
    );
});

export default WithdrawAndTopUpSteps;