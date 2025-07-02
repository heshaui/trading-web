import { SearchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import {
  Input,
  Select,
  Space,
  Table,
  Button,
  ConfigProvider,
  Modal,
} from "antd";
import { useState } from "react";
import styles from "../../../styles/components/Financial.module.css";
import { FinancialConfig } from "../index";
import { StatusEnum } from "@/services/financial";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { NoData } from "@/components/noData";

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

const TokenList = ({
  setOpenSubscribe,
  financialConfig,
}: {
  setOpenSubscribe: (open: boolean) => void;
  financialConfig: FinancialConfig;
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const handleExpand = (key: React.Key) => {
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys(expandedRowKeys.filter((k) => k !== key));
    } else {
      setExpandedRowKeys([...expandedRowKeys, key]);
    }
  };

  const onSubscribe = (record: any) => {
    const userInfo = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || "{}"
    );
    if (
      financialConfig?.isRealname &&
      financialConfig.isRealname === StatusEnum.OPEN &&
      userInfo.authStatus === 1
    ) {
      setOpenSubscribe(true);
    } else {
      console.log(record);
      Modal.confirm({
        className: styles.modal,
        title: (
          <div className="font-w-400 text-[16px] text-[var(--text-color5)]">
            您需要完成以下操作后申购
          </div>
        ),
        closable: true,
        icon: null,
        styles: {
          content: {
            backgroundColor: "var(--background12)",
          },
        },
        content: (
          <div className="flex gap-[10px] p-[32px_20px_73px_20px]">
            <div className="font-w-400 text-[14px] text-[var(--text-color5)]">
              绑定身份认证
            </div>
            <div className="text-[var(--theme-color)] cursor-pointer">前往</div>
          </div>
        ),
        footer: null,
      });
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
      align: "right" as const,
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

  const expandedColumns = [
    {
      title: "",
      dataIndex: "",
      key: "",
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
      align: "right" as const,
      render: (text: any, record: any, index: number) => (
        <>
          {index == 0 && (
            <Button
              onClick={() => onSubscribe(record)}
              type="primary"
              shape="round"
            >
              申购
            </Button>
          )}
          {index == 1 && (
            <Button
              disabled
              type="primary"
              shape="round"
              style={{
                backgroundColor: "var(--theme-05)",
              }}
            >
              售罄
            </Button>
          )}
          {index == 2 && (
            <Button
              disabled
              type="primary"
              shape="round"
              style={{
                backgroundColor: "var(--theme-05)",
              }}
            >
              暂停
            </Button>
          )}
        </>
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
            // cellPaddingInline: 0,
            // cellPaddingBlock: 0,
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
            prefix={<SearchOutlined className="text-[var(--text-color5)]" />}
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
          className={styles.table}
          bordered={false}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                showHeader={false}
                columns={expandedColumns}
                dataSource={dataSource}
                bordered={false}
                pagination={false}
              />
            ),
            expandIconColumnIndex: 0, // 展开列的索引
            showExpandColumn: false, // 隐藏默认的展开列
            expandedRowKeys, // 展开的行
            onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]), // 展开的行
          }}
          dataSource={dataSource}
          locale={{ emptyText: <NoData /> }}
          columns={columns}
        />
      </div>
    </ConfigProvider>
  );
};

export default TokenList;
