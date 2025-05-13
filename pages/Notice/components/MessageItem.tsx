import styles from '../styles/bulletinCenter.module.css';
import { MessageData } from '@/type/bulletin_center/bc_types';
import dayjs from 'dayjs';

export default function MessageItem({
    title,
    time,
    content,
    isClickable = false,
    onClick,

}: MessageData) {
    return (
        <>
            <div
                className={`${styles.bulletinCenterContent}`}
                onClick={isClickable ? onClick : undefined}
            >
                <h6>{title}</h6>
                <div className={styles.timeContent}>
                    <span>{dayjs(time).format('YYYY-MM-DD HH:mm')}</span>
                </div>
            </div>
        </>
    );
}