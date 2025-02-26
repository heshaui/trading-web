import { MessageData } from '@/type/bulletin_center/bc_types';
// 定义消息数据类型（数组形式）
type Messages = MessageData[];

// 定义菜单项数据，使用循环生成四个菜单项
const menuData = [
    { key: '1', defaultIcon: '/images/bulletin_center/icon_horn.png', hoverIcon: '/images/bulletin_center/icon_horn_hover.png', label: '公告（4）' },
    { key: '2', defaultIcon: '/images/bulletin_center/icon_contacts.png', hoverIcon: '/images/bulletin_center/icon_contacts_hover.png', label: '账户助手' },
    { key: '3', defaultIcon: '/images/bulletin_center/icon_assets.png', hoverIcon: '/images/bulletin_center/icon_assets_hover.png', label: '资产' },
    { key: '4', defaultIcon: '/images/bulletin_center/icon_Trading.png', hoverIcon: '/images/bulletin_center/icon_Trading_hover.png', label: '交易' },
];

// 定义消息数据，使用 menuData 的 key 作为索引
const messageData: Record<string, Messages> = {
    '1': [
      { title: '公告 1 标题XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', time: '2024-12-12 12:12:12' },
      { title: '公告 2 标题YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', time: '2024-12-12 13:15:30' },
      { title: '公告 3 标题ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', time: '2024-12-12 14:20:45' },
      { title: '公告 4 标题AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', time: '2024-12-12 15:25:10' },
    ],
    '2': [
      { title: '账户助手通知 1', time: '2024-12-13 14:30:00' },
      { title: '账户助手通知 2', time: '2024-12-13 15:45:20' },
    ],
    '3': [
      { title: '资产更新 1', time: '2024-12-14 09:00:00' },
      { title: '资产更新 2', time: '2024-12-14 10:15:30' },
    ],
    '4': [
      { title: '交易动态 1', time: '2024-12-15 16:45:00' },
      { title: '交易动态 2', time: '2024-12-15 17:50:15' },
    ],
  };

export { menuData, messageData };