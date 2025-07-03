import { NoData } from "@/components/noData";
import { ConfigProvider, DatePicker, Select, Table } from "antd";
import { useEffect, useState } from "react";
const { RangePicker } = DatePicker;
import styles from "../../../styles/components/Financial.module.css";
import { getCoinAll } from "@/services/assets";
import { ColumnsType } from "antd/es/table";
import { getFinancialBillDetails } from "@/services/financial";

const Financial = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);

  // 表单数据
  const [formData, setFormData] = useState<any>({
    coinId: null,
    productType: null,
    operationType: null,
    startTime: null,
    endTime: null,
  });

  // 币种列表
  const [coinList, setCoinList] = useState<{ coinName: string; id: string }[]>(
    []
  );

  const columns: ColumnsType<any> = [
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
          <div className="text-[var(--text-color5)] font-[500] text-[14px]">
            <div>100 BTC</div>
            <div>≈￥700.23</div>
          </div>
        );
      },
    },
  ];
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

  const fetchData = async (params: any) => {
    try {
      setTableLoading(true);
      const response = await getFinancialBillDetails(params);
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
          options={[
            { label: "全部", value: "all" },
            { label: "活期", value: "活期" },
            { label: "定期", value: "定期" },
          ]}
          onChange={(value) => setFormData({ ...formData, productType: value })}
        />
        <Select
          prefix="操作类型"
          className="w-[200px] h-[50px]"
          style={{ textAlign: "end" }}
          options={[
            { label: "全部", value: "all" },
            { label: "赎回", value: "赎回" },
            { label: "申购", value: "申购" },
            { label: "利息", value: "利息" },
          ]}
          onChange={(value) =>
            setFormData({ ...formData, operationType: value })
          }
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
      </div>
      <Table
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
