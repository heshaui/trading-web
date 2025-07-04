import { SearchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import {
  Input,
  Select,
  Space,
  Table,
  Button,
  ConfigProvider,
  Modal,
  Spin,
} from "antd";
import { useState, useEffect, use } from "react";
import styles from "../../../styles/components/Financial.module.css";
import { FinancialConfig } from "../index";
import { getFinancialPageToken, StatusEnum } from "@/services/financial";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { NoData } from "@/components/noData";
import { useRouter } from "next/router";
import Image from "next/image";
import { ColumnsType } from "antd/es/table";

// 定义数据项类型
interface TokenItem {
  key: string;
  name: string;
  age: string;
  address: string;
}

// 定义数据源类型
interface DataSource {
  data: TokenItem[];
  count: number;
}

// 模拟数据
const mockData: TokenItem[] = [
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
  {
    key: "3",
    name: "ETH",
    age: "3.50 ~ 8.80%",
    address: "定期",
  },
  {
    key: "4",
    name: "BNB",
    age: "4.20 ~ 6.50%",
    address: "活期",
  },
  {
    key: "5",
    name: "ADA",
    age: "6.00 ~ 12.00%",
    address: "定期",
  },
  {
    key: "6",
    name: "XRP",
    age: "3.80 ~ 7.20%",
    address: "活期",
  },
  {
    key: "7",
    name: "DOT",
    age: "8.50 ~ 15.30%",
    address: "定期",
  },
  {
    key: "8",
    name: "MATIC",
    age: "7.20 ~ 11.80%",
    address: "活期",
  },
  {
    key: "9",
    name: "SOL",
    age: "9.00 ~ 16.50%",
    address: "定期",
  },
  {
    key: "10",
    name: "AVAX",
    age: "6.80 ~ 13.20%",
    address: "活期",
  },
  {
    key: "11",
    name: "LINK",
    age: "5.50 ~ 10.30%",
    address: "定期",
  },
  {
    key: "12",
    name: "UNI",
    age: "7.80 ~ 14.20%",
    address: "活期",
  },
  {
    key: "13",
    name: "ALGO",
    age: "8.20 ~ 12.80%",
    address: "定期",
  },
  {
    key: "14",
    name: "ATOM",
    age: "9.50 ~ 17.20%",
    address: "活期",
  },
];

const TokenList = ({
  setOpenSubscribe,
  financialConfig,
  isLoggedIn,
}: {
  setOpenSubscribe: (open: boolean) => void;
  financialConfig: FinancialConfig;
  isLoggedIn: boolean;
}) => {
  const router = useRouter();

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any>({
    data: [],
    count: 0,
  });
  const [formData, setFormData] = useState({
    coinId: '',
    type: null,
  });

  const [currentPage, setCurrentPage] = useState({
    pageNo: 1,
    pageSize: 10,
  });

  // 模拟API请求
  const fetchData = async (params: any) => {
    try {
      setLoading(true);
      // 模拟网络请求延迟
      const res = await getFinancialPageToken(params);
      if (res.code === "0") {
        setDataSource({
          data: res.data.list,
          count: res.data.count,
        });
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const more = async () => {
    const nextPage = {
      pageNo: currentPage.pageNo + 1,
      pageSize: currentPage.pageSize,
      ...formData,
    };
    await fetchData(nextPage)
  };

  // 检查是否还有更多数据

  // 为每个币种生成子产品数据
  const generateSubProducts = (record: TokenItem): TokenItem[] => {
    const baseRates = record.age.split(" ~ ");
    const minRate = parseFloat(baseRates[0].replace("%", ""));
    const maxRate = parseFloat(baseRates[1].replace("%", ""));

    const subProducts: TokenItem[] = [
      {
        key: `${record.key}_1`,
        name: record.name,
        age: `${minRate.toFixed(2)}% ~ ${maxRate.toFixed(2)}%`,
        address: record.address === "定期" ? "定期-7天" : "活期",
      },
      {
        key: `${record.key}_2`,
        name: record.name,
        age: `${(minRate + 1).toFixed(2)}% ~ ${(maxRate + 2).toFixed(2)}%`,
        address: record.address === "定期" ? "定期-14天" : "定期-7天",
      },
      {
        key: `${record.key}_3`,
        name: record.name,
        age: `${(minRate + 2).toFixed(2)}% ~ ${(maxRate + 3).toFixed(2)}%`,
        address: "定期-30天",
      },
    ];
    return subProducts;
  };

  const columns: ColumnsType<any> = [
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

  const expandedColumns: ColumnsType<any> = [
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
          {!isLoggedIn ? (
            <Button
              onClick={() => router.push("/login")}
              type="primary"
              shape="round"
            >
              登录
            </Button>
          ) : (
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
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchData(formData);
  }, [formData]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "transparent",
            headerSplitColor: "transparent",
            borderColor: "transparent",
            rowExpandedBg: "var(--bgc-color)",
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
            value={formData.coinId}
            onChange={(e) => setFormData({ ...formData, coinId: e.target.value })}
            className="w-[188px] h-[40px]"
            placeholder="搜索"
            prefix={<SearchOutlined className="text-[var(--text-color5)]" />}
          />
          <Select
            value={formData.type}
            className="w-[188px] h-[40px]"
            onChange={(value) => setFormData({ ...formData, type: value })}
            options={[
              { value: "全部", label: "全部" },
              { value: "活期", label: "活期" },
              { value: "定期-7天", label: "定期-7天" },
              { value: "定期-14天", label: "定期-14天" },
            ]}
          />
        </Space>
        <Spin spinning={loading}>
          <Table
            className={styles.table}
            bordered={false}
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  showHeader={false}
                  columns={expandedColumns}
                  dataSource={generateSubProducts(record)}
                  bordered={false}
                  pagination={false}
                />
              ),
              expandIconColumnIndex: 0, // 展开列的索引
              showExpandColumn: false, // 隐藏默认的展开列
              expandedRowKeys, // 展开的行
              onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]), // 展开的行
            }}
            dataSource={dataSource.data}
            locale={{ emptyText: <NoData /> }}
            columns={columns}
            pagination={false}
            footer={() =>
              dataSource.count > dataSource.data.length ? (
                <div className="flex justify-center">
                  <Image
                    src="/images/financial/more.svg"
                    className="cursor-pointer m-[20px]"
                    width={24}
                    height={24}
                    alt="more"
                    onClick={more}
                  />
                </div>
              ) : null
            }
          />
        </Spin>
      </div>
    </ConfigProvider>
  );
};

export default TokenList;
