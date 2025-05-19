import { useState } from 'react';
import styles from '../styles/bulletinCenter.module.css';
import { MessageItemDetailProps } from '@/type/bulletin_center/bc_types';

export default function MessageItemDetail({
    content
}: MessageItemDetailProps) {
    const [showContent, setShowContent] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5; // 每页显示的数量
    // 确保 message 存在
 
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

   

    const handleDetailClick = () => {
        setShowContent(prev => !prev);
    }



    return (
        <>

            <div className={`${styles.contentContainer}`}>
                <div style={{ color: 'var(--text-color5)' }} dangerouslySetInnerHTML={{ __html: content }} />
            </div>

        </>
    );
}