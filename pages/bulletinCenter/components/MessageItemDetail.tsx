import MessageItem from './MessageItem';
import DetailBreadCrumb from './DetailBreadCrumb';
import { MessageItemDetailProps } from '@/type/bulletin_center/bc_types';

export default function MessageItemDetail({ message, onBack, currentDetailLabel }: MessageItemDetailProps) {
    // 确保 message 存在
    if (!message) {
        return null; // 或者返回一个加载状态/错误状态的组件
    }
    const items = [
        { title: '公告', onClick: onBack },
        { title: currentDetailLabel || '最新动态' },
        { title: '文章' }
    ];
    return (
        <>
            <DetailBreadCrumb items={items} />
            <MessageItem
                title={message.title || ''}
                time={message.time || ''}
                content={message.content || ''}
                isDetail
            />
        </>
    );
}