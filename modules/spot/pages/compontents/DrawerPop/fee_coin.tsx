'use client'
import React from 'react';
import styles from '../styles/spotHeader_pop.module.css'
import { Radio,ConfigProvider } from "antd";
import { Iconify } from "@/components/icon"
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { useAuth } from '@/context/AuthContext';
import { division } from '@/utils';
import { useRouter } from 'next/navigation';
import { ROUTER_KEY_OPEN } from '@/config/apiConfig';
import type { CheckboxGroupProps } from 'antd/es/checkbox';
import { usePopTypeContext, PopTypeEnum } from '@/hooks/usePopProvider';
import { useFeeDirection } from '@/hooks/useKv';
const FeeCoin = observer(() => {

    const { t } = useTranslation(['spot']);
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const {popType, setPopType } = usePopTypeContext();
    const { feeDirection } = useFeeDirection();

    console.log(feeDirection, 'feeDirection');

    const options: CheckboxGroupProps<string>['options'] = [
        {
            label:
                <div className={`${styles.title_color} ml-1`}>
                    {t('spot.feeCoin.receivedCoin')}
                </div>,
            value: '1'
        },
        {
            label:
                <div className={`${styles.title_color} ml-1`}>
                    {t('spot.feeCoin.quotedCoin')}
                </div>,
            value: '2'
        },
    ];



    if(popType !== PopTypeEnum.FEE_COIN) return null

    return (
        <>
        <ConfigProvider
            theme={{
                components: {
                    Radio: {
                        // colorPrimary: '#000',
                        buttonPaddingInline:0
                    },
                },
            }}
            >
            <Radio.Group block options={options} defaultValue={feeDirection.toString()}
                className='mt-5 px-5 radio-custom' />
       </ConfigProvider>     
            <ul className={`${styles.tip_color} px-5 mt-5 font-14 font-w-400`}>
                <li className={`mt-5`}>
                    {t('spot.feeCoin.receivedDesc')}
                </li>
                <li className={`mt-5`}>
                    {t('spot.feeCoin.quotedDesc')}</li>
            </ul>
        </>
    )
})
export default FeeCoin;