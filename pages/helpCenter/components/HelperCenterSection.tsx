import React from 'react';
import { Row, Col, Button } from 'antd';
import Image from 'next/image';

import styles from '../styles/helpCenter.module.css';
import { HelpCenterSectionProps } from '@/type/help_center/hc_types';

const HelpCenterSection: React.FC<HelpCenterSectionProps> = ({ 
    helpCenterList,
    onButtonClick 
}) => {
    return (
        <div className={styles.helpCenterCard}>
            {helpCenterList.map((item, index) => (
                <div key={index}>
                    <Row>
                        <Col>
                            <h2 style={{ fontSize: 24, fontWeight: 500 }}>
                                {item.title}
                            </h2>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: 40 }}>
                        <Col span={8}>
                            <Button
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
                                            alt="arrow_right"
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