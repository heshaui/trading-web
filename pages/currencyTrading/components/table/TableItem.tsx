import styles from '../../styles/table.module.css';
import Image from 'next/image';

interface DataType {
    currency: string;
    imgSrc: string;
}

const TableItem: React.FC<DataType> = ({ currency, imgSrc }) => {
    return (
        <div className={styles.tableItemContainer}>
            {/* <img src={imgSrc} alt="" /> */}
            <Image
                src={imgSrc}
                alt=""
                width={28}
                height={28}
            />
            <span>{currency}</span>
        </div>
    )
}
export default TableItem;