"use client";
import React from "react";
import styles from "./styles/markerTable.module.css";
import { ConfigProvider, Rate, Table, Tooltip, Image, Input } from "antd";
import { Iconify } from "@/components/icon";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "next-i18next";
import type { DropdownProps, MenuProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TabsProps } from "antd";
import appStore from "@/store";
import { observer } from "mobx-react-lite";
import { message } from "antd";
// import Image from 'next/image';
import {
  addUserExchangeCoinType,
  canalUserExchangeCoinType,
} from "@/services/spot";
import SimpleScrollTabs from "@/components/ScrollableTabs";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { cut, division, nul } from '@/utils'
import type { ColumnsType } from 'antd/es/table';
import { NoData } from '@/components/noData'
import { ROUTER_KEY_SPOT } from "@/config/apiConfig"
import { getSpotData, getClassLabel } from '@/services/marketData'
import { CoinMarket, pairsNewPriceType } from '@/type/marketData/marketData';
import { toast } from "sonner"
import { getUserExchangeCoinTypeList } from '@/services/spot';
import { roundDown, formatted } from '@/utils'
import { useThemeMode } from '@/hooks/useThemeMode'


interface SpotSelectProps {
  currencyPairs: any[];
  onPairSelect?: (pair: any) => void;
  pairsNewPrice: pairsNewPriceType[];
}

const SpotSelect: React.FC<SpotSelectProps> = ({
  currencyPairs,
  pairsNewPrice,
  onPairSelect,
  // searchValue,
}) => {
  const router = useRouter();
  const { t } = useTranslation(["market"]);
  const [activeTab, setActiveTab] = useState("all"); // 当前选中的tab
       const { isDayMode } = useThemeMode()
  const [searchValue, setSearchValue] = useState('')
  const { isLoggedIn } = useAuth(); // 使用 useAuth 获取登录状态
  const [spotList, setSpotList] = useState<pairsNewPriceType[]>([])
  const [tableLoading, setTableLoading] = useState(false)
  const currencyPairsArray = appStore.currencyPairs || [];
  const [tabsItem, setTabsItem] = useState<TabsProps["items"]>([])
  const [isHover, setIsHover] = useState(false);
  const [exchangeCoinId, setExchangeCoinId] = useState(null);
  // 标签页配置
  const initTabsItem: TabsProps["items"] = [
    { key: "1", label: t("header.mainArea") },
    { key: "2", label: t("header.innovationArea") },
    { key: "3", label: t("header.newCoinArea") },
    { key: "4", label: "AI" },
    { key: "5", label: "Meme" },
    { key: "6", label: "NFT" },
    { key: "7", label: "DeFi" },
    { key: "8", label: "Web3" },
    { key: "9", label: "Payments" },
    { key: "10", label: "Launchpad" },
    { key: "11", label: "Layer2" },
    { key: "12", label: "Solana" },
    { key: "13", label: "RWA" },
    { key: "14", label: "Launchpool" },
    { key: "15", label: t("header.gameMetaverse") },
    { key: "16", label: t("header.storage") },
  ];
  const getClassLabelList = async () => {
    try {
      const res = await getClassLabel()
      if (res.code === "0") {
        const mapList = res.data?.map((item: any) => {
          const tab = initTabsItem.find((tab) => tab.key === item?.toString())
          return tab
        })
        setTabsItem(mapList)
      }
    } catch (error) {

    }
  }
  const columns: ColumnsType<any> = [
    {
      title: t('header.name'),
      dataIndex: 'coinSymbol',
      key: 'coinSymbol',
      width: 200,
      render: (text, record) => (
        <div className={`${styles.pair_name} flex-x align-center`}>
          <span
            className={styles.favorite}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
            }}
          >
            <Rate
              onChange={(value) => handleFavoriteChange(value, record)}
              value={record.isFavorite ? 1 : 0}
              count={1}
              style={{ fontSize: 14 }}
            />
          </span>
          <span className={styles.coin_icon}>{record.icon}</span>
          <span className={`font-14 ${styles.title_color}`}>
            {record.coinSymbol}/{record.baseSymbol}
          </span>
        </div>
      ),
      sorter: (a, b) => {
        return a.coinSymbol.localeCompare(b.coinSymbol);
      },
    },
    {
      title: t('header.lastPrice'),
      dataIndex: 'price',
      key: 'price',
      align: 'left',
      width: 200,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (_price, record) => {
        // ${parseFloat(_price || "0").toLocaleString()}
        // return <span>{parseFloat(_price || "0").toLocaleString()}/${parseFloat(_price || "0").toLocaleString()}</span>
        const price = _price ? roundDown(_price, record.baseCoinScale || 0) : '0'
        const text = formatted(price)
        // return <span>{parseFloat(price || "0").toLocaleString()}/${parseFloat(record.price || "0").toLocaleString()}</span>
        return <span>{text}/${text}</span>
      },
    },
    // {
    //   title: t('header.volume24h'),
    //   dataIndex: 'yesterdayPrice',
    //   key: 'yesterdayPrice',
    //   align: 'center',
    //   sorter: (a, b) => {
    //     const aPrice = cut(Number(a.price) || 0, Number(a.yesterdayPrice) || 0) || 0
    //     const bPrice = cut(Number(b.price) || 0, Number(b.yesterdayPrice) || 0) || 0
    //     return Number(aPrice) - Number(bPrice)
    //   },
    //    render: (_price, record) => {
    //     const price = Number(_price).toFixed(2)
    //     return <span className={`${Number(_price) > 0 ? styles.success_icon : Number(_price) < 0 ? styles.error_icon : ''}`}>
    //       {_price > 0 ? `+${price}%` : `${price}%`}</span>
    //   },
    // },
    {
      title: t('header.change24h'),
      dataIndex: 'closePrice',
      key: 'closePrice',
      align: 'left',
      width: 200,
      sorter: (a, b) => {
        const aPrice = division(Number(cut(Number(a.closePrice) || 0, Number(a.openPrice) || 0)), Number(a.openPrice))
        const bPrice = division(Number(cut(Number(b.closePrice) || 0, Number(b.openPrice) || 0)), Number(b.openPrice))
        return Number(aPrice || 0) - Number(bPrice || 0)
      },
      // render: (_price, record) => {
      //   const price = _price ? Number(_price).toFixed(2) : Number(0).toFixed(2)
      //   return <span className={`${Number(_price) > 0 ? styles.success_icon : Number(_price) < 0 ? styles.error_icon : ''}`}>
      //     {_price > 0 ? `+${price}%` : `${price}%`} </span>
      // },
      render: (_price, record) => {
        const price = record.openPrice ? division(Number(cut(Number(_price) || 0, Number(record.openPrice) || 0)), Number(record.openPrice)) : 0
        const percent = nul(price, 100) //price  //
        return <span className={`${Number(percent) > 0 ? styles.success_icon : Number(percent) < 0 ? styles.error_icon : ''}`}>
          {Number(percent) > 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`} </span>
      },
    },
    {
      title: `${t("header.high24h")}/${t("header.low24h")}`,
      dataIndex: 'height',
      key: 'height',
      align: 'left',
      width: 200,
      render: (_marketValue, record) => {
        // const height = record.height || '0'
        // const lower = record.lower || '0'
        // // const price = `${record.height ? height : "--"}/${record.lower ? lower : "--"}`
        // const price = `${record.height ? parseFloat(height || "0").toLocaleString() : "--"}/${record.lower ? parseFloat(lower || "0").toLocaleString() : "--"}`
        // return <span>{price}</span>
        const heightText = record.height ? roundDown(record.height, record.baseCoinScale || 0) : '0'
        const lowerText = record.lower ? roundDown(record.lower, record.baseCoinScale || 0) : '0'

        const height = formatted(heightText)
        const lower = formatted(lowerText)
        const price = `${record.height ? height : "--"}/${record.lower ? lower : "--"}`
        return <span>{price}</span>
      },
    },
    {
      title: t("header.volume24h"),
      dataIndex: 'volume',
      key: 'volume',
      align: 'left',
      width: 200,
      sorter: (a, b) => {
        // const aQuantity = parseFloat(a.quantity) / 1000000
        // const bQuantity = parseFloat(b.quantity) / 1000000
        // return aQuantity - bQuantity
        return Number(a.volume || 0) - Number(b.volume || 0)
      },
      render: (_volume, record) => {
        // return <span>{`${(parseFloat(record.quantity) / 1000000).toFixed(2)}M` || '--'}</span>
        return <span>{`${_volume ? parseFloat(_volume).toLocaleString() : "--"}`}</span>
      },
    },
    {
      title: t('marketList.tableHeaders.action'),
      align: 'right',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (_, record) => {

        return <Tooltip title={t('marketList.tableHeaders.trade')} placement="left">
          <button
            onClick={() => {
              if (record.coinSymbol && record.baseSymbol) {
                const symbol = `${record.coinSymbol}/${record.baseSymbol}`
                router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${symbol}`)
              }
            }}
            onMouseEnter={() => {
              setIsHover(true)
              setExchangeCoinId(record.exchangeCoinId)
            }}
            onMouseLeave={() => {
              setIsHover(false)
              setExchangeCoinId(null)
            }}
          >
            <TradeIcon
                key={record.exchangeCoinId}
                isDayMode={isDayMode}
                coinId={record.exchangeCoinId}
  />
          </button>
        </Tooltip>
      },
    },
  ];
  const TradeIcon = ({ isDayMode, coinId }: { isDayMode: boolean, coinId: number }) => {
    const normalSrc = isDayMode
      ? '/images/market/icon_Trade.svg'
      : '/images/market/icon_Trade_dark.svg';
    const hoverSrc = '/images/market/icon_Trade_hover.svg';

    return (
      <Image
        src={(isHover&&coinId===exchangeCoinId) ? hoverSrc : normalSrc}
        alt="trade"
        width={24}
        height={24}
        style={{ borderRadius: '50%', height: '24px', width: '24px', cursor: 'pointer' }}
        preview={false}
      />
    );
  }
  const getSpotList = async () => {
    setTableLoading(true)
    try {

      const res = await getSpotData({})
      if (res.code === '0') {
        // setTableData(res.data)

        // const resData = res.data.map((item:any) => {
        //   const coinPair = exchangeCoin.find((pair: any) => pair.exchangeCoinId?.toString() === item)
        //   return {
        //     ...item,
        //     isFavorite: !!coinPair
        //   }
        // })
        //   setSpotList(resData)
        const resData = res.data.map((item: any) => {
          return {
            exchangeCoinId: item.exchangeCoinId,
            classLabel: item.classLabel,
            baseSymbol: item.baseSymbol,
            coinSymbol: item.coinSymbol,
          };
        })

        const userToken = appStore.getUserToken();
        if (!userToken) {
          setSpotList(resData)
          return
        }
        const result = await getUserExchangeCoinTypeList();
        if (result.code === '0') {
          // setExchangeCoin(result.data || [])
          const spotData = resData.map((item: any) => {
            const coinPair = result.data.find((pair: any) => item.exchangeCoinId?.toString() === pair)
            return {
              ...item,
              isFavorite: !!coinPair
            }
          })

          setSpotList(spotData)
        }
      }
    } catch (error) {
      toast.error(String(error))
    } finally {
      setTableLoading(false)
    }
  }
  // 基于搜索和标签过滤排序后的结果
  const filteredPairs = useMemo(
    () =>
      pairsNewPrice?.map((pairs: any) => {
        const spotListArr = spotList?.find(item => item?.coinSymbol === pairs?.coinSymbol && item?.baseSymbol === pairs?.baseSymbol);
        return {
          ...pairs,
          ...spotListArr,
        }

      })?.filter((pair) => {
        // 搜索过滤
        const matchesSearch =
          pair?.coinSymbol?.toLowerCase().includes(searchValue?.toLowerCase() || '') ||
          pair?.baseSymbol?.toLowerCase().includes(searchValue?.toLowerCase() || '');

        // 标签过滤
        const matchesTab =
          activeTab && activeTab === "all" ? true : pair?.classLabel === activeTab;

        return matchesSearch && matchesTab //&& spotListArr //&& currencyPairsArray
      }) || [],
    [spotList, searchValue, activeTab, pairsNewPrice]
  );

  const handleFavoriteChange = async (value: number, pair: any) => {
    if (!isLoggedIn) {
      // 用户未登录，显示提示并跳转到登录页面
      toast.info(t('marketList.operationTips.loginToFavorite'));
      router.push('/login'); // 登录页面路径根据实际项目调整
      return;
    }

    const isFavorite = value === 1;
    const apiCall = isFavorite
      ? addUserExchangeCoinType({ exchangeCoinId: pair.exchangeCoinId, type: 1 })
      : canalUserExchangeCoinType({ exchangeCoinId: pair.exchangeCoinId, type: 1 });
    const res = await apiCall;
    if (res.code === "0") {
      toast.success(isFavorite ? t('marketList.operationTips.addSuccess') :
        t('marketList.operationTips.removeSuccess'));
      // await getUserExchangeCoin()
      await getSpotList()


      // 本地更新以提高性能 - 只使用一种更新方式避免冲突
      const updatedPairs = [...appStore.currencyPairs];
      const pairIndex = updatedPairs.findIndex((item) => item.id === pair.exchangeCoinId);
      if (pairIndex !== -1) {
        updatedPairs[pairIndex] = {
          ...updatedPairs[pairIndex],
          isFavorite: isFavorite,
        };
        appStore.setCurrencyPairs(updatedPairs);
      }

      // 如果当前选中的是被修改的币对，也要更新currentPair
      if (appStore.currentPair && appStore.currentPair.id === pair.exchangeCoinId) {
        const updatedCurrentPair = { ...appStore.currentPair };
        updatedCurrentPair.isFavorite = isFavorite;
        appStore.setCurrentPair(updatedCurrentPair);
      }

      // // 更新表格数据 - 将最新的币对信息与价格数据匹配
      // if (pairsNewPrice && pairsNewPrice.length > 0) {
      //   // 创建一个新的价格数据数组，保留原有价格信息但更新收藏状态
      //   const updatedPriceData = pairsNewPrice.map(priceItem => {
      //     // 使用coinSymbol和baseSymbol匹配币对，因为pairsNewPriceType没有id属性
      //     if (priceItem.coinSymbol === pair.coinSymbol && priceItem.baseSymbol === pair.baseSymbol) {
      //       return {
      //         ...priceItem,
      //         isFavorite: isFavorite
      //       };
      //     }
      //     return priceItem;
      //   });

      //   // 更新当前组件的状态
      //   setSpotList(updatedPriceData);

      //   // 如果组件有接收更新价格数据的方法，调用它通知父组件
      //   if (onPairSelect && typeof onPairSelect === 'function') {
      //     onPairSelect({ type: 'updateFavorite', data: updatedPriceData });
      //   }
      // }
    }

  };

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };
  useEffect(() => {
    getClassLabelList()
    getSpotList()
    // getUserExchangeCoin()
  }, []);



  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            itemActiveColor: "var(--tip-color)",
            itemSelectedColor: "var(--text-color5)",
            horizontalMargin: "0 0 0 0",
            itemColor: "var(--text-color6)",
            inkBarColor: "var(--text-color5)",
          },
          Rate: {
            starBg: "#A4A5AC",
          },
        },
      }}
    >
      <div className={styles.container}>
        {/* 标签页导航 */}
        <div className={`${styles.allCoins_inputSearch}  flex-x align-center justify-end`}>
          <Input
            allowClear
            size="middle"
            value={searchValue}
            // onChange={(e) => setSearchValue(e.target.value)}
            onChange={(e) => {
              // 只允许数字和英文字母
              const filteredValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
              setSearchValue(filteredValue);
            }}
            placeholder={t('header.searchInput')}
            suffix={<SearchOutlined style={{ color: 'var(--text-color4)', fontSize: 16 }} />}
            className={`${styles.input_box} modal-input`}
          />
        </div>
        <div>
          <SimpleScrollTabs
            items={tabsItem || []}
            onChange={handleTabClick}
            defaultActiveKey={activeTab}
            showAllTab={true}
            allTabLabel={t("header.all")}
            className={styles.allCoins_tabs}
            visibleNum={6}
            hideSwitchNoContent={true}
            allBtnIsThemeColor={true}
          />
          <Table
            columns={columns}
            dataSource={filteredPairs}
            rowKey="id"
            pagination={false}
            size="middle"
            bordered={false}
            loading={tableLoading}
            className={`${styles.allCoinsTable} markerData-table w-full`}
            showSorterTooltip={false}
            locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default observer(SpotSelect);
