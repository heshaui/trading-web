import { SearchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { Input, Select, Space, Table, Button, ConfigProvider } from "antd";
import { useState } from "react";

const dataSource = [
  {
    key: "1",
    name: "USDT",
    age: "2.82 ~ 3.20%",
    address: "定期",
  },
  {
    key: "2",
    name: "BTC",
    age: "5.00 ~ 13.20%",
    address: "活期",
  },
];
export const TokenList = ({
  setOpenSubscribe,
}: {
  setOpenSubscribe: (open: boolean) => void;
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const handleExpand = (key: React.Key) => {
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys(expandedRowKeys.filter((k) => k !== key));
    } else {
      setExpandedRowKeys([...expandedRowKeys, key]);
    }
  };

  const columns = [
    {
      title: "币种",
      dataIndex: "name",
      key: "name",
      width: "30%",
    },
    {
      title: "年利率",
      dataIndex: "age",
      key: "age",
      width: "30%",
    },
    {
      title: "期限（天)",
      dataIndex: "address",
      key: "address",
      width: "30%",
    },
    {
      title: "操作",
      dataIndex: "address",
      key: "address",
      width: "10%",
      render: (text: any, record: any, index: number) => (
        <Button
          type="text"
          size="small"
          icon={
            expandedRowKeys.includes(record.key) ? (
              <UpOutlined />
            ) : (
              <DownOutlined />
            )
          }
          onClick={() => handleExpand(record.key)}
        />
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            /* 这里是你的组件 token */
            headerBg: "transparent",
            headerSplitColor: "transparent",
            borderColor: "transparent",
            rowExpandedBg: "var(--bgc-color)",
            cellPaddingInline: 0,
            headerColor: "var(--text-color6)",
            fontWeightStrong: 400,
            headerBorderRadius: 0,
          },
        },
      }}
    >
      <div className="p-[30px_120px]">
        <Space size={30} className="mb-[14px]">
          <Input
            className="w-[188px] h-[40px]"
            placeholder="搜索"
            prefix={<SearchOutlined style={{ color: "var(--text-color5)" }} />}
          />
          <Select
            defaultValue="lucy"
            className="w-[188px] h-[40px]"
            // onChange={handleChange}
            options={[
              { value: "jack", label: "Jack" },
              { value: "lucy", label: "Lucy" },
              { value: "Yiminghe", label: "yiminghe" },
              { value: "disabled", label: "Disabled", disabled: true },
            ]}
          />
        </Space>
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
          bordered={false}
          expandable={{
            expandedRowRender: (record) => (
              <table>
                <tr className="h-[64px]">
                  <td className="w-[30%]"></td>
                  <td className="w-[30%]">2.82 ~ 3.20%</td>
                  <td className="w-[30%]">活期</td>
                  <td className="w-[10%]">
                    <Button
                      type="primary"
                      shape="round"
                      onClick={() => setOpenSubscribe(true)}
                    >
                      购买
                    </Button>
                  </td>
                </tr>
                <tr className="h-[64px]">
                  <td className="w-[30%]"></td>
                  <td className="w-[30%]">2.82 ~ 3.20%</td>
                  <td className="w-[30%]">活期</td>
                  <td className="w-[10%]">
                    <Button type="primary" shape="round">
                      购买
                    </Button>
                  </td>
                </tr>
                <tr className="h-[64px]">
                  <td className="w-[30%]"></td>
                  <td className="w-[30%]">2.82 ~ 3.20%</td>
                  <td className="w-[30%]">活期</td>
                  <td className="w-[10%]">
                    <Button type="primary" shape="round">
                      购买
                    </Button>
                  </td>
                </tr>
              </table>
            ),
            expandIconColumnIndex: 0,
            showExpandColumn: false, // 隐藏默认的展开列
            expandedRowKeys, // 展开的行
            onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]), // 展开的行
          }}
          dataSource={dataSource}
          columns={columns}
        />
      </div>
    </ConfigProvider>
  );
};
