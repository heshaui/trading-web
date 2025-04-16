// pages/userCenter/pages/index.tsx
import React from 'react';
import Image from 'next/image';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'next-i18next';
import { Iconify } from "@/components/icon";
import styles from "./styles/modal.module.css";
type NoDataProps = {
    title: string;
    textColor?: string;
    className?: string;
}
const TipBox = ({title,textColor,className}:NoDataProps) => {
    // const { isDayMode } = useThemeMode(); // 使用 hook
    // const { t } = useTranslation('common');

    return (<div className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5 ${className}`}>
        <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
        <span>
            {title}
        </span>
    </div>
    );
};

export default TipBox;