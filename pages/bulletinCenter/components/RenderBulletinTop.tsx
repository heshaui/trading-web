import { Checkbox, Col, Input, Row } from 'antd';
import Image from 'next/image';

import styles from '../styles/bulletinCenter.module.css';
import { RenderBulletinTopProps } from '@/type/bulletin_center/bc_types';
import { useState } from 'react';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useTranslation } from 'next-i18next';

const { Search } = Input;

export default function RenderBulletinTop({ 
    showDetail, 
    onBack, 
    onReadAll, 
    onUnreadChange, 
    onSearch,
    hasUnreadMessages = true, // 默认值为 true，向下兼容
    disableUnreadCheckbox = false // 默认值为 false，向下兼容
}: RenderBulletinTopProps) {
    // 搜索值
    const [searchValue, setSearchValue] = useState('');
    // 日夜间判断
    const { isDayMode } = useThemeMode();
    const { t } = useTranslation('builetinCenter');

    const handleSearch = (value: string) => {
        setSearchValue(value);
        onSearch?.(value);
    };
    if (!showDetail) {
        // 在公告中心主页面时
        return (
            <div className={`${styles.bulletinTop} customSearch`}>
                <Row align='middle' justify='space-between'>
                    <Col>
                        <Row gutter={16} align='middle'>
                            <Col><h5>{t('bulletinCenter.menu.notification')}</h5></Col>
                            <Col>
                                <Search
                                    placeholder={t('bulletinCenter.action.search')}
                                    allowClear
                                    style={{ width: 200 }}
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onSearch={handleSearch}
                                    className={styles.input}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Checkbox 
                            onChange={(e) => onUnreadChange?.(e.target.checked)}
                            disabled={disableUnreadCheckbox}
                        >
                            <span className={styles.themeText} style={{ 
                                opacity: disableUnreadCheckbox ? 0.6 : 1 
                            }}>{t('bulletinCenter.action.unreadOnly')}</span>
                        </Checkbox>
                        <span 
                            style={{ 
                                color: hasUnreadMessages ? 'var(--theme-color)' : '#999', 
                                cursor: hasUnreadMessages ? 'pointer' : 'not-allowed',
                                opacity: hasUnreadMessages ? 1 : 0.6,
                                marginLeft: '8px'
                            }} 
                            onClick={hasUnreadMessages ? onReadAll : undefined}
                        >
                            {t('bulletinCenter.action.markAllRead')}
                        </span>
                    </Col>
                </Row>
            </div>
        );
    } else {
        // 在详情页（包括最新动态、新币上线等）时
        return (
            <div className={styles.bulletinTop}>
                <Image
                    src={isDayMode
                        ? "/images/bulletin_center/icon_arrow_left.png"
                        : "/images/bulletin_center/icon_arrow_left_white.png"}
                    alt=""
                    width={24}
                    height={24}
                    style={{ cursor: 'pointer' }}
                    onClick={onBack}  // 添加点击事件
                />
            </div>
        );
    }
}