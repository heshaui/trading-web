// export { default } from '../../modules/spot/pages';
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import { withSpotLayout } from "@/components/sidebarLayout/SpotLayout/userSpotLayout";
import { ConfigProvider, DatePicker, Select, Space, Table, Tabs } from "antd";
import NoData from "@/components/noData/noData";
import { useState } from "react";
import styles from "../../styles/components/Financial.module.css";
const { RangePicker } = DatePicker;

const tableData = [
  {
    tokenName: "USDT",
    autoSubscribe: 1,
    subscribeAmount: "1000",
    annualRate: "10%",
    totalIncome: "1000",
  },
];
const FinancialOrder = () => {
  const [tableLoading, setTableLoading] = useState(false);

  // 表格列
  const columns = [
    {
      title: "币种",
      dataIndex: "tokenName",
      width: "190px",
    },
    {
      title: "日期",
      dataIndex: "autoSubscribe",
    },
    {
      title: "类型",
      dataIndex: "subscribeAmount",
    },
    {
      title: "金额",
      dataIndex: "annualRate",
    },
    {
      title: "状态",
      dataIndex: "totalIncome",
    },
  ];

  // 切换tabs
  const items = [
    {
      key: "1",
      label: "定期",
      children: (
        <>
          <div className="p-[24px_20px]  border-t-[1px] border-t-[var(--border-color)]">
            <Space>
              <Select
                prefix="币种"
                className="w-[200px] h-[50px]"
                style={{ textAlign: "end" }}
                options={[
                  {
                    label: "全部",
                    value: "all",
                  },
                ]}
              />
              <Select
                prefix="类型"
                className="w-[200px] h-[50px]"
                style={{ textAlign: "end" }}
                options={[
                  {
                    label: "全部",
                    value: "all",
                  },
                ]}
              />
              <RangePicker className="w-[278px] h-[50px]" />
            </Space>
          </div>
          <Table
            className={styles.table}
            columns={columns}
            // dataSource={tableData}
            pagination={false}
            loading={tableLoading}
            locale={{ emptyText: <NoData /> }}
          />
        </>
      ),
    },
    {
      key: "2",
      label: "活期",
      children: <div>活期</div>,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "transparent",
            headerColor: "var(--text-color6)",
            headerSplitColor: "transparent", // 表头分割线颜色
            rowExpandedBg: "var(--background10)", // 表格行展开背景色
            borderColor: "transparent",
            headerBorderRadius: 0, // 表头圆角
          },
          Tabs: {
            horizontalMargin: "0px",
            inkBarColor: "var(--text-color5)", // 指示条颜色
            itemSelectedColor: "var(--text-color5)", // 选中文本颜色
            itemColor: "var(--text-color6)", // 文本颜色
            itemHoverColor: "var(--text-color5)", // 悬停文本颜色
          },
          Select: {
            optionSelectedBg: "var(--background10)",
          },
        },
      }}
    >
      <div className="w-[100%] h-[100%]">
        <div className="mb-[16px] text-[var(--text-color5)] font-[500] text-[20px]">
          理财订单
        </div>
        <div className="bg-[var(--btncolor7)] rounded-[10px]">
          <Tabs
            className={styles.tabs}
            tabBarStyle={{ padding: "0 20px", height: "72px" }}
            items={items}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default withSpotLayout(FinancialOrder);

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "flash",
        "spot",
        "common",
      ])),
    },
  };
};
