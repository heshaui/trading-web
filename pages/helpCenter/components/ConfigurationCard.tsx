import React from 'react';
import { Card, Col, Row } from 'antd';
import Image from 'next/image';

import { ConfigurationCardProps } from '@/type/help_center/hc_types';
import styles from '../styles/helpCenter.module.css';

const ConfigurationCard: React.FC<ConfigurationCardProps> = ({ configurationList }) => {
    return (

        <div className={styles.cardContent}>
            <Row>
                <Col flex={1}>
                    <Card className={styles.card}>
                        <Row justify='space-evenly'>
                            {
                                Array.isArray(configurationList) && configurationList.map((item, index) => {
                                    // 根据数组长度动态计算span
                                    const listLength = configurationList.length;
                                    const spanValue = listLength === 5 ? 4 : 6;
                                    return (
                                        <Col key={index} span={spanValue} style={{ cursor: 'pointer' }}>
                                            <Row justify='center'>
                                                <Col>
                                                    <Image
                                                        src={item.icon}
                                                        alt="help"
                                                        width={50}
                                                        height={50}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row justify='center' style={{ marginTop: 18 }}>
                                                <Col>
                                                    <span style={{ color: 'var(--text-color5)', fontSize: 16, fontWeight: 500 }}>
                                                        {item.title}
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Col>
                                    )
                                })
                            }
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default ConfigurationCard;