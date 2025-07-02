import { NoData } from "@/components/noData";
import { withAssetsLayout } from "@/components/sidebarLayout/AssetsLayout/userAssetsLayout";
import { Button, ConfigProvider, Select, Space, Switch, Table, Tabs } from "antd";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState } from "react";
import RedemptionModal from "./components/RedemptionModal";
import ConfirmModal from "./components/ConfirmModal";
import styles from "../../../styles/components/Financial.module.css";

const tableData = [
  {
    tokenName: "USDT",
    autoSubscribe: 1,
    subscribeAmount: "1000",
    annualRate: "10%",
    totalIncome: "1000",
  },
];

const Financial = () => {
  const [tabsKey, setTabsKey] = useState("1");
  const [tableLoading, setTableLoading] = useState(false);
  const [openRedemption, setOpenRedemption] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  // 表格列
  const columns = [
    {
      title: "币种",
      dataIndex: "tokenName",
      width: "190px",
    },
    {
      title: "自动申购",
      dataIndex: "autoSubscribe",
      render: (text: number) => {
        return <Switch size="small" checked={text === 1} />;
      },
      width: "190px",
    },
    {
      title: "申购金额",
      dataIndex: "subscribeAmount",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            <div> {record.subscribeAmount} USDT</div>
            <div>≈$20.10</div>
          </div>
        );
      },
      width: "190px",
    },
    {
      title: "年利率",
      dataIndex: "annualRate",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            5.00%~3.20%
          </div>
        );
      },
      width: "190px",
    },
    {
      title: "累计收益",
      dataIndex: "totalIncome",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            <div>0.00000000 BTC</div>
            <div>≈$20.10</div>
          </div>
        );
      },
      width: "190px",
    },
    {
      title: "操作",
      dataIndex: "action",
      align: "right" as const,
      render: (_: any, record: any) => {
        return (
          <Space>
            <div
              className="font-[400] text-[14px] text-[var(--theme-color)] cursor-pointer"
              onClick={() => setOpenConfirm(true)}
            >
              再次申购
            </div>
            <div
              className="font-[400] text-[14px] text-[var(--theme-color)] cursor-pointer"
              onClick={() => setOpenRedemption(true)}
            >
              赎回
            </div>
          </Space>
        );
      },
    },
  ];

  // 切换tabs
  const items = [
    {
      key: "1",
      label: "定期",
      children: (
        <Table
          className={styles.table}
          columns={columns}
          dataSource={tableData}
          pagination={false}
          loading={tableLoading}
          locale={{ emptyText: <NoData /> }}
          showSorterTooltip={false}
        />
      ),
    },
    {
      key: "2",
      label: "活期",
      children: <div>活期</div>,
    },
  ];

  return (
    <>
      <RedemptionModal
        openRedemption={openRedemption}
        setOpenRedemption={setOpenRedemption}
      />
      <ConfirmModal openConfirm={openConfirm} setOpenConfirm={setOpenConfirm} />
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
          },
        }}
      >
        <div>
          {/* title */}
          <div className="text-[20px] text-[var(--text-color5)] font-[500] mb-[16px]">
            理财账户
          </div>
          {/* content */}
          <div className="w-[1152px] h-[728px] bg-[var(--btncolor7)] rounded-[8px] p-[20px]">
            {/* 头部 */}
            <div className="w-[1112px] h-[274px] bg-[var(--background14)] rounded-[8px] mb-[30px]">
              {/* 顶部 */}
              <div className="p-[30px] flex justify-between items-end">
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    总资产
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    0.15 USD
                  </div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    ≈ 1.12 CNY
                  </div>
                </div>
                <Button type="primary">理财产品</Button>
              </div>
              <div className="m-[0px_30px] border-t border-[var(--border-color4)]" />
              {/* 底部 */}
              <div className="flex gap-[229px] p-[30px]">
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    昨日收益（USDT）
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    0.15 USD
                  </div>
                </div>
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    30日累计收益（USDT）
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    0.15 USD
                  </div>
                </div>
              </div>
            </div>
            {/* 表格 */}
            <Tabs
              className={styles.tabs}
              items={items}
              activeKey={tabsKey}
              tabBarStyle={{ padding: "0 20px", height: "72px" }}
              tabBarExtraContent={{ right: <Select className="w-[170px] h-[30px]" options={[]} /> }}
              onChange={(key) => setTabsKey(key)}
            />
          </div>
        </div>
      </ConfigProvider>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["assets", "common"])),
    },
  };
};
export default withAssetsLayout(Financial);
