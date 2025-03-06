import styles from '../styles/helpCenter.module.css';
import { SearchResultProps } from '@/type/help_center/hc_types';
import { highlightText } from './/highlight';

const SearchResult: React.FC<SearchResultProps> = ({ resultCount, items, currentCategory, searchValue }) => {
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