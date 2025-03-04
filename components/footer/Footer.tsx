import styles from '@/styles/components/Footer.module.css';
import { useLogoImage } from '@/hooks/webLogo'; // 获取logo
import { FooterListProps } from "@/type/types";

import { Button, Col, ConfigProvider, Dropdown, Row } from 'antd';
import Image from 'next/image';
import { useState } from 'react';


export default function Footer() {
    // 添加状态管理选中的语言
    const [selectedLang, setSelectedLang] = useState('简体中文');
    // 获取logo
    const { logoUrl, setLogoUrl } = useLogoImage('/home_menu_logo.png');
    const itemsLan = [
        {
            label: '简体中文',
            key: '1',
        },
        {
            label: 'English',
            key: '2',
        },
    ];
    const itemsDownLoad = [
        {
            label: (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <h5>扫码下载APP</h5>
                    {/* <img src="/images/home_menu/QR_code.png" /> */}
                    <Image
                        src="/images/home_menu/QR_code.png"
                        alt=""
                        width={100}  // 必须指定宽度
                        height={100} // 必须指定高度
                    />
                </div>
            ),
            key: '1',
        },
    ];
    // 语言选择菜单
    const menuProps1 = {
        items: itemsLan,
        onClick: ({ key }: { key: string }) => {
            // 根据选中项的key更新显示的语言
            const selectedItem = itemsLan.find(item => item.key === key);
            if (selectedItem) {
                setSelectedLang(selectedItem.label);
            }
        }
    };
    const menuProps2 = {
        items: itemsDownLoad,
    };

    const aboutIMBIT = [
        "关于我们",
        "加入我们",
        "客服邮箱",
        "商务合作",
        "上币申请",
        "投诉举报"
    ];

    const products = [
        "现货交易",
        "快速兑换",
        "C2C",
        "M积分",
        "质押算力",
        "存币生息"
    ];

    const helpCenter = [
        "新手指南",
        "常见问题",
        "交易指南",
        "币种资料",
        "平台公告"
    ];

    const legalAndRisk = [
        "免责条款",
        "隐私条款",
        "用户协议",
        "资费说明",
        "反洗钱政策",
        "风险提示"
    ];

    function renderFooterList({ title, items }: FooterListProps) {
        return (
            <div className={styles.footerList}>
                <h5>{title}</h5>
                <ul>
                    {items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        );
    }
    return (
        <ConfigProvider
            theme={{
                components: {
                    Button: {
                        defaultBg: 'inherit',
                        defaultColor: 'inherit',
                        contentFontSize: 12,
                        paddingInline: 0,
                        defaultHoverBg: 'inherit',
                        defaultHoverColor: 'inherit',
                        defaultBorderColor: 'inherit',
                        defaultHoverBorderColor: 'inherit',
                        defaultActiveBg: 'inherit',
                        defaultActiveColor: 'inherit',
                        defaultActiveBorderColor: 'inherit',

                    },
                    Dropdown: {
                        fontSize: 12,
                    }
                },
            }}
        >
            <div className={styles.footerContainer}>
                <div className={styles.logoAndButton}>
                    <div className={styles.logo}>
                        <Image
                            src={logoUrl}
                            alt=""
                            width={126}  // 必须指定宽度
                            height={30} // 必须指定高度
                            onError={() => setLogoUrl('/home_menu_logo.png')} // 图片加载失败时使用默认值
                        />
                    </div>
                    <p>©2023 - 2024 MetaWave.</p>
                    <Dropdown
                        menu={menuProps1}
                        trigger={['click']}
                    >
                        <Button>
                            <Row justify='space-between' align='middle' gutter={32}>
                                <Col>
                                    <Row align='middle' gutter={4}>
                                        <Col>
                                            <Image
                                                src="/images/footer/icon_earth_line.png"
                                                alt=''
                                                width={20}
                                                height={20}
                                            />
                                        </Col>
                                        <Col>
                                            <span style={{ fontSize: '12px' }}>{selectedLang}</span>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    <Image
                                        src="/images/footer/icon_down_line.png"
                                        alt=''
                                        width={20}
                                        height={20}
                                    />
                                </Col>
                            </Row>
                        </Button>
                    </Dropdown>
                    <div style={{ marginTop: '20px' }}></div>
                    <Dropdown
                        menu={menuProps2}
                        trigger={['click']}
                    >
                        <Button>
                            <Row justify='start' align='middle' gutter={32}>
                                <Col>
                                    <Row align='middle' gutter={4}>
                                        <Col>
                                            <Image
                                                src="/images/footer/icon_download_line.png"
                                                alt=''
                                                width={20}
                                                height={20}
                                            />
                                        </Col>
                                        <Col>
                                            <span style={{ fontSize: '12px' }}>下载APP</span>
                                        </Col>
                                    </Row>
                                </Col>
                                {/* 占位 */}
                                <Col>
                                    <div style={{ width: '20px', height: '20px' }}></div>
                                </Col>
                            </Row>
                        </Button>
                    </Dropdown>
                </div>
                <div className={styles.footer}>
                    {renderFooterList({ title: "关于IMBIT", items: aboutIMBIT })}
                    {renderFooterList({ title: "产品", items: products })}
                    {renderFooterList({ title: "帮助中心", items: helpCenter })}
                    {renderFooterList({ title: "法律与风险披露", items: legalAndRisk })}
                </div>
            </div>
        </ConfigProvider>
    )
}