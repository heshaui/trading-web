

import styles from '../styles/bulletinCenter.module.css';
import { MessageData } from '@/type/bulletin_center/bc_types';

export default function MessageItem({ title, time }: MessageData) {
    return (
        <>
            <div className={styles.bulletinCenterContent}>
                <h6>{title}</h6>
                <div className={styles.timeContent}>
                    <span>{time}</span>
                </div>
            </div>
        </>
    );
}