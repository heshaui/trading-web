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
} from "antd";
import NoData from "@/components/noData/noData";
import { useEffect, useState } from "react";
import styles from "../../styles/components/Financial.module.css";
import {
  FinancialOrderItem,
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
import appStore from "@/store";
import { observer } from "mobx-react-lite";
import { getCoinRound } from "@/utils/getUseRate";
import BigNumber from "bignumber.js";
import { financialThemeConfig } from "@/theme/financialThemeConfig";

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null

const resultStatusMap: Record<FinancialOrderStatusEnum, { text: string }> = {
  [FinancialOrderStatusEnum.SUCCESS]: {
    text: "common.success",
  },
  [FinancialOrderStatusEnum.FAIL]: {
    text: "common.fail",
  },
};

interface FormDataType {
  type: FinancialType;
  coinId: number | null;
  operationType: string | null;
  timer: [dayjs.Dayjs | null, dayjs.Dayjs | null];
}

interface TabsItemProps {
  current: {
    symbol: string;
    rate: number | undefined;
    shortName: string;
    accuracy: number | null;
  };
  type: FinancialType;
  tableData: FinancialOrderItem[];
  coinList: { coinName: string; id: string }[];
  tableLoading: boolean;
  setFormData: (data: FormDataType) => void;
  formData: FormDataType;
}
const TabsItem = ({
  current,
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
      width: type === FinancialType.FIXED ? 180 : "20%",
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
            <div className="text-[14px] text-[var(--text-color5)] font-[500]">
              {record.coinName}
            </div>
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
      width: type === FinancialType.FIXED ? 180 : "20%",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        );
      },
    },

    // 类型
    {
      title: t("common.type"),
      dataIndex: "status",
      key: "status",
      width: type === FinancialType.FIXED ? 180 : "20%",
      align: "center" as const,
      render: (_: any, record: any) => {
        return (
          <>
            {record.status == FinancialOrderTypeEnum.PURCHASE && (
              <div className="text-[14px] text-[var(--text-color5)] font-[500]">{t("common.subscribe")}</div>
            )}
            {record.status == FinancialOrderTypeEnum.REDEEM && (
              <div className="text-[14px] text-[var(--text-color5)] font-[500]">{t("common.redeem")}</div>
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
      width: type === FinancialType.FIXED ? 180 : "20%",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            <div>
              {getCoinRound(record.coinName, record.amount)} {record.coinName}
            </div>
            <div>
              ≈ {current.symbol}{" "}
              {
                // 有汇率的存在
                current.rate
                  ? // 有精度存在
                    current.accuracy
                    ? new BigNumber(record.amount)
                        .times(new BigNumber(current.rate))
                        .toFixed(Number(current.accuracy))
                    : new BigNumber(record.amount)
                        .times(new BigNumber(current.rate))
                        .toString()
                  : // 没有汇率的存在
                    record.amount
              }
            </div>
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
              return (
                <div className="text-[14px] text-[var(--text-color5)] font-[500]">
                  {record.term ? record.term : "-"}
                </div>
              );
            },
          },
        ]
      : []),

    // 状态
    {
      title: t("common.status"),
      dataIndex: "resultStatus",
      key: "resultStatus",
      width: type === FinancialType.FIXED ? 180 : "20%",
      align: "right" as const,
      render: (_: any, record: FinancialOrderItem) => {
        const resultStatus = record.resultStatus;
        return resultStatus !== null && resultStatus !== undefined ? (
          <div className="text-[var(--text-color5)] font-[500] text-[14px]">
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
      <div className="p-[24px_20px]  border-t-[1px] border-t-[var(--border-color)] h-[100%]">
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

          {/* 时间  默认显示七天 ,超过六个月不可点击*/}
          <RangePicker
            className="w-[278px] h-[50px]"
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              // 禁用6个月之前的日期和未来日期
              const sixMonthsAgo = dayjs().subtract(6, "month").startOf("day");
              const today = dayjs().endOf("day");
              return (
                current &&
                (current.isBefore(sixMonthsAgo) || current.isAfter(today))
              );
            }}
            value={formData.timer}
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
                  timer: [null, null],
                });
              }
              setFormData({
                ...formData,
                timer: [dayjs(value[0]).startOf("day"), dayjs(value[1]).endOf("day")],
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
        locale={{ emptyText: <NoData height="45vh" /> }}
      />
    </>
  );
};
const FinancialOrder = observer(() => {
  const { t } = useTranslation(["financial"]);
  const rateKey = appStore.getRateKey()?.replace(/\s+/g, ""); // 汇率key
  const [current, setCurrent] = useState<{
    accuracy: number | null;
    symbol: string;
    rate: number | undefined;
    shortName: string;
  }>({
    accuracy: null, // 精度
    rate: undefined, // 汇率
    symbol: "", // 币种符号
    shortName: "", // 币种名称
  });
  const rateData = appStore.getRateData();

  const [tableLoading, setTableLoading] = useState(false);
  // 表单数据
  const [formData, setFormData] = useState<FormDataType>({
    type: FinancialType.CURRENT,
    coinId: null,
    operationType: null,
    // 默认显示七天 七天前 00:00:00到 今天的当前时间
    timer: [dayjs().subtract(7, "day").startOf("day"), dayjs().endOf("day")],
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
      key: String(FinancialType.CURRENT),
      label: t("common.current"),
      children: (
        <TabsItem
          current={current}
          type={FinancialType.CURRENT}
          tableData={tableData}
          coinList={coinList}
          tableLoading={tableLoading}
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
    {
      key: String(FinancialType.FIXED),
      label: t("common.fixed"),
      children: (
        <TabsItem
          current={current}
          type={FinancialType.FIXED}
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
  const fetchData = async (params: FormDataType) => {
    try {
      setTableLoading(true);
      const data = {
        coinId: params.coinId,
        type: params.type,
        operationType: params.operationType,
        startTime: params.timer?.[0]?.valueOf(),
        endTime: params.timer?.[1]?.valueOf(),
      };

      const res = await getFinancialOrderList(data);
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

  // 获取汇率
  useEffect(() => {
    const currentInfo = rateData.find(
      (item: any) => item.shortName === rateKey
    );
    if (currentInfo) {
      setCurrent({
        accuracy: currentInfo?.accuracy,
        shortName: currentInfo?.shortName,
        symbol: currentInfo?.symbol,
        rate: currentInfo?.exchangeRate,
      });
    } else {
      setCurrent({
        accuracy: null,
        shortName: "USD",
        symbol: "$",
        rate: 1,
      });
    }
  }, [rateKey, rateData]);

  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染

  return (
    <ConfigProvider theme={financialThemeConfig}>
      <div className="flex flex-col h-full">
        <div className="mb-[16px] text-[var(--text-color5)] font-[500] text-[20px]">
          {t("common.financialOrder")}
        </div>
        <div className="bg-[var(--btncolor7)] rounded-[10px] flex-1">
          <Tabs
            className={styles.tabs}
            tabBarStyle={{ padding: "0 20px", height: "72px" }}
            items={items}
            onChange={(key) =>
              setFormData({
                type: Number(key),
                coinId: null,
                operationType: null,
                timer: [dayjs().subtract(7, "day").startOf("day"), dayjs().endOf("day")],
              })
            }
          />
        </div>
      </div>
    </ConfigProvider>
  );
});

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
