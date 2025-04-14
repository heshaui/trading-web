// pages/userCenter/pages/index.tsx
import React from 'react';
import Image from 'next/image';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'next-i18next';
type NoDataProps = {
    title?: string;
    textColor?: string;
}
const NoData = ({title,textColor}:NoDataProps) => {
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { t } = useTranslation('common');

    return (<div className='flex-y-cc'>
        <Image
            src={isDayMode ? "/images/pubic_icon/iocn_nodata_day.png" : "/images/pubic_icon/iocn_nodata_night.png"}
            alt="empty" width={100} height={100} />
        <div className={`font-14 font-w-400 tip-color`}
        style={{color:textColor?textColor:''}}
        >{title?title:
            <p>
                <span className='theme-color'>{t('noLogin.tip2')}</span>
                <span>{t('noLogin.or')}</span>
                <span className='theme-color'>{t('noLogin.tip3')}</span>
                <span >{t('noLogin.tip1')}</span>
            </p>
        }</div>
    </div>
    );
};

export default NoData;