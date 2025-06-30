import { NoData } from "@/components/noData";
import { withAssetsLayout } from "@/components/sidebarLayout/AssetsLayout/userAssetsLayout";
import {
  Button,
  ConfigProvider,
  Divider,
  Space,
  Switch,
  Table,
  Tabs,
  Typography,
} from "antd";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState } from "react";
import RedemptionModal from "./components/RedemptionModal";
const { Link } = Typography;

const tableData = [
  {
    tokenName: "USDT",
    autoSubscribe: 1,
    subscribeAmount: "1000",
    annualRate: "10%",
    totalIncome: "1000",
  },
];

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
        <div className="text-[14px] text-[#0C0D0C] font-[400]">
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
        <div className="text-[14px] text-[#0C0D0C] font-[400]">5.00%~3.20%</div>
      );
    },
    width: "190px",
  },
  {
    title: "累计收益",
    dataIndex: "totalIncome",
    render: (_: any, record: any) => {
      return (
        <div className="text-[14px] text-[#0C0D0C] font-[400]">
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
    render: (text: string) => {
      return (
        <Space>
          <Link
            style={{ color: "var(--theme-color)" }}
            className="font-[400] text-[14px]"
          >
            再次申购
          </Link>
          <Link
            style={{ color: "var(--theme-color)" }}
            className="font-[400] text-[14px]"
          >
            赎回
          </Link>
        </Space>
      );
    },
  },
];

const Financial = () => {
  const [tabsKey, setTabsKey] = useState("1");
  const [tableLoading, setTableLoading] = useState(false);

  const items = [
    {
      key: "1",
      label: "定期",
      children: (
        <Table
          columns={columns}
          dataSource={tableData}
          size="large"
          scroll={{ x: "max-content", y: 500 }}
          className={`table-box`}
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
      <RedemptionModal />
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
            },
          },
        }}
      >
        <div>
          {/* title */}
          <div className="text-[20px] text-[#0C0D0C] font-[500] mb-[16px]">
            理财账户
          </div>
          {/* content */}
          <div className="w-[1152px] h-[728px] bg-[#FFF] rounded-[8px] p-[20px]">
            {/* 头部 */}
            <div className="w-[1112px] h-[274px] bg-[#F5F5F5] rounded-[8px] mb-[30px]">
              {/* 顶部 */}
              <div className="p-[30px] flex justify-between items-end">
                <div>
                  <div className="text-[14px] text-[#676867] font-[400]">
                    总资产
                  </div>
                  <div className="text-[32px] text-[#0C0D0C] font-[700]">
                    0.15 USD
                  </div>
                  <div className="text-[14px] text-[#676867] font-[400]">
                    ≈ 1.12 CNY
                  </div>
                </div>
                <Button type="primary">理财产品</Button>
              </div>
              <div className="m-[0px_30px] border-t border-[#E5E5E5]" />
              {/* 底部 */}
              <div className="flex gap-[229px] p-[30px]">
                <div>
                  <div className="text-[14px] text-[#676867] font-[400]">
                    昨日收益（USDT）
                  </div>
                  <div className="text-[32px] text-[#0C0D0C] font-[700]">
                    0.15 USD
                  </div>
                </div>
                <div>
                  <div className="text-[14px] text-[#676867] font-[400]">
                    30日累计收益（USDT）
                  </div>
                  <div className="text-[32px] text-[#0C0D0C] font-[700]">
                    0.15 USD
                  </div>
                </div>
              </div>
            </div>
            {/* 表格 */}
            <Tabs
              items={items}
              activeKey={tabsKey}
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
