import styles from './styles/Footer.module.css';
import { useLogoImage } from '@/hooks/useKv'; // 获取logo
import { ApiResponse, FooterListProps, FormattedLanguage, LanguageParams, FooterProps } from "@/type/types";

import { Button, Col, ConfigProvider, Dropdown, Row } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getCustomFooter, getLogo, getSocialMediaList, getSelectFooter } from '@/services/footer';
import { getLanguage } from '@/services/header';
import { useWebConfig } from '@/hooks/useKv';
import appStore from '@/store';
import { useRouter } from 'next/router';
import { LOCAL_STORAGE_KEY } from '@/config/apiConfig';
import { useTranslation } from 'next-i18next';
import { transformDOMPurify } from "@/utils/transformDOMPurify"

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
    const { t, i18n } = useTranslation('footer');
    const langKey = appStore.getLang() || 'en_US';
    const allConfig = appStore.getKvConfigAll();
    const footerConfig = appStore.getKvConfig('footer_setting');
    const languageList = appStore.getLangList();
    const router = useRouter()
    // 获取footer自定义数据
    const [customFooter, setCustomFooter] = useState<FooterProps[]>([]);
    const [selectFooter, setSelectFooter] = useState<string | null>(null);

    // 使用现有的 useWebConfig hook 获取所有配置
    const { loading } = useWebConfig();

    // 添加状态管理选中的语言
    const [selectedLang, setSelectedLang] = useState('简体中文');
    // 获取logo
    const { logoUrl, setLogoUrl } = useLogoImage('/home_menu_logo.png');

    // 语言
    // const [languageList, setLanguageList] = useState<FormattedLanguage[]>([]); // 用于存储语言数据
    // 添加社交媒体列表状态
    const [socialMediaList, setSocialMediaList] = useState<SocialMediaItem[]>([]);

    // 获取社交媒体列表
    const fetchSocialMedia = async () => {
        try {
            const response = await getSocialMediaList()
            if (response?.code === '0' && response.data) {
                setSocialMediaList(response.data);
            }
        } catch (error) {
            console.error('获取社交媒体列表失败:', error);
        }
    };

    // 获取 footer 设置
    const fetchFooterSetting = async () => {
        try {
            if (footerConfig?.status === '1' || footerConfig.toString() === '1') {
                // kv为1
                getSelectFooterJson()

            } else {
                // json
                getCustomFooterJson()
            }
        } catch (error) {
            console.error('获取footer设置失败2:', error);
        }
    };
    const getCustomFooterJson = async () => {
        try {
            const res = await getCustomFooter({ lang: langKey })
            // console.log(res.data, 111);

            if (res.code === '0' && res.data) {
                const filteredData = filterFooterList(res.data);
                setCustomFooter(filteredData);
            }
        } catch (error) {
            console.error('获取footer设置失败0:', error);
        }
    };
    const getSelectFooterJson = async () => {
        try {
            const res = await getSelectFooter({ lang: langKey });

            if (res?.code === '0' && res.data) {
                const htmlString = transformDOMPurify(res.data);
                // 设置净化后的 HTML
                setSelectFooter(htmlString);
                // console.log('转换后的 HTML:', htmlString);
            }
        } catch (error) {
            console.error('获取社交媒体列表失败1:', error);
        }
    }
    const filterFooterList = (list: FooterProps[]): FooterProps[] => {
        return list
            .filter(item => item.show === 1)
            .map(item => ({
                ...item,
                children: item.children ? filterFooterList(item.children) : undefined
            }));
    };

    useEffect(() => {
        fetchSocialMedia();
    }, []);

    useEffect(() => {
        if (allConfig) {
            fetchFooterSetting()
            setSelectedLang(languageList.find(item => item.key.includes(i18n.language))?.span || i18n.language);
        }
    }, [allConfig, langKey, languageList])


    const setLangChange = async (key: string) => {
        const selectedItem = languageList.find(item => item.key === key);
        if (selectedItem) {
            try {
                // 保存选中的语言到状态和本地存储
                setSelectedLang(selectedItem.span || '');
                localStorage.setItem('lang', key);
                localStorage.setItem('selectedLanguage', selectedItem.span || '');

                // 清除缓存
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith('cached')) {
                        localStorage.removeItem(k);
                    }
                });

                // 添加时间戳使缓存失效
                localStorage.setItem('cacheInvalidationTimestamp', Date.now().toString());

                // 设置语言
                appStore.setLang(key);

                // 处理 i18n
                if (typeof i18n.changeLanguage === 'function') {
                    await i18n.changeLanguage(key.split('-')[0]);
                }

                // 设置 i18next 语言
                // localStorage.setItem('i18nextLng', key.split('-')[0]);

                // 刷新相关数据
                await fetchFooterSetting();

                // 处理 Next.js locale
                let nextLocale = 'en';
                if (key.startsWith('zh')) {
                    nextLocale = 'zh';
                } else if (key.startsWith('ja')) {
                    nextLocale = 'ja';
                } else if (key.startsWith('ko')) {
                    nextLocale = 'ko';
                }

                // 使用 Next.js 路由更新 locale
                const { pathname, asPath, query } = router;
                await router.push({ pathname, query }, asPath, { locale: nextLocale });

            } catch (error) {
                console.error('语言切换失败:', error);
            }
        }
    }

    // const itemsLan = [
    //     {
    //         label: '简体中文',
    //         key: '1',
    //     },
    //     {
    //         label: 'English',
    //         key: '2',
    //     },
    // ];
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
    // const menuProps1 = {
    //     items: itemsLan,
    //     onClick: ({ key }: { key: string }) => {
    //         // 根据选中项的key更新显示的语言
    //         const selectedItem = itemsLan.find(item => item.key === key);
    //         if (selectedItem) {
    //             setSelectedLang(selectedItem.label || '');
    //         }
    //     }
    // };
    const menuProps2 = {
        items: itemsDownLoad,
    };
    const goLink = (url: string) => {
        if (url.startsWith('http')) {
            window.open(url, '_blank', 'noopener');
        } else {
            router.push(url);
        }

    }
    function renderFooterList({ title, items }: FooterListProps) {
        return (
            <div className={`${styles.footerList}`} >
                <h5 className='tip-color'>{title || '--'}</h5>
                <ul>
                    {items.map((item, index) => (
                        <li key={index}>
                            <button onClick={() => goLink(item.accessPath)}>
                                {item.bottomName || '--'}
                            </button>

                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    const renderCustomFooter = () => {
        if (customFooter?.length > 0) {
            return customFooter.map((item, index) => (
                <div key={index} className={`flex-1`}>
                    {/* {renderFooterList({
                        title: item.bottomName,
                        items: item.children || []
                    })} */}
                    <div className={`${styles.footerList}`} >
                        <h5 className='tip-color'>{item.bottomName || '--'}</h5>
                        <ul>
                            {item.children?.map((childItem, index) => (
                                <li key={index}>
                                    <button onClick={() => goLink(childItem.accessPath)}>
                                        {childItem.bottomName || '--'}
                                    </button>

                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ));
        }
    };
    // 渲染社交媒体图标
    const renderSocialMediaIcons = () => {
        // 渲染从API获取的社交媒体图标
        // if (socialMediaList.length === 0) {
        //     // 如果没有社交媒体数据，显示默认的Discord图标
        //     return (
        //         <Col style={{ marginBottom: '10px' }} span={6}>
        //             <Image
        //                 src="/images/footer/icon_discord.png"
        //                 alt=''
        //                 width={20}
        //                 height={20}
        //             />
        //         </Col>
        //     );
        // }

        return socialMediaList.map((item, index) => (
            <Col key={item.id || index} style={{ marginBottom: '6px' }} className='mr-3 mt-2_5' >
                <button onClick={() => goLink(item.linkUrl)}>
                    <Image
                        src={item.imgUrl}
                        alt={item.nameText || '社交媒体'}
                        width={20}
                        height={20}
                    />
                </button>
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
            <div className={styles.footerContainer} style={{ borderTop: '0.5px solid #37373A' }}>
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
                    <p suppressHydrationWarning>{`©2023 - 2024 ${allConfig?.tenant_cache_name || ''}.`}</p>
                    <Row className='mt-3'>
                        <Col><h6 style={{ color: '#FFFFFF', fontSize: 12 }}>社区</h6></Col>
                    </Row>
                    <Row align='middle' className='mb-2'>
                        {renderSocialMediaIcons()}
                    </Row>
                    <Dropdown
                        menu={{
                            items: languageList.map(item => ({
                                ...item,
                                label: item.span,
                                key: item.key,
                            })),
                            onClick: ({ key }: { key: string }) => {
                                setLangChange(key);
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
                <div className={`${styles.footer} flex-x`} suppressHydrationWarning>
                    {footerConfig && footerConfig.toString() === '0' ? renderCustomFooter() :
                        (
                            <div
                                // style={{ color: 'pink' }}
                                dangerouslySetInnerHTML={{ __html: selectFooter || '' }}
                            />
                        )
                    }
                </div>
            </div>
        </ConfigProvider>
    )
}