import { NoData } from "@/components/noData";
import { ConfigProvider, DatePicker, Select, Table } from "antd";
import { useEffect, useState } from "react";
const { RangePicker } = DatePicker;
import styles from "../../../styles/components/Financial.module.css";
import { getCoinAll } from "@/services/assets";
import { ColumnsType } from "antd/es/table";
import {
  FinancialAccountBillDetailsItem,
  FinancialAccountBillDetailsParams,
  FinancialAccountBillDetailsStatusEnum,
  FinancialType,
  getFinancialAccountBillDetails,
} from "@/services/financial";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null

const Financial = () => {
  const { t } = useTranslation(["financial"]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);

  // 表单数据
  const [formData, setFormData] = useState<FinancialAccountBillDetailsParams>({
    coinId: null, //币种ID
    type: null, //1定期 2活期
    status: null, //1申购 2赎回 3利息
    startTime: null, //开始时间
    endTime: null, //结束时间
  });

  // 币种列表
  const [coinList, setCoinList] = useState<{ coinName: string; id: string }[]>(
    []
  );

  // 表格列
  const columns: ColumnsType<FinancialAccountBillDetailsItem> = [
    {
      title: t("common.date"),
      dataIndex: "createTime",
      key: "createTime",
      render: (text: number) => {
        return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
      },
    },
    {
      title: t("common.token"),
      dataIndex: "coinName",
      key: "coinName",
    },
    {
      title: t("common.type"),
      dataIndex: "type",
      key: "type",
      render: (_: any, record: FinancialAccountBillDetailsItem) => {
        return record.type === FinancialType.CURRENT
          ? t("common.current")
          : t("common.fixed");
      },
    },
    {
      title: t("common.operationType"),
      dataIndex: "status",
      key: "status",
      render: (_: any, record: FinancialAccountBillDetailsItem) => {
        return (
          <div>
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
    {
      title: t("common.amount"),
      dataIndex: "amount",
      width: 200,
      align: "right" as const,
      render: (_: any, record: FinancialAccountBillDetailsItem) => {
        return (
          <div className="text-[var(--text-color5)] font-[500] text-[14px]">
            <div>
              {record.amount} {record.coinName}
            </div>
            <div>≈ {record.usdtAmount || 0} USDT</div>
          </div>
        );
      },
    },
  ];

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

  // 获取数据
  const fetchData = async (params: any) => {
    try {
      setTableLoading(true);
      const response = await getFinancialAccountBillDetails(params);
      if (response.code === "0") {
        setTableData(response.data);
      } else {
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setTableLoading(false);
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
          className="w-[278px] h-[50px]"
          onChange={(value) => {
            console.log("value", value);
            if (!value) {
              return setFormData({
                ...formData,
                startTime: null,
                endTime: null,
              });
            }
            setFormData({
              ...formData,
              startTime: dayjs(value?.[0]).startOf("day").valueOf(),
              endTime: dayjs(value?.[1]).endOf("day").valueOf(),
            });
          }}
        />
      </div>
      <Table
        rowKey="id"
        className={styles.table}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        loading={tableLoading}
        locale={{ emptyText: <NoData /> }}
        showSorterTooltip={false}
      />
    </ConfigProvider>
  );
};

export default Financial;
