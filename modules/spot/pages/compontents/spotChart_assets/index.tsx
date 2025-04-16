import React from 'react';
import styles from '../styles/spotChartAssets.module.css'
import { useTranslation } from 'next-i18next';

interface DataType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: number,
    tokenTime: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
}
const SpotAssetsPage = () => {
    const { t } = useTranslation(['spot']);


    return (<>
        <div className={`${styles.card_header} flex align-center w-full`}>
            资产
        </div>
        <div className={`px-6 py-6 w-full ${styles.spot_main}`}>
            <ul className={`${styles.tip_color1} font-14 font-w-400`}>
                <li className='flex justify-between align-center mb-5'>
                    <div>BTC可用资产</div>
                    <div>0.0000023</div>
                </li>
                <li className='flex justify-between align-center mb-5' >
                    <div>USDT可用资产</div>
                    <div>10.010000</div>
                </li>
            </ul>
            <div className={`flex-x-cc w-full `}>
                <button type='button' className={`cancel_btn2 ${styles.btn_style} mr-4`} >{t('spot.columns.deposit')}</button>
                <button type='button' className={`cancel_btn2 ${styles.btn_style}`}>{t('spot.columns.withdraw')}</button>
            </div>
        </div>
    </>
    );
};

export default SpotAssetsPage