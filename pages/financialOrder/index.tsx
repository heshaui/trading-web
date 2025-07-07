// export { default } from '../../modules/spot/pages';
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import { withSpotLayout } from "@/components/sidebarLayout/SpotLayout/userSpotLayout";
import {
  ConfigProvider,
  DatePicker,
  Flex,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import NoData from "@/components/noData/noData";
import { useEffect, useState } from "react";
import styles from "../../styles/components/Financial.module.css";
import {
  FinancialOrderItem,
  FinancialOrderListParams,
  FinancialOrderStatusEnum,
  getFinancialOrderList,
} from "@/services/financial";
import { getCoinAll } from "@/services/assets";
const { RangePicker } = DatePicker;
import { FinancialType } from "@/services/financial";
import Image from "next/image";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const TabsItem = ({
  tableData,
  coinList,
  tableLoading,
  setFormData,
  formData,
}: {
  tableData: FinancialOrderItem[];
  coinList: { coinName: string; id: string }[];
  tableLoading: boolean;
  setFormData: (data: FinancialOrderListParams) => void;
  formData: FinancialOrderListParams;
}) => {
  // 表格列
  const columns: ColumnsType<FinancialOrderItem> = [
    {
      title: "币种",
      dataIndex: "coinName",
      key: "coinName",
      render: (_: any, record: any) => {
        return (
          <Flex gap="8px">
            {record.iconUrl && (
              <Image width={24} height={24} src={record.iconUrl} alt="" />
            )}
            <div>{record.coinName}</div>
          </Flex>
        );
      },
    },
    {
      title: "日期",
      dataIndex: "createTime",
      key: "createTime",
      render: (_: any, record: any) => {
        return dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (_: any, record: any) => {
        return (
          <>
          {record.status == FinancialOrderStatusEnum.PURCHASE && <div>申购</div>}
          {record.status == FinancialOrderStatusEnum.REDEEM && <div>赎回</div>}
          {record.status == FinancialOrderStatusEnum.INTEREST && <div>利息</div>}
        </>
        );
      },
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      render: (_: any, record: any) => {
        return (
          <div>
            <div>{record.amount} USDT</div>
            <div>≈￥{record.usdtAmount}</div>
          </div>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        return <Tag color="success">成功</Tag>
      },
    },
  ];

  //内容
  return (
    <>
      <div className="p-[24px_20px]  border-t-[1px] border-t-[var(--border-color)]">
        <Space>
          <Select
            value={formData.coinId}
            prefix="币种"
            className="w-[200px] h-[50px]"
            style={{ textAlign: "end" }}
            options={[
              {
                label: "全部",
                value: null,
              },
              ...coinList.map((item) => ({
                label: item.coinName,
                value: item.id,
              })),
            ]}
            onChange={(value) => setFormData({ ...formData, coinId: value })}
          />
          <Select
            prefix="类型"
            className="w-[200px] h-[50px]"
            style={{ textAlign: "end" }}
            value={formData.operationType}
            onChange={(value) =>
              setFormData({ ...formData, operationType: value })
            }
            // 1申购，2赎回，3利息
            options={[
              {
                label: "全部",
                value: null,
              },
              {
                label: "申购",
                // value: FinancialOrderStatusEnum.PURCHASE,
                value: '申购',
              },
              {
                label: "赎回",
                // value: FinancialOrderStatusEnum.REDEEM,
                value: '赎回',
              },
              // {
              //   label: "利息",
              //   value: FinancialOrderStatusEnum.INTEREST,
              // },
            ]}
          />
          <RangePicker
            className="w-[278px] h-[50px]"
            onChange={(value) =>
              setFormData({
                ...formData,
                startTime: value?.[0]?.unix(),
                endTime: value?.[1]?.unix(),
              })
            }
          />
        </Space>
      </div>
      <Table
        className={styles.table}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        loading={tableLoading}
        locale={{ emptyText: <NoData /> }}
      />
    </>
  );
};
const FinancialOrder = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [formData, setFormData] = useState<FinancialOrderListParams>({
    type: FinancialType.FIXED,
    coinId: null,
    operationType: null,
    startTime: null,
    endTime: null,
  });
  const [tableData, setTableData] = useState<FinancialOrderItem[]>([]);
  const [coinList, setCoinList] = useState<{ coinName: string; id: string }[]>(
    []
  );

  // 切换tabs
  const items = [
    {
      key: String(FinancialType.FIXED),
      label: "定期",
      children: (
        <TabsItem
          tableData={tableData}
          coinList={coinList}
          tableLoading={tableLoading}
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
    {
      key: String(FinancialType.CURRENT),
      label: "活期",
      children: (
        <TabsItem
          tableData={tableData}
          coinList={coinList}
          tableLoading={tableLoading}
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
  ];

  const fetchData = async (params: FinancialOrderListParams) => {
    try {
      setTableLoading(true);
      const res = await getFinancialOrderList(params);
      if (res.code === "0") {
        setTableData(res.data);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchCoinList = async () => {
    try {
      const response = await getCoinAll();
      if (response.code === "0" && Array.isArray(response.data)) {
        setCoinList(
          response.data.map((item: any) => ({
            coinName: item.coinName,
            id: item.coinId,
          }))
        );
      } else {
      }
    } catch (error) {
      console.error("获取币种列表失败:", error);
    }
  };

  useEffect(() => {
    fetchCoinList();
  }, []);

  useEffect(() => {
    fetchData(formData);
  }, [formData]);

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
      <div>
        <div className="mb-[16px] text-[var(--text-color5)] font-[500] text-[20px]">
          理财订单
        </div>
        <div className="bg-[var(--btncolor7)] rounded-[10px]">
          <Tabs
            className={styles.tabs}
            tabBarStyle={{ padding: "0 20px", height: "72px" }}
            items={items}
            onChange={(key) =>
              setFormData({
                type: Number(key),
                coinId: null,
                operationType: null,
                startTime: null,
                endTime: null,
              })
            }
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
