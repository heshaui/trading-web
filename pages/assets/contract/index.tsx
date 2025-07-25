import { withAssetsLayout } from "@/components/sidebarLayout/AssetsLayout/userAssetsLayout";
import {
  ConfigProvider,
  Table,
  Input,
  Form,
  Checkbox,
  Flex,
  Button,
} from "antd";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import styles from "../../../styles/components/Financial.module.css";
import { NoData } from "@/components/noData";
import { useEffect, useState } from "react";
import { Iconify } from "@/components/icon";
import Image from "next/image";
import { ColumnsType } from "antd/es/table";
import { observer } from "mobx-react-lite";
import { financialThemeConfig } from "@/theme/financialThemeConfig";

interface ContractAccountItem {
  id: string;
  coinName: string;
  totalProfit: number;
  walletBalance: number;
  available: number;
  unrealizedProfit: number;
}

const Contract = observer(() => {
  const { t } = useTranslation(["contract"]);
  const [form] = Form.useForm();

  const [tableData, setTableData] = useState<ContractAccountItem[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  // 表格列
  const columns: ColumnsType<ContractAccountItem> = [
    // 币种
    {
      title: "币种",
      dataIndex: "coinName",
      key: "coinName",
      render: (_: any, record: any) => {
        return (
          <Flex gap="8px">
            {record.iconUrl && (
              <Image
                width={24}
                height={24}
                src={record.iconUrl}
                alt=""
                style={{ borderRadius: "50%" }}
              />
            )}
            <div className="font-[500] text-[14px] text-[var(--text-color5)]">
              {record.coinName}
            </div>
          </Flex>
        );
      },
    },
    //总收益
    {
      title: "总收益",
      dataIndex: "totalProfit",
      key: "totalProfit",
      sorter: (a: ContractAccountItem, b: ContractAccountItem) =>
        a.totalProfit - b.totalProfit,
      align: "right",
    },
    // 钱包余额
    {
      title: "钱包余额",
      dataIndex: "walletBalance",
      key: "walletBalance",
      align: "right",
    },
    // 可用
    {
      title: "可用",
      dataIndex: "available",
      key: "available",
      sorter: (a: ContractAccountItem, b: ContractAccountItem) =>
        a.available - b.available,
      align: "right",
    },
    // 未实现盈亏
    {
      title: "未实现盈亏",
      dataIndex: "unrealizedProfit",
      key: "unrealizedProfit",
      align: "right",
      sorter: (a: ContractAccountItem, b: ContractAccountItem) =>
        a.unrealizedProfit - b.unrealizedProfit,
    },
    // 操作
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[var(--theme-color)] cursor-pointer">
            {"划转"}
          </div>
        );
      },
    },
  ];

  // 获取数据
  const fetchData = async () => {
    setTableLoading(true);
    try {
      setTimeout(() => {
        setTableData([
          {
            id: "btc",
            coinName: "BTC",
            totalProfit: 100,
            walletBalance: 100,
            available: 100,
            unrealizedProfit: 100,
          },
          {
            id: "eth",
            coinName: "ETH",
            totalProfit: 200,
            walletBalance: 200,
            available: 200,
            unrealizedProfit: 200,
          },
          {
            id: "usdt",
            coinName: "USDT",
            totalProfit: 300,
            walletBalance: 300,
            available: 300,
            unrealizedProfit: 300,
          },
          {
            id: "sol",
            coinName: "SOL",
            totalProfit: 400,
            walletBalance: 400,
            available: 400,
            unrealizedProfit: 300,
          },
        ]);
      }, 1000);
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    // 基础页面
    <ConfigProvider theme={financialThemeConfig}>
      <div className="flex flex-col h-full gap-[16px]">
        {/* title */}
        <div className="text-[20px] text-[var(--text-color5)] font-[500]">
          {"合约账户"}
        </div>
        {/* 内容 */}
        <div className="bg-[var(--btncolor7)] rounded-[8px] p-[20px] flex-1">
          {/* 头部数据 */}
          <div className="h-[151px] bg-[var(--background14)] rounded-[8px] flex items-end justify-between p-[30px]">
            {/* 总资产折合  */}
            <div className="flex flex-col">
              <div className="text-[14px] text-[var(--text-color6)]">
                总资产折合
              </div>
              <div className="text-[30px] text-[var(--text-color5)] font-[700]">
                0.00091761 BTC
              </div>
              <div className="text-[14px] text-[var(--text-color6)]">
                ≈ 99.41 USD
              </div>
            </div>
            {/* 今日盈亏 */}
            <div className="flex flex-col">
              <div className="text-[14px] text-[var(--text-color6)]">
                今日盈亏
              </div>
              <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                -0.58 USD
              </div>
              <div className="text-[14px] text-[var(--text-color6)]">
                -0.58%
              </div>
            </div>
            {/* 盈亏分析 */}
            <Button onClick={() => {}} type="primary" ghost shape="round">
              盈亏分析
            </Button>
          </div>
          {/* 底部数据 */}
          <div>
            {/* 搜索 */}
            <div className="py-[16px]">
              <Form form={form}>
                <Flex align="center" gap={30}>
                  <Form.Item noStyle name="coin">
                    <Input
                      allowClear
                      placeholder="请输入币种"
                      className="h-[40px]"
                      style={{ width: "188px" }}
                      prefix={<Iconify icon="garden:search-26" size={20} />}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    name="hideSmallAssets"
                    valuePropName="checked"
                  >
                    <Checkbox onChange={() => {}}>隐藏小额资产</Checkbox>
                  </Form.Item>
                </Flex>
              </Form>
            </div>
            {/* 表格 */}
            <Table
              rowKey="id"
              className={styles.table}
              columns={columns}
              showSorterTooltip={false}
              dataSource={tableData}
              pagination={false}
              loading={tableLoading}
              locale={{ emptyText: <NoData height="35vh" /> }}
            />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
});

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "contract"])),
    },
  };
};
export default withAssetsLayout(Contract);
