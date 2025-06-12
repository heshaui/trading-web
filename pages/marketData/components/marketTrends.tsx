import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useState } from "react";
import { HotMarketSymbol } from "@/type/marketData/marketData";
import { useTranslation } from "next-i18next";
import AllCoins from './allCoins';
import SportMarket from './spotMarket'
import WatchList from './watchList'

interface TrendsTableProps {
  data: HotMarketSymbol[];
}

const TrendsTable: React.FC<TrendsTableProps> = ({ data }) => {
  const { t } = useTranslation("market");
  const [activeTab, setActiveTab] = useState('2'); // 默认选中第2个tab
  //   tabs标题
  const items: TabsProps["items"] = [
    {
      key: "1",
      label:t("marketList.tabs.favorites"),
      children: <WatchList data={data} />,
    },
    {
      key: "2",
      label: t("marketList.tabs.allCoins"),
      children: <AllCoins data={data} />,
    },
    {
      key: "3",
      label: t("marketList.tabs.spotMarket"),
      children: <SportMarket data={data}/>,
    },
  ];
  const onChange = (key: string) => {
    console.log(key);
    setActiveTab(key)
  };

  return (
    <>
      <Tabs
        items={items}
        className="custom-tabs2"
        activeKey={activeTab}
        indicator={{ size: (origin) => origin - 35, align: 'center' }}
        onChange={onChange}
      />
    </>
  );
};

export default TrendsTable;
