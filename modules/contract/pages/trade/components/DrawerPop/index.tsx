'use client'
import React from 'react';
import styles from '../styles/spotHeader_pop.module.css'
import { ConfigProvider, Drawer, Switch, Tooltip, Button } from "antd";
import { Iconify } from "@/components/icon"
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { useAuth } from '@/context/AuthContext';
import { division } from '@/utils';
import { useRouter } from 'next/navigation';
import { ROUTER_KEY_OPEN } from '@/config/apiConfig';
import DrawerPopIndex from './pop_index';
import FeeCoin from './fee_coin';
import TradeRule from './trade_rule';
import { usePopTypeContext, PopTypeProvider, PopTypeEnum } from '@/hooks/usePopProvider';
type DrawerPopProps = {
    open: boolean;
    onClose: () => void;
}
const DrawerContent = observer(({ open, onClose }: DrawerPopProps) => {
    const { t } = useTranslation(['spot']);
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const { popType, setPopType } = usePopTypeContext();
    const goIndex = () => {
        setPopType(PopTypeEnum.INDEX)
    }
    const handClose = () => {
        onClose()
        setPopType(PopTypeEnum.INDEX)
    }
    
    return (
        <Drawer
            title={
                <div className={`font-16 font-w-500 px-5 flex-x align-center ${styles.title_color}`}>
                    {popType === PopTypeEnum.INDEX && t('spot.drawer.preferences')}
                    {popType === PopTypeEnum.TRADE_RULE && (
                        <div className='flex-x align-center justify-between w-full'>
                            <div className='flex-x align-center'>
                                <button onClick={goIndex}>
                                    <Iconify icon="icon-park-outline:left" className={`${styles.tip_color}`} size={24} />
                                </button>
                                {t('spot.drawer.tradeRule')}
                            </div>
                            <button onClick={handClose}>
                                <Iconify icon="eva:close-outline" className={`${styles.tip_color} ml-1`} size={24} />
                            </button>
                        </div>
                    )}
                    {popType === PopTypeEnum.FEE_COIN && (
                        <div className='flex-x align-center justify-between w-full'>
                            <div className='flex-x align-center'>
                                <button onClick={goIndex}>
                                    <Iconify icon="icon-park-outline:left" className={`${styles.tip_color}`} size={24} />
                                </button>
                                {t('spot.drawer.feeCoin')}
                            </div>
                            <button onClick={handClose}>
                                <Iconify icon="eva:close-outline" className={`${styles.tip_color} ml-1`} size={24} />
                            </button>
                        </div>
                    )}  
                </div>
            }
            open={open}
            onClose={handClose}
            closeIcon={false}
        >
            <DrawerPopIndex />
            <FeeCoin />
            <TradeRule />
        </Drawer>
    );
});
const DrawerPop = observer(({ open, onClose }: DrawerPopProps) => {
    return (
        <>
            <ConfigProvider
                theme={{
                    components: {
                        Button: {
                            controlHeightLG: 50,
                            defaultBg: "#FF4D4F",
                            defaultBorderColor: "#FF4D4F",
                            defaultColor: '#fff',
                            defaultActiveBg: '#fff',
                            defaultActiveBorderColor: "#FF4D4F",
                            defaultActiveColor: "#FF4D4F",
                            defaultHoverBg: '#fff',
                            defaultHoverBorderColor: "#FF4D4F",
                            defaultHoverColor: "#FF4D4F",
                        },
                    },
                    token: {
                        colorBgElevated: 'var(--background12)',
                        paddingLG: 0,
                        paddingXS: 0,
                    },
                }}
            >
                <PopTypeProvider>
                    <DrawerContent open={open} onClose={onClose} />
                </PopTypeProvider>
            </ConfigProvider>
        </>
    )
})
export default DrawerPop;