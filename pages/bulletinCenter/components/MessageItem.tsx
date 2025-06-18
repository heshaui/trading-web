import styles from '../styles/bulletinCenter.module.css';
import { MessageData } from '@/type/bulletin_center/bc_types';

export default function MessageItem({
    title,
    time = '',
    content,
    isClickable = false,
    isDetail = false,
    onClick,
    isRead = false
}: MessageData) {
    return (
        <>
            <div
                className={`${styles.bulletinCenterContent} `}
                onClick={isClickable ? onClick : undefined}
            >
                <h6 className={isRead ? styles.readTitle : ''}>{title}</h6>
                <div className={`${styles.timeContent} w-full`}>
                     {time&&<span>{time}</span>}
                    {content && <p style={{ color: 'var(--text-color5)' }}>{content}</p>}
                </div>
            </div>
            {isDetail && content && (
                <div className={`${styles.contentContainer} ${isDetail ? styles.expanded : ''}`}>
                    <p style={{ color: 'var(--text-color5)' }}>{content}</p>
                </div>
            )}
        </>
    );
}