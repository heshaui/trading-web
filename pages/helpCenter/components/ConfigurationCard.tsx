import React, { useRef, useEffect } from 'react';
import { Card, Col, Row, ConfigProvider } from 'antd';
import Image from 'next/image';

import { CustomizationProps } from '@/type/help_center/hc_types';
import styles from '../styles/helpCenter.module.css';
import { useThemeMode } from '@/hooks/useThemeMode'
import { useRouter } from 'next/navigation';


type ConfigurationCardProps = {
    configurationList: CustomizationProps[];
    onHeightChange?: (height: number) => void;
}
const ConfigurationCard: React.FC<ConfigurationCardProps> = ({ configurationList, onHeightChange }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current && onHeightChange) {
            const observer = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    onHeightChange(entry.contentRect.height);
                }
            });

            observer.observe(contentRef.current);

            return () => {
                observer.disconnect();
            };
        }
    }, [onHeightChange]);
    const { isDayMode } = useThemeMode();
    const router = useRouter();
    const handleButtonClick = (languagePath: string) => {
        if (languagePath.startsWith('http')) {
            window.open(languagePath, '_blank', 'noopener');
        } else {
            router.push(languagePath);
        }
    }

    return (
        <ConfigProvider
            theme={{
                components: {
                    Card: {
                        // headerPadding:0,
                    },
                },
            }}
        >
            <div ref={contentRef} className={`${styles.cardContent} configContentLayout`}>
                <Row>
                    <Col flex={1}>
                        <Card className={styles.card} style={{ paddingTop: 0 }}>
                            <Row className="flex-x align-center flex-wrap">
                                {
                                    Array.isArray(configurationList) && configurationList.map((item, index) => {
                                        // 根据数组长度动态计算span
                                        // const span = configurationList.length > 8 ? 24/5 : 6; // 大于8个时一行5个(24/5)，否则一行4个(6)
                                        const span = configurationList.length > 8 ? '20%' : '25%'; // 大于8个时一行5个(24/5)，否则一行4个(6)
                                        return (
                                            <Col key={item.id} className='mt-10' style={{ cursor: 'pointer', width: span }}>
                                                <Row justify='center' onClick={() => handleButtonClick(item.languagePath)}>
                                                    <Col>
                                                        <Image
                                                            src={isDayMode && item.whiteIcon ? item.whiteIcon : item.blackIcon}
                                                            alt="help"
                                                            width={50}
                                                            height={50}
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row justify='center' style={{ marginTop: 18 }}>
                                                    <Col>
                                                        <span style={{ color: 'var(--text-color5)', fontSize: 16, fontWeight: 500 }}>
                                                            {item.articleTitle}
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
        </ConfigProvider>
    )
}

export default ConfigurationCard;