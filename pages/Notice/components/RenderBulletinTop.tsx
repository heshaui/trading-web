import { Checkbox, Col, Input, Row } from 'antd';
import Image from 'next/image';

import styles from '../styles/bulletinCenter.module.css';
import { RenderBulletinTopProps } from '@/type/bulletin_center/bc_types';
import { useState } from 'react';
import { useThemeMode } from '@/hooks/useThemeMode';

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
                            <Col><h5>通知</h5></Col>
                            <Col>
                                <Search
                                    placeholder="搜索"
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
                            }}>只看未读</span>
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
                            全部已读
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