// pages/userCenter/pages/index.tsx
import React from 'react';
import Image from 'next/image';
import { useThemeMode } from '@/hooks/useThemeMode';
type NoDataProps = {
    title?: string;
}
const NoData = ({title}:NoDataProps) => {
    const { isDayMode } = useThemeMode(); // 使用 hook


    return (<div className='flex-y-cc'>
        <Image
            src={isDayMode ? "/images/pubic_icon/iocn_nodata_day.png" : "/images/pubic_icon/iocn_nodata_night.png"}
            alt="empty" width={100} height={100} />
        <p className={`font-14 font-w-400 tip-color`}>{title?title:"暂无数据"}</p>
    </div>
    );
};

export default NoData;