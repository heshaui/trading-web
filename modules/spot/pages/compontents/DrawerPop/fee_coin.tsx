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
                <div className='ml-1'>
                    接收币种
                </div>,
            value: '1'
        },
        {
            label:
                <div className='ml-1'>
                    计价币种
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
                    接收币种：现货交易时手续费币种按照成交到账的币种作为手续费，即卖出得到usdt就是按照usdt收取，买入得到币种就按币种收取；
                </li>
                <li className={`mt-5`}>
                    计价币种：现货交易时买卖手续费币种均按照计价币种收取。用户在买单时计算数量或成交额需包含手续费。</li>
            </ul>
        </>
    )
})
export default FeeCoin;