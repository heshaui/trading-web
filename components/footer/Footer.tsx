import styles from '@/styles/components/Footer.module.css';
import { useLogoImage } from '@/services/webLogo'; // 获取logo
import { ApiResponse, FooterListProps, FormattedLanguage, LanguageParams } from "@/type/types";

import { Button, Col, ConfigProvider, Dropdown, Row } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getCustomFooter, getLogo, getSocialMediaList } from '@/services/footer';
import { getLanguage } from '@/services/header';

interface FooterSetting {
    statu: string;
    // 添加其他可能的字段
}
interface FooterItem {
    bottomName: string;
    children?: FooterItem[];
}
interface CustomFooterResponse {
    code: string;
    message: string;
    reqNo: string;
    data: FooterItem[];  // 直接是数组类型，不是字符串
}
// 添加社交媒体项的接口
interface SocialMediaItem {
    id: number;
    nameText: string;
    imgUrl: string;
    linkUrl: string;
    status: number;
    createTime: number;
    updateTime: number;
    tenantId: string;
}

export default function Footer() {
    // 添加状态管理选中的语言
    const [selectedLang, setSelectedLang] = useState('简体中文');
    // 获取logo
    const { logoUrl, setLogoUrl } = useLogoImage('/home_menu_logo.png');
    // 获取footer自定义数据
    const [footerSetting, setFooterSetting] = useState<FooterSetting | null>(null);
    const [customFooter, setCustomFooter] = useState<FooterItem[]>([]);
    // 语言
    const [languageList, setLanguageList] = useState<FormattedLanguage[]>([]); // 用于存储语言数据
    // 添加社交媒体列表状态
    const [socialMediaList, setSocialMediaList] = useState<SocialMediaItem[]>([]);

    useEffect(() => {
        const fetchFooterSetting = async () => {
            try {
                const response = await getLogo({ key: 'footer_setting' }) as ApiResponse<string>;
                if (response?.data) {
                    const fixedJsonString = response.data.replace(/([{,]\s*)([a-zA-Z0-9_]+):/g, '$1"$2":')
                        .replace(/:\s*'([^']*?)'/g, ':"$1"');
                    const parsedData = JSON.parse(fixedJsonString) as FooterSetting;
                    setFooterSetting(parsedData);
                    // console.log('footerSetting', parsedData);

                    // 如果 statu 为 '1'，获取自定义 footer 数据
                    if (parsedData.statu === '1') {
                        const customResponse = await getCustomFooter({ lang: 'zh_CN' }) as CustomFooterResponse;
                        if (customResponse?.data?.length > 0) {
                            setCustomFooter(customResponse.data);
                        }
                    }
                }

                // 获取语言数据
                const languageResponse = await getLanguage({
                    lang: '',
                }) as ApiResponse<LanguageParams[]>;
                if (languageResponse?.code === '0' && languageResponse.data) {
                    const formattedLanguageData = languageResponse.data.map((item, index) => ({
                        label: `${item.lang}`,
                        key: `${String(index + 1)}`
                    }));
                    setLanguageList(formattedLanguageData);
                }

                // 获取社交媒体列表
                const socialMediaResponse = await getSocialMediaList() as ApiResponse<SocialMediaItem[]>;
                if (socialMediaResponse?.code === '0' && socialMediaResponse.data) {
                    // 只显示状态为1的社交媒体
                    const activeMediaList = socialMediaResponse.data.filter(item => item.status === 1);
                    setSocialMediaList(activeMediaList);
                }
            } catch (error) {
                console.error('获取footer设置失败:', error);
            }
        };

        fetchFooterSetting();
    }, []);

    // const itemsLan = languageList.length > 0 ? languageList :  [
    //     {
    //         label: '简体中文',
    //         key: '1',
    //     },
    //     {
    //         label: 'English',
    //         key: '2',
    //     },
    // ];

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
                setSelectedLang(selectedItem.label || '');
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

    const renderCustomFooter = () => {
        if (customFooter.length > 0) {
            return customFooter.map((item, index) => (
                <div key={index}>
                    {renderFooterList({
                        title: item.bottomName,
                        items: item.children?.map(child => child.bottomName) || []
                    })}
                </div>
            ));
        }

        // 默认 footer
        return (
            <>
                {renderFooterList({ title: "关于IMBIT", items: aboutIMBIT })}
                {renderFooterList({ title: "产品", items: products })}
                {renderFooterList({ title: "帮助中心", items: helpCenter })}
                {renderFooterList({ title: "法律与风险披露", items: legalAndRisk })}
            </>
        );
    };
    // 渲染社交媒体图标
    const renderSocialMediaIcons = () => {
        if (socialMediaList.length === 0) {
            // 如果没有社交媒体数据，显示默认的Discord图标
            return (
                <Col style={{ marginBottom: '10px' }} span={6}>
                    <Image
                        src="/images/footer/icon_discord.png"
                        alt=''
                        width={20}
                        height={20}
                    />
                </Col>
            );
        }

        // 渲染从API获取的社交媒体图标
        return socialMediaList.map((item, index) => (
            <Col key={item.id || index} style={{ marginRight: '12px' }}>
                <a href={item.linkUrl} target="_blank" rel="noopener noreferrer">
                    <Image
                        src={item.imgUrl}
                        alt={item.nameText || '社交媒体'}
                        width={20}
                        height={20}
                    />
                </a>
            </Col>
        ));
    };
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
                    <Row>
                        <Col><h6 style={{ color: '#FFFFFF', fontSize: 12 }}>社区</h6></Col>
                    </Row>
                    <Row align='middle' style={{ marginTop: '10px' }}>
                        {renderSocialMediaIcons()}
                    </Row>
                    <Dropdown
                        menu={{
                            items: itemsLan,
                            onClick: ({ key }: { key: string }) => {
                                // 根据选中项的key更新显示的语言
                                const selectedItem = itemsLan.find(item => item.key === key);
                                if (selectedItem) {
                                    setSelectedLang(selectedItem.label || '');
                                }
                            }
                        }}
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
                                            <span style={{ fontSize: '12px', color: '#FFFFFF' }}>{selectedLang}</span>
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
                    <div style={{ marginTop: '10px' }}></div>
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
                                            <span style={{ fontSize: '12px', color: '#FFFFFF' }}>下载APP</span>
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
                    {renderCustomFooter()}
                </div>
            </div>
        </ConfigProvider>
    )
}