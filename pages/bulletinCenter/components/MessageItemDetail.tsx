import { useState } from 'react';

import MessageItem from './MessageItem';
import DetailBreadCrumb from './DetailBreadCrumb';
import MessagePagination from './MessagePagination';
import { MessageItemDetailProps } from '@/type/bulletin_center/bc_types';
import { detailListData } from '@/data/bulletinCenter/getItemsMessage';

export default function MessageItemDetail({
    message,
    onBack,
    currentDetailLabel,
    currentDetailKey,
    onLatestClick,
    showArticle
}: MessageItemDetailProps) {
    const [showContent, setShowContent] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5; // 每页显示的数量
    // 确保 message 存在
    if (!message) {
        return null; // 或者返回一个加载状态/错误状态的组件
    }
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // 获取当前页的数据
    const getCurrentPageData = () => {
        const allData = detailListData[currentDetailKey] || [];
        const startIndex = (currentPage - 1) * pageSize;
        return allData.slice(startIndex, startIndex + pageSize);
    };

    const handleDetailClick =()=>{
        setShowContent(prev => !prev);
    }

    const items = [
        { title: '公告', onClick: onBack },
        {
            title: currentDetailKey === 'latest'
                ? (showArticle ? '最新动态' : currentDetailLabel)
                : currentDetailLabel,
            onClick: currentDetailKey === 'latest' && showArticle ? onLatestClick : undefined
        },
        ...(currentDetailKey === 'latest' && showArticle ? [{ title: '文章' }] : [])
    ];
    return (
        <>
            <DetailBreadCrumb items={items} />
            {!showArticle ? (
                <>
                    <div>
                        {getCurrentPageData().map((item, index) => (
                            <MessageItem
                                key={index}
                                title={item.title}
                                time={item.time}
                            />
                        ))}
                    </div>
                    <MessagePagination
                        current={currentPage}
                        total={(detailListData[currentDetailKey] || []).length}
                        onChange={handlePageChange}
                        pageSize={pageSize}
                    />
                </>
            ) : (
                <MessageItem
                    title={message.title}
                    time={message.time}
                    content={message.content}
                    isClickable
                    onClick={handleDetailClick}
                    isDetail={showContent}
                />
            )}
        </>
    );
}