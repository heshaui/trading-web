import styles from '../styles/bulletinCenter.module.css';
import { MessageData } from '@/type/bulletin_center/bc_types';
import dayjs from 'dayjs';

export default function MessageItem({
    title,
    time,
    content,
    isClickable = false,
    isDetail = false,
    onClick,
    isRead = false
}: MessageData) {
    return (
        <>
            <div
                className={`${styles.bulletinCenterContent} ${isDetail ? styles.detail : ''}`}
                onClick={isClickable ? onClick : undefined}
            >
                <h6 className={isRead ? styles.readTitle : ''}>{title}</h6>
                <div className={styles.timeContent}>
                    <span>{dayjs(time).format('YYYY-MM-DD HH:mm')}</span>
                </div>
            </div>
            {isDetail && content && (
                <div className={`${styles.contentContainer} ${isDetail ? styles.expanded : ''}`}>
                    <div style={{ color: 'var(--text-color5)' }} dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            )}
        </>
    );
}