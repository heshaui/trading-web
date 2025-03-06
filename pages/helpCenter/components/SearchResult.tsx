import styles from '../styles/helpCenter.module.css';
import { SearchResultProps } from '@/type/help_center/hc_types';
import { highlightText } from '@/utils/highlight';

const SearchResult: React.FC<SearchResultProps> = ({ resultCount=0, items=[], currentCategory='全部', searchValue='' }) => {
    // 添加空值检查
    if (!items) return null;

    return (
        <div className={styles.searchResult}>
            <h2 className={styles.searchResultTitle}>
                搜索结果（{resultCount}）
            </h2>
            {items.map((item, index) => (
                <div key={index} className={styles.searchResultContent}>
                    <h6 className={styles.title}>
                        {highlightText(item.title, searchValue)}
                    </h6>
                    <p className={styles.content}>
                        {highlightText(item.content, searchValue)}
                    </p>
                    <span className={styles.time}>{item.time}</span>
                </div>
            ))}
        </div>
    );
};

export default SearchResult;