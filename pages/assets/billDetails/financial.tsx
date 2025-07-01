import { NoData } from "@/components/noData";
import { ConfigProvider, DatePicker, Select, Table } from "antd";
import { useState } from "react";
const { RangePicker } = DatePicker;

const tableData = [
  {
    id: 1,
    date: "2021-01-01",
    coin: "BTC",
    productType: "活期",
    operationType: "购买",
    amount: "100 BTC",
  },
];

const Financial = () => {
  const [tableLoading, setTableLoading] = useState(false);

  const columns = [
    {
      title: "日期",
      dataIndex: "date",
    },
    {
      title: "币种",
      dataIndex: "coin",
    },
    {
      title: "产品类型",
      dataIndex: "productType",
    },
    {
      title: "操作类型",
      dataIndex: "operationType",
    },
    {
      title: "金额",
      dataIndex: "amount",
      width: 200,
      align: "right" as const,
      render: (_: any, record: any) => {
        return (
          <div className="text-[#0C0D0C] font-[500] text-[14px]">
            <div>100 BTC</div>
            <div>≈￥700.23</div>
          </div>
        );
      },
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
          Pagination: {
            itemActiveBg: "transparent",
            itemBg: "transparent",
          },
          Select: {
            activeBorderColor: "var(--border-color4)",
            optionActiveBg: "transparent",
            selectorBg: "transparent", //选框背景色
          },
        },
      }}
    >
      <div className="flex items-center gap-[20px] p-[30px_20px]">
        <Select options={[]} className={`w-[200px] h-[50px]`} />
        <Select options={[]} className={`w-[200px] h-[50px]`} />
        <Select options={[]} className={`w-[200px] h-[50px]`} />
        <RangePicker className="w-[278px] h-[50px]" />
      </div>
      <Table
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                style={{
                  borderTop: "1px solid #DCDCDC",
                  borderBottom: "1px solid #DCDCDC",
                }}
              />
            ),
          },
        }}
        columns={columns}
        dataSource={tableData}
        size="large"
        pagination={false}
        loading={tableLoading}
        locale={{ emptyText: <NoData /> }}
        showSorterTooltip={false}
      />
    </ConfigProvider>
  );
};

export default Financial;
