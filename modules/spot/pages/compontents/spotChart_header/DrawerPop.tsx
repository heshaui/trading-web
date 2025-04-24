'use client'
import React from 'react';
import styles from '../styles/spotHeader.module.css'
import { Drawer } from 'antd';
import { Iconify } from "@/components/icon"
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';

type DrawerPopProps = {
    open: boolean;
    onClose: () => void;
}   
const DrawerPop = observer( ({open,onClose}:DrawerPopProps) => {
    
    const { t } = useTranslation(['spot']);
  
  



    return (
       <>
       <Drawer title="Basic Drawer" open={open} onClose={onClose}>

       </Drawer>
       </>
    )
})
export default DrawerPop;