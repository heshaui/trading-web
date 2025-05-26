import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { Tooltip , Layout,  } from 'antd';
import Link from 'next/link';
import styles from '../styles/helpCenter.module.css';
import {Iconify} from '@/components/icon/index'
import { useTranslation } from 'next-i18next';

const { Sider, Content } = Layout;
interface currentArticletype {
    title: string;
    content: string;
    time: string;
}
type Props = {
    currentArticle:currentArticletype;
    handleBackToList: () => void;
}

export default function EsssayPage({currentArticle, handleBackToList}:Props) {
    // 路由
    const router = useRouter();
    const { t } = useTranslation('helpCenter');

    return (
        <div className={styles.helpCenterContainer}>
                <div className={`${styles.helpCenterDetailContainer} ${styles.detail_container} customHelperMenu `}>
                   
                    {/* 只在非文章详情页显示标题 */}
                {/* {!showArticleDetail && ( */}
                <Tooltip title={t('helpCenter.detail.back')}>
                    <button onClick={() => handleBackToList()}
                    className='font-32 font-weight-600 mt-5 mb-5'>
                        <Iconify icon="mingcute:arrow-left-fill" size={32} />
                    </button>
                </Tooltip>
                    {/* )} */}

                    <Layout style={{ background: 'transparent' }}>

                    <Content className='w-full h-full'
                        style={{ padding: '0 24px', minHeight: 280 }}>
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