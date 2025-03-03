import styles from './styles/helpCenter.module.css';
import ConfigurationCard from './components/ConfigurationCard';

import Image from 'next/image';
import { Button, Col, ConfigProvider, Input, Row } from 'antd';
import HelpCenterSection from './components/HelperCenterSection';
import { HelpCenterItem } from '@/type/help_center/hc_types';
export default function HelpCenter() {
    // 搜索图标
    const SearchIcon = <Image
        src="/images/help_center/icon_search.png"
        alt="search"
        width={18}
        height={18}
    />;
    // 历史搜索列表
    const historicalSearchList = ['永续合约', '期货合约', '期权合约', '期权合约', '期货合约', '期权合约', '期权合约'];
    // 后端配置列表
    const configurationList = [
        {
            icon: '/images/help_center/icon_lock.png',
            title: '重置登录密码',
        },
        {
            icon: '/images/help_center/icon_lock.png',
            title: '重置登录密码',
        },
        {
            icon: '/images/help_center/icon_lock.png',
            title: '重置登录密码',
        },
        {
            icon: '/images/help_center/icon_lock.png',
            title: '重置登录密码',
        },
        {
            icon: '/images/help_center/icon_lock.png',
            title: '重置登录密码',
        },
    ]
    // const configurationList: any[] = [];
    const helpCenterList = [
        {
            title: '新手帮助',
            icon: '/images/help_center/icon_user.png',
            buttonWord: '账户功能',
        },
    ];
    // 按钮点击事件
    const handleButtonClick = (item: HelpCenterItem) => {
        console.log(item);
    }

    return (
        <div className={styles.helpCenterContainer}>
            <ConfigProvider
                theme={{
                    components: {
                        Input: {
                            inputFontSize: 12,
                        },
                        Button: {
                            defaultActiveColor: 'none',
                            defaultHoverColor: 'none',
                        },
                    },
                    token: {
                        controlHeight: 50,
                    }
                }}
            >
                <div className={styles.banner}>
                    <div className={styles.bannerContent}>
                        <Row>
                            <Col>
                                <h1 style={{ color: '#0C0D0C', fontSize: 32, fontWeight: 600 }}>我们能帮您什么？</h1>
                            </Col>
                        </Row>
                        <Row style={{ marginTop: 16 }}>
                            <Col flex={1}>
                                <Input placeholder="请输入您的问题" prefix={SearchIcon} />
                            </Col>
                        </Row>
                        <Row align='middle'>
                            <Col>
                                <Row gutter={8} align='middle' style={{ marginTop: 10 }}>
                                    {
                                        historicalSearchList.map((text, index) => (
                                            <Col key={index}>
                                                <span style={{ color: '#676867', fontSize: 14 }}>
                                                    {text}
                                                </span>
                                            </Col>
                                        ))
                                    }
                                    <Col>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Image
                                                src="/images/help_center/icon_delete.png"
                                                alt="delete"
                                                width={16}
                                                height={16}
                                                style={{
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    top: '1px'  // 微调图标位置
                                                }}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    {/* <ConfigurationCard configurationList={configurationList} /> */}
                    {Array.isArray(configurationList) && configurationList.length > 0 && (
                        <ConfigurationCard configurationList={configurationList} />
                    )}
                </div>
                <HelpCenterSection
                    helpCenterList={helpCenterList}
                    onButtonClick={handleButtonClick}
                />
            </ConfigProvider>
        </div>
    )
}