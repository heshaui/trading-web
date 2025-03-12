import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { Breadcrumb, ConfigProvider, Layout, Menu, Pagination } from 'antd';
import Link from 'next/link';
import styles from './styles/helpCenter.module.css';
import Image from 'next/image';
import { getHelpCenterMenu } from '@/services/helpCenter';

const { Sider, Content } = Layout;

// 模拟侧边栏菜单数据
const getMenuItems = (category: string) => {
    if (category === '常见问题') {
        return [
            {
                key: 'account',
                label: '账号安全设置',
                children: [
                    { key: 'account-1', label: '账号管理' },
                    { key: 'account-2', label: '个人身份认证' },
                ]
            },
            {
                key: 'deposit',
                label: '充/提币',
                children: [
                    { key: 'deposit-1', label: '如何充币' },
                    { key: 'deposit-2', label: '如何提币' },
                ]
            },
            {
                key: 'trading',
                label: '交易',
                children: [
                    { key: 'trading-1', label: '如何交易' },
                    { key: 'trading-2', label: '交易费用' },
                ]
            },
            {
                key: 'web3',
                label: 'Web3',
                children: [
                    { key: 'web3-1', label: '什么是Web3' },
                    { key: 'web3-2', label: 'Web3使用指南' },
                ]
            }
        ];
    } else if (category === '新手帮助') {
        return [
            {
                key: 'guide',
                label: '入门指南',
                children: [
                    { key: 'guide-1', label: '如何注册账号' },
                    { key: 'guide-2', label: '如何进行身份验证' },
                ]
            },
            {
                key: 'security',
                label: '安全设置',
                children: [
                    { key: 'security-1', label: '如何设置安全密码' },
                    { key: 'security-2', label: '如何开启二次验证' },
                ]
            }
        ];
    }

    // 其他分类的菜单项
    return [
        {
            key: 'default',
            label: '默认菜单项',
            children: [
                { key: 'default-1', label: '菜单项1' },
                { key: 'default-2', label: '菜单项2' },
            ]
        }
    ];
};

// 模拟内容数据
const getContent = (menuKey: string, category: string) => {
    // 模拟数据库内容
    const contentMap: Record<string, {
        items: Array<{
            title: string;
            content: string;
            time: string;
        }>
    }> = {
        'account-1': {
            items: [
                {
                    title: '如何修改账号密码',
                    content: '登录账号后，进入安全中心，点击"修改密码"，按照提示操作即可完成密码修改。为了账号安全，建议定期更换密码，并使用字母、数字和特殊字符的组合。',
                    time: '2024-12-12'
                },
                {
                    title: '如何绑定手机号',
                    content: '登录账号后，进入安全中心，点击"绑定手机"，输入手机号并完成验证即可。绑定手机后可用于接收安全验证码和重要通知。',
                    time: '2024-12-12'
                },
                {
                    title: '如何绑定手机号',
                    content: '登录账号后，进入安全中心，点击"绑定手机"，输入手机号并完成验证即可。绑定手机后可用于接收安全验证码和重要通知。',
                    time: '2024-12-12'
                },
                {
                    title: '如何绑定手机号',
                    content: '登录账号后，进入安全中心，点击"绑定手机"，输入手机号并完成验证即可。绑定手机后可用于接收安全验证码和重要通知。',
                    time: '2024-12-12'
                },
                {
                    title: '如何绑定手机号',
                    content: '登录账号后，进入安全中心，点击"绑定手机"，输入手机号并完成验证即可。绑定手机后可用于接收安全验证码和重要通知。',
                    time: '2024-12-12'
                },
                {
                    title: '如何绑定手机号',
                    content: '登录账号后，进入安全中心，点击"绑定手机"，输入手机号并完成验证即可。绑定手机后可用于接收安全验证码和重要通知。',
                    time: '2024-12-12'
                },
                {
                    title: '如何绑定手机号',
                    content: '登录账号后，进入安全中心，点击"绑定手机"，输入手机号并完成验证即可。绑定手机后可用于接收安全验证码和重要通知。',
                    time: '2024-12-12'
                }
            ]
        },
        'account-2': {
            items: [
                {
                    title: '个人身份认证流程',
                    content: '进入身份认证页面，选择"个人认证"，按要求上传证件照片并填写个人信息，提交后等待审核结果。认证成功后可提高账户安全等级和提现额度。',
                    time: '2024-12-12'
                }
            ]
        },
        'deposit-1': {
            items: [
                {
                    title: '如何充值数字货币',
                    content: '登录账户后，进入资产页面，选择"充币"，选择要充值的币种，系统会生成充值地址，将数字货币转入该地址即可。请确保地址正确，避免资产损失。',
                    time: '2024-12-12'
                }
            ]
        },
        // 其他内容项...
    };

    return contentMap[menuKey] || { items: [] };
};

export default function HelperCenterDetail() {
    // 路由
    const router = useRouter();
    // 路由参数
    const { title, category } = router.query;
    // 路由参数
    const locale = router.query.locale || 'zh';
    // 从本地存储获取语言设置
    const [storedLang, setStoredLang] = useState<string>('zh_CN');
    // 在组件加载时从本地存储获取语言并添加监听器
    useEffect(() => {
        // 确保代码在客户端执行
        if (typeof window !== 'undefined') {
            // 初始获取语言
            const localLang = localStorage.getItem('lang') || 'zh_CN';
            setStoredLang(localLang);

            // 创建存储事件监听器（其他标签页更改时触发）
            const handleStorageChange = (event: StorageEvent) => {
                if (event.key === 'lang' && event.newValue) {
                    setStoredLang(event.newValue);
                }
            };

            // 创建自定义事件监听器（当前页面更改时触发）
            const handleCustomLangChange = (event: CustomEvent) => {
                if (event.detail && typeof event.detail === 'string') {
                    setStoredLang(event.detail);
                }
            };

            // 添加事件监听器
            window.addEventListener('storage', handleStorageChange);
            window.addEventListener('langChange', handleCustomLangChange as EventListener);

            // 清理函数
            return () => {
                window.removeEventListener('storage', handleStorageChange);
                window.removeEventListener('langChange', handleCustomLangChange as EventListener);
            };
        }
    }, []);
    // 获取动态菜单数据
    const fetchMenuItems = useCallback(async () => {
        if (!category || (category !== '常见问题' && category !== '新手帮助')) {
            return;
        }

        try {
            // 使用本地存储中的语言设置
            const lang = storedLang;

            // 调用接口获取菜单数据
            const response = await getHelpCenterMenu({ lang });

            // 在控制台打印获取的数据
            console.log('帮助中心菜单数据:', response);
            console.log('当前语言:', lang);

            // 暂时不渲染到页面上，仍使用模拟数据
        } catch (error) {
            console.error('获取菜单数据失败:', error);
        }
    }, [category, storedLang]);

    // 当 category 或 storedLang 变化时获取数据
    useEffect(() => {
        fetchMenuItems();
    }, [fetchMenuItems]);
    // 选中菜单
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    // 展开菜单
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [content, setContent] = useState<{
        items: Array<{
            title: string;
            content: string;
            time: string;
        }>
    }>({ items: [] });
    // 当前菜单标签
    const [currentMenuLabel, setCurrentMenuLabel] = useState<string>('');
    // 当前父菜单标签
    const [currentParentMenuLabel, setCurrentParentMenuLabel] = useState<string>('');
    // 添加分页相关状态
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5; // 每页显示的条目数

    // 添加文章详情相关状态
    const [showArticleDetail, setShowArticleDetail] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<{
        title: string;
        content: string;
        time: string;
    } | null>(null);

    // 获取菜单数据
    const menuItems = getMenuItems(category as string);
    // 初始化默认选中的菜单项
    useEffect(() => {
        if (menuItems && menuItems.length > 0) {
            const firstItem = menuItems[0];

            if (firstItem.children && firstItem.children.length > 0) {
                // 如果第一项有子菜单，选中第一个子菜单
                const firstChildKey = firstItem.children[0].key;
                setSelectedKeys([firstChildKey]);
                setOpenKeys([firstItem.key]);

                // 设置面包屑标签
                setCurrentParentMenuLabel(firstItem.label);
                setCurrentMenuLabel(firstItem.children[0].label);

                // 获取内容
                setContent(getContent(firstChildKey, category as string));
            } else {
                // 如果第一项没有子菜单，直接选中第一项
                setSelectedKeys([firstItem.key]);

                // 设置面包屑标签
                setCurrentMenuLabel(firstItem.label);
                setCurrentParentMenuLabel('');

                // 获取内容
                setContent(getContent(firstItem.key, category as string));
            }
        }
    }, [category]);

    // 处理分页变化
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // 计算当前页显示的内容
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return content.items.slice(startIndex, endIndex);
    };

    // 处理菜单点击
    const handleMenuClick = (info: any) => {
        if (!category) return;

        setSelectedKeys([info.key]);

        // 查找当前点击的菜单项及其父菜单
        const { label, parentLabel } = findMenuInfo(menuItems, info.key);

        // 设置面包屑标签
        setCurrentMenuLabel(label || '');
        setCurrentParentMenuLabel(parentLabel || '');

        // 获取内容
        setContent(getContent(info.key, category as string));

        // 重置分页到第一页
        setCurrentPage(1);
    };

    // 查找菜单项信息（标签和父菜单标签）
    const findMenuInfo = (items: any[], key: string, parentLabel: string = ''): { label: string, parentLabel: string } => {
        for (const item of items) {
            if (item.key === key) {
                return { label: item.label, parentLabel };
            }
            if (item.children) {
                const found = findMenuInfo(item.children, key, item.label);
                if (found.label) return found;
            }
        }
        return { label: '', parentLabel: '' };
    };

    // 查找菜单项标签
    const findMenuLabel = (items: any[], key: string): string => {
        for (const item of items) {
            if (item.key === key) {
                return item.label;
            }
            if (item.children) {
                const found = findMenuLabel(item.children, key);
                if (found) return found;
            }
        }
        return '';
    };

    // 处理文章点击
    const handleArticleClick = (article: {
        title: string;
        content: string;
        time: string;
    }) => {
        setCurrentArticle(article);
        setShowArticleDetail(true);
    };

    // 返回文章列表
    const handleBackToList = () => {
        setShowArticleDetail(false);
        setCurrentArticle(null);
    };

    // 处理子菜单展开/收起
    const handleOpenChange = (keys: string[]) => {
        setOpenKeys(keys);
    };

    // 返回帮助中心
    const handleBack = () => {
        router.push(`/${locale}/helpCenter`);
    };

    return (
        <div className={styles.helpCenterContainer}>
            <ConfigProvider
                theme={{
                    components: {
                        Breadcrumb: {
                            itemColor: 'var(--text-color6)',
                            lastItemColor: 'var(--text-color5)',
                            separatorColor: 'var(--text-color6)',
                            linkColor: 'var(--text-color6)',
                            linkHoverColor: 'none',
                        },
                        Menu: {
                            itemColor: '#A4A5AC',
                            // itemActiveBg: '#FF5F1F',
                            // itemHoverBg: '#FF5F1F',
                            // itemSelectedBg: '#FF5F1F',
                            itemHoverColor: '#FFFFFF',
                            itemSelectedColor: '#FFFFFF',
                            itemMarginBlock: 0,
                            itemBorderRadius: 10,
                            horizontalItemHoverBg: '#FF5F1F',
                            horizontalItemSelectedBg: '#FF5F1F',
                        },
                        Pagination: {
                            itemActiveBg: '#FF5F1F',
                        },
                    },
                }}
            >
                <div className={`${styles.helpCenterDetailContainer} customHelperMenu`}>
                    <Breadcrumb
                        className={styles.breadcrumb}
                        items={[
                            {
                                title: <a onClick={handleBack}>帮助中心</a>,
                            },
                            {
                                title: category || '详情',
                            },
                            ...(currentParentMenuLabel ? [{
                                title: <a onClick={showArticleDetail ? handleBackToList : undefined}>{currentParentMenuLabel}</a>,
                            }] : []),
                            ...(currentMenuLabel ? [{
                                title: <a onClick={showArticleDetail ? handleBackToList : undefined}>{currentMenuLabel}</a>,
                            }] : []),
                            ...(showArticleDetail && currentArticle ? [{
                                title: currentArticle.title,
                            }] : []),
                        ]}
                    />
                    {/* 只在非文章详情页显示标题 */}
                    {!showArticleDetail && (
                        <h1 style={{ fontSize: 32, fontWeight: 600, marginTop: 20, marginBottom: 40 }}>
                            {title || '详情页'}
                        </h1>
                    )}

                    <Layout style={{ background: 'transparent' }}>
                        {!showArticleDetail && (
                            <Sider width={240} style={{ background: 'transparent' }}>
                                <Menu
                                    mode="inline"
                                    selectedKeys={selectedKeys}
                                    openKeys={openKeys}
                                    onOpenChange={handleOpenChange}
                                    onClick={handleMenuClick}
                                    style={{
                                        borderRight: 0,
                                        background: 'transparent'
                                    }}
                                    items={menuItems}
                                />
                            </Sider>
                        )}
                        <Content style={{ padding: showArticleDetail ? 0 : '0 24px', minHeight: 280 }}>
                            <div className={styles.detailContent}>
                                {showArticleDetail && currentArticle ? (
                                    <div className={styles.articleDetail}>
                                        <div className={styles.articleHeader}>
                                            <h1 className={styles.articleTitle}>
                                                {currentArticle.title}
                                            </h1>
                                            <div className={styles.articleTime}>
                                                {currentArticle.time}
                                            </div>
                                        </div>
                                        <div className={styles.articleContent}>
                                            {currentArticle.content}
                                        </div>
                                    </div>
                                ) : (
                                    content.items.length > 0 ? (
                                        <>
                                            <div className={styles.searchResult}>
                                                {getCurrentPageItems().map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className={styles.searchResultContent}
                                                        onClick={() => handleArticleClick(item)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <h6 className={styles.title}>
                                                            {item.title}
                                                        </h6>
                                                        <p className={styles.content}>
                                                            {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
                                                        </p>
                                                        <span className={styles.time}>{item.time}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {content.items.length > pageSize && (
                                                <div className={styles.pagination}>
                                                    <Pagination
                                                        size="small"
                                                        current={currentPage}
                                                        pageSize={pageSize}
                                                        total={content.items.length}
                                                        onChange={handlePageChange}
                                                        showSizeChanger={false}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className={styles.emptyContent}>
                                            请选择左侧菜单查看详细内容
                                        </div>
                                    )
                                )}
                            </div>
                        </Content>
                    </Layout>
                </div>
            </ConfigProvider>
        </div>
    );
}