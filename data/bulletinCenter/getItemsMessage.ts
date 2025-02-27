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
const detailMenuItems = [
  {
    key: 'latest',
    label: '最新动态',
    defaultIcon: '/images/bulletin_center/icon_Dynamic state.png',
    hoverIcon: '/images/bulletin_center/icon_Dynamic state_hover.png',
  },
  {
    key: 'new',
    label: '新币上线',
    defaultIcon: '/images/bulletin_center/icon_Top line.png',
    hoverIcon: '/images/bulletin_center/icon_Top line_hover.png',
  },
  {
    key: 'delist',
    label: '币对下线',
    defaultIcon: '/images/bulletin_center/icon_downline.png',
    hoverIcon: '/images/bulletin_center/icon_downline_hover.png',
  },
  {
    key: 'suspension',
    label: '充提暂停/恢复',
    defaultIcon: '/images/bulletin_center/icon_charging.png',
    hoverIcon: '/images/bulletin_center/icon_charging_hover.png',
  }
];

// 定义消息数据，使用 menuData 的 key 作为索引
const messageData: Record<string, Messages> = {
  '1': [
    {
      title: '公告 1 标题XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      time: '2024-12-12 12:12:12',
      content: '公告 1 内容XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    },
    { title: '公告 2 标题YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', time: '2024-12-12 13:15:30', content: '公告 2 内容YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY' },
    { title: '公告 3 标题ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', time: '2024-12-12 14:20:45', content: '公告 3 内容ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ' },
    { title: '公告 4 标题AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', time: '2024-12-12 15:25:10', content: '公告 4 内容AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
    { title: '公告 1 标题XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', time: '2024-12-12 12:12:12', content: '公告 1 内容XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
    { title: '公告 2 标题YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', time: '2024-12-12 13:15:30', content: '公告 2 内容YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY' },
    { title: '公告 3 标题ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', time: '2024-12-12 14:20:45', content: '公告 3 内容ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ' },
    { title: '公告 4 标题AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', time: '2024-12-12 15:25:10', content: '公告 4 内容AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
    { title: '公告 1 标题XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', time: '2024-12-12 12:12:12', content: '公告 1 内容XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
    { title: '公告 2 标题YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', time: '2024-12-12 13:15:30', content: '公告 2 内容YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY' },
    { title: '公告 3 标题ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', time: '2024-12-12 14:20:45', content: '公告 3 内容ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ' },
    { title: '公告 4 标题AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', time: '2024-12-12 15:25:10', content: '公告 4 内容AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
  ],
  '2': [
    { title: '账户助手通知 1', time: '2024-12-13 14:30:00' },
    { title: '账户助手通知 2', time: '2024-12-13 15:45:20' },
  ],
  '3': [
    { title: '资产更新 1', time: '2024-12-14 09:00:00' },
    { title: '资产更新 2', time: '2024-12-14 10:15:30' },
    { title: '资产更新 3', time: '2024-12-14 11:30:45' },
    { title: '资产更新 4', time: '2024-12-14 12:45:10' },
  ],
  '4': [
    { title: '交易动态 1', time: '2024-12-15 16:45:00' },
    { title: '交易动态 2', time: '2024-12-15 17:50:15' },
  ],
};

export { menuData, messageData, detailMenuItems };