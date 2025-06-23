'use client'
import React from 'react';
import styles from '../styles/marketData.module.css'
import { Tabs, Input } from "antd";
import type { TabsProps, DropdownProps } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import { Iconify } from "@/components/icon"
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import AllCoins from './allCoins';
import SportMarket from './SportMarket'
import WatchList from './watchList'
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import SelfSelect from '@/modules/spot/pages/compontents/spotChart_header/SelfSelect'
type Props = {
  tradeData?: any;
  
}

const TrendsTable = observer(({ tradeData }: Props) => {
  const { t } = useTranslation("market");
  const [activeTab, setActiveTab] = useState('1'); // 默认选中第2个tab
  const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词状态
  const currencyPairsArray = appStore.getCurrentPairList() || appStore.currencyPairs || [];
  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handlePairSelect = (pair: any) => {
    appStore.setCurrentPair(pair);
  };

  // 处理回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 搜索逻辑已经通过value变化传递给子组件
      console.log('执行搜索:', searchKeyword);
    }
  };

  const onChange = (key: string) => {
    setActiveTab(key);
  };

  // tabs标题
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("marketList.tabs.favorites"),
      children: <div style={{ minHeight: "45vh", paddingBottom: '20px' }}>
        <WatchList
          currencyPairs={currencyPairsArray}
          onPairSelect={handlePairSelect}
          pairsNewPrice={tradeData}
          onTabChange={onChange} />
      </div>
      ,
    },
    {
      key: "2",
      label: t("marketList.tabs.allCoins"),
      children: <div style={{ minHeight: "45vh",paddingBottom: '20px' }}>
        <AllCoins  pairsNewPrice={tradeData}
          currencyPairs={currencyPairsArray}
          onPairSelect={handlePairSelect}
        /> </div>,
    },
    {
      key: "3",
      label: t("marketList.tabs.spotMarket"),
      children: <div style={{ minHeight: "45vh",paddingBottom: '20px' }}><SportMarket
        currencyPairs={currencyPairsArray}
        pairsNewPrice={tradeData}
        onPairSelect={handlePairSelect}
       
        // searchValue={searchKeyword}
      /> </div>,
    },
  ];

  return (
    <div className='position-relative'>
      <Tabs
        items={items}
        className="custom-tabs2"
        activeKey={activeTab}
        destroyInactiveTabPane={true}
        indicator={{ size: (origin) => origin - 35, align: 'center' }}
        onChange={onChange}
      />
    </div>
  );
})

export default TrendsTable;