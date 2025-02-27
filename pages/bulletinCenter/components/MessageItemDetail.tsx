import MessageItem from './MessageItem';
import DetailBreadCrumb from './DetailBreadCrumb';
import { MessageItemDetailProps } from '@/type/bulletin_center/bc_types';

export default function MessageItemDetail({ message, onBack, currentDetailLabel }: MessageItemDetailProps) {
    const items = [
        { title: '公告', onClick: onBack },
        { title: currentDetailLabel },
        { title: '文章' }
    ];
    return (
        <>
            <DetailBreadCrumb items={items} />
            <MessageItem
                title={message.title}
                time={message.time}
                content={message.content}
                isDetail
            />
        </>
    );
}