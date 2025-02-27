import styles from '../styles/bulletinCenter.module.css';
import { MessageData } from '@/type/bulletin_center/bc_types';

export default function MessageItem({
    title,
    time,
    content,
    isClickable = false,
    isDetail = false,
    onClick
}: MessageData) {
    return (
        <>
            <div
                className={`${styles.bulletinCenterContent} ${isClickable ? styles.clickable : ''} ${isDetail ? styles.detail : ''}`}
                onClick={isClickable ? onClick : undefined}
            >
                <h6 className={isDetail ? styles.detailTitle : ''}>{title}</h6>
                <div className={styles.timeContent}>
                    <span>{time}</span>
                </div>
            </div>
            {isDetail && content && (
                <div className={styles.contentContainer}>
                    <p>{content}</p>
                </div>
            )}
        </>
    );
}