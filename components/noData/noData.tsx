// pages/userCenter/pages/index.tsx
import React from 'react';
import Image from 'next/image';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'next-i18next';
import styles from './styles/modal.module.css';
type NoDataProps = {
    title?: string;
    textColor?: string;
    height?: string;
    position?: string;
    button?: React.ReactNode | boolean;
    buttonTitle?: string;
    buttonClick?: () => void;
}
const NoData = ({ title, textColor, height, position = 'center', button, buttonTitle, buttonClick }: NoDataProps) => {
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { t } = useTranslation('common');
    const overclassName = () => {
        if (position === 'center') return 'flex-y-cc'
        if (position === 'top') return 'flex-y align-center justify-start'
    }
    return (<div
        className={overclassName()}
        style={{ height: height || 'auto' }}
    >
        <Image
            src={isDayMode ? "/images/pubic_icon/iocn_nodata_day.png" : "/images/pubic_icon/iocn_nodata_night.png"}
            alt="empty" width={100} height={100} />
        <p className={`font-14 font-w-400 tip-color`}
            style={{ color: textColor ? textColor : '' }}
        >{title ? title : t('nodata')}</p>
        {button || buttonTitle ? <>
            {buttonTitle && !button ? <button
                type='submit' className={`default_btn  mt-5 ${styles.invite_btn}`}
                onClick={buttonClick}>
                {buttonTitle || 'Click'}
            </button> : button}</>
            : null}
    </div>
    );
};

export default NoData;