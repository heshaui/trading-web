import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { Breadcrumb, ConfigProvider, Layout, Menu, Pagination, Skeleton } from 'antd';
import Link from 'next/link';
import styles from './styles/helpCenter.module.css';
import Image from 'next/image';
import { getClassIdContent, getCustomization, getHelpCenterMenu } from '@/services/helpCenter';
import appStore from '@/store';
import { HelpCenterMenuProps, HelpCenterMenuProps2 } from '@/type/help_center/hc_types';
import { toast } from 'sonner';
import EsssayPage from './components/esssay';
import { useTranslation } from 'next-i18next';

const { Sider, Content } = Layout;
interface currentArticletype {
    title: string;
    content: string;
    time: string;
}

export default function HelperCenterDetail() {
    const { t } = useTranslation('helpCenter');
    // 路由
    const router = useRouter();
    // 路由参数
    const { classId, parentId } = router.query;
    const langKey = appStore.getLang();
    // 路由参数
    const locale = router.query.locale || 'zh';

    // 
    const [helpCenterMenuData, setHelpCenterMenuData] = useState<HelpCenterMenuProps[]>([]); // 帮助中心菜单

    const [menuData, setMenuData] = useState<HelpCenterMenuProps2>({} as HelpCenterMenuProps2);
    // 选中菜单
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    // 展开菜单
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [contentList, setContentList] = useState<any[]>([])
    const paramRef = useRef({
        classId: '' as string | null,
        lang: langKey,
        page: 1,
        pageSize: 10,
        total: 0
    })
    const [menuLoding, setMenuLoding] = useState(true)
    const [essayLoding, setEssayLoding] = useState(true)
    const [showDetail, setShowDetail] = useState(false)

    // 帮助中心菜单
    // 递归查找指定id的菜单项
    const findMenuItemById = (items: HelpCenterMenuProps2[], targetId: number): HelpCenterMenuProps2 | null => {
        for (const item of items) {
            if (item.id === targetId) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const found = findMenuItemById(item.children, targetId);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };

    // 获取菜单数据
    const getHelpCenterMenuData = async () => {
        setMenuLoding(true);
        const langName = langKey || 'en_US'
        try {
            const res = await getHelpCenterMenu({ lang: langName });
            if (res.code === '0') {
                // const sortedData = recursiveSort([...res.data, 
                //     {
                //         id: 1,
                //         helpDescription: "账户管理",
                //         helpSort: 1,
                //         blackIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png",
                //         whiteIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar2.png",
                //         parentId: 0,
                //         contentId: "1",
                //         languageCode: "en-US",
                //         articleTitle: "账户管理",
                //         children: [
                //             {
                //                 id: 11,
                //                 helpDescription: "修改账户信息",
                //                 helpSort: 10,
                //                 blackIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png",
                //                 whiteIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar2.png",
                //                 parentId: 1,
                //                 contentId: "1",
                //                 languageCode: "en-US",
                //                 articleTitle: "修改账户信息",
                //                 children: [
                //                     {
                //                         id: 111,
                //                         helpDescription: "修改密码",
                //                         helpSort: 10,
                //                         blackIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png",
                //                         whiteIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar2.png",
                //                         parentId: 11,
                //                         contentId: "1",
                //                         languageCode: "en-US",
                //                         articleTitle: "修改密码",
                //                     },
                //                     {
                //                         id: 112,
                //                         helpDescription: "修改手机号",
                //                         helpSort: 10,
                //                         blackIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png",
                //                         whiteIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar2.png",
                //                         parentId: 11,
                //                         contentId: "1",
                //                         languageCode: "en-US",
                //                         articleTitle: "修改手机号",
                //                     },
                //                 ]
                //             },
                //             {
                //                 id: 12,
                //                 helpDescription: "修改昵称",
                //                 helpSort: 11,
                //                 blackIcon: "https://meta2025.oss-ap-northeast-2.aliyuncs.com/user/avatar1.png",
                //                 whiteIcon: "",
                //                 parentId: 1,
                //                 contentId: "1",
                //                 languageCode: "en-US",
                //                 articleTitle: "修改昵称",
                //             }]
                //     }
                // ]);
                const sortedData = recursiveSort(res.data)
                setHelpCenterMenuData(sortedData);

                // 在所有菜单项中查找showMenuItem
                let showMenuItem: HelpCenterMenuProps2 | null = null;
                let parentMenu: HelpCenterMenuProps2 | null = null;

                // 递归查找匹配的菜单项
                for (const item of sortedData) {
                    if (item.children) {
                        for (const child of item.children) {
                            if (child.id === Number(classId)) {
                                showMenuItem = child;
                                parentMenu = item;
                                break;
                            }
                            // 如果还有下一级子菜单，继续查找
                            if (child.children) {
                                for (const subChild of child.children) {
                                    if (subChild.id === Number(classId)) {
                                        showMenuItem = subChild;
                                        parentMenu = child;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                // 如果找到了匹配的菜单项
                if (showMenuItem && parentMenu) {
                    // 设置当前菜单数据为父级菜单
                    setMenuData(parentMenu);

                    // 如果showMenuItem有子菜单，选中第一个子菜单
                    if (showMenuItem.children && showMenuItem.children.length > 0) {
                        const firstChild = showMenuItem.children[0];
                        setSelectedKeys([String(firstChild.id)]);
                        setOpenKeys([String(showMenuItem.id)]);
                        setCurrentParentMenuLabel(showMenuItem.articleTitle);
                        setCurrentMenuLabel(firstChild.articleTitle);
                        // 设置classId并获取内容列表
                        paramRef.current.classId = String(firstChild.id);
                    } else {
                        // 如果没有子菜单，直接选中当前菜单项
                        setSelectedKeys([String(showMenuItem.id)]);
                        setCurrentMenuLabel(showMenuItem.articleTitle);
                        setCurrentParentMenuLabel(parentMenu.articleTitle);
                        // 设置classId并获取内容列表
                        paramRef.current.classId = String(showMenuItem.id);
                    }
                    // 重置页码并获取内容列表
                    paramRef.current.page = 1;
                    getContentList();
                }
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(String(error))
        } finally {
            setMenuLoding(false)
        }
    };
    // 递归排序函数
    const recursiveSort = (data: HelpCenterMenuProps2[]): HelpCenterMenuProps2[] => {
        return data.map(item => {
            // if (item.children && item.children.length > 0) {
            if (item.type === 2) {
                if (item.children && item.children.length > 0) {
                    return {
                        ...item,
                        key: String(item.id),
                        label: item.articleTitle,
                        children: recursiveSort(item.children)
                    };
                } else {
                    return {
                        ...item,
                        key: String(item.id),
                        label: item.articleTitle,
                        children: []
                    };
                }
            } else {
                return {
                    ...item,
                    key: String(item.id),
                    label: item.articleTitle,
                    children: undefined
                }
            }
        }).sort((a, b) => a.helpSort - b.helpSort);
    };

    useEffect(() => {
        if (classId && parentId) {
            getHelpCenterMenuData()
        }
    }, [classId, parentId, langKey]);


    const [content, setContent] = useState<{
        items: currentArticletype[]
    }>({ items: [] });
    // 当前菜单标签
    const [currentMenuLabel, setCurrentMenuLabel] = useState<string>('');
    // 当前父菜单标签
    const [currentParentMenuLabel, setCurrentParentMenuLabel] = useState<string>('');
    // 添加文章详情相关状态
    const [showArticleDetail, setShowArticleDetail] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<currentArticletype >({} as currentArticletype);


    // 处理分页变化
    const handlePageChange = (page: number) => {
        // setCurrentPage(page);
        paramRef.current.page = page;
        getContentList();
    };


    // 处理菜单点击
    const handleMenuClick = (info: any) => {
        if (!menuData) return;

        setSelectedKeys([info.key]);

        // 查找当前点击的菜单项及其父菜单
        const { label, parentLabel } = findMenuInfo(Object.keys(menuData).length > 0 ? menuData.children as HelpCenterMenuProps2[] : [], info.key);

        // 设置面包屑标签
        setCurrentMenuLabel(label || '');
        setCurrentParentMenuLabel(parentLabel || '');

        // 获取内容
        // setContent(getContent(info.key, category as string));
        console.log(info, 999);
        paramRef.current.classId = String(info.key);
        // 重置页码并获取内容列表
        paramRef.current.page = 1;
        getContentList();

        // 重置分页到第一页
        // setCurrentPage(1);
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
        setShowDetail(true)
    };

    // 返回文章列表
    const handleBackToList = () => {
        setShowArticleDetail(false);
        setCurrentArticle({} as currentArticletype);
    };

    // 处理子菜单展开/收起
    const handleOpenChange = (keys: string[]) => {
        setOpenKeys(keys);
    };

    // 返回帮助中心
    const handleBack = () => {
        router.push(`/helpCenter`);
    };
    // 文章列表
    const getContentList = async () => {
        setEssayLoding(true);
        try {
            const { classId, lang, page, pageSize } = paramRef.current;
            const res = await getClassIdContent({ classId: classId || '', lang, page, size: pageSize });
            if (res.code === '0') {
                setContentList(res.data);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(String(error))
        } finally {
            setEssayLoding(false);
        }
    }

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
                            // itemActiveBg: 'var(--theme-color)',
                            // itemHoverBg: 'var(--theme-color)',
                            // itemSelectedBg: 'var(--theme-color)',
                            itemHoverColor: '#FFFFFF',
                            itemSelectedColor: '#FFFFFF',
                            itemMarginBlock: 0,
                            itemBorderRadius: 10,
                            horizontalItemHoverBg: 'var(--theme-color)',
                            horizontalItemSelectedBg: 'var(--theme-color)',
                        },
                        Pagination: {
                            itemActiveBg: 'var(--theme-color)',
                        },
                    },
                }}
            >
                <div className={`${styles.helpCenterDetailContainer} customHelperMenu`}>
                    <Breadcrumb
                        className={styles.breadcrumb}
                        items={[
                            {
                                title: <Link
                                    // onClick={handleBack}
                                    href="/helpCenter">
                                    {t('helpCenter.helpCenter')}</Link>,
                            },
                            {
                                title: menuData?.articleTitle || '--',
                            },
                            ...(currentParentMenuLabel ? [{
                                title: <div
                                // onClick={showArticleDetail ? handleBackToList : undefined}
                                // href={showArticleDetail ? `/helpCenter/${parentId}` : `/helpCenter/${classId}`}
                                >{currentParentMenuLabel}</div>,
                            }] : []),
                            ...(currentMenuLabel ? [{
                                title: <div
                                // onClick={showArticleDetail ? handleBackToList : undefined}
                                // href={showArticleDetail ? `/helpCenter/${parentId}` : `/helpCenter/${classId}`}
                                >{currentMenuLabel}</div>,
                            }] : []),
                            ...(showArticleDetail && currentArticle ? [{
                                title: currentArticle.title,
                            }] : []),
                        ]}
                    />
                    {/* 只在非文章详情页显示标题 */}
                    {!showDetail ? <>
                    <h1 style={{ fontSize: 32, fontWeight: 600, marginTop: 20, marginBottom: 40 }}>
                        {menuLoding?<Skeleton.Input active={true} size='large' block={menuLoding} />:menuData?.articleTitle || '--'}
                    </h1>
                    {/* )} */}

                    <Layout style={{ background: 'transparent' }}>
                        {!showDetail && (
                            <Sider width={240} style={{ background: 'transparent' }}>
                                {menuLoding ? <><Skeleton.Input active={true}  block={menuLoding} />
                                    <Skeleton.Input active={true}  block={menuLoding} className='mt-1' />
                                    <Skeleton.Input active={true}  block={menuLoding} className='mt-1' />
                                
                                </> : (
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
                                    items={menuData.children as any[] || []}
                                />
                                )}
                            </Sider>
                        )}
                        <Content style={{ padding: showDetail ? 0 : '0 24px', minHeight: 280 }}>
                            <div className={styles.detailContent}>
                                {/* {showArticleDetail && currentArticle ? ( */}
                                {/* <div className={styles.articleDetail}>
                                        <div className={styles.articleHeader}>
                                            <h1 className={styles.articleTitle}>
                                                {currentArticle?.title || '--'}
                                            </h1>
                                            <div className={styles.articleTime}>
                                                {currentArticle?.time || '--'}
                                            </div>
                                        </div>
                                        <div className={styles.articleContent}>
                                            {currentArticle?.content || '--'}
                                        </div>
                                    </div> */}
                                {/* ) : (
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
                                        </div> */}
                                {/* )
                                )} */}
                                <Skeleton active={true} loading={essayLoding} paragraph={{ rows: 2 }}>

                                    {contentList.length > 0 ? <>
                                        <div className={styles.searchResult}>
                                            {contentList.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className={styles.searchResultContent}
                                                    onClick={() => handleArticleClick(item)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <h6 className={styles.title}>
                                                        {item.articleTitle}
                                                    </h6>
                                                    <p className={styles.content}>
                                                        {item.articleContent.length > 100 ? `${item.articleContent.substring(0, 100)}...` : item.articleContent}
                                                    </p>
                                                    <span className={styles.time}>{item.time}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {contentList.length > 0 && (
                                            <div className={styles.pagination}>
                                                <Pagination
                                                    size="small"
                                                    current={paramRef.current.page}
                                                    pageSize={paramRef.current.pageSize}
                                                    total={paramRef.current.total}
                                                    onChange={handlePageChange}
                                                    showSizeChanger={false}
                                                />
                                            </div>
                                        )}
                                    </> : <div className={styles.emptyContent}>
                                        暂无内容
                                    </div>}
                                </Skeleton>
                            </div>
                        </Content>
                    </Layout>
                </>:<EsssayPage currentArticle={currentArticle} />}
                </div>
            </ConfigProvider>
        </div>
    );
}