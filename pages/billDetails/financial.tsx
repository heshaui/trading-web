import { NoData } from "@/components/noData";
import { ConfigProvider, DatePicker, message, Select, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
const { RangePicker } = DatePicker;
import styles from "@/styles/components/Table.module.css";
import { getCoinAll } from "@/services/assets";
import { ColumnsType } from "antd/es/table";
import {
  FinancialAccountBillDetailsItem,
  FinancialAccountBillDetailsStatusEnum,
  FinancialType,
  getFinancialAccountBillDetails,
} from "@/services/financial";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Iconify } from "@/components/icon";
import appStore from "@/store";
import { observer } from "mobx-react-lite";
import BigNumber from "bignumber.js";
import { getCoinRound } from "@/utils/getUseRate";
import { DatePickerTheme, SelectTheme, TableTheme, TokenTheme } from "@/theme/publicThemeConfig";
import { roundDown } from "@/utils";

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null

interface FormDataType {
  coinId: number | null;
  type: FinancialType | null;
  status: FinancialAccountBillDetailsStatusEnum | null;
  timer: [dayjs.Dayjs | null, dayjs.Dayjs | null];
}

const Financial = observer(({ activeKey }: { activeKey: number }) => {
  const { t } = useTranslation(["financial"]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const rateKey = appStore.getRateKey()?.replace(/\s+/g, ""); // 汇率key
  const rateData = appStore.getRateData();
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

  // 表单数据
  const [formData, setFormData] = useState<FormDataType>({
    coinId: null, //币种ID
    type: null, //1定期 2活期
    status: null, //1申购 2赎回 3利息
    timer: [dayjs().subtract(7, "day").startOf("day"), dayjs().endOf("day")],
  });

  // 币种列表
  const [coinList, setCoinList] = useState<{ coinName: string; id: string }[]>(
    []
  );

  // 表格列
  const columns: ColumnsType<FinancialAccountBillDetailsItem> = [
    // 日期
    {
      title: t("common.date"),
      dataIndex: "createTime",
      key: "createTime",
      width: "20%",
      render: (text: number) => {
        return text ? (
          <div className="text-[var(--text-color5)] font-[500] text-[14px]">
            {dayjs(text).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        ) : (
          "--"
        );
      },
    },

    // 币种
    {
      title: t("common.token"),
      dataIndex: "coinName",
      key: "coinName",
      width: "20%",
      render: (_: any, record: FinancialAccountBillDetailsItem) => {
        return (
          <div className="text-[var(--text-color5)] font-[500] text-[14px]">
            {record.coinName}
          </div>
        );
      },
    },

    // 类型
    {
      title: t("common.type"),
      dataIndex: "type",
      key: "type",
      width: "20%",
      render: (_: any, record: FinancialAccountBillDetailsItem) => {
        return record.type === FinancialType.CURRENT ? (
          <div className="text-[var(--text-color5)] font-[500] text-[14px]">
            {t("common.current")}
          </div>
        ) : (
          <div className="text-[var(--text-color5)] font-[500] text-[14px]">
            {t("common.fixed")}
          </div>
        );
      },
    },

    // 操作类型
    {
      title: t("common.operationType"),
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (_: any, record: FinancialAccountBillDetailsItem) => {
        return (
          <div className="text-[var(--text-color5)] font-[500] text-[14px]">
            {record.status === FinancialAccountBillDetailsStatusEnum.PURCHASE &&
              t("common.subscribe")}
            {record.status === FinancialAccountBillDetailsStatusEnum.REDEEM &&
              t("common.redeem")}
            {record.status === FinancialAccountBillDetailsStatusEnum.INTEREST &&
              t("common.interest")}
          </div>
        );
      },
    },

    // 金额 申购赎回是理财币种 利息是结息币种
    {
      title: t("common.amount"),
      dataIndex: "amount",
      width: "20%",
      align: "right" as const,
      render: (_: any, record: FinancialAccountBillDetailsItem) => {
        return (
          <div className="text-[var(--text-color5)] font-[500] text-[14px]">
            <div>
              {record.status === FinancialAccountBillDetailsStatusEnum.INTEREST
                ? `${roundDown(record.endAmount, 8)} ${record.endCoinName}`
                : `${getCoinRound(record.coinName, record.amount)} ${
                    record.coinName
                  }`}
            </div>
            <div>
              ≈{" "}
              {
                // 有汇率的存在
                current.rate
                  ? // 有精度存在
                    current.accuracy
                    ? new BigNumber(record.usdtAmount)
                        .times(new BigNumber(current.rate))
                        .toFixed(Number(current.accuracy),BigNumber.ROUND_DOWN)
                    : new BigNumber(record.usdtAmount)
                        .times(new BigNumber(current.rate))
                        .toString()
                  : // 没有汇率的存在
                    record.usdtAmount
              }{" "}
              {current.shortName}
            </div>
          </div>
        );
      },
    },
  ];

  // 获取币种列表
  const fetchCoinList = useCallback(async () => {
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
        setCoinList([]);
        message.error(t("common.fail"));
      }
    } catch (error) {
      console.error("获取币种列表失败:", error);
    }
  }, [t]);

  // 获取数据
  const fetchData = useCallback(async (params: FormDataType) => {
    try {
      setTableLoading(true);
      setTableData([]);
      const data = {
        coinId: params.coinId,
        type: params.type,
        status: params.status,
        startTime: params.timer?.[0]?.valueOf(),
        endTime: params.timer?.[1]?.valueOf(),
      };
      const response = await getFinancialAccountBillDetails(data);
      if (response.code === "0") {
        setTableData(response.data);
      } else {
        setTableData([]);
        message.error(t("common.fail"));
      }
    } catch (error) {
      console.error("获取数据失败:", error);
      setTableData([]);
      message.error(t("common.fail"));
    } finally {
      setTableLoading(false);
    }
  }, [t]);

  // 获取币种列表
  useEffect(() => {
    fetchCoinList();
  }, [fetchCoinList]);

  // 获取数据
  useEffect(() => {
    if (activeKey === 2) {
      fetchData(formData);
    }
  }, [formData, fetchData, activeKey]);

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

  return (
    <ConfigProvider theme={{
      components: {
        Select: SelectTheme,
        Table: TableTheme,
        DatePicker: DatePickerTheme,
      },
      token: TokenTheme,
    }}>
      <div className="flex items-center gap-[20px] p-[30px_20px] border-t-[1px] border-t-[var(--border-color)]">
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
        <Select
          value={!formData.type ? NULL_PLACEHOLDER : formData.type}
          allowClear
          prefix={t("common.type")}
          className="w-[200px] h-[50px]"
          style={{ textAlign: "end" }}
          options={[
            { label: t("common.all"), value: NULL_PLACEHOLDER },
            { label: t("common.current"), value: FinancialType.CURRENT },
            { label: t("common.fixed"), value: FinancialType.FIXED },
          ]}
          onChange={(value) =>
            setFormData({
              ...formData,
              type: value === NULL_PLACEHOLDER ? null : Number(value),
            })
          }
        />
        <Select
          value={!formData.status ? NULL_PLACEHOLDER : formData.status}
          onChange={(value) =>
            setFormData({
              ...formData,
              status: value === NULL_PLACEHOLDER ? null : Number(value),
            })
          }
          allowClear
          prefix={t("common.operationType")}
          className="w-[200px] h-[50px]"
          style={{ textAlign: "end" }}
          options={[
            { label: t("common.all"), value: NULL_PLACEHOLDER },
            {
              label: t("common.redeem"),
              value: FinancialAccountBillDetailsStatusEnum.REDEEM,
            },
            {
              label: t("common.subscribe"),
              value: FinancialAccountBillDetailsStatusEnum.PURCHASE,
            },
            {
              label: t("common.interest"),
              value: FinancialAccountBillDetailsStatusEnum.INTEREST,
            },
          ]}
        />
        <RangePicker
          allowClear
          format="YYYY-MM-DD"
          className="w-[278px] h-[50px]"
          onChange={(value) => {
            console.log("value", value);
            if (!value) {
              return setFormData({
                ...formData,
                timer: [null, null],
              });
            }
            setFormData({
              ...formData,
              timer: [
                dayjs(value?.[0]).startOf("day"),
                dayjs(value?.[1]).endOf("day"),
              ],
            });
          }}
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
          placeholder={[t("common.startTime"), t("common.endTime")]}
          suffixIcon={
            <Iconify
              icon="cuida:calendar-outline"
              className={`${styles.title_color}`}
              size={20}
            />
          }
        />
      </div>
      <Table
        rowKey="id"
        className={styles.table}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        loading={tableLoading}
        locale={{ emptyText: <NoData height="45vh" /> }}
        showSorterTooltip={false}
      />
    </ConfigProvider>
  );
});

export default Financial;
