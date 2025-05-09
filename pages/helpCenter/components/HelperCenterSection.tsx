import React from 'react';
import { Row, Col, Button } from 'antd';
import Image from 'next/image';

import styles from '../styles/helpCenter.module.css';
import { HelpCenterMenuProps} from '@/type/help_center/hc_types';
import { useRouter } from 'next/router';
import { useThemeMode } from '@/hooks/useThemeMode'

type Props = {
    helpCenterList: HelpCenterMenuProps[];
    onButtonClick: (item: any) => void;
    flag: boolean;
    configContentHeight?: number;
};
const HelpCenterSection: React.FC<Props> = ({
    helpCenterList = [],
    flag,
    onButtonClick,
    configContentHeight = 0
}) => {
    const { isDayMode } = useThemeMode();

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
    const clickButton = (languagePath: string) => {
        if(!languagePath) return 
        if (languagePath.startsWith('http')) {
            window.open(languagePath, '_blank', 'noopener');
        } else {
            router.push(languagePath);
        }
    };

    return (
        <div className={`${styles.helpCenterCard}`} style={flag?{ marginTop: configContentHeight }:{}}>
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
                                {item.helpDescription}
                            </h2>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: 40 }}>
                        {item.children && item.children.map((child) => (
                            <Col  key={child.id} style={{ width: '30%' }} className='mr-6'>
                                <Button
                                    className={`${styles.helpCenterCardButton} flex-x `}
                                    style={{
                                        width: '100%',
                                    height: 64,
                                    display: 'flex',
                                    alignItems: 'center',
                                    }}
                                    
                                onClick={() => clickButton(child?.languagePath || '')}
                            >
                                <Row
                                    gutter={18}
                                    justify='start'
                                    align='middle'
                                    style={{ width: '100%' }}
                                >
                                    <Col>
                                        <Image
                                            src={isDayMode&&child.whiteIcon ? child.whiteIcon : child.blackIcon}
                                            alt={child.articleTitle}
                                            width={18}
                                            height={18}
                                        />
                                    </Col>
                                    <Col>
                                        <span>{child.helpDescription}</span>
                                    </Col>
                                </Row>
                            </Button>
                            </Col>
                        ))}
                    </Row>
                </div>
            ))}
        </div>
    );
};

export default HelpCenterSection;

export interface HelpCenterSectionProps {
    configContentHeight?: number;
}