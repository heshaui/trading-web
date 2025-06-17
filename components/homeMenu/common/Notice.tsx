import React, { useMemo, useState ,useCallback} from 'react';
import { Badge, ConfigProvider, Row, Col, Tabs, TabsProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import MenuItemLabel from '../HomeMenuLabel';
import { NoData } from '@/components/noData';
import { getInformUserMessageList } from '@/services/bulletinCenter';
import dayjs from 'dayjs';

interface NoticeProps {
//   isLoggedIn: boolean;
//   unreadCount: number;
  bulletinDataList: any[];
  isLogin: boolean;
}

const Notice: React.FC<NoticeProps> = ({
//   isLoggedIn,
//   unreadCount,
  bulletinDataList,
  isLogin
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');
    // 站内信相关状态管理
    const [accountLoading, setAccountLoading] = useState(false);
    const [assetsLoading, setAssetsLoading] = useState(false);
    const [transactionLoading, setTransactionLoading] = useState(false);
    const [bizData, setBizData] = useState<any[]>([]);
  const goNotice = (id: string) => {
    router.push(`/Notice/${id}`);
  };
        const handleTabChange = (key: string) => {
            if (key === '2') {
                fetchUserMessageData('account')
            } else if (key === '3') {
                fetchUserMessageData('assets')
            } else if (key === '4') {
                fetchUserMessageData('transaction')
            }
        }
        // 通用的站内信数据获取函数
        const fetchUserMessageData = useCallback(async (bizType: 'account' | 'assets' | 'transaction') => {
            try {
                // 设置对应的加载状态
                switch (bizType) {
                    case 'account':
                        setAccountLoading(true);
                        break;
                    case 'assets':
                        setAssetsLoading(true);
                        break;
                    case 'transaction':
                        setTransactionLoading(true);
                        break;
                }
    
                const lang = localStorage.getItem('lang') || 'en_US';
                const response: any = await getInformUserMessageList({
                    languageCode: lang,
                    pageNum: 1,
                    pageSize: 2,
                    bizType
                });
    
                if (response.code === '0' && response.data) {
                    const formattedData = response.data.list?.map((item: any) => ({
                        id: item.id,
                        title: item.titleTemplate,
                        time: dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
                        content: item.contentTemplate || '',
                        isRead: item.isRead || false,
                        link: item.link || ''
                    })) || [];
                    setBizData(formattedData)
                } else {
                    // 如果没有数据，设置为空数组
                    setBizData([])
                }
            } catch (error) {
                console.error(`获取${bizType}消息数据失败:`, error);
                // 错误时设置为空数组
                setBizData([])
            } finally {
                // 清除加载状态
                switch (bizType) {
                    case 'account':
                        setAccountLoading(false);
                        break;
                    case 'assets':
                        setAssetsLoading(false);
                        break;
                    case 'transaction':
                        setTransactionLoading(false);
                        break;
                }
            }
        }, []);
    

  // 公告中心标签页
  const bulletinItems: TabsProps['items'] = [
    {
      key: '1',
      label: t('header.notice.notice'), // "公告"
      children:
        bulletinDataList.length > 0
          ? bulletinDataList.map((item: any, index: number) => (
            <MenuItemLabel 
              key={index} 
              h5Text={item.h5Text} 
              spanText={item.spanText} 
              needHover 
              onClick={() => { goNotice(item.id) }} 
            />
          ))
          : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '40px 0'
            }}>
              <NoData title={t('header.noNewNotice')} />
            </div>
          )
    },
    {
      key: '2',
      label: t('header.notice.accountAssistant'), // "账户助手"
      children: (
        accountLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 0'
          }}>
            {t('header.loading')}
          </div>
        ) : bizData.length > 0 ? (
          bizData.map((item: any, index: number) => (
            <MenuItemLabel
              key={`account-${index}`}
              h5Text={item.title}
              spanText={item.content}
              needHover
              onClick={() => {
                router.push(`/bulletinCenter?type=${item.id}`);
              }}
            />
          ))
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 0'
          }}>
            <NoData title={t('header.noNewNotice')} />
          </div>
        )
      ),
    },
    {
      key: '3',
      label: t('header.notice.assets'), // "资产"
      children: (
        assetsLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 0'
          }}>
            {t('header.loading')}
          </div>
        ) : bizData.length > 0 ? (
          bizData.map((item: any, index: number) => (
            <MenuItemLabel
              key={`assets-${index}`}
              h5Text={item.title}
              spanText={item.content}
              needHover
              onClick={() => {
                router.push(`/bulletinCenter??type=${item.id}`);
              }}
            />
          ))
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 0'
          }}>
            <NoData title={t('header.noNewNotice')} />
          </div>
        )
      ),
    },
    {
      key: '4',
      label: t('header.notice.transaction'), // "交易"
      children: (
        transactionLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 0'
          }}>
            {t('header.loading')}
          </div>
        ) : bizData.length > 0 ? (
          bizData.map((item: any, index: number) => (
            <MenuItemLabel
              key={`transaction-${index}`}
              h5Text={item.title}
              spanText={item.content}
              needHover
              onClick={() => {
                router.push(`/bulletinCenter?type=${item.id}`);
              }}
            />
          ))
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 0'
          }}>
            <NoData title={t('header.noNewNotice')} />
          </div>
        )
      ),
    },
  ];

  // 根据登录状态创建不同的Tabs内容
  const loginAwareBulletinItems = useMemo(() => {
    // 如果已登录，返回所有标签页；否则只返回公告标签页
    if (isLogin) {
      return bulletinItems;
    } else {
      return [bulletinItems[0]];
    }
  }, [isLogin, bulletinItems]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            inkBarColor: 'var(--text-color5)',
            itemColor: '#6D6F7A',
            itemActiveColor: 'var(--text-color5)',
            itemHoverColor: '#6D6F7A',
            itemSelectedColor: 'var(--text-color5)',
            colorBorderSecondary: 'var(--border-color4)'
          },
        },
      }}
    >
      <Tabs
        defaultActiveKey="1"
        items={loginAwareBulletinItems}
        key={`tabs-${isLogin ? 'logged-in' : 'logged-out'}`}
        onChange={handleTabChange}
      />
    </ConfigProvider>
  );
};

export default Notice;