import styles from '../../styles/table.module.css';

interface DataType {
    currency: string;
    imgSrc: string;
}

const TableItem: React.FC<DataType> = ({ currency, imgSrc }) => {
    return (
        <div className={styles.tableItemContainer}>
            <img src={imgSrc} alt="" />
            <span>{ currency }</span>
        </div>
    )
}
export default TableItem;