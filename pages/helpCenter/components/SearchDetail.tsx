import { SearchDetailProps } from '@/type/help_center/hc_types';

const SearchDetail: React.FC<SearchDetailProps> = ({ searchValue }) => {
    return (
        <div>
            <h2>搜索结果</h2>
            <p>您搜索的内容是：{searchValue}</p>
            {/* 添加搜索结果的展示逻辑 */}
        </div>
    );
};

export default SearchDetail;