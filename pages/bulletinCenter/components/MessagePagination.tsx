import { Pagination } from 'antd';
import { PaginationProps } from 'antd';
import styles from '../styles/bulletinCenter.module.css';
export default function BulletinCenter() {
    const onShowSizeChange: PaginationProps['onShowSizeChange'] = (current, pageSize) => {
        console.log(current, pageSize);
    };
    return (
        <>
            <div className={styles.PaginationMargin}>
                <Pagination
                    // showSizeChanger
                    onShowSizeChange={onShowSizeChange}
                    defaultCurrent={1}
                    total={50}
                    align="end"
                    size='small'
                />
            </div>
        </>
    );
}