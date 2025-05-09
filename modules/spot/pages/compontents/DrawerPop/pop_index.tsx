'use client'
import React from 'react';
import styles from '../styles/spotHeader_pop.module.css'
import { ConfigProvider,Drawer, Switch,Tooltip,Button } from "antd";
import { Iconify } from "@/components/icon"
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import { observer } from 'mobx-react-lite';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ROUTER_KEY_OPEN } from '@/config/apiConfig';
import { usePopTypeContext, PopTypeEnum } from '@/hooks/usePopProvider';
import appStore from '@/store';
const DrawerPopIndex = () => {

    const { t } = useTranslation(['spot']);
    const { isLoggedIn} = useAuth();
    const router = useRouter();
    const {popType, setPopType } = usePopTypeContext();
    const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];
const goRule = () => {
    setPopType(PopTypeEnum.TRADE_RULE)
}
const goFeeCoin = () => {
    setPopType(PopTypeEnum.FEE_COIN)
}   

    if(popType !== PopTypeEnum.INDEX) return null

    return (
        <>
        <ConfigProvider
            theme={{
                components: {
                    Button: {
                        controlHeightLG: 50,
                        defaultBg:  "#FF4D4F",
                        defaultBorderColor:  "#FF4D4F",
                        defaultColor: '#fff',
                        defaultActiveBg: '#fff',
                        defaultActiveBorderColor:  "#FF4D4F",
                        defaultActiveColor:  "#FF4D4F",
                        defaultHoverBg: '#fff',
                        defaultHoverBorderColor:  "#FF4D4F",
                        defaultHoverColor:  "#FF4D4F",
                    },
                },
                token: {
                    colorBgElevated: 'var(--background9)',
                    // padding: 0, // 去除默认padding
                    paddingLG: 0, // 去除默认padding
                    paddingXS: 0, // 去除默认padding
                },
            }}
            >
                {isLoggedIn ? <>
                <div className={`font-12 px-5 mt-5 flex-x align-center pointer ${styles.tip_color}`}>
                <Tooltip 
                placement="right"
                title={<div className='font-16 ml-3 py-2'>
                    开启下单确认功能后，每次提交订单时需要进行二次确认。
                </div>}
                >
                    下单确认
                    <Iconify icon="mingcute:warning-line" className={`${styles.tip_color} mx-1`} size={14} />
                </Tooltip>
                </div>
                <ul className={`${styles.title_color} ${styles.swith_box} font-16 font-w-500`}>
                    <li className='flex-x align-center justify-between '>
                        限价单 
                        <Switch 
                        size='small'
                        />
                    </li>
                    <li className='flex-x align-center justify-between mt-5'>
                        市价单 <Switch
                            size='small'
                        />
                    </li>
                </ul>
                <ul className={`${styles.title_color} ${styles.swith_box} font-16 font-w-500`}>
                    <li className='flex-x align-center justify-between '>
                    手续费币种 
                    <button className={`${styles.tip_color} font-w-400 mx-1`}
                    onClick={goFeeCoin}
                    >
                    接收币种
                    <Iconify icon="icon-park-outline:right" className={`${styles.tip_color} ml-1`} size={24} />

                    </button>
                        
                    </li>
                    <li className='flex-x align-center justify-between mt-5'>
                    交易规则 
                    <button className={`${styles.tip_color} font-w-400  mx-1`}
                    onClick={goRule}
                    >
                    {currentPair?.coinSymbol}/{currentPair?.baseSymbol}
                    <Iconify icon="icon-park-outline:right" className={`${styles.tip_color} ml-1`} size={24} />

                    </button>
                    </li>
                </ul></> : <>
                <ul className={`${styles.title_color} px-5  font-16 font-w-500`}>
                    <li className='flex-x align-center justify-between mt-5'>
                    交易规则 
                    <button className={`${styles.tip_color} font-w-400  mx-1`}
                    onClick={goRule}
                    >
                    {currentPair?.coinSymbol}/{currentPair?.baseSymbol}
                    <Iconify icon="icon-park-outline:right" className={`${styles.tip_color} ml-1`} size={24} />

                    </button>
                    </li>
                </ul>
                <div className='px-5 mt-10'>
                <Button
                            // className={`${styles.sumbit_btn} green_btn`}
                            style={{ width: '100%', height: '50px', borderRadius: '32px' }}
                            htmlType="button"
                            onClick={()=>{
                                router.push(ROUTER_KEY_OPEN.LOGIN)
                            }}
                        >
                             {t('spot.modal.login')}
                        </Button>
                        </div>
                </>}
            </ConfigProvider>
        </>
    )
}
export default DrawerPopIndex;