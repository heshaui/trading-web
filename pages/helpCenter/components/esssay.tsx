import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { Breadcrumb, ConfigProvider, Layout, Menu, Pagination } from 'antd';
import Link from 'next/link';
import styles from '../styles/helpCenter.module.css';
import Image from 'next/image';
import { getClassIdContent, getCustomization, getHelpCenterMenu } from '@/services/helpCenter';
import appStore from '@/store';
import { HelpCenterMenuProps, HelpCenterMenuProps2 } from '@/type/help_center/hc_types';
import { toast } from 'sonner';

const { Sider, Content } = Layout;
interface currentArticletype {
    title: string;
    content: string;
    time: string;
}
type Props = {
    currentArticle:currentArticletype
}

export default function EsssayPage({currentArticle}:Props) {
    // 路由
    const router = useRouter();
    // 路由参数
    const { classId, parentId } = router.query;
    const langKey = appStore.getLang();
    // 路由参数
    const locale = router.query.locale || 'zh';

    return (
        <div className={styles.helpCenterContainer}>
                <div className={`${styles.helpCenterDetailContainer} customHelperMenu`}>
                   
                    {/* 只在非文章详情页显示标题 */}
                    {/* {!showArticleDetail && ( */}
                    <h1 style={{ fontSize: 32, fontWeight: 600, marginTop: 20, marginBottom: 40 }}>
                        { '--'}
                    </h1>
                    {/* )} */}

                    <Layout style={{ background: 'transparent' }}>

                        <Content style={{ padding:  '0 24px', minHeight: 280 }}>
                            <div className={styles.detailContent}>
                                {/* {showArticleDetail && currentArticle ? ( */}
                                <div className={styles.articleDetail}>
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
                                </div>
                            </div>
                        </Content>
                    </Layout>
                </div>
        </div>
    );
}