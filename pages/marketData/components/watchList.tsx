
"use client";
import React from "react";
import styles from "./styles/spotHeader_select.module.css";
import {
  Input,
  ConfigProvider,
  Rate,
  Table,
  Tooltip,
  Image
} from "antd";
import { useState, useEffect,useMemo } from "react";
import { useTranslation } from "next-i18next";
import { SearchOutlined } from "@ant-design/icons";
import {
  addUserExchangeCoinType,
  canalUserExchangeCoinType,
  getUserExchangeCoinTypeList
} from "@/services/spot";
import appStore from "@/store";
import { observer } from "mobx-react-lite";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import type { ColumnsType } from 'antd/es/table';
import { NoData } from '@/components/noData'
import { cut, division, nul } from '@/utils'
import { ROUTER_KEY_SPOT } from "@/config/apiConfig"
import { toast } from "sonner"
import {  pairsNewPriceType } from '@/type/marketData/marketData';
import { getSpotData } from '@/services/marketData'


interface SelfSelectProps {
  currencyPairs: any[];
  pairsNewPrice?: pairsNewPriceType[];
  onPairSelect?: (pair: any) => void;
  // searchValue: string;
  onTabChange?: (key: string) => void;
}
const SelfSelect: React.FC<SelfSelectProps> = ({
  currencyPairs,
  onPairSelect,
  pairsNewPrice,
  onTabChange,
}) => {
  const { t } = useTranslation(["market"]);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showVolume, setShowVolume] = useState<boolean>(false);
  const { isLoggedIn } = useAuth(); // 获取登录状态
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('')
  const [exchangeCoin, setExchangeCoin] = useState<pairsNewPriceType[]>([])
  const [spotList, setSpotList] = useState<pairsNewPriceType[]>([])
  const [tableLoading, setTableLoading] = useState(false)
  // // 标签页配置
  // const tabsItem: TabsProps["items"] = [
  //   { key: "1", label: t("header.mainArea") },
  //   { key: "2", label: t("header.innovationArea") },
  //   { key: "3", label: t("header.newCoinArea") },
  //   { key: "4", label: "AI" },
  //   { key: "5", label: "Meme" },
  //   { key: "6", label: "NFT" },
  //   { key: "7", label: "DeFi" },
  //   { key: "8", label: "Web3" },
  //   { key: "9", label: "Payments" },
  //   { key: "10", label: "Launchpad" },
  //   { key: "11", label: "Layer2" },
  //   { key: "12", label: "Solana" },
  //   { key: "13", label: "RWA" },
  //   { key: "14", label: "Launchpool" },
  //   { key: "15", label: t("header.gameMetaverse") },
  //   { key: "16", label: t("header.storage") },
  // ];
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
      // sorter: (a, b) => a.price - b.price,
      render: (_price) => {
        // return <span>{_price || '0'}</span>
        return <span>{parseFloat(_price || "0").toLocaleString()}/${parseFloat(_price || "0").toLocaleString()}</span>
      },
    },
    {
      title: t('header.change24h'),
      dataIndex: 'closePrice',
      key: 'closePrice',
      align: 'center',
      // sorter: (a, b) => {
      //   const aPrice = division(Number(cut(Number(a.closePrice) || 0, Number(a.openPrice) || 0)), Number(a.openPrice))
      //   const bPrice = division(Number(cut(Number(b.closePrice) || 0, Number(b.openPrice) || 0)), Number(b.openPrice))
      //   return Number(aPrice) - Number(bPrice)
      // },
      render: (_price, record) => {
        const price = record.openPrice ? division(Number(cut(Number(_price) || 0, Number(record.openPrice) || 0)), Number(record.openPrice)) : 0
        const percent =price*100
        // const percent = price
        return <span className={`${Number(percent) > 0 ? styles.success_icon : Number(percent) < 0 ? styles.error_icon : ''}`}>
          {Number(percent) > 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`} </span>
      },
    },
    {
      title: `${t("header.high24h")}/${t("header.low24h")}`,
      dataIndex: 'height',
      key: 'height',
      align: 'center',
      // render: (_marketValue, record) => {
      //   // {pair.high_price || "--"}/{pair.low_price || "--"}
      //   const price = `${record.high_price || "--"}/${record.low_price || "--"}`
      //   return <span>{price}</span>
      // },
      render: (_marketValue, record) => {
        const height=record.height||"0"
        const lower=record.lower||"0"
        // const price = `${record.height ?height: "--"}/${record.lower ?lower: "--"}`
        const price = `${record.height ? parseFloat(height || "0").toLocaleString() : "--"}/${record.lower ? parseFloat(lower || "0").toLocaleString() : "--"}`
        return <span>{price}</span>
      },
    },
    // {
    //   title: t("header.volume24h"),
    //   dataIndex: 'quantity',
    //   key: 'quantity',
    //   align: 'center',
    //   sorter: (a, b) => {
    //     const aQuantity = parseFloat(a.quantity) / 1000000
    //     const bQuantity = parseFloat(b.quantity) / 1000000
    //     return aQuantity - bQuantity
    //   },
    //   render: (_quantity, record) => {
    //     return <span>{`${(parseFloat(record.quantity) / 1000000).toFixed(2)}M` || '--'}</span>
    //   },
    // },
    {
      title: t("header.volume24h"),
      dataIndex: 'volume',
      key: 'volume',
      align: 'center',
      // sorter: (a, b) => {
      //   // const aQuantity = parseFloat(a.quantity) / 1000000
      //   // const bQuantity = parseFloat(b.quantity) / 1000000
      //   // return aQuantity - bQuantity
      //   return Number(a.volume)-Number( b.volume)
      // },
      render: (_volume, record) => {
        // return <span>{`${(parseFloat(record.quantity) / 1000000).toFixed(2)}M` || '--'}</span>
        // return <span>{`${_volume || '--'}`}</span>
        return <span>{`${_volume ? parseFloat(_volume).toLocaleString() : "--"}`}</span>

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


  // 处理前往市场按钮点击/登录按钮点击
  const handleGoToMarket = () => {
    if (onTabChange && isLoggedIn) {
      onTabChange("3"); // 切换到现货市场Tab
    } else {
      router.push("/login");
    }
  };

  const filteredPairs = useMemo(
    () =>
      pairsNewPrice?.map((pairs: any) => {
        // const spotListArr = exchangeCoin?.find(item => pairs.exchangeCoinId === item);
        const spotListArr = spotList?.find(item => item?.coinSymbol === pairs?.coinSymbol && item?.baseSymbol === pairs?.baseSymbol);
        return {
          ...spotListArr,
          ...pairs,
          // isFavorite: !!spotListArr
        }

      })
        ?.filter((pair) => {
          // 必须是收藏的
          const isFavorite = pair?.isFavorite;

          // 搜索过滤
          const matchesSearch =
            pair?.coinSymbol?.toLowerCase().includes(searchValue.toLowerCase()) ||
            pair?.baseSymbol?.toLowerCase().includes(searchValue.toLowerCase());

          // // 标签过滤
          // const matchesTab =
          //   activeTab && activeTab === "all" ? true : pair?.classLabel === activeTab;

          return matchesSearch && isFavorite  //&& matchesTab;

        }) || [],
    [pairsNewPrice, searchValue, spotList]
  );
  // useEffect(() => {
  //   console.log(filteredPairs,999);
    
  // }, [filteredPairs]);
  const handleFavoriteChange = async (value: number, pair: any) => {
    const isFavorite = value === 1;
    const apiCall = isFavorite
      ? addUserExchangeCoinType({ exchangeCoinId: pair.exchangeCoinId, type: 1 })
      : canalUserExchangeCoinType({ exchangeCoinId: pair.exchangeCoinId, type: 1 });

    const res = await apiCall;
    if (res.code === "0") {
      toast.success(isFavorite ? t('marketList.operationTips.addSuccess') :
        t('marketList.operationTips.removeSuccess'));
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
    }
  };
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
  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };
  useEffect(() => {
    // getUserExchangeCoin()
    getSpotList()
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
        {/* <SimpleScrollTabs
          items={tabsItem}
          onChange={handleTabClick}
          defaultActiveKey={activeTab}
          showAllTab={true}
          allTabLabel={t("header.all")}
          className={styles.allCoins_tabs}
        /> */}
        {filteredPairs && filteredPairs?.length > 0 && <button className={`default_btn my-4 ${styles.btn_style} font-14`}>
          {/* 限价 | 市价 */}
          {`${t('header.spot')}(${filteredPairs?.length || 0})`}
        </button>}
        <Table
          columns={columns}
          dataSource={isLoggedIn ? filteredPairs : []}
          rowKey="id"
          loading={tableLoading}
          pagination={false}
          size="middle"
          bordered={false}
          className={`${styles.allCoinsTable} spot-table-box w-full`}
          showSorterTooltip={false}
          locale={{
            emptyText: <>
              <NoData textColor='#A4A5AC' buttonTitle={isLoggedIn ? t("header.goToMarket") : t("header.loginNow")}
                buttonClick={handleGoToMarket} />
            </>
          }}
        />
      </div>
      {/* 
      {!isLoggedIn ? (
        // 未登录状态
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Image
              src="/images/market/empty.png"
              alt=""
              width={160}
              height={160}
            />
            <p
              style={{
                color: "var(--text-color6)",
                fontSize: "14px",
              }}
            >
              {t("spot.header.noData")}
            </p>
            <button
              style={{
                backgroundColor: "var(--theme-color)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "8px 24px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onClick={() => router.push("/login")}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
               {t("spot.header.loginNow")}
            </button>
          </div>
        </div>
      ) : filteredPairs.length === 0 ? (
        // 已登录但无数据
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Image
              src="/images/market/empty.png"
              alt=""
              width={160}
              height={160}
            />
            <p
              style={{
                color: "var(--text-color6)",
                fontSize: "14px",
              }}
            >
              {t("spot.header.noData")}
            </p>
            <button
              style={{
                backgroundColor: "var(--theme-color)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "8px 24px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onClick={handleGoToMarket}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {t("spot.header.goToMarket")}
            </button>
          </div>
        </div>
      ) : (
        // 已登录且有数据
        <div className={styles.container}>
          列表头部
          <div
            className={`${styles.list_header} px-4 py-4`}
            style={{
              display: "grid",
              gridTemplateColumns: "16% 16% 16% 20% 16% 16%",
            }}
          >
            名称表头
            <div
              className={`${styles.tip_color} font-12 flex-x align-center pointer`}
              onClick={() => handleSort("name")}
            >
              <span>{t("spot.header.name")}</span>
              <div className="ml-1 flex-y-cc">
                <Iconify
                  icon="fluent-mdl2:flick-down"
                  className={`pointer ${
                    sortField === "name" && sortDirection === "asc"
                      ? styles.active_sort
                      : ""
                  }`}
                  size={10}
                  style={{ marginBottom: 2 }}
                />
                <Iconify
                  icon="fluent-mdl2:flick-up"
                  className={`pointer ${
                    sortField === "name" && sortDirection === "desc"
                      ? styles.active_sort
                      : ""
                  }`}
                  size={10}
                />
              </div>
            </div>

            最新价表头
            <div
              className={`${styles.tip_color} font-12 flex-x align-center pointer`}
              onClick={() => handleSort("price")}
            >
              <span>{t("spot.header.lastPrice")}</span>
              <div className="ml-1 flex-y-cc">
                <Iconify
                  icon="fluent-mdl2:flick-down"
                  className={`pointer ${
                    sortField === "price" && sortDirection === "asc"
                      ? styles.active_sort
                      : ""
                  }`}
                  size={10}
                  style={{ marginBottom: 2 }}
                />
                <Iconify
                  icon="fluent-mdl2:flick-up"
                  className={`pointer ${
                    sortField === "price" && sortDirection === "desc"
                      ? styles.active_sort
                      : ""
                  }`}
                  size={10}
                />
              </div>
            </div>

            24h涨跌/24h成交量表头
            <div
              className={`${styles.tip_color} font-12 flex-x align-center pointer`}
              onClick={() => handleSort("change")}
            >
              <span>
                {showVolume
                  ? t("spot.header.volume24h")
                  : t("spot.header.change24h")}
              </span>
              <div className="ml-1 flex-y-cc">
                <Iconify
                  icon="fluent-mdl2:flick-down"
                  className={`pointer ${
                    sortField === "change" && sortDirection === "asc"
                      ? styles.active_sort
                      : ""
                  }`}
                  size={10}
                  style={{ marginBottom: 2 }}
                />
                <Iconify
                  icon="fluent-mdl2:flick-up"
                  className={`pointer ${
                    sortField === "change" && sortDirection === "desc"
                      ? styles.active_sort
                      : ""
                  }`}
                  size={10}
                />
              </div>
            </div>

            最高价/最低价表头
            <div className={`${styles.tip_color} font-12 flex-x align-center`}>
              <span>{t("spot.header.high24h")}/{t("spot.header.low24h")}</span>
            </div>

            成交额表头
            <div className={`${styles.tip_color} font-12 flex-x align-center`} onClick={() => handleSort("quantity")}>
              <span>{t("spot.header.amount24h")}</span>
              <div className="ml-1 flex-y-cc">
                <Iconify
                  icon="fluent-mdl2:flick-down"
                  className={`pointer ${
                    sortField === "quantity" && sortDirection === "asc"
                      ? styles.active_sort
                      : ""
                  }`}
                  size={10}
                  style={{ marginBottom: 2 }}
                />
                <Iconify
                  icon="fluent-mdl2:flick-up"
                  className={`pointer ${
                    sortField === "quantity" && sortDirection === "desc"
                      ? styles.active_sort
                      : ""
                  }`}
                  size={10}
                />
              </div>
            </div>

            操作表头
            <div className={`${styles.tip_color} font-12 flex-x-end`}>
              <span>{t("spot.columns.operation")}</span>
            </div>
          </div>

          交易对列表
          <div className={`${styles.pair_list}`}>
            {filteredPairs.map((pair, index) => (
              <div
                key={index}
                className={`${styles.pair_item}  px-4 flex-x align-center`}
                onClick={() => handlePairClick(pair)}
                style={{
                    cursor: "pointer",
                    display: "grid",
                    gridTemplateColumns: "16% 16% 16% 20% 16% 16%",
                  }}
              >
                币种名称
                <div className={`${styles.pair_name} flex-1`}>
                  <span className={styles.favorite}>
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
                <div className={`font-14 ${styles.title_color} flex-1`}>
                  {pair.yesterdayPrice}
                </div>
                24h涨跌/24h成交量
                <div
                  className={`${styles.pair_change} ${
                    !showVolume && pair.priceChangePercent > 0
                      ? styles.success_icon
                      : !showVolume && pair.priceChangePercent < 0
                      ? styles.error_icon
                      : ""
                  } flex-1`}
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
          </div>
        </div>
      )} */}
    </ConfigProvider>
  );
};

export default observer(SelfSelect);
