import styles from './styles/helpCenter.module.css';
import ConfigurationCard from './components/ConfigurationCard';
import { useThemeMode } from '@/hooks/useThemeMode';
import HelpCenterSection from './components/HelperCenterSection';
import { HelpCenterItem, SearchCategory, CustomizationProps, HelpCenterMenuProps } from '@/type/help_center/hc_types';
import SearchDetail from './components/SearchDetail';
import { getCustomization, getHelpCenterMenu, getClassIdContent } from '@/services/helpCenter';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, Col, ConfigProvider, Empty, Input, message, Row } from 'antd';
import appStore from '@/store';
import { observer } from 'mobx-react-lite';
import { toast } from 'sonner';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

export default function HelpCenter() {
    const { t } = useTranslation('helpCenter');
    const lang = appStore.getLang();
    const [configContentHeight, setConfigContentHeight] = useState<number>(0);
    const [menuData, setMenuData] = useState<CustomizationProps[]>([]); // 配置列表
    const [initMenuData, setInitMenuData] = useState<HelpCenterMenuProps[]>([]); // 帮助中心菜单
    const [helpCenterMenuData, setHelpCenterMenuData] = useState<HelpCenterMenuProps[]>([]); // 帮助中心菜单

    // 日夜间判断
    const { isDayMode } = useThemeMode();
    // 添加客户端渲染标记
    const [isClient, setIsClient] = useState(false);

    // 历史搜索
    const [historicalSearchList] = useState(['永续合约', '期货合约', '期权合约']);

    // 搜索框输入值
    const [searchValue, setSearchValue] = useState('');
    // 搜索框显示状态
    const [showSearch, setShowSearch] = useState(false);
    // 搜索结果
    const [searchResults, setSearchResults] = useState<typeof initMenuData>([]);
    // 搜索事件
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // if (!searchValue.trim()) {
            //     toast.warning(t('helpCenter.search.placeholder'));
            //     return;
            // }

            // 搜索逻辑
            // const filteredResults = allData.filter(item =>
            //     item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            //     item.content.toLowerCase().includes(searchValue.toLowerCase())
            // );
            // setSearchResults(filteredResults);
            // setShowSearch(true);

            // 搜索帮助中心
            // const filteredResults = initMenuData.filter(item =>
            //     item.helpDescription.toLowerCase().includes(searchValue.toLowerCase()) ||
            //     item.articleTitle.toLowerCase().includes(searchValue.toLowerCase())
            // );

            // setHelpCenterMenuData(filteredResults);
            // setShowSearch(true);
        }
    };
    // 按钮点击事件
    const handleButtonClick = (item: HelpCenterItem) => {
        console.log(item);
    }
    // 递归排序函数
    const recursiveSort = (data: HelpCenterMenuProps[]): HelpCenterMenuProps[] => {
        return data.map(item => {
            if (item.children && item.children.length > 0) {
                return {
                    ...item,
                    children: recursiveSort(item.children)
                };
            }
            return item;
        }).sort((a, b) => a.helpSort - b.helpSort);
    };

    // 帮助中心菜单
    const getHelpCenterMenuData = async () => {
        const langName = lang || 'en_US'
        try {
            const res = await getHelpCenterMenu({ lang: langName });
            if (res.code === '0') {
                const sortedData = recursiveSort(res.data);
                setInitMenuData(sortedData)
                setHelpCenterMenuData(sortedData)
                // setHelpCenterMenuData([...sortedData, {
                //     id: 0,
                //     helpDescription: "账户管理",
                //     helpSort: 1,
                //     blackIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png",
                //     whiteIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar2.png",
                //     parentId: 0,
                //     contentId: "1",
                //     languageCode: "en-US",
                //     articleTitle: "Account Help",
                //     children: [
                //         {
                //             id: 1,
                //             helpDescription: "修改密码",
                //             helpSort: 10,
                //             blackIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png",
                //             whiteIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar2.png",
                //             parentId: 0,
                //             contentId: "1",
                //             languageCode: "en-US",
                //             articleTitle: "Account Help",
                //             children: []
                //         },
                //         {
                //             id: 1,
                //             helpDescription: "修改昵称",
                //             helpSort: 11,
                //             blackIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png",
                //             whiteIcon: "",
                //             parentId: 0,
                //             contentId: "1",
                //             languageCode: "en-US",
                //             articleTitle: "Account Help",
                //             children: []
                //         }
                //     ]
                // }]);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(String(error))
        }
    }
    // 自定义服务菜单
    const getMenuData = async () => {
        const langName = lang || 'en_US'
        try {
            const res = await getCustomization({ lang: langName });
            if (res.code === '0') {
                const sortedData = res.data.sort((a: CustomizationProps, b: CustomizationProps) => a.sort - b.sort);
                setMenuData(sortedData)
                // setMenuData([...sortedData, {
                //     id: 1,
                //     whiteIcon: "/images/help_center/icon_lock.png",
                //     blackIcon: "/images/help_center/icon_lock.png",
                //     accessType: 2,
                //     accessPath: "/custom-service",
                //     sort: 1,
                //     languageCode: "ja-JP",
                //     articleTitle: "修改密码",
                //     languagePath: "/userCenter"
                // }]);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(String(error))
        }
    }

    useEffect(() => {
        setIsClient(true);
    }, [lang]);
    useEffect(() => {
        getHelpCenterMenuData();
        getMenuData();
    }, []);
    // // 如果需要在主题切换时更新列表
    // useEffect(() => {
    //     if (isClient) {
    //         const updatedList = helpCenterList.map(item => ({
    //             ...item,
    //             icon: isDayMode
    //                 ? item.icon.replace('_dark.png', '.png')
    //                 : item.icon.replace('.png', '_dark.png'),
    //         }));
    //         setHelpCenterList(updatedList);
    //     }
    // }, [isDayMode, isClient]);
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
                <div className={`${styles.banner}`}>
                    <div className={styles.bannerContent}>
                        <Row>
                            <Col>
                                <h1 style={{ color: 'var(--text-color5)', fontSize: 32, fontWeight: 600 }}>{t('helpCenter.title')}</h1>
                            </Col>
                        </Row>
                        {/* 2025.5.26 */}
                        {/* <Row style={{ marginTop: 16 }}>
                            <Col flex={1}>
                                <Input
                                    placeholder={t('helpCenter.search.placeholder')}
                                    prefix={<Image
                                        src={isDayMode
                                            ? "/images/help_center/icon_search.png"
                                            : "/images/help_center/icon_search_dark.png"
                                        }
                                        alt="search"
                                        width={18}
                                        height={18}
                                    />}
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyDown={handleSearch}
                                    className={styles.input}
                                />
                            </Col>
                        </Row> */}
                        {/* <Row align='middle'>
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
                        </Row> */}
                    </div>
                    {
                        showSearch ? <></> :
                            Array.isArray(menuData) && menuData.length > 0 && (
                                <ConfigurationCard
                                    configurationList={menuData}
                                    onHeightChange={setConfigContentHeight}
                                />
                            )
                    }
                </div>
                <HelpCenterSection
                    helpCenterList={helpCenterMenuData}
                    flag={menuData.length > 0}
                    // onButtonClick={handleButtonClick}
                    configContentHeight={configContentHeight}
                />
                <div className={`${styles.otherSupport} customCard`}>
                    <Row>
                        <Col>
                            <h2 style={{ fontSize: 24, fontWeight: 500 }}>{t('helpCenter.otherSupport.title')}</h2>
                        </Col>
                    </Row>
                    <Row gutter={24} justify='space-between' align='middle' style={{ marginTop: 40 }}>
                        <Col span={12}>
                            <Card style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color4)' }}>
                                <Row>
                                    <Col>
                                        <h3 style={{ color: 'var(--text-color5)', fontSize: 20, fontWeight: 500 }}>{t('helpCenter.otherSupport.onlineCommunication.title')}</h3>
                                    </Col>
                                </Row>
                                <Row style={{ marginTop: 20 }}>
                                    <Col>
                                        <p style={{ color: 'var(--text-color6)', fontSize: 14 }}>{t('helpCenter.otherSupport.onlineCommunication.description')}</p>
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
                                        <h3 style={{ color: 'var(--text-color5)', fontSize: 20, fontWeight: 500 }}>{t('helpCenter.otherSupport.email.title')}</h3>
                                    </Col>
                                </Row>
                                <Row style={{ marginTop: 20 }}>
                                    <Col>
                                        <Row align='middle' gutter={4}>
                                            <Col>
                                                <Image src="/images/help_center/icon_briefcase.png" alt="email" width={20} height={20} />
                                            </Col>
                                            <Col>
                                                <span style={{ color: 'var(--text-color6)', fontSize: 14 }}>{t('helpCenter.otherSupport.email.business')}</span>
                                            </Col>
                                        </Row>
                                        <Row style={{ marginTop: 20 }} align='middle' gutter={4}>
                                            <Col>
                                                <Image src="/images/help_center/icon_auction.png" alt="email" width={20} height={20} />
                                            </Col>
                                            <Col>
                                                <span style={{ color: 'var(--text-color6)', fontSize: 14 }}>{t('helpCenter.otherSupport.email.legal')}</span>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>

            </ConfigProvider>
        </div>

    )
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'en', ['common', 'helpCenter'])),
        },
    };
};