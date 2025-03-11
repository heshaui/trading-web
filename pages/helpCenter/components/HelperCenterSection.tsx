import React from 'react';
import { Row, Col, Button } from 'antd';
import Image from 'next/image';

import styles from '../styles/helpCenter.module.css';
import { HelpCenterSectionProps } from '@/type/help_center/hc_types';
import { useRouter } from 'next/router';

const HelpCenterSection: React.FC<HelpCenterSectionProps> = ({
    helpCenterList = [],
    onButtonClick
}) => {

    const router = useRouter();
    const locale = router.query.locale || 'zh';
    
    // 处理标题点击事件
    const handleTitleClick = (item: any) => {
        router.push({
            pathname: `/${locale}/helpCenter/detail`,
            query: { 
                title: item.title,
                category: item.title 
            }
        });
    };

    return (
        <div className={styles.helpCenterCard}>
            {Array.isArray(helpCenterList) && helpCenterList.map((item, index) => (
                <div key={index} className={styles.helpCenterCardContent}>
                    <Row>
                        <Col>
                            <h2
                                style={{
                                    fontSize: 24,
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleTitleClick(item)}
                            >
                                {item.title}
                            </h2>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: 40 }}>
                        <Col span={8}>
                            <Button
                                className={styles.helpCenterCardButton}
                                style={{
                                    width: '100%',
                                    height: 64,
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                onClick={() => onButtonClick?.(item)}
                            >
                                <Row
                                    gutter={18}
                                    justify='start'
                                    align='middle'
                                    style={{ width: '100%' }}
                                >
                                    <Col>
                                        <Image
                                            src={item.icon}
                                            alt={item.alt}
                                            width={18}
                                            height={18}
                                        />
                                    </Col>
                                    <Col>
                                        <span>{item.buttonWord}</span>
                                    </Col>
                                </Row>
                            </Button>
                        </Col>
                    </Row>
                </div>
            ))}
        </div>
    );
};

export default HelpCenterSection;