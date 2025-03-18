import React, { useEffect } from 'react';
import Image from 'next/image';
import { Col } from 'antd';
import { useDayModeChange } from '@/hooks/dayModeChange';

// 使用 React.memo 创建记忆化组件
const ThemeIcon = React.memo(() => {
    const { isDayMode, toggleTheme } = useDayModeChange();

    // 预加载图片
    useEffect(() => {
        const sunImage = new window.Image();
        sunImage.src = '/images/home_menu/icon_sun_fill.png';

        const moonImage = new window.Image();
        moonImage.src = '/images/home_menu/icon_moon_line.png';
    }, []);

    return (
        <Col onClick={toggleTheme} style={{ cursor: 'pointer' }}>
            <div className="theme-icon-container">
                <Image
                    src="/images/home_menu/icon_sun_fill.png"
                    alt="日间模式"
                    width={20}
                    height={20}
                    className={`theme-icon ${isDayMode ? 'visible' : 'hidden'}`}
                />
                <Image
                    src="/images/home_menu/icon_moon_line.png"
                    alt="夜间模式"
                    width={20}
                    height={20}
                    className={`theme-icon ${isDayMode ? 'hidden' : 'visible'}`}
                />
            </div>
        </Col>
    );
});

// 添加显示名称（有助于调试）
ThemeIcon.displayName = 'ThemeIcon';

export default ThemeIcon;