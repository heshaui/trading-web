import styles from './styles/helpCenter.module.css';
import ConfigurationCard from './components/ConfigurationCard';
import { useThemeMode } from '@/hooks/useThemeMode';

import Image from 'next/image';
import { Card, Col, ConfigProvider, Input, message, Row } from 'antd';
import HelpCenterSection from './components/HelperCenterSection';
import { HelpCenterItem } from '@/type/help_center/hc_types';
import { useEffect, useState } from 'react';
import SearchDetail from './components/SearchDetail';

export default function HelpCenter() {
    // 日夜间判断
    const { isDayMode } = useThemeMode();
    // 添加客户端渲染标记
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    // 历史搜索
    const [historicalSearchList] = useState(['永续合约', '期货合约', '期权合约']);
    // 配置列表
    const [configurationList] = useState([
        {
            icon: '/images/help_center/icon_lock.png',
            title: '重置登录密码',
        }
    ]);
    // 帮助中心列表
    const [helpCenterList, setHelpCenterList] = useState([
        {
            title: '新手帮助',
            icon: '/images/help_center/icon_user.png',
            buttonWord: '账户功能',
            alt: 'user',
        }
    ]);
    // 如果需要在主题切换时更新列表
    useEffect(() => {
        if (isClient) {
            const updatedList = helpCenterList.map(item => ({
                ...item,
                icon: isDayMode
                    ? item.icon.replace('_dark.png', '.png')
                    : item.icon.replace('.png', '_dark.png'),
            }));
            setHelpCenterList(updatedList);
        }
    }, [isDayMode, isClient]);
    // 搜索框
    const [searchValue, setSearchValue] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (!searchValue.trim()) {
                message.warning('请输入搜索内容');
                return;
            }
            setShowSearch(true);
        }
    };

    // 搜索图标
    const SearchIcon = <Image
        src={isDayMode
            ? "/images/help_center/icon_search.png"
            : "/images/help_center/icon_search_dark.png"
        }
        alt="search"
        width={18}
        height={18}
    />;
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
                            colorTextPlaceholder: 'var(--help-center-input-text)',
                            colorBorder: 'var(--border-color4)'
                        },
                        Button: {
                            defaultActiveColor: 'none',
                            defaultHoverColor: 'none',
                            defaultHoverBg: 'none',
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
                                <h1 style={{ color: 'var(--text-color5)', fontSize: 32, fontWeight: 600 }}>我们能帮您什么？</h1>
                            </Col>
                        </Row>
                        <Row style={{ marginTop: 16 }}>
                            <Col flex={1}>
                                <Input
                                    placeholder="请输入您的问题"
                                    prefix={SearchIcon}
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyDown={handleSearch}
                                    className={styles.input}
                                />
                            </Col>
                        </Row>
                        <Row align='middle'>
                            <Col>
                                <Row gutter={8} align='middle' style={{ marginTop: 10 }}>
                                    {
                                        historicalSearchList.map((text, index) => (
                                            <Col key={index}>
                                                <span style={{ color: 'var(--text-color6)', fontSize: 14 }}>
                                                    {text}
                                                </span>
                                            </Col>
                                        ))
                                    }
                                    <Col>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Image
                                                src={isClient && isDayMode
                                                    ? "/images/help_center/icon_delete.png"
                                                    : "/images/help_center/icon_delete_dark.png"
                                                }
                                                alt="delete" // 使用固定的 alt 文本
                                                width={16}
                                                height={16}
                                                style={{
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    top: '1px'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    {
                        showSearch ? <></> :
                            Array.isArray(configurationList) && configurationList.length > 0 && (
                                <ConfigurationCard configurationList={configurationList} />
                            )
                    }

                </div>
                {showSearch ? (
                    <SearchDetail searchValue={searchValue} />
                ) : (
                    <>
                        <HelpCenterSection
                            helpCenterList={helpCenterList || []}
                            onButtonClick={handleButtonClick}
                        />
                        <div className={`${styles.otherSupport} customCard`}>
                            <Row>
                                <Col>
                                    <h2 style={{ fontSize: 24, fontWeight: 500 }}>其他支持</h2>
                                </Col>
                            </Row>
                            <Row gutter={24} justify='space-between' align='middle' style={{ marginTop: 40 }}>
                                <Col span={12}>
                                    <Card style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color4)' }}>
                                        <Row>
                                            <Col>
                                                <h3 style={{ color: 'var(--text-color5)', fontSize: 20, fontWeight: 500 }}>在线沟通</h3>
                                            </Col>
                                        </Row>
                                        <Row style={{ marginTop: 20 }}>
                                            <Col>
                                                <p style={{ color: 'var(--text-color6)', fontSize: 14 }}>我们提供全天候服务，始终满足您的需求。</p>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card
                                        style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color4)' }}
                                        styles={{
                                            body: {
                                                padding: '20px'
                                            }
                                        }}
                                    >
                                        <Row>
                                            <Col>
                                                <h3 style={{ color: 'var(--text-color5)', fontSize: 20, fontWeight: 500 }}>通过电子邮件联系我们</h3>
                                            </Col>
                                        </Row>
                                        <Row style={{ marginTop: 20 }}>
                                            <Col>
                                                <Row align='middle' gutter={4}>
                                                    <Col>
                                                        <Image src="/images/help_center/icon_briefcase.png" alt="email" width={20} height={20} />
                                                    </Col>
                                                    <Col>
                                                        <span style={{ color: 'var(--text-color6)', fontSize: 14 }}>商户洽谈: 11123@qq.com</span>
                                                    </Col>
                                                </Row>
                                                <Row style={{ marginTop: 20 }} align='middle' gutter={4}>
                                                    <Col>
                                                        <Image src="/images/help_center/icon_auction.png" alt="email" width={20} height={20} />
                                                    </Col>
                                                    <Col>
                                                        <span style={{ color: 'var(--text-color6)', fontSize: 14 }}>法律合规: 123@qq.com</span>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </>
                )}
            </ConfigProvider>
        </div>
    )
}