import { SearchDetailProps } from '@/type/help_center/hc_types';
import styles from '../styles/helpCenter.module.css';

import { Breadcrumb, ConfigProvider, Segmented } from 'antd';

const SearchDetail: React.FC<SearchDetailProps> = ({ searchValue }) => {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Breadcrumb: {
                        itemColor: 'var(--text-color6)',
                        lastItemColor: 'var(--text-color5)',
                        separatorColor: 'var(--text-color6)',
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
                            title: '帮助中心',
                        },
                        {
                            title: '搜索结果',
                        },
                    ]}
                />
                <Segmented
                    size='small'
                    shape="round"
                    options={['全部', '常见问题', '公告']}
                    onChange={(value) => {
                        console.log(value); // string
                    }}
                    className={`${styles.segmented} customSegmented`}
                />
                <div className={styles.searchResult}>
                    <h2>搜索结果</h2>
                    <p>您搜索的内容是：{searchValue}</p>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default SearchDetail;