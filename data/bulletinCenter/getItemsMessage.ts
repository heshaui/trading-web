import { MessageData } from '@/type/bulletin_center/bc_types';
// 定义消息数据类型（数组形式）
type Messages = MessageData[];

// 定义公告顶层的菜单项数据，使用循环生成四个菜单项
// 用不了多语言
const menuData = [
  { key: 'all', defaultIcon: '/images/bulletin_center/icon_horn.png', hoverIcon: '/images/bulletin_center/icon_horn_hover.png', label: '公告（4）' },
  { key: 'account', defaultIcon: '/images/bulletin_center/icon_contacts.png', hoverIcon: '/images/bulletin_center/icon_contacts_hover.png', label: '账户助手' },
  { key: 'assets', defaultIcon: '/images/bulletin_center/icon_assets.png', hoverIcon: '/images/bulletin_center/icon_assets_hover.png', label: '资产' },
  { key: 'trading', defaultIcon: '/images/bulletin_center/icon_Trading.png', hoverIcon: '/images/bulletin_center/icon_Trading_hover.png', label: '交易' },
];
// 定义公告下级的菜单项
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
// 公告下级的菜单项下的数据
const detailListData: Record<string, Array<{ title: string; time: string; content?: string }>> = {
  'latest': [
    {
      title: '最新动态公告 1',
      time: '2024-12-16 10:00:00',
      content: '最新动态内容 1...'
    },
    {
      title: '最新动态公告 2',
      time: '2024-12-16 09:30:00',
      content: '最新动态内容 2...'
    },
    {
      title: '最新动态公告 1',
      time: '2024-12-16 10:00:00',
      content: '最新动态内容 1...'
    },
    {
      title: '最新动态公告 2',
      time: '2024-12-16 09:30:00',
      content: '最新动态内容 2...'
    },
    {
      title: '最新动态公告 1',
      time: '2024-12-16 10:00:00',
      content: '最新动态内容 1...'
    },
    {
      title: '最新动态公告 2',
      time: '2024-12-16 09:30:00',
      content: '最新动态内容 2...'
    },
    {
      title: '最新动态公告 1',
      time: '2024-12-16 10:00:00',
      content: '最新动态内容 1...'
    },
    {
      title: '最新动态公告 2',
      time: '2024-12-16 09:30:00',
      content: '最新动态内容 2...'
    },
  ],
  'new': [
    {
      title: 'BTC/USDT 交易对上线公告',
      time: '2024-12-16 09:00:00',
      content: '新币上线内容...'
    },
    {
      title: 'ETH/USDT 交易对上线公告',
      time: '2024-12-16 08:30:00',
      content: '新币上线内容...'
    },
    // ... 更多新币上线数据
  ],
  'delist': [
    {
      title: 'ABC/USDT 交易对下线公告',
      time: '2024-12-15 14:30:00',
      content: '币对下线内容...'
    },
    // ... 更多币对下线数据
  ],
  'suspension': [
    {
      title: 'ETH 充提业务暂停公告',
      time: '2024-12-14 16:45:00',
      content: '充提暂停内容...'
    },
    // ... 更多充提暂停数据
  ]
};

// 定义消息数据，使用 menuData 的 key 作为索引
const messageData: Record<string, Messages> = {
  'all': [


  ],
  '2': [

  ],
  '3': [

  ],
  '4': [

  ],
};

export { messageData, menuData, detailMenuItems, detailListData };