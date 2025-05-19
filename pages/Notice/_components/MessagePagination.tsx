import { Pagination } from 'antd';
import { PaginationProps } from 'antd';
import styles from '../styles/bulletinCenter.module.css';

export default function MessagePagination(props: PaginationProps) {
    return (
        <div className={styles.PaginationMargin}>
            <Pagination
                {...props}
                pageSize={5}
                align="end"
                size='small'
                hideOnSinglePage // 当只有一页时隐藏分页器
            />
        </div>
    );
}