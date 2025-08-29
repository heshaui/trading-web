import { Select, Table, DatePicker, Form, Flex, message } from "antd";
import styles from "@/styles/components/Table.module.css";
import dayjs from "dayjs";
import { Iconify } from "@/components/icon";
import { useTranslation } from "react-i18next";
import { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import { NoData } from "@/components/noData";
import { getHistoryTradeList } from "@/services/contract";
import { useWatch } from "antd/es/form/Form";
import appStore from "@/store";
import { SideEnum, SideMap } from "./type";
const { RangePicker } = DatePicker;

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null



interface HistoryDealCustoms {
  contractId: number; // 合约ID
  contractName: string; // 合约名称
  ctime: number; // 创建时间
  fee: number; // 手续费
  feeCoin: string; // 手续费币种
  feeCoinPrecision: number; // 手续费币种精度
  id: string; // 订单ID
  open: string; // 开仓方向
  price: number; // 成交价格
  pricePrecision: number; // 价格精度
  role: string; // 角色
  side: SideEnum; // 方向
  symbol: string; // 合约
  volume: number; // 成交数量
}





// 历史成交
const HistoryDeal = ({ activeKey }: { activeKey: string }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(["contract"]);

  const publicInfo = appStore.getPublicInfo();

  const contractId = useWatch("contractId", form);
  const time = useWatch("time", form);

  const [dataSource, setDataSource] = useState<{
    tradeHisList: HistoryDealCustoms[];
    count: number;
  }>({
    tradeHisList: [],
    count: 0,
  });
  const [tableLoading, setTableLoading] = useState(false);

  const [pageParams, setPageParams] = useState({
    page: 1,
    limit: 10,
  });

  // 列表项
  const columns: ColumnsType<HistoryDealCustoms> = [
    // 合约
    {
      title: t("symbol"),
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: HistoryDealCustoms) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.symbol}
          </div>
        );
      },
    },
    // 方向
    {
      title: t("side"),
      dataIndex: "side",
      key: "side",
      align: "right",
      render: (_: any, record: HistoryDealCustoms) => {
        return (
          <div
            className="text-[14px] font-[500]"
            style={{ color: SideMap[record.side].color }}
          >
            {t(SideMap[record.side].text)}
          </div>
        );
      },
    },
    // 角色
    {
      title: t("role"),
      dataIndex: "role",
      key: "role",
      align: "right",
      render: (_: any, record: HistoryDealCustoms) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.role}
          </div>
        );
      },
    },
    // 成交数量
    {
      title: t("filledAmount"),
      dataIndex: "volume",
      key: "volume",
      align: "right",
      render: (_: any, record: HistoryDealCustoms) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.volume}
          </div>
        );
      },
    },
    // 成交价格
    {
      title: t("filledPrice"),
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (_: any, record: HistoryDealCustoms) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.price}
          </div>
        );
      },
    },
    // 手续费
    {
      title: t("fee"),
      dataIndex: "fee",
      key: "fee",
      align: "right",
      render: (_: any, record: HistoryDealCustoms) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.fee}
          </div>
        );
      },
    },
    // 时间
    {
      title: t("time"),
      dataIndex: "time",
      key: "time",
      align: "right",
      render: (_: any, record: HistoryDealCustoms) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {dayjs(record.ctime).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        );
      },
    },
  ];

  const fetchData = useCallback(async () => {
    // 如果参数未定义则不执行请求
    if (contractId === undefined || time === undefined) {
      return;
    }
    // 如果参数为空字符串则设置为 NULL_PLACEHOLDER
    try {
      setTableLoading(true);
      const paramsContractId =
        contractId === NULL_PLACEHOLDER || !contractId ? "" : contractId;
      const paramsTime = time
        ? [dayjs(time[0]).startOf("day"), dayjs(time[1]).endOf("day")]
        : [dayjs().subtract(7, "day").startOf("day"), dayjs().endOf("day")];

      const res = await getHistoryTradeList({
        limit: pageParams.limit,
        page: pageParams.page,
        uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        contractId: paramsContractId,
        beginTime: paramsTime[0].valueOf(),
        endTime: paramsTime[1].valueOf(),
      });
      if (res.code === "0") {
        setDataSource({
          tradeHisList: res.data.tradeHisList,
          count: res.data.count,
        });
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setTableLoading(false);
    }
  }, [contractId, time, pageParams]);

  // 获取列表
  useEffect(() => {
    if (activeKey === "5") {
      fetchData();
    }
  }, [activeKey, fetchData]);

  return (
    <div>
      {/* 筛选 */}
      <Form
        form={form}
        className="p-[24px_20px]  border-t-[1px] border-t-[var(--border-color)] h-[100%]"
      >
        <Flex gap={20}>
          {/* 全部合约 */}
          <Form.Item
            name="contractId"
            noStyle
            // initialValue={NULL_PLACEHOLDER}
            initialValue={publicInfo.contractList[0].id}
          >
            <Select
              // allowClear
              value={
                !form.getFieldValue("contractId")
                  ? NULL_PLACEHOLDER
                  : form.getFieldValue("contractId")
              }
              prefix={t("symbol")}
              className="w-[200px] h-[50px]"
              style={{ textAlign: "end" }}
              options={[
                // {
                //   label: t("all"),
                //   value: NULL_PLACEHOLDER,
                // },
                ...publicInfo.contractList.map((item: any) => ({
                  label: item.contractName,
                  value: item.id,
                })),
              ]}
              onChange={(value) => {
                const newValue =
                  value === NULL_PLACEHOLDER || value === undefined
                    ? NULL_PLACEHOLDER
                    : value;
                form.setFieldsValue({
                  contractId: newValue,
                });
              }}
            />
          </Form.Item>

          {/* 开始时间-结束时间 */}
          <Form.Item
            name="time"
            noStyle
            initialValue={[
              dayjs().subtract(7, "day").startOf("day"),
              dayjs().endOf("day"),
            ]}
          >
            {/* 时间  默认显示七天 ,超过六个月不可点击*/}
            <RangePicker
              className="w-[278px] h-[50px]"
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                // 禁用6个月之前的日期和未来日期
                const sixMonthsAgo = dayjs()
                  .subtract(6, "month")
                  .startOf("day");
                const today = dayjs().endOf("day");
                return (
                  current &&
                  (current.isBefore(sixMonthsAgo) || current.isAfter(today))
                );
              }}
              value={time}
              suffixIcon={
                <Iconify
                  icon="cuida:calendar-outline"
                  className={`${styles.title_color}`}
                  size={20}
                />
              }
              placeholder={[t("startTime"), t("endTime")]}
              onChange={(value) => {
                if (!value) {
                  form.setFieldsValue({
                    time: [null, null],
                  });
                  return;
                }
                form.setFieldsValue({
                  time: [
                    dayjs(value[0]).startOf("day"),
                    dayjs(value[1]).endOf("day"),
                  ],
                });
              }}
            />
          </Form.Item>
        </Flex>
      </Form>

      {/* 表格 */}
      <Table
        scroll={{ x: "max-content" }}
        className={styles.table}
        rowKey="id"
        columns={columns}
        dataSource={dataSource.tradeHisList}
        loading={tableLoading}
        pagination={{
          pageSize: pageParams.limit,
          current: pageParams.page,
          total: dataSource.count,
          onChange: (page, pageSize) => {
            setPageParams({
              page,
              limit: pageSize,
            });
          },
        }}
        locale={{ emptyText: <NoData height="45vh" /> }}
      />
    </div>
  );
};

export default HistoryDeal;
