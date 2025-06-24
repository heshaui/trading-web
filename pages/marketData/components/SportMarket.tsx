"use client";
import React from "react";
import styles from "./styles/spotHeader_select.module.css";
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
import { cut,division ,nul} from '@/utils'
import type { ColumnsType } from 'antd/es/table';
import { NoData } from '@/components/noData'
import { ROUTER_KEY_SPOT } from "@/config/apiConfig"
import { getSpotData, getClassLabel } from '@/services/marketData'
import { CoinMarket, pairsNewPriceType } from '@/type/marketData/marketData';
import { toast } from "sonner"
import { getUserExchangeCoinTypeList } from '@/services/spot';


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
  const [sortField, setSortField] = useState<string>("");
  // const [showVolume, setShowVolume] = useState<boolean>(false); // 控制显示24h涨跌或成交量
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchValue, setSearchValue] = useState('')
  const { isLoggedIn } = useAuth(); // 使用 useAuth 获取登录状态
  const [spotList, setSpotList] = useState<pairsNewPriceType[]>([])
  const [tableLoading, setTableLoading] = useState(false)
  const currencyPairsArray = appStore.currencyPairs || [];
  const [tabsItem, setTabsItem] = useState<TabsProps["items"]>([])
  const [exchangeCoin, setExchangeCoin] = useState<string[]>([])
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
      width: 100,
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
      align: 'center',
      sorter: (a, b) => a.price - b.price,
      render: (_price) => {
        return <span>{_price || '0'}</span>
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
      align: 'center',
      sorter: (a, b) => {
        const aPrice = division(Number(cut(Number(a.closePrice) || 0, Number(a.openPrice) || 0)) ,Number(a.openPrice))
        const bPrice = division(Number(cut(Number(b.closePrice) || 0, Number(b.openPrice) || 0)) ,Number(b.openPrice))
        return Number(aPrice) - Number(bPrice)
      },
      // render: (_price, record) => {
      //   const price = _price ? Number(_price).toFixed(2) : Number(0).toFixed(2)
      //   return <span className={`${Number(_price) > 0 ? styles.success_icon : Number(_price) < 0 ? styles.error_icon : ''}`}>
      //     {_price > 0 ? `+${price}%` : `${price}%`} </span>
      // },
      render: (_price, record) => {
        const price =record.openPrice? division(Number(cut(Number(_price) || 0, Number(record.openPrice) || 0)) ,Number(record.openPrice)) : 0
        const percent  =price  //nul(price, 100)
        return <span className={`${Number(percent) > 0 ? styles.success_icon : Number(percent) < 0 ? styles.error_icon : ''}`}>
          {Number(percent) > 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`} </span>
      },
    },
    {
      title: `${t("header.high24h")}/${t("header.low24h")}`,
      dataIndex: 'height',
      key: 'height',
      align: 'center',
      render: (_marketValue, record) => {
        const height=Number(record.height||0)
        const lower=Number(record.lower||0)
        const price = `${record.height ?height: "--"}/${record.lower ?lower: "--"}`
        return <span>{price}</span>
      },
    },
    {
      title: t("header.volume24h"),
      dataIndex: 'volume',
      key: 'volume',
      align: 'center',
      sorter: (a, b) => {
        // const aQuantity = parseFloat(a.quantity) / 1000000
        // const bQuantity = parseFloat(b.quantity) / 1000000
        // return aQuantity - bQuantity
        return Number(a.volume)-Number( b.volume)
      },
      render: (_volume, record) => {
        // return <span>{`${(parseFloat(record.quantity) / 1000000).toFixed(2)}M` || '--'}</span>
        return <span>{`${_volume || '--'}`}</span>
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
              if (record.coinSymbol && record.baseSymbol) {
                const symbol = `${record.coinSymbol}/${record.baseSymbol}`
                router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${symbol}`)
              }
            }}
          >
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
        const resData = res.data.map((item:any) => {
          return {
            exchangeCoinId:item.exchangeCoinId,
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
          <SimpleScrollTabs
            items={tabsItem || []}
            onChange={handleTabClick}
            defaultActiveKey={activeTab}
            showAllTab={true}
            allTabLabel={t("header.all")}
            className={styles.allCoins_tabs}
          />
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
        {/* <div
          className={`${styles.list_header} px-4 py-4 flex-x align-center justify-between`}
          style={{
            display: "grid",
            gridTemplateColumns: "16% 16% 16% 20% 16% 16%",
          }}
        >
          <div
            className={`${styles.tip_color} font-12 flex-x align-center pointer`}
            onClick={() => handleSort("name")}
          >
            <span>{t("header.name")}</span>
            <div className="ml-1 flex-y-cc">
              <Iconify
                icon="fluent-mdl2:flick-down"
                className={`pointer ${sortField === "name" && sortDirection === "asc"
                    ? styles.active_sort
                    : ""
                  }`}
                size={10}
                style={{ marginBottom: 2 }}
              />
              <Iconify
                icon="fluent-mdl2:flick-up"
                className={`pointer ${sortField === "name" && sortDirection === "desc"
                    ? styles.active_sort
                    : ""
                  }`}
                size={10}
              />
            </div>
          </div>

          <div
            className={`${styles.tip_color} font-12 flex-x align-center pointer`}
            onClick={() => handleSort("price")}
          >
            <span>{t("header.lastPrice")}</span>
            <div className="ml-1 flex-y-cc">
              <Iconify
                icon="fluent-mdl2:flick-down"
                className={`pointer ${sortField === "price" && sortDirection === "asc"
                    ? styles.active_sort
                    : ""
                  }`}
                size={10}
                style={{ marginBottom: 2 }}
              />
              <Iconify
                icon="fluent-mdl2:flick-up"
                className={`pointer ${sortField === "price" && sortDirection === "desc"
                    ? styles.active_sort
                    : ""
                  }`}
                size={10}
              />
            </div>
          </div>
          <div
            className={`${styles.tip_color} font-12 flex-x align-center pointer`}
            onClick={() => handleSort("change")}
          >
            <span>
              {showVolume
                ? t("header.volume24h")
                : t("header.change24h")}
            </span>
            <div className="ml-1 flex-y-cc">
              <Iconify
                icon="fluent-mdl2:flick-down"
                className={`pointer ${sortField === "change" && sortDirection === "asc"
                    ? styles.active_sort
                    : ""
                  }`}
                size={10}
                style={{ marginBottom: 2 }}
              />
              <Iconify
                icon="fluent-mdl2:flick-up"
                className={`pointer ${sortField === "change" && sortDirection === "desc"
                    ? styles.active_sort
                    : ""
                  }`}
                size={10}
              />
            </div>
          </div>

          最高价/最低价表头
          <div
            className={`${styles.tip_color} font-12 flex-x align-center pointer`}
          >
            <span>{t("header.high24h")}/{t("header.low24h")}</span>
          </div>

          成交额表头
          <div
            className={`${styles.tip_color} font-12 flex-x align-center pointer`}
            onClick={() => handleSort("quantity")}
          >
            <span>{t("header.amount24h")}</span>
            <div className="ml-1 flex-y-cc">
              <Iconify
                icon="fluent-mdl2:flick-down"
                className={`pointer ${sortField === "quantity" && sortDirection === "asc"
                    ? styles.active_sort
                    : ""
                  }`}
                size={10}
                style={{ marginBottom: 2 }}
              />
              <Iconify
                icon="fluent-mdl2:flick-up"
                className={`pointer ${sortField === "quantity" && sortDirection === "desc"
                    ? styles.active_sort
                    : ""
                  }`}
                size={10}
              />
            </div>
          </div>

          操作表头
          <div className={`${styles.tip_color} font-12 flex-x-end`}>
            <span>{t("columns.operation")}</span>
          </div>
        </div>
        <div className={`${styles.pair_list}`}>
          {filteredPairs.map((pair: any, index: any) => (
            <div
              key={index}
              className={`${styles.pair_item} px-4 flex-x align-center`}
              onClick={() => handlePairClick(pair)}
              style={{
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "16% 16% 16% 20% 16% 16%",
              }}
            >
              币种名称
              <div className={`${styles.pair_name} flex-x align-center`}>
                <span
                  className={styles.favorite}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                  }}
                >
                  <Rate
                    onChange={(value) => handleFavoriteChange(value, pair)}
                    value={pair.isFavorite ? 1 : 0}
                    count={1}
                    style={{ fontSize: 14 }}
                  />
                </span>
                <span className={styles.coin_icon}>{pair.icon}</span>
                <span className={`font-14 ${styles.title_color}`}>
                  {pair.coinSymbol}/{pair.baseSymbol}
                </span>
              </div>
              最新价
              <div
                className={`font-14 ${styles.title_color} flex-x align-center`}
              >
                {pair.yesterdayPrice}
              </div>

              24h涨跌/24h成交量
              <div
                className={`${styles.pair_change} ${!showVolume && pair.priceChangePercent > 0
                    ? styles.success_icon
                    : !showVolume && pair.priceChangePercent < 0
                      ? styles.error_icon
                      : ""
                  } flex-x align-center`}
              >
                {showVolume
                  ? pair.quantity
                  : `${pair.priceChangePercent.toFixed(2)}%`}
              </div>

              最高价/最低价
              <div
                className={`font-14 ${styles.title_color} flex-x align-center`}
              >
                {pair.high_price || "--"}/{pair.low_price || "--"}
              </div>

              24h成交额
              <div
                className={`font-14 ${styles.title_color} flex-x align-center`}
              >
                ${(parseFloat(pair.quantity) / 1000000).toFixed(2)}M
              </div>

              交易按钮
              <div className={`flex-x-end`}>
                <Image
                  src="/images/market/icon_Trade.png"
                  alt=""
                  width={24}
                  height={24}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("交易:", pair.coinSymbol, pair.baseSymbol);
                  }}
                />
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </ConfigProvider>
  );
};

export default observer(SpotSelect);
