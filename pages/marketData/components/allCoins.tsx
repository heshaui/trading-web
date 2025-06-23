import React, { useEffect, useState, useMemo } from 'react';
import { Table, Tooltip, Image, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CoinMarket, pairsNewPriceType } from '@/type/marketData/marketData';
import styles from '../styles/marketData.module.css';
import { useTranslation } from 'next-i18next';
import { getAllCoinsData, getUsdtPriceWithStables } from '@/services/marketData'
import { SearchOutlined } from '@ant-design/icons';
import SimpleScrollTabs from '@/components/ScrollableTabs';
import type { TabsProps } from 'antd';
import { toast } from 'sonner';
import { cut, division, nul } from '@/utils'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import appStore from "@/store";
import { NoData } from '@/components/noData'
import { ROUTER_KEY_SPOT } from "@/config/apiConfig"
import {getCoinRate} from '@/utils/getUseRate'

// 添加props接口定义
interface AllCoinsProps {
  // searchKeyword?: string;
  onPairSelect?: (pair: any) => void;
  currencyPairs?: any[];
  pairsNewPrice?: pairsNewPriceType[];
}
interface usdtPriceType {
    nowPrice: string,
    yesterdayPrice: string
}
const AllCoins: React.FC<AllCoinsProps> = ({ currencyPairs, pairsNewPrice }: AllCoinsProps) => {
  const { t } = useTranslation('market');
  // const { isLoggedIn } = useAuth(); // 使用 useAuth 获取登录状态
  const router = useRouter();
  // const [allCoins, setAllcoins] = useState<CoinMarket[]>([])
  const [allInitCoins, setAllInitCoins] = useState<pairsNewPriceType[]>([])
  const [activeTab, setActiveTab] = useState('all');
  const [searchValue, setSearchValue] = useState('')
  const [usdtPrice, setUsdtPrice] = useState({} as usdtPriceType)
  const [tableLoading, setTableLoading] = useState(false)


  // console.log(currencyPairs, 99987);
  const getUsdtPrice = async () => {
    const res = await getUsdtPriceWithStables()
    if (res?.code === '0') {
      setUsdtPrice(res.data)
    }
  }
  // 获取所有币种接口
  const fetchAllcoins = async () => {
    setTableLoading(true)
    try {
      const response = await getAllCoinsData()
      if (response?.code === '0') {
        const resData = response.data?.map((item: CoinMarket) => {
          const directData = currencyPairs?.find(p => p.coinSymbol === item.coinName && p.baseSymbol === 'USDT')
          const reverseData = currencyPairs?.find(p => p.baseSymbol === item.coinName && p.coinSymbol === 'USDT')
          if (directData) {
            return {
              ...item,
              ...directData,
              isDirectPair: 1
            }
          } else if (reverseData) {
            return {
              ...item,
              ...reverseData,
              isDirectPair: 0
            }
          } else if (item.coinName === 'USDT') {
            return {
              ...item,
              isDirectPair: 2,
              price: usdtPrice.nowPrice,
              yesterdayPrice: usdtPrice.yesterdayPrice
            }
          } else {
            return {
              ...item,
              isDirectPair: 3
            }
          }

        })
        // setAllcoins(resData)
        setAllInitCoins(resData)
      }
    } catch (error) {
      toast.error(String(error))
    } finally {
      setTableLoading(false)
    }
  };
  useEffect(() => {
    getUsdtPrice()
  }, [])
  useEffect(() => {
    fetchAllcoins()
  }, [currencyPairs,usdtPrice])

  // 标签页配置
  const tabsItem: TabsProps['items'] = [
    { key: '1', label: t('header.mainArea') },
    { key: '2', label: t('header.innovationArea') },
    { key: '3', label: t('header.newCoinArea') },
    { key: '4', label: 'AI' },
    { key: '5', label: 'Meme' },
    { key: '6', label: 'NFT' },
    { key: '7', label: 'DeFi' },
    { key: '8', label: 'Web3' },
    { key: '9', label: 'Payments' },
    { key: '10', label: 'Launchpad' },
    { key: '11', label: 'Layer2' },
    { key: '12', label: 'Solana' },
    { key: '13', label: 'RWA' },
    { key: '14', label: 'Launchpool' },
    { key: '15', label: t('header.gameMetaverse') },
    { key: '16', label: t('header.storage') },
  ];

  const columns: ColumnsType<any> = [
    {
      title: t('marketList.tableHeaders.name'),
      dataIndex: 'coinName',
      key: 'coinName',
      width: 100,
      // onHeaderCell: () => ({
      //   style: { paddingLeft: '20px' },
      // }),
      // onCell: () => ({
      //   style: { paddingLeft: '20px' },
      // }),
      render: (text, record) => (
        <div className='flex align-center'>
          <Image src={record?.iconUrl} alt={text} width={28} height={28}
            style={{ borderRadius: '50%', height: '28px', width: '28px' }}
            preview={false}
            className='mr-1' />
          <p className='font-w-500 font-14 flex-x ml-1'>
            {/* {`${text}`}<span className={`font-w-400 font-14 ${styles.tip_color}`}>&nbsp;/&nbsp;{record?.baseSymbol || '--'}</span> */}
            {`${text}`}<span className={`font-w-400 font-14 ${styles.tip_color}`}>&nbsp;{record?.nameDefault || '--'}</span>
          </p>
        </div>
      ),
      sorter: (a, b) => {
        return a.coinName.localeCompare(b.coinName);
      },
    },
    {
      title: t('marketList.tableHeaders.price'),
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      sorter: (a, b) => a.price - b.price,
      render: (_price, record) => {
        if (record.isDirectPair === 0) {
          const coinRate=getCoinRate(record.coinName, _price)
          return <span>{coinRate.coinRate || '0'}</span>
        } else if (record.isDirectPair === 2) {
          return <span>{_price || '0'}</span>
        } else {
          return <span>{_price || '0'}</span>
        }
      },
    },
    {
      title: t('marketList.tableHeaders.change24h'),
      dataIndex: 'yesterdayPrice',
      key: 'yesterdayPrice',
      align: 'center',
      sorter: (a, b) => {
        const aPrice = cut(Number(a.price) || 0, Number(a.yesterdayPrice) || 0) || 0
        const bPrice = cut(Number(b.price) || 0, Number(b.yesterdayPrice) || 0) || 0
        return Number(aPrice) - Number(bPrice)
      },
      render: (_price, record) => {
        const price = cut(Number(record.price) || 0, Number(record.yesterdayPrice) || 0) || 0
        const percent = Number(record.yesterdayPrice) ? division(Number(price) || 0, Number(record.yesterdayPrice)) : 0
        const pricePercent = nul(percent, 100)?.toFixed(2) || 0
        return <span className={`${Number(pricePercent) > 0 ? styles.success_icon : Number(pricePercent) < 0 ? styles.error_icon : ''}`}>
          {Number(pricePercent) > 0 ? `+${pricePercent}%` : `${pricePercent}%`}</span>

      },
    },
    {
      title: t('marketList.tableHeaders.marketCap'),
      dataIndex: 'marketValue',
      key: 'marketValue',
      align: 'center',
      // sorter: (a, b) => a.marketValue - b.marketValue,
      render: (_marketValue, record) => {
        return <span>{_marketValue || '--'}</span>
      },
    },
    {
      title: t('marketList.tableHeaders.action'),
      align: 'right',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => {

        return <Tooltip title={t('marketList.tableHeaders.trade')} placement="left">
          <button
            onClick={() => {
              const symbolName = `${record.coinSymbol}/${record.baseSymbol}`;
              if (record.coinSymbol && record.baseSymbol) {
                router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.coinSymbol}/${record.baseSymbol}`)
              } else {
                router.push(`${ROUTER_KEY_SPOT.INDEX}`)
              }
            }}
          >
            { `${record.coinSymbol}/${record.baseSymbol}`}
            <Image
              src={'/images/market/icon_Trade.svg'}
              alt={'trade'}
              width={28}
              height={28}
              style={{ borderRadius: '50%', height: '28px', width: '28px' }}
              preview={false} />
          </button>
        </Tooltip>
      },
    },
  ];

  const filteredPairs = React.useMemo(
    () =>
      allInitCoins?.filter((pair) => {
        // 搜索过滤
        const matchesSearch = searchValue ? (
          (pair?.coinSymbol?.toLowerCase()?.includes(searchValue?.toLowerCase() || '')) ||
          (pair?.baseSymbol?.toLowerCase()?.includes(searchValue?.toLowerCase() || '')) ||
          (pair?.coinName?.toLowerCase()?.includes(searchValue?.toLowerCase() || ''))
        ) : true;

        // // 标签过滤
        // const matchesTab =
        // activeTab&&activeTab === "all" ? true : pair.classLabel === activeTab;

        return matchesSearch //&& matchesTab;
      }) || [],
    [allInitCoins, searchValue, activeTab]
  );

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };
  return (
    <div className={styles.allCoinsWrapper}>
      {/* 搜索框 */}
      <div className={`${styles.allCoins_inputSearch}  flex-x align-center justify-end`}>
        <Input
          allowClear
          size="middle"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t('header.searchInput')}
          // onChange={handleSearchChange}  // 修正为正确的处理函数
          // onKeyPress={handleKeyPress}    // 添加回车键处理
          prefix={<SearchOutlined style={{ color: 'var(--text-color4)', fontSize: 16 }} />}
          // style={{ width: "242px", marginBottom: 16 }}
          className={`${styles.input_box} modal-input`}
        />
      </div>
      <div>
        <Table
          columns={columns}
          dataSource={filteredPairs}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered={false}
          loading={tableLoading}
          className={`${styles.allCoinsTable} spot-table-box w-full`}
          showSorterTooltip={false}
          locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
        />
      </div>

    </div>
  );
};

export default AllCoins;