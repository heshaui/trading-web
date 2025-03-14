import styles from '@/styles/components/HomeMenu.module.css';
// import { DownOutlined, SmileOutlined, SearchOutlined, QuestionCircleOutlined, DownloadOutlined, BellOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
// import { QuestionCircleOutlined, DownloadOutlined, BellOutlined, GlobalOutlined } from '@ant-design/icons';
// import { Dropdown, Space, Input, Button, Menu, Avatar, ConfigProvider, Row, Col, Drawer, Empty, MenuProps } from 'antd';
import { Dropdown, Space, Button, Avatar, ConfigProvider, Row, Col, Drawer, Empty, Tabs, TabsProps, } from 'antd';
import { MenuProps } from 'antd';
import MenuItem from './HomeMenuItems'; // 顶部菜单
import MenuAdaptiveItem from './HomeMenuAdapiveItems'; // 自适应时顶部菜单变为侧边栏菜单
import MenuItemLabel from './HomeMenuLabel';
import MenuItemChildrenLabel from './HomeMenuChildrenLabel';
import TabsItem from './TabsItem';
import { MenuListItem, HomeMenuProps, IconName, TabsItemData, menuType, LanguageParams, ApiResponse, FormattedLanguage } from '@/type/types';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import store from "@/store"
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';

import { exchangeRate, homeMenu, getLanguage } from '@/services/header'; // 引入封装好的 homeMenu 方法
// import { encryptWithPublicKey } from '@/utils/jsENcrypy'; // 引入加密方法
import { useLogoImage } from '@/services/webLogo'; // 获取logo
import { useDayModeChange } from '@/hooks/dayModeChange'; // 使用 hook
import { getBulletinMessage } from '@/services/bulletinCenter';

export default function HomeMenu() {
    // 路由
    const router = useRouter();

    // t - 多语言
    const { t, i18n } = useTranslation('home_menu');
    // 添加调试日志
    // console.log('Current language:', i18n.language);
    // console.log('Router locale:', router.locale);
    // console.log('Translation test:', t('title_1_1_h5'));

    // 是否登录
    const [isLogin, setIsLogin] = useState<boolean>(false);
    // 获取logo
    const { logoUrl, setLogoUrl } = useLogoImage('/home_menu_logo.png');
    // 请求导航栏数据
    const [menuData, setMenuData] = useState<any>(null); // 用于存储请求到的菜单数据
    const [menus, setMenus] = useState<MenuListItem[]>([]); // 用于存储菜单项
    const [adaptiveMenuData, setAdaptiveMenuData] = useState<MenuListItem[]>([]); // 用于 HomeMenuAdaptiveItems 的数据
    // 语言
    const [languageList, setLanguageList] = useState<FormattedLanguage[]>([]); // 用于存储语言数据
    // 汇率菜单
    const [rateData, setRateData] = useState<any[]>([]); // 用于存储汇率数据
    // 语言
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        // 检查是否在浏览器环境
        if (typeof window !== 'undefined') {
            // 从localStorage获取已保存的语言设置
            const savedLanguage = localStorage.getItem('selectedLanguage');
            if (savedLanguage) return savedLanguage;

            // 获取系统语言
            const systemLang = navigator.language.toLowerCase();
            return systemLang.includes('zh') ? '简体中文' : 'English';
        }

        // 服务器端渲染时的默认值
        return '简体中文';
    });
    // 使用 hook
    const { isDayMode, toggleTheme } = useDayModeChange(); // 使用 hook
    // 渲染主题切换图标
    const renderThemeIcon = () => {
        return (
            <Col onClick={toggleTheme} style={{ cursor: 'pointer' }}>
                <Image
                    src={
                        isDayMode
                            ? "/images/home_menu/icon_sun_fill.png"
                            : "/images/home_menu/icon_moon_line.png"
                    }
                    alt={isDayMode ? '日间模式' : '夜间模式'}
                    width={20}
                    height={20}
                />
            </Col>
        );
    };
    // 添加公告数据状态
    const [bulletinData, setBulletinData] = useState<any[]>([]);

    // 统一初始化数据
    const initializeData = async (currentLang: string) => {
        try {
            // 检查登录状态
            const token = localStorage.getItem('userToken');
            setIsLogin(!!token);

            // 获取菜单数据
            const menuResponse = await homeMenu({ lang: currentLang }) as { data: any[] };
            if (menuResponse?.data) {
                setMenuData(menuResponse);
                setMenus(formatMenus(menuResponse.data.slice(0, 6)));
                setAdaptiveMenuData(formatAdaptiveMenus(menuResponse.data));
            }

            // 获取公告数据
            // const bulletinResponse = await getBulletinMessage({
            //     languageCode: currentLang
            // }) as ApiResponse<any>;

            // if (bulletinResponse?.code === '0' && bulletinResponse.data?.list) {
            //     // 格式化公告数据
            //     const formattedBulletinData = bulletinResponse.data.list.map((item: any) => ({
            //         h5Text: item.title,
            //         spanText: dayjs(item.releaseTime).format('YYYY/MM/DD HH:mm:ss')
            //     }));
            //     setBulletinData(formattedBulletinData);
            // }

            // 获取语言数据
            const languageResponse = await getLanguage({
                lang: '',
            }) as ApiResponse<LanguageParams[]>;

            if (languageResponse?.code === '0' && languageResponse.data) {
                const formattedLanguageData = languageResponse.data.map(item => ({
                    span: `${item.lang}`,
                    key: `${item.langEncode}`
                }));
                setLanguageList(formattedLanguageData);
            }

            // 获取汇率数据
            const rateResponse = await exchangeRate({
                id: 0,
                shortName: "",
                status: 1
            }) as { data: any[] };
            if (rateResponse?.data) {
                const formattedRateData = rateResponse.data.map(item => ({
                    span: `${item.shortName} - ${item.symbol}`
                }));
                setRateData(formattedRateData);
            }
        } catch (error) {
            console.error('数据初始化失败:', error);
        }
    };
    // 首次加载时初始化数据
    useEffect(() => {
        const lang = localStorage.getItem('lang') || 'zh_CN';
        initializeData(lang);
    }, []);

    // 格式化菜单
    function formatMenus(menuData: any[]): MenuListItem[] {
        return menuData.map(menu => {
            // 检查图片 URL 是否为本地路径
            const getImagePath = (url: string, isDay: boolean) => {
                // 如果没有URL，返回默认图片
                if (!url) return '/images/home_menu/Avatar.png';

                try {
                    // 如果是完整的 URL，直接返回
                    if (url.startsWith('http')) {
                        return url;
                    }

                    // 如果已经是本地路径，检查格式是否正确
                    if (!url.startsWith('/')) {
                        // 如果不是以/开头，添加/
                        return `/${url}`;
                    }

                    // 返回有效的本地路径
                    return url;
                } catch (error) {
                    console.error('处理图片路径时出错:', error);
                    return '/images/home_menu/Avatar.png'; // 出错时返回默认图片
                }
            };

            // 基本菜单项结构
            const menuItem = {
                key: String(menu.id),
                title: menu.menuName,
                linkHref: menu.accessPath,
                items: [] as any[]
            };

            // 处理二级菜单
            if (menu.children && menu.children.length > 0) {
                menuItem.items = menu.children.map((child: any) => {
                    // 二级菜单项
                    const secondLevelItem = {
                        key: String(child.id),
                        type: child.typeId === 1 ? 'group' : (child.typeId === 2 ? 'item' : 'divider'),
                        label: (
                            <MenuItemLabel
                                src={getImagePath(isDayMode ? child.iconUrlDay : child.iconUrlNight, isDayMode)}
                                h5Text={child.menuName || ''}
                                spanText={child.menuViceName || ''}
                                isNew={child.cornerMarkOne === '新' || child.cornerMarkTwo === '新'}
                            />
                        ),
                        children: [] as any[]
                    };

                    // 处理三级菜单
                    if (child.children && child.children.length > 0) {
                        secondLevelItem.children = child.children.map((grandChild: any) => ({
                            key: String(grandChild.id),
                            type: grandChild.typeId === 1 ? 'group' : (grandChild.typeId === 2 ? 'item' : 'divider'),
                            label: (
                                <MenuItemLabel
                                    src={getImagePath(isDayMode ? grandChild.iconUrlDay : grandChild.iconUrlNight, isDayMode)}
                                    h5Text={grandChild.menuName || ''}
                                    spanText={grandChild.menuViceName || ''}
                                    isNew={grandChild.cornerMarkOne === '新' || grandChild.cornerMarkTwo === '新'}
                                />
                            )
                        }));
                    }

                    return secondLevelItem;
                });
            } else {
                // 如果没有子菜单，创建一个默认项
                menuItem.items = [{
                    key: String(menu.id),
                    type: menu.typeId === 1 ? 'group' : (menu.typeId === 2 ? 'item' : 'divider'),
                    label: (
                        <MenuItemLabel
                            src={getImagePath(isDayMode ? menu.iconUrlDay : menu.iconUrlNight, isDayMode)}
                            h5Text={menu.menuName || ''}
                            spanText={menu.menuViceName || ''}
                            isNew={menu.cornerMarkOne === '新' || menu.cornerMarkTwo === '新'}
                        />
                    ),
                }];
            }

            return menuItem;
        });
    }

    // 新增格式化函数，按 HomeMenuAdaptiveItems 的 items 数据结构封装
    function formatAdaptiveMenus(menuData: any[]): MenuListItem[] {
        return menuData.map(menu => {
            return {
                key: String(menu.id),
                title: menu.menuName || menu.menuDescription, // 根据实际需求选择字段
                linkHref: menu.accessPath,
                items: (menu.children || []).length > 0
                    ? menu.children.map((child: any) => ({
                        key: String(child.id),
                        type: 'item',
                        label: (
                            <MenuItemLabel
                                src={child.iconUrlDay || "/images/home_menu/Avatar.png"}
                                h5Text={child.menuName || child.menuDescription}
                                spanText={child.menuViceName || ''}
                            />
                        )
                    }))
                    : [{
                        key: String(menu.id),
                        type: 'item',
                        label: (
                            <MenuItemLabel
                                // src={menu.iconUrlDay || "/images/home_menu/Avatar.png"}
                                src="/images/home_menu/Avatar.png"
                                h5Text={menu.menuName || menu.menuDescription}
                                spanText={menu.menuViceName || ''}
                            />
                        )
                    }]
            };
        });
    }

    // 退出登录
    const handleLogout = () => {
        setIsLogin(false);
        store.clearUserToken();  // 清除 token
        router.push('/login');
    };

    // const items = [
    //     {
    //         key: '1',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/Group (3).png" h5Text="我的资产" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '2',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon-Make up money.png" h5Text="充币" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '3',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon-Withdraw currency.png" h5Text="提币" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '4',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_refresh.png" h5Text="资金划转" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '5',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_presentation.png" h5Text="资产分析" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '6',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_Order for goods.png" h5Text="订单中心" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '7',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_sale.png" h5Text="我的手续费" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '8',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_Certificate.png" h5Text="储备金证明报告" spanText="" />
    //         ),
    //     }
    // ];
    // 资产 - 2版
    const itemsFunding = [
        {
            key: '1',
            label: (
                <MenuItemLabel src="/images/home_menu/icon_coin_line.png" h5Text="我的资产" spanText="" />
            ),
        },
        {
            key: '2',
            label: (
                <MenuItemLabel src="/images/home_menu/icon_deposit.png" h5Text="充币" spanText="" />
            ),
        },
        {
            key: '3',
            label: (
                <MenuItemLabel src="/images/home_menu/icon_cash.png" h5Text="提币" spanText="" />
            ),
        },
        {
            key: '4',
            label: (
                <MenuItemLabel src="/images/home_menu/icon_bill_line.png" h5Text="账单明细" spanText="" />
            ),
        }
    ];
    // const moreItems = [
    //     {
    //         key: '1',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/Group (2).png" h5Text="活动中心" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '2',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_trophy.png" h5Text="我的奖励" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '3',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_invite.png" h5Text="邀请好友" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '4',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_sitemap.png" h5Text="节点计划" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '5',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_plugin.png" h5Text="IMBIT ventures" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '6',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon-Trading.png" h5Text="使用 TradingView 交易" spanText="" />
    //         ),
    //     },
    //     {
    //         key: '7',
    //         label: (
    //             <MenuItemLabel src="/images/home_menu/icon_file_upload.png" h5Text="上币申请" spanText="" />
    //         ),
    //     },
    // ];
    // const UserIcon = () => <UserOutlined style={{ marginLeft: '12px', fontSize: '16px', cursor: 'pointer', color: '#ffffff' }} />;
    const userItems = [
        {
            key: '1',
            type: 'item',
            label: (
                <MenuItemLabel src='/images/home_menu/icon_layout_line.png' h5Text="总览" />
            ),
        },
        {
            key: '2',
            type: 'item',
            label: (
                <MenuItemLabel src='/images/home_menu/icon_user.png' h5Text="个人资料" />
            ),
        },
        {
            key: '3',
            type: 'item',
            label: (
                <MenuItemLabel src='/images/home_menu/icon_safety_certificate_line.png' h5Text="安全中心" />
            ),
        },
        {
            key: '4',
            type: 'item',
            label: (
                <MenuItemLabel src='/images/home_menu/icon_IDcard_line.png' h5Text="身份认证" />
            ),
        },
        {
            key: '5',
            type: 'item',
            label: (
                <MenuItemLabel src='/images/home_menu/icon_world.png' h5Text="国家/地区" />
            ),
        },
        {
            key: '6',
            type: 'item',
            label: (
                <MenuItemLabel src='/images/home_menu/icon_settings.png' h5Text="偏好设置" />
            ),
        },
        {
            key: '7',
            type: 'item',
            label: (
                <MenuItemLabel src='/images/home_menu/icon_sub-account.png' h5Text="子账户" />
            ),
        },
        {
            key: '8',
            type: 'item',
            label: (
                <MenuItemLabel src='/images/home_menu/icon_API.png' h5Text="API" />
            ),
        },
        {
            key: '9',
            type: 'item',
            label: (
                <MenuItemLabel src='/images/home_menu/icon_Third party authorization.png' h5Text="第三方授权管理" />
            ),
        },
        {
            key: '10',
            type: 'divider',
            label: '',
        },
        {
            key: '11',
            type: 'item',
            label: (
                <MenuItemLabel src='/images/home_menu/icon_exit.png' h5Text="退出登录" onClickLogout={() => handleLogout()} />
            ),
        },
    ];
    const userItemsAll = [
        {
            key: '1',
            type: 'group',
            label: (
                <MenuItemLabel src='/images/home_menu/Avatar.png' h5Text="nav***@gmail.com" spanText='UID：123456789' nickName='昵称：MWUSER-12345678' level='V0' />
            ),
        },
        {
            key: '2',
            type: 'group',
            label: (
                <MenuItemLabel myWords_1='近30天交易量' myWords_2='0.00' myWords_3='USD' h5Text="切换账户" isUser />
            ),
        },
        {
            key: '3',
            type: 'divider',
            label: '',
        },
        {
            key: '4',
            type: 'group',
            label: (
                <MenuItemLabel items={userItems} isUserList />
            ),
        },
    ];
    // 添加判断正负的通用函数
    function mapArray<T extends { normalNum?: string }, U extends { isPositive: boolean }>(
        array: T[],
        mapper: (item: T) => U
    ): (T & U)[] {
        return array.map(mapper) as (T & U)[];
    }
    // 处理包含normalNum属性的数组
    function addIsPositiveProperty<T extends { normalNum?: string }>(item: T): T & { isPositive: boolean } {
        return {
            ...item,
            isPositive: item.normalNum?.includes('+') || false,
        };
    }
    // 定义过滤函数
    const filterData = (data: TabsItemData[], searchValue: string) => {
        const lowerSearchValue = searchValue.toLowerCase();
        return data.filter(item =>
            item.h5Text.toLowerCase().includes(lowerSearchValue)
        );
    };

    // 搜索数据
    // let coinPairs: TabsItemData[] = [
    //     {
    //         src: '/images/home_menu/BTC.png',
    //         h5Text: 'BTC/USDT',
    //         spanText: '/images/home_menu/fire_fill 1.png',
    //         incNum: '63,719.9',
    //         normalNum: '+0.62%',
    //         isFire: true,
    //     },
    //     {
    //         src: '/images/home_menu/ETC.png',
    //         h5Text: 'ETH/USDT',
    //         spanText: '/images/home_menu/fire_fill 1.png',
    //         incNum: '23,719.9',
    //         normalNum: '-0.22%',
    //         isFire: true,
    //     },
    //     {
    //         src: '/images/home_menu/BCH.png',
    //         h5Text: 'LTC/USDT',
    //         spanText: '/images/home_menu/fire_fill 1.png',
    //         incNum: '13,719.9',
    //         normalNum: '-1.12%',
    //         isFire: true,
    //     },
    //     {
    //         src: '/images/home_menu/BCH.png',
    //         h5Text: 'LTC/USDT',
    //         spanText: '',
    //         incNum: '13,719.9',
    //         normalNum: '-1.12%',
    //     },
    // ];
    // coinPairs = mapArray(coinPairs, addIsPositiveProperty);
    // // 添加用于存储搜索框输入值的状态
    // const [searchValue, setSearchValue] = useState('');
    // // 根据搜索框的值过滤coinPairs数据
    // const filteredCoinPairs = React.useMemo(() => filterData(coinPairs, searchValue), [coinPairs, searchValue]);
    // const inputItems = [
    //     {
    //         key: '1',
    //         type: 'group',
    //         label: (
    //             <h5 style={{ color: filteredCoinPairs.length > 0 ? '#0C0D0C' : 'inherit', fontSize: '16px', fontWeight: '500' }}>{filteredCoinPairs.length > 0 ? '热门搜索' : '暂无数据'}</h5>
    //         ),
    //         children: filteredCoinPairs.map((coinPair, index) => ({
    //             key: `1-${index + 1}`, // 使用inputItems中的key和map的index生成key
    //             type: 'item',
    //             label: (
    //                 <TabsItem
    //                     needNumber
    //                     haveNumber
    //                     isHover={false}
    //                     index={index + 1}
    //                     isFire={coinPair.isFire}
    //                     src={coinPair.src}
    //                     h5Text={coinPair.h5Text}
    //                     spanText={coinPair.spanText}
    //                     incNum={coinPair.incNum}
    //                     normalNum={coinPair.normalNum} isPositive={coinPair.isPositive} />
    //             )
    //         }))
    //     }
    // ];

    // 定义一个函数，根据 key 返回不同的图标
    const getIconByKey = (icon: IconName) => {
        switch (icon) {
            case 'img_horn':
                return <Col>
                    <Image
                        src="/images/home_menu/icon_horn_hover.png"
                        alt=""
                        width={20}  // 必须指定宽度
                        height={20} // 必须指定高度
                    />
                </Col>;
            case 'img_download':
                return <Col>
                    <Image
                        src="/images/home_menu/icon_download_line.png"
                        alt=""
                        width={20}  // 必须指定宽度
                        height={20} // 必须指定高度
                    />
                </Col>;
            case 'img_change':
                return renderThemeIcon();
            case 'img_global':
                return <Col>
                    <Image
                        src="/images/home_menu/icon_earth_line.png"
                        alt=""
                        width={20}  // 必须指定宽度
                        height={20} // 必须指定高度
                    />
                </Col>;
            default:
                return null;
        }
    };
    const IconHtml = ({ icon }: { icon: IconName }) => {
        return getIconByKey(icon);
    };

    // 语言菜单
    const spanArr = languageList.length > 0 ? languageList : [
        {
            span: '简体中文',
            key: 'zh-CN'
        },
        {
            span: 'English',
            key: 'en-US'
        },
        {
            span: '日本語',
            key: 'ja-JP'
        },
        {
            span: 'Español',
            key: 'es-ES'
        },
        {
            span: 'Français',
            key: 'fr-FR'
        },
    ]

    // 使用实际数据替换静态数据
    const spanRateArr = rateData.length > 0 ? rateData : [
        {
            span: 'CNY - ￥'  // 默认值
        },
        {
            span: 'USD- $'   // 默认值
        },
    ];
    // 语言点击
    const [selectedRate, setSelectedRate] = useState<string>('');
    const handleLanguageClick = async (language: string, langEncode: string) => {
        setSelectedLanguage(language);
        localStorage.setItem('lang', langEncode);

        // 分发自定义事件通知其他组件语言已更改
        const event = new CustomEvent('langChange', { detail: langEncode });
        window.dispatchEvent(event);

        // 切换语言后重新请求所有数据
        initializeData(langEncode);
    };
    // 汇率点击
    const handleRateClick = (rate: string) => {
        setSelectedRate(rate);
        // 可以在这里添加其他逻辑，例如更新语言设置
    };
    // 定义语言菜单项
    const languageItems = spanArr.map((item, index) => ({
        key: `1-${index + 1}`, // 动态生成 key
        type: 'item',
        title: `${item.span}`,
        label: (
            <span style={{
                fontWeight: selectedLanguage === item.span ? '500' : '400',
                cursor: 'pointer',
                display: 'block',
                width: '100%',
                height: '100%'
            }}
                onClick={() => handleLanguageClick(item.span || '', item.key || '')}
            >
                {item.span}
            </span> // 动态赋值
        ),
    }));
    // 定义汇率菜单项
    const rateItems = spanRateArr.map((item, index) => ({
        key: `3-${index + 1}`, // 动态生成 key
        type: 'item',
        title: `${item.span}`,
        label: (
            <span style={{
                fontWeight: selectedRate === item.span ? '500' : '400',
                cursor: 'pointer',
                display: 'block',
                width: '100%',
                height: '100%'
            }}
                onClick={() => handleRateClick(item.span)}>{item.span}
            </span> // 动态赋值
        ),
    }));
    // 语言过滤(模糊搜索)
    const filterLanguages = (languages: any[], searchValue: string) => {
        if (!searchValue) return languages; // 如果没有搜索值，直接返回所有语言项

        const regex = new RegExp(searchValue.trim(), 'i');
        const filtered = languages.filter((lang) => {
            return regex.test(lang.label.props.children); // 匹配 label 中的 <span> 内容
        });

        // 如果过滤后的结果为空，返回空状态组件
        if (filtered.length === 0) {
            return [
                {
                    key: 'empty',
                    type: 'group',
                    label: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配结果" />,
                },
            ];
        }

        return filtered;
    };
    // 汇率过滤(模糊搜索)
    const filterRates = (rates: any[], searchValue: string) => {
        if (!searchValue) return rates; // 如果没有搜索值，直接返回所有语言项

        const regex = new RegExp(searchValue.trim(), 'i');
        const filtered = rates.filter((lang) => {
            return regex.test(lang.label.props.children); // 匹配 label 中的 <span> 内容
        });

        // 如果过滤后的结果为空，返回空状态组件
        if (filtered.length === 0) {
            return [
                {
                    key: 'empty',
                    type: 'group',
                    label: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配结果" />,
                },
            ];
        }

        return filtered;
    };
    // 定义语言状态变量
    const [searchLanguageValue, setSearchLanguageValue] = useState<string>("");
    // 定义汇率状态变量
    const [searchRateValue, setSearchRateValue] = useState<string>("");
    // 公告中心 - 公告部分测试数据
    const bulletinArr = [
        { h5Text: "IMBIT关于上线 Pendle (PENDLE) 现货交易的公告", spanText: "2024/09/27 11:00:00" },
        { h5Text: "ETH/BTC 币对现已上线双币赢！", spanText: "2024/09/27 14:30:00" },
        { h5Text: "IMBIT关于延迟上线 USDC 交易币对的公告", spanText: "2024/09/27 14:30:00" },
        { h5Text: "IMBIT关于 HMSTR 杠杆交易、永续合约及简单赚币正式上线的公告", spanText: "2024/09/27 14:30:00" },
        { h5Text: "IMBIT关于完成发放 Hamster Kombat (HMSTR) 空投币的公告", spanText: "2024/09/27 11:00:00" },
    ];
    // 公告中心标签页 - 使用动态获取的数据
    const bulletinItems: TabsProps['items'] = [
        {
            key: '1',
            label: '公告',
            children:
                // 如果有公告数据则使用，否则使用默认数据
                bulletinData.length > 0
                    ? bulletinData.map((item, index) => (
                        <MenuItemLabel key={index} h5Text={item.h5Text} spanText={item.spanText} needHover />
                    ))
                    : bulletinArr.map((item, index) => (
                        <MenuItemLabel key={index} h5Text={item.h5Text} spanText={item.spanText} needHover />
                    ))
        },
        {
            key: '2',
            label: '账户助手',
            children: 'Content of Tab Pane 2',
        },
    ];
    // 右侧菜单
    const iconMenusLogin: MenuListItem[] = [
        // {
        //     key: '1',
        //     title: <IconHtml icon="img_download" />,
        //     widthSet: 'download',
        //     items: [
        //         {
        //             key: '1',
        //             type: 'group',
        //             label: (
        //                 <MenuItemLabel src="/images/home_menu/QR_code.png" h5Text="扫码下载APP" isOtherItem />
        //             ),
        //         },
        //     ],
        // },

        {
            key: '1',
            title: <IconHtml icon="img_horn" />,
            widthSet: 'bell',
            items: [
                {
                    key: '0',
                    type: 'group',
                    label: (
                        <Row align='middle' justify='space-between'>
                            <Col>
                                <span style={{
                                    fontSize: '16px'
                                }}>
                                    消息
                                </span>
                            </Col>
                            <Col>
                                <Link href='/bulletinCenter'>
                                    <span
                                        style={{
                                            color: '#FF5F1F',
                                            fontSize: '14px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        查看全部
                                    </span>
                                </Link>
                            </Col>
                        </Row>
                    ),
                    children: [
                        {
                            key: '0-1',
                            type: 'group',
                            label: (
                                <ConfigProvider
                                    theme={{
                                        components: {
                                            Tabs: {
                                                inkBarColor: '#0C0D0C',
                                                itemColor: '#6D6F7A',
                                                itemActiveColor: '#0C0D0C',
                                                itemHoverColor: '#6D6F7A',
                                                itemSelectedColor: '#0C0D0C'
                                            },
                                        },
                                    }}
                                >
                                    <Tabs
                                        defaultActiveKey="1"
                                        items={isLogin ? bulletinItems : bulletinItems.filter(item => item.key === '1')}
                                    />
                                </ConfigProvider>

                            ),
                        }
                    ]
                },
            ],
        },
        {
            key: '2',
            title: <IconHtml icon="img_change" />,
            widthSet: 'question',
            items: [],
        },
        {
            key: '3',
            title: <IconHtml icon="img_global" />,
            widthSet: 'global',
            items: [
                {
                    key: '0',
                    type: 'group',
                    label: (
                        <h6 style={{ color: '#000000', marginBottom: '-10px' }}>语言</h6>
                    )
                },
                {
                    key: '1',
                    type: 'group',
                    label: (
                        <MenuItemLabel isInput onInputChange={(value) => setSearchLanguageValue(value)} h5Text='中文' />
                    ),
                    children: [
                        ...filterLanguages(languageItems, searchLanguageValue),
                    ],
                },
                {
                    key: '2',
                    type: 'group',
                    label: (
                        <h6 style={{ color: '#000000', marginBottom: '-10px' }}>汇率</h6>
                    )
                },
                {
                    key: '3',
                    type: 'group',
                    label: (
                        <MenuItemLabel isInput onInputChange={(value) => setSearchRateValue(value)} h5Text='搜索' />
                    ),
                    children: [
                        ...filterRates(rateItems, searchRateValue),
                    ],
                },

            ],
        },
    ];
    const iconItemsLogin = iconMenusLogin.map(iconMenu =>
        <MenuItem key={iconMenu.key} menuList={iconMenu} haveArrow={true} />
    );

    // TabsItem组件的数据
    // let tabsItemsData1: TabsItemData[] = [
    //     {
    //         src: '/images/home_menu/BTC.png',
    //         h5Text: "BTC/USDT",
    //         spanText: "10X",
    //         incNum: '63,719.9',
    //         normalNum: '+0.35%',
    //         colorSpan: 'orange'
    //     },
    //     {
    //         src: '/images/home_menu/ETC.png',
    //         h5Text: "ETH/USDT",
    //         spanText: "10X",
    //         incNum: '2,617.00',
    //         normalNum: '+0.62%',
    //         colorSpan: 'orange'
    //     },
    //     {
    //         src: '/images/home_menu/ETC.png',
    //         h5Text: "ETH/USDT",
    //         spanText: "10X",
    //         incNum: '2,617.00',
    //         normalNum: '-0.62%',
    //         colorSpan: 'orange'
    //     },
    // ];
    // tabsItemsData1 = mapArray(tabsItemsData1, addIsPositiveProperty);
    // let tabsItemsData2: TabsItemData[] = [
    //     {
    //         src: '/images/home_menu/BTC.png',
    //         h5Text: "BTC/USDT",
    //         spanText: "永续",
    //         incNum: '63,719.9',
    //         normalNum: '+0.35%',
    //         colorSpan: 'blue'
    //     },
    //     {
    //         src: '/images/home_menu/ETC.png',
    //         h5Text: "ETH/USDT",
    //         spanText: "永续",
    //         incNum: '2,617.00',
    //         normalNum: '+0.62%',
    //         colorSpan: 'blue'
    //     },
    // ];
    // tabsItemsData2 = mapArray(tabsItemsData2, addIsPositiveProperty);
    // const tabsItemsData3: TabsItemData[] = [
    //     {
    //         src: '/images/home_menu/BTC.png',
    //         h5Text: "BTCUSD",
    //         spanText: "T型报价",
    //     },
    //     {
    //         src: '/images/home_menu/ETC.png',
    //         h5Text: "ETHUSD",
    //         spanText: "T型报价",
    //     },
    // ];
    // let tabsItemsData4: TabsItemData[] = [
    //     {
    //         src: '/images/home_menu/BTC.png',
    //         h5Text: "BTCUSD",
    //         incNum: '63,719.9',
    //         normalNum: '+0.35%',
    //         spanText: "交割",
    //     },
    //     {
    //         src: '/images/home_menu/ETC.png',
    //         h5Text: "ETHUSD",
    //         incNum: '2,617.00',
    //         normalNum: '+0.62%',
    //         spanText: "交割",
    //     },
    // ];
    // tabsItemsData4 = mapArray(tabsItemsData4, addIsPositiveProperty);
    // // TabsItem组件过滤后的数据
    // const [searchValue1, setSearchValue1] = useState('');
    // const handleInputChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setSearchValue1(event.target.value);
    // };
    // const [searchValue2, setSearchValue2] = useState('');
    // const handleInputChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setSearchValue2(event.target.value);
    // };
    // // const [searchValue3, setSearchValue3] = useState('');
    // // const handleInputChange3 = (event: React.ChangeEvent<HTMLInputElement>) => {
    // //     setSearchValue3(event.target.value);
    // // };
    // const [searchValue4, setSearchValue4] = useState('');
    // // const handleInputChange4 = (event: React.ChangeEvent<HTMLInputElement>) => {
    // //     setSearchValue4(event.target.value);
    // // };
    // const filteredData1 = React.useMemo(() => filterData(tabsItemsData1, searchValue1), [tabsItemsData1, searchValue1]);
    // const filteredData2 = React.useMemo(() => filterData(tabsItemsData2, searchValue2), [tabsItemsData2, searchValue2]);
    // // const filteredData3 = React.useMemo(() => filterData(tabsItemsData3, searchValue3), [tabsItemsData3, searchValue3]);
    // // const filteredData4 = React.useMemo(() => filterData(tabsItemsData4, searchValue4), [tabsItemsData4, searchValue4]);

    // // 子项标签页
    // // const tabsItems1 = [
    // //     {
    // //         key: '1',
    // //         label: 'USDT',
    // //         children: <MenuItemChildrenLabel isSearch needNumber tabsItemsData={filteredData1} onInputChange={handleInputChange1} />,
    // //     },
    // //     {
    // //         key: '2',
    // //         label: 'USDC',
    // //         children: 'Content of Tab Pane 2',
    // //     },
    // //     {
    // //         key: '3',
    // //         label: '稳定币',
    // //         children: 'Content of Tab Pane 3',
    // //     },
    // //     {
    // //         key: '4',
    // //         label: 'Crypto',
    // //         children: 'Content of Tab Pane 4',
    // //     },
    // // ];
    // // const tabsItems2 = [
    // //     {
    // //         key: '1',
    // //         label: 'USDT本位',
    // //         children: <MenuItemChildrenLabel isSearch needNumber tabsItemsData={filteredData2} onInputChange={handleInputChange2} />,
    // //     },
    // //     {
    // //         key: '2',
    // //         label: 'USDC本位',
    // //         children: 'Content of Tab Pane 2',
    // //     },
    // //     {
    // //         key: '3',
    // //         label: '币本位',
    // //         children: 'Content of Tab Pane 3',
    // //     },
    // // ];
    // // const tabsItems3 = [
    // //     {
    // //         key: '1',
    // //         label: 'T型报价',
    // //         children: <MenuItemChildrenLabel tabsItemsData={tabsItemsData3} />,
    // //     },
    // //     {
    // //         key: '2',
    // //         label: '期权简选',
    // //         children: 'Content of Tab Pane 2',
    // //     },
    // // ];

    // // 菜单中的子项
    // // const ulItems = [
    // //     {
    // //         liContent: '简单赚币'
    // //     },
    // //     {
    // //         liContent: '结构化产品'
    // //     },
    // //     {
    // //         liContent: '链上赚币'
    // //     },
    // // ];

    // // 左侧菜单
    // // const menus: MenuListItem[] = [
    // //     // {
    // //     //     key: '0',
    // //     //     title: <img src='/images/home_menu/icon_classify_line.png' style={{ width: '18px', height: '18px' }} />,
    // //     //     items: []
    // //     // },
    // //     {
    // //         key: '1',
    // //         // title: t('home_menu_title_1'),
    // //         // title: '买币',
    // //         title: '行情',
    // //         // title: <IconHtml icon="bell" />,
    // //         items: [
    // //             {
    // //                 key: '1',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon-c2c.png" h5Text="C2C 买币" spanText="灵活选择，0交易费" />
    // //                 ),
    // //             },
    // //         ],
    // //     },
    // //     {
    // //         key: '2',
    // //         // title: '发现',
    // //         title: '交易',
    // //         items: [
    // //             {
    // //                 key: '1',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_chart_line.png" h5Text="市场" spanText="查看最新行情和交易大数据" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '2',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_target_line.png" h5Text="机会" spanText="发掘最热、最新币种，及时捕捉市场机会" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '3',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_task.png" h5Text="跟单" spanText="与全球顶级交易员一起赚钱" />
    // //                 ),
    // //             },
    // //         ],
    // //     },
    // //     {
    // //         key: '3',
    // //         // title: '交易',
    // //         title: '合约',
    // //         items: [
    // //             {
    // //                 key: '0',
    // //                 type: 'group',
    // //                 label: '交易类型',
    // //             },
    // //             {
    // //                 key: '1',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_shandui.png" h5Text="闪兑" spanText="币币兑换，0 费率，无滑点" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '2',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_exchange_baht_line.png" h5Text="现货" spanText="轻松买卖数字货币" />
    // //                 ),
    // // children: [
    // //     {
    // //         key: '2-1',
    // //         type: 'group',
    // //         label: (
    // //             <MenuItemChildrenLabel isTabs tabsItems={tabsItems1} />
    // //         ),
    // //     },
    // // ],
    // //             },
    // //             {
    // //                 key: '3',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_pact.png" h5Text="合约" spanText="交易永续和交割合约，灵活使用杠杆" />
    // //                 ),
    // //                 children: [
    // //                     {
    // //                         key: '3-1',
    // //                         type: 'group',
    // //                         label: (
    // //                             <MenuItemChildrenLabel isTabs tabsItems={tabsItems2} />
    // //                         ),
    // //                     },
    // //                 ],
    // //             },
    // //             {
    // //                 key: '4',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_option.png" h5Text="期权" spanText="利用市场波动，赚取收益，降低交易风险" />
    // //                 ),
    // //                 children: [
    // //                     {
    // //                         key: '4-1',
    // //                         type: 'group',
    // //                         label: (
    // //                             <MenuItemChildrenLabel isTabs tabsItems={tabsItems3} />
    // //                         ),
    // //                     },
    // //                 ],
    // //             },
    // //             {
    // //                 key: '5',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel isNew src="/images/home_menu/Group.png" h5Text="盘前交易" spanText="在币种未上线阶段，提前交易其交割合约" />
    // //                 ),
    // //                 children: [
    // //                     {
    // //                         key: '5-1',
    // //                         type: 'group',
    // //                         label: (
    // //                             <MenuItemChildrenLabel isSearch needNumber isMargin tabsItemsData={filteredData4} onInputChange={handleInputChange4} />
    // //                         ),
    // //                     },
    // //                 ],
    // //             },
    // //             {
    // //                 key: '6',
    // //                 type: 'divider',
    // //                 label: '',
    // //             },
    // //             {
    // //                 key: '7',
    // //                 type: 'group',
    // //                 label: '交易工具',
    // //             },
    // //             {
    // //                 key: '8',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_dengpao.png" h5Text="策略交易" spanText="多种智能策略，助您轻松交易" />
    // //                 ),
    // //                 children: [
    // //                     {
    // //                         key: '8-1',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_target_line.png" h5Text="策略广场" spanText="" />
    // //                         ),
    // //                     },
    // //                     {
    // //                         key: '8-2',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/chuangjianrenwu 1.png" h5Text="创建策略" spanText="" />
    // //                         )
    // //                     },
    // //                 ],
    // //             },
    // //             {
    // //                 key: '9',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_jiaoyiyuan.png" h5Text="交易广场" spanText="与全球顶级交易员一起赚钱" />
    // //                 ),
    // //                 children: [
    // //                     {
    // //                         key: '9-1',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel isNew src="/images/home_menu/icon_award.png" h5Text="精选策略" spanText="" />
    // //                         ),
    // //                     },
    // //                     {
    // //                         key: '9-2',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_contract.png" h5Text="合约跟单" spanText="" />
    // //                         )
    // //                     },
    // //                     {
    // //                         key: '9-3',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_task (1).png" h5Text="现货跟单" spanText="" />
    // //                         )
    // //                     },
    // //                     {
    // //                         key: '9-4',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_Recruitment.png" h5Text="精英交易员招募" spanText="" />
    // //                         )
    // //                     },
    // //                 ],
    // //             },
    // //             {
    // //                 key: '10',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_flow.png" h5Text="流动性市场" spanText="为交割价差、自定义多腿策略和大宗交易 带来深度流动性" />
    // //                 ),
    // //                 children: [
    // //                     {
    // //                         key: '10-1',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_safe_flash.png" h5Text="价格速递" spanText="" />
    // //                         ),
    // //                     },
    // //                     {
    // //                         key: '10-2',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_Inquiry sheet.png" h5Text="询价单" spanText="" />
    // //                         )
    // //                     },
    // //                 ],
    // //             },
    // //             {
    // //                 key: '11',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_simulate.png" h5Text="模拟交易" spanText="使用虚拟资金，零风险体验交易环境" />
    // //                 ),
    // //             },
    // //         ],
    // //     },
    // //     {
    // //         key: '4',
    // //         // title: '金融',
    // //         title: '跟单',
    // //         items: [
    // //             {
    // //                 key: '1',
    // //                 type: 'group',
    // //                 // children: [
    // //                 //     {
    // //                 //         key: '1-1',
    // //                 //         type: 'item',
    // //                 //         label: '1st menu item',
    // //                 //     },
    // //                 //     {
    // //                 //         key: '1-2',
    // //                 //         type: 'item',
    // //                 //         label: '2nd menu item',
    // //                 //     },
    // //                 // ],
    // //                 label: (
    // //                     <MenuItemLabel ulItems={ulItems} haveItemChildren src="/images/home_menu/icon_currency.png" h5Text="赚币" spanText="持币生币，赚取收益" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '2',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_Debit and credit.png" h5Text="借贷" spanText="质押数字资产，满足您的投资和消费需求" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '3',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_compass.png" h5Text="Jumpstart" spanText="抢先发现全国优质新项目" />
    // //                 ),
    // //             },
    // //         ],
    // //     },
    // //     {
    // //         key: '5',
    // //         // title: '公链',
    // //         title: '策略',
    // //         items: [
    // //             {
    // //                 key: '0',
    // //                 type: 'group',
    // //                 label: 'X Layer',
    // //             },
    // //             {
    // //                 key: '1',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_tansuo.png" h5Text="X Layer" spanText="点燃创意、引领创新" />
    // //                 ),
    // //                 children: [
    // //                     {
    // //                         key: '1-1',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_X Layer.png" h5Text="主网浏览器" spanText="主网链上数据" />
    // //                         ),
    // //                     },
    // //                     {
    // //                         key: '1-2',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_compass (1).png" h5Text="测试网浏览器" spanText="测试网链上数据" />
    // //                         )
    // //                     },
    // //                     {
    // //                         key: '1-3',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_Test net.png" h5Text="X Layer 生态" spanText="探索 X Layer DApp" />
    // //                         )
    // //                     },
    // //                     {
    // //                         key: '1-4',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_webhook.png" h5Text="精英交易员招募" spanText="" />
    // //                         )
    // //                     },
    // //                 ],
    // //             },
    // //             {
    // //                 key: '2',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_code.png" h5Text="开发者" spanText="无限扩容" />
    // //                 ),
    // //                 children: [
    // //                     {
    // //                         key: '2-1',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_file_code.png" h5Text="开发者文档" spanText="查看技术文档" />
    // //                         ),
    // //                     },
    // //                     {
    // //                         key: '2-2',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_faucet.png" h5Text="测试网水龙头" spanText="获取测试网 IMBT" />
    // //                         )
    // //                     },
    // //                     {
    // //                         key: '2-3',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_link.png" h5Text="测试网跨链桥" spanText=" Layer 测试网跨链桥" />
    // //                         )
    // //                     },
    // //                     {
    // //                         key: '2-4',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_settings.png" h5Text="预言机" spanText="获取价格数据" />
    // //                         )
    // //                     },
    // //                     {
    // //                         key: '2-5',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_github.png" h5Text="GitHub" spanText="探索 X Layer 仓库" />
    // //                         )
    // //                     },
    // //                 ],
    // //             },
    // //             {
    // //                 key: '3',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_Official application.png" h5Text="官方应用" spanText="基础建设产品" />
    // //                 ),
    // //                 children: [
    // //                     {
    // //                         key: '3-1',
    // //                         type: 'item',
    // //                         label: (
    // //                             <MenuItemLabel src="/images/home_menu/icon_link.png" h5Text="跨链桥" spanText="以太坊与 X Layer 资产跨链" />
    // //                         ),
    // //                     },
    // //                 ],
    // //             },
    // //         ],
    // //     },
    // //     {
    // //         key: '6',
    // //         // title: '机构客户',
    // //         title: '理财',
    // //         items: [
    // //             {
    // //                 key: '1',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_building.png" h5Text="机构首页" spanText="为机构客户提供最强劲、最完整的数字货币交易解决方案" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '2',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_flow (1).png" h5Text="流动性市场" spanText="支持场外交易，为专业交易员和机构用户提供流动性" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '3',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_API.png" h5Text="API" spanText="超低延迟的 API 无缝连接您的数据和操作" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '4',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_VIP.png" h5Text="尊享借币" spanText="提高资金利用率" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '5',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_Broker's office.png" h5Text="经济商项目" spanText="享受世界一流的市场深度，获得高额的佣金回赠" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '6',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon_manage.png" h5Text="资金子账户" spanText="统一管理子账户，让交易变得更轻松、更安全、更实惠" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '7',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon-market.png" h5Text="历史行情数据" spanText="K线图、交易汇总、订单表数据等信息尽在掌握" />
    // //                 ),
    // //             },
    // //             {
    // //                 key: '8',
    // //                 type: 'item',
    // //                 label: (
    // //                     <MenuItemLabel src="/images/home_menu/icon-news.png" h5Text="机构交易资讯" spanText="洞悉最前沿的机构交易研究、新闻及更多" />
    // //                 ),
    // //             },
    // //         ],
    // //     },
    // // ];

    const listItems = menus.map(menuList => {
        // console.log('menuList', menuList);
        return <MenuItem key={menuList.key} menuList={menuList} haveArrow={false} isCascading />
    }
    );

    // 左侧菜单展开
    const [open, setOpen] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(true);

    const showMenu = () => {
        setOpen(true);
        setLoading(true);

        // Simple loading mock. You should add cleanup logic in real world.
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    return (
        <div style={{ position: 'relative' }}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Image
                        src={logoUrl}
                        alt=""
                        width={126}
                        height={30}
                        onError={() => setLogoUrl('/home_menu_logo.png')}
                    />
                </div>
                <div className={styles.menuContainer}>
                    <div className={styles.menuListContainer}>
                        <Row align='middle'>
                            <Row>
                                <Col style={{ cursor: 'pointer' }} onClick={showMenu}>
                                    {/* <img src='/images/home_menu/icon_classify_line.png' style={{ width: '18px', height: '18px', marginRight: '20px' }} /> */}
                                    <Image
                                        src="/images/home_menu/icon_classify_line.png"
                                        alt=""
                                        width={18}  // 必须指定宽度
                                        height={18} // 必须指定高度
                                        style={{ marginRight: '20px' }}
                                    />
                                </Col>
                            </Row>
                            <Row align='middle' className={styles.collapsedMenu}>
                                <Col>{listItems}</Col>
                                {/* <Link href='/currencyTrading' style={{ marginRight: '20px', cursor: 'pointer' }}>
                                    <Row gutter={4} align='middle'>
                                        <Col><img src="/images/home_menu/icon_fire_fill.png" className={styles.iconCursor} /></Col>
                                        <Col><span>Web3</span></Col>
                                    </Row>
                                </Link>
                                <Col>
                                    <Dropdown
                                        menu={{
                                            items: moreItems,
                                        }}
                                        trigger={['click']}
                                        overlayStyle={{ top: '80px' }}
                                    >
                                        <a style={{ cursor: 'pointer', position: 'relative' }} onClick={(e) => e.preventDefault()}>
                                            <Space style={{ columnGap: '3px' }}>
                                                打新专区
                                                <img src="/images/home_menu/new.png" style={{ width: '40px', height: '20px', position: 'absolute', right: '-35px', top: '-20px' }} />
                                            </Space>
                                        </a>
                                    </Dropdown>
                                </Col> */}
                            </Row>
                        </Row>
                    </div>
                    <div className={styles.rightListContainer}>
                        <Dropdown
                            // menu={{
                            //     items: inputItems,
                            // }}
                            trigger={['click']}
                            overlayStyle={{ top: '80px', maxWidth: '390px', width: '390px' }}
                        >
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    <ConfigProvider
                                        theme={{
                                            components: {
                                                Input: {
                                                    activeBorderColor: '#FF5F1F',
                                                    hoverBorderColor: '#FF5F1F'
                                                },
                                            },
                                            token: {
                                                // colorTextPlaceholder: '#979897',
                                                fontSize: 12
                                            }
                                        }}
                                    >
                                        {/* <Input
                                            style={{ width: '188px', minWidth: '188px', backgroundColor: '#1C1E1C', color: '#979897', borderColor: '#979897' }}
                                            placeholder="搜索币对和其他产品"
                                            prefix={<SearchOutlined />}
                                            value={searchValue}
                                            onChange={(e) => setSearchValue(e.target.value)}
                                        /> */}
                                    </ConfigProvider>
                                </Space>
                            </a>
                        </Dropdown>
                        <div className={`${styles.loginContent} customMenu`}>
                            <Row gutter={16} align='middle'>
                                {
                                    isLogin ? (
                                        <>
                                            <Col>
                                                <Dropdown
                                                    menu={{
                                                        // items,
                                                        items: itemsFunding
                                                    }}
                                                    trigger={['click']}
                                                    className={styles.dropDownList}
                                                    overlayStyle={{ top: '80px', width: '180px' }}
                                                >
                                                    {/* <a onClick={(e) => e.preventDefault()} className={styles.iconCursor}>
                                                    <Space style={{ columnGap: '3px' }}>
                                                        <img src="/images/home_menu/icon_wallet_line.png" className={styles.iconCursor} />
                                                    </Space>
                                                </a> */}
                                                    <Space style={{ columnGap: '3px' }}>
                                                        {/* <img onClick={(e) => e.preventDefault()} src="/images/home_menu/icon_wallet_line.png" className={styles.iconCursor} /> */}
                                                        <Image
                                                            onClick={(e) => e.preventDefault()}
                                                            src="/images/home_menu/icon_wallet_line.png"
                                                            className={styles.iconCursor}
                                                            alt=""
                                                            width={20}  // 必须指定宽度
                                                            height={20} // 必须指定高度
                                                        />
                                                    </Space>
                                                </Dropdown>
                                            </Col>
                                            <Col>
                                                <Dropdown
                                                    menu={{
                                                        items: [
                                                            {
                                                                key: '1',
                                                                label: '上传文件',
                                                            },
                                                        ],
                                                    }}
                                                    trigger={['click']}
                                                    overlayStyle={{ top: '80px', maxWidth: '200px', width: '180px' }}
                                                >
                                                    {/* <a onClick={(e) => e.preventDefault()}> */}
                                                    <Space>
                                                        {/* <img onClick={(e) => e.preventDefault()} src="/images/home_menu/icon_search_line.png" className={styles.iconCursor} /> */}
                                                        <Image
                                                            onClick={(e) => e.preventDefault()}
                                                            alt=""
                                                            width={20}  // 必须指定宽度
                                                            height={20} // 必须指定高度
                                                            src="/images/home_menu/icon_upload_line.png"
                                                            className={styles.iconCursor}
                                                        />
                                                    </Space>
                                                    {/* </a> */}
                                                </Dropdown>
                                            </Col>
                                            <Col>
                                                <Dropdown
                                                    menu={{
                                                        items: userItemsAll as MenuProps['items'],
                                                        triggerSubMenuAction: 'click',
                                                    }}
                                                    placement="bottomLeft"
                                                    trigger={['click']}
                                                    overlayStyle={{ top: '80px', maxWidth: '240px', minWidth: '240px' }}
                                                >
                                                    <Space>
                                                        <Image
                                                            onClick={(e) => e.preventDefault()}
                                                            src="/images/home_menu/icon_user_line.png"
                                                            className={styles.userCursor}
                                                            alt="avatar"
                                                            width={20}  // 必须指定宽度
                                                            height={20} // 必须指定高度
                                                        />
                                                    </Space>
                                                </Dropdown>
                                            </Col>
                                            {iconItemsLogin}
                                        </>
                                    ) : (
                                        <>
                                            <Col><Link href='/login' className={styles.register}><span style={{ color: '#FFF' }}>注册</span></Link></Col>
                                            <Col><Link href='/login' className={styles.login}><span style={{ color: '#FFF' }}>登录</span></Link></Col>
                                            <div style={{ height: '20px', border: '1px solid #676867', margin: '0 12px' }}></div>
                                            {/* <Col> */}
                                            {/* <Dropdown */}
                                            {/* menu={{
                                                     items: inputItems,
                                                 }}
                                                    trigger={['click']}
                                                    overlayStyle={{ top: '80px', maxWidth: '390px', width: '390px' }} */}
                                            {/* > */}
                                            {/* <a onClick={(e) => e.preventDefault()}> */}
                                            {/* <Space> */}
                                            {/* <img onClick={(e) => e.preventDefault()} src="/images/home_menu/icon_search_line.png" className={styles.iconCursor} />
                                                        <Image
                                                            onClick={(e) => e.preventDefault()}
                                                            alt=""
                                                            width={20}  // 必须指定宽度
                                                            height={20} // 必须指定高度
                                                            src="/images/home_menu/icon_search_line.png"
                                                            className={styles.iconCursor}
                                                        /> */}
                                            {/* </Space> */}
                                            {/* </a> */}
                                            {/* </Dropdown> */}
                                            {/* </Col> */}
                                            {iconItemsLogin}
                                        </>
                                    )
                                }
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className={styles.container}>
                <div>{menuData ? JSON.stringify(menuData) : '暂无数据'}</div>
            </div> */}
            {/* 点击展开的左侧菜单栏 */}
            {/* <Drawer
                closable
                destroyOnClose
                title={<p>菜单</p>}
                placement="left"
                open={open}
                loading={loading}
                onClose={() => setOpen(false)}
                style={{ position: 'relative' }}
                width={288}
            >
                <Button type="primary" style={{ marginBottom: 16 }} onClick={showMenu}>
                    Reload
                </Button>
                <MenuAdaptiveItem menuList={adaptiveMenuData} />
            </Drawer> */}
            {/* <p>{t('home_menu:home_menu_title_2')}</p> */}
        </div>
    );
}
