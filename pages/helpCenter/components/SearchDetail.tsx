import { SearchDetailProps, SearchCategory } from '@/type/help_center/hc_types';
import styles from '../styles/helpCenter.module.css';

import { Breadcrumb, ConfigProvider, Empty, Segmented } from 'antd';
import SearchResult from './SearchResult';
import { useState } from 'react';

const SearchDetail: React.FC<SearchDetailProps> = ({
    searchValue = '',
    searchResults = [],
    setShowSearch,
    setSearchValue
}) => {
    // 当前分类
    const [currentCategory, setCurrentCategory] = useState<SearchCategory>('全部');
    // 添加空值检查
    if (!searchResults) return null;
    
    // 根据分类筛选结果
    const filteredResults = searchResults?.filter(item =>
        currentCategory === '全部' || item.category === currentCategory
    ) || [];
    // 返回按钮
    const handleBack = () => {
        setShowSearch(false);
        setSearchValue('');  // 清空搜索值
    };
    return (
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
                    Segmented: {
                        itemHoverColor: 'none'
                    },
                },
            }}
        >
            <div className={styles.searchDetailContainer}>
                <Breadcrumb
                    className={styles.breadcrumb}
                    items={[
                        {
                            title: <a onClick={handleBack}>帮助中心</a>,
                        },
                        {
                            title: '搜索结果',
                        },
                    ]}
                />
                <Segmented
                    size='small'
                    shape="round"
                    value={currentCategory}
                    options={['全部', '常见问题', '公告']}
                    onChange={(value) => setCurrentCategory(value as SearchCategory)}
                    className={`${styles.segmented} customSegmented`}
                />
                {filteredResults.length > 0 ? (
                    <SearchResult
                        resultCount={filteredResults.length}
                        items={filteredResults}
                        currentCategory={currentCategory}
                        searchValue={searchValue}
                    />
                ) : (
                    <div style={{ margin: '60px 0' }}>
                        <ConfigProvider
                            theme={{
                                components: {
                                    Empty: {
                                        colorTextDescription: '#A4A5AC'
                                    }
                                },
                            }}
                        >
                            <Empty
                                image='/images/help_center/no_data.png'
                                imageStyle={{
                                    width: '156px',
                                    height: '156px',
                                    margin: '0px auto'
                                }}
                            />
                        </ConfigProvider>
                    </div>
                )}
            </div>
        </ConfigProvider>
    );
};

export default SearchDetail;