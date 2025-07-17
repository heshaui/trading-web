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
  FinancialOrderTypeEnum,
  getFinancialOrderList,
} from "@/services/financial";
import { getCoinAll } from "@/services/assets";
const { RangePicker } = DatePicker;
import { FinancialType } from "@/services/financial";
import Image from "next/image";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Iconify } from "@/components/icon";

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null

const resultStatusMap: Record<FinancialOrderStatusEnum, { text: string }> = {
  [FinancialOrderStatusEnum.SUCCESS]: {
    text: "common.success",
  },
  [FinancialOrderStatusEnum.FAIL]: {
    text: "common.fail",
  },
};

interface TabsItemProps {
  type: FinancialType;
  tableData: FinancialOrderItem[];
  coinList: { coinName: string; id: string }[];
  tableLoading: boolean;
  setFormData: (data: FinancialOrderListParams) => void;
  formData: FinancialOrderListParams;
}
const TabsItem = ({
  type,
  tableData,
  coinList,
  tableLoading,
  setFormData,
  formData,
}: TabsItemProps) => {
  const { t } = useTranslation(["financial"]);
  // 表格列
  // 定期: 币种 日期 类型 金额 期限(天) 状态
  // 活期: 币种 日期 类型 金额         状态
  const columns: ColumnsType<FinancialOrderItem> = [
    // 币种
    {
      title: t("common.token"),
      dataIndex: "coinName",
      key: "coinName",
      width: type === FinancialType.FIXED ? 180 : '20%',
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
            <div>{record.coinName}</div>
          </Flex>
        );
      },
    },

    // 日期
    {
      title: t("common.date"),
      dataIndex: "createTime",
      key: "createTime",
      align: "right",
      width: type === FinancialType.FIXED ? 180 : '20%',
      render: (_: any, record: any) => {
        return dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss");
      },
    },

    // 类型
    {
      title: t("common.type"),
      dataIndex: "status",
      key: "status",
      width: type === FinancialType.FIXED ? 180 : '20%',
      align: "center" as const,
      render: (_: any, record: any) => {
        return (
          <>
            {record.status == FinancialOrderTypeEnum.PURCHASE && (
              <div>{t("common.subscribe")}</div>
            )}
            {record.status == FinancialOrderTypeEnum.REDEEM && (
              <div>{t("common.redeem")}</div>
            )}
          </>
        );
      },
    },

    // 金额
    {
      title: t("common.amount"),
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: type === FinancialType.FIXED ? 180 : '20%',
      render: (_: any, record: any) => {
        return (
          <div>
            <div>{record.amount} USDT</div>
            <div>≈￥{record.usdtAmount}</div>
          </div>
        );
      },
    },

    // 期限(天) 定期显示
    ...(type === FinancialType.FIXED
      ? [
          {
            title: `${t("common.term")}(${t("common.day")})`,
            dataIndex: "term",
            key: "term",
            align: "right" as const,
            render: (_: any, record: FinancialOrderItem) => {
              return <div>{record.term ? record.term : "-"}</div>;
            },
          },
        ]
      : []),

    // 状态
    {
      title: t("common.status"),
      dataIndex: "resultStatus",
      key: "resultStatus",
      width: type === FinancialType.FIXED ? 180 : '20%',
      align: "right" as const,
      render: (_: any, record: FinancialOrderItem) => {
        const resultStatus = record.resultStatus;
        return resultStatus !== null && resultStatus !== undefined ? (
          <div className="text-[var(--text-color5)] font-[400] text-[16px]">
            {t(resultStatusMap[resultStatus].text)}
          </div>
        ) : (
          "-"
        );
      },
    },
  ];

  //内容
  return (
    <>
      <div className="p-[24px_20px]  border-t-[1px] border-t-[var(--border-color)]">
        <Space>
          {/* 币种 */}
          <Select
            allowClear
            value={!formData.coinId ? NULL_PLACEHOLDER : formData.coinId}
            prefix={t("common.token")}
            className="w-[200px] h-[50px]"
            style={{ textAlign: "end" }}
            options={[
              {
                label: t("common.all"),
                value: NULL_PLACEHOLDER,
              },
              ...coinList.map((item) => ({
                label: item.coinName,
                value: item.id,
              })),
            ]}
            onChange={(value) =>
              setFormData({
                ...formData,
                coinId: value === NULL_PLACEHOLDER ? null : Number(value),
              })
            }
          />

          {/* 类型 */}
          <Select
            allowClear
            prefix={t("common.type")}
            className="w-[200px] h-[50px]"
            style={{ textAlign: "end" }}
            value={
              !formData.operationType
                ? NULL_PLACEHOLDER
                : formData.operationType
            }
            onChange={(value) =>
              setFormData({
                ...formData,
                operationType: value === NULL_PLACEHOLDER ? null : value,
              })
            }
            // 全部 申购 赎回
            options={[
              {
                label: t("common.all"),
                value: NULL_PLACEHOLDER,
              },
              {
                label: t("common.subscribe"),
                value: String(FinancialOrderTypeEnum.PURCHASE),
              },
              {
                label: t("common.redeem"),
                value: String(FinancialOrderTypeEnum.REDEEM),
              },
            ]}
          />

          {/* 时间 */}
          <RangePicker
            className="w-[278px] h-[50px]"
            suffixIcon={
              <Iconify
                icon="cuida:calendar-outline"
                className={`${styles.title_color}`}
                size={20}
              />
            }
            placeholder={[t("common.startTime"), t("common.endTime")]}
            onChange={(value) => {
              if (!value) {
                return setFormData({
                  ...formData,
                  startTime: null,
                  endTime: null,
                });
              }
              setFormData({
                ...formData,
                startTime: dayjs(value?.[0]).startOf("day").valueOf(), // 开始时间 00.00.00
                endTime: dayjs(value?.[1]).endOf("day").valueOf(), // 结束时间 23.59.59
              });
            }}
          />
        </Space>
      </div>
      <Table
        rowKey={(record) => record.createTime}
        className={styles.table}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        loading={tableLoading}
        locale={{ emptyText: <NoData/> }}
      />
    </>
  );
};
const FinancialOrder = () => {
  const { t } = useTranslation(["financial"]);

  const [tableLoading, setTableLoading] = useState(false);
  // 表单数据
  const [formData, setFormData] = useState<FinancialOrderListParams>({
    type: FinancialType.FIXED,
    coinId: null,
    operationType: null,
    startTime: null,
    endTime: null,
  });
  // 表格数据
  const [tableData, setTableData] = useState<FinancialOrderItem[]>([]);
  // 币种列表
  const [coinList, setCoinList] = useState<{ coinName: string; id: string }[]>(
    []
  );

  // 切换tabs
  const items = [
    {
      key: String(FinancialType.FIXED),
      label: t("common.fixed"),
      children: (
        <TabsItem
          type={FinancialType.FIXED}
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
      label: t("common.current"),
      children: (
        <TabsItem
          type={FinancialType.CURRENT}
          tableData={tableData}
          coinList={coinList}
          tableLoading={tableLoading}
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
  ];

  // 获取数据
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

  // 获取币种列表
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

  // 获取币种列表
  useEffect(() => {
    fetchCoinList();
  }, []);

  // 获取数据
  useEffect(() => {
    fetchData(formData);
  }, [formData]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "transparent", // 表头背景色
            headerColor: "var(--text-color6)", // 表头文本颜色
            headerSplitColor: "transparent", // 表头分割线颜色
            rowExpandedBg: "var(--background10)", // 表格行展开背景色
            borderColor: "transparent", // 表格边框颜色
            headerBorderRadius: 0, // 表头圆角
            // 悬停背景色
            rowHoverBg: "var(--bgc-color)",
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
      <div className="min-h-[100%]">
        <div className="mb-[16px] text-[var(--text-color5)] font-[500] text-[20px]">
          {t("common.financialOrder")}
        </div>
        <div className="bg-[var(--btncolor7)] rounded-[10px] min-h-[calc(100%-30px-16px)]">
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
        "financial",
      ])),
    },
  };
};
