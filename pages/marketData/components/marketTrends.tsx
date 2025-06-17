// 'use client'
// import React from 'react';
// import styles from '../styles/marketData.module.css'
// import { Tabs,Input} from "antd";
// import type { TabsProps,DropdownProps } from "antd";
// import { SearchOutlined } from '@ant-design/icons';
// import { Iconify } from "@/components/icon"
// import { useState, useEffect, useRef } from "react";
// import { useTranslation } from "next-i18next";
// import AllCoins from './allCoins';
// import SportMarket from './SportMarket'
// import WatchList from './watchList'
// import { observer } from 'mobx-react-lite';
// import appStore from '@/store';
// import SelfSelect from '@/modules/spot/pages/compontents/spotChart_header/SelfSelect'
// const TrendsTable=observer(()=>{
//   const { t } = useTranslation("market");
//   const [activeTab, setActiveTab] = useState('2'); // 默认选中第2个tab
//   const [searchKeyword, setSearchKeyword] = useState(''); // 添加搜索关键词状态
//   const currencyPairsArray = appStore.currencyPairs || [];
//       const [searchValue, setSearchValue] = useState('');
//     // 处理搜索输入变化
//     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       setSearchKeyword(e.target.value);
//     };
//     const handlePairSelect = (pair: any) => {
//       appStore.setCurrentPair(pair);
//   };

  
//     // 处理搜索按钮点击或回车
//     const handleSearch = (value: string) => {
//       setSearchValue(value);
//   };
//     // const handleSearch = (value: string) => {
//     //   setSearchKeyword(value);
//     //   console.log('搜索关键词:', value);
//     // };
//     const handleTabChange = (key: string) => {
//       setActiveTab(key);
//     };
//      const onChange = (key: string) => {
//     setActiveTab(key)
//   };
//   //   tabs标题
//   const items: TabsProps["items"] = [
//     {
//       key: "1",
//       label:t("marketList.tabs.favorites"),
//       children: <WatchList  
//       currencyPairs={currencyPairsArray}
//       onPairSelect={handlePairSelect}
//       searchValue={searchValue}
//       onTabChange={onChange}/>,
//     },
//     {
//       key: "2",
//       label: t("marketList.tabs.allCoins"),
//       children: <AllCoins searchKeyword={searchKeyword}/>,
//     },
//     {
//       key: "3",
//       label: t("marketList.tabs.spotMarket"),
//       children: <SportMarket 
//       currencyPairs={currencyPairsArray}
//       onPairSelect={handlePairSelect}
//       searchValue={searchValue}/>,
//     },
//   ];
 
  

//   return (
//     <>
//        {/* 添加搜索框 */}
//        <div className={styles.searchContainer}>
//         <Input
//           allowClear
//           size="middle"
//           value={searchKeyword}
//           onChange={(e) => handleSearch(e.target.value)}
//           prefix={<SearchOutlined style={{ color: '#bfbfbf' }}/>}
//           style={{ width: "242px", marginBottom: 16 }}
//         />
//       </div>
//       <Tabs
//         items={items}
//         className="custom-tabs2"
//         activeKey={activeTab}
//         indicator={{ size: (origin) => origin - 35, align: 'center' }}
//         onChange={onChange}
//       />
      
//     </>
//   );
// })

// export default TrendsTable;
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

const TrendsTable = observer(() => {
  const { t } = useTranslation("market");
  const [activeTab, setActiveTab] = useState('2'); // 默认选中第2个tab
  const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词状态
  const currencyPairsArray = appStore.currencyPairs || [];

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
      children: <WatchList
        currencyPairs={currencyPairsArray}
        onPairSelect={handlePairSelect}
        searchValue={searchKeyword}
        onTabChange={onChange} />,
    },
    {
      key: "2",
      label: t("marketList.tabs.allCoins"),
      children: <AllCoins searchKeyword={searchKeyword} />,
    },
    {
      key: "3",
      label: t("marketList.tabs.spotMarket"),
      children: <SportMarket
        currencyPairs={currencyPairsArray}
        onPairSelect={handlePairSelect}
        searchValue={searchKeyword} />,
    },
  ];

  return (
    <>
      {/* 搜索框 */}
      <div className={styles.searchContainer}>
        <Input
          allowClear
          size="middle"
          value={searchKeyword}
          onChange={handleSearchChange}  // 修正为正确的处理函数
          onKeyPress={handleKeyPress}    // 添加回车键处理
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          style={{ width: "242px", marginBottom: 16 }}
        />
      </div>
      <Tabs
        items={items}
        className="custom-tabs2"
        activeKey={activeTab}
        indicator={{ size: (origin) => origin - 35, align: 'center' }}
        onChange={onChange}
      />
    </>
  );
})

export default TrendsTable;