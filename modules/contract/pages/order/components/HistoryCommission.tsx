import { DatePicker, Flex, Form, message, Select, Table } from "antd";
import styles from "@/styles/components/Table.module.css";
import { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import { NoData } from "@/components/noData";
import { useTranslation } from "react-i18next";
import { Iconify } from "@/components/icon";
import dayjs from "dayjs";
import { getHistoryOrderList } from "@/services/contract";
import { useWatch } from "antd/es/form/Form";
import appStore from "@/store";
import { SideEnum, SideMap, Status, StatusMap, Type, TypeMap } from "./type";
const { RangePicker } = DatePicker;

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null




interface HistoryCommissionColumns {
  symbol: string; // 合约
  pricePrecision: number; // 价格精度
  side: SideEnum; // 方向
  positionType: number; // 仓位类型
  avgPrice: number; // 平均成交价
  tradeFee: number; // 交易手续费
  realizedAmount: number; // 已实现盈亏
  type: Type; // 订单类型
  mtime: number; // 时间
  volume: number; // 委托数量
  dealVolume: number; // 成交数量
  price: number; // 委托价格
  contractId: number; // 合约ID
  ctime: number; // 创建时间
  contractName: string; // 合约名称
  id: string; // 订单ID
  open: string; // 开仓方向
  status: Status; // 状态
}
// 历史委托
const HistoryCommission = ({ activeKey }: { activeKey: string }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(["contract"]);

  const publicInfo = appStore.getPublicInfo();

  const contractId = useWatch("contractId", form);
  const type = useWatch("type", form);
  const time = useWatch("time", form);

  const [dataSource, setDataSource] = useState<{
    orderList: HistoryCommissionColumns[];
    count: number;
  }>({
    orderList: [],
    count: 0,
  });
  const [tableLoading, setTableLoading] = useState(false);

  // 当前页 每页多少条
  const [pageParams, setPageParams] = useState({
    page: 1,
    limit: 10,
  });

  // 获取列表
  const fetchData = useCallback(
    async (page: number, pageSize: number) => {
      // 如果参数未定义则不执行请求
      if (
        contractId === undefined ||
        type === undefined ||
        time === undefined
      ) {
        return;
      }
      // 如果参数为空字符串则设置为 NULL_PLACEHOLDER
      try {
        setTableLoading(true);
        const paramsContractId =
          contractId === NULL_PLACEHOLDER || !contractId ? "" : contractId;

        const paramsType = type === NULL_PLACEHOLDER || !type ? "" : type;

        const paramsTime = time
          ? [dayjs(time[0]).startOf("day"), dayjs(time[1]).endOf("day")]
          : [dayjs().subtract(7, "day").startOf("day"), dayjs().endOf("day")];

        const res = await getHistoryOrderList({
          limit: pageParams.limit,
          page: pageParams.page,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          type: paramsType,
          contractId: paramsContractId,
          beginTime: paramsTime[0].valueOf(),
          endTime: paramsTime[1].valueOf(),
        });
        if (res.code === "0") {
          setDataSource({
            orderList: res.data.orderList,
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
    },
    [contractId, type, time, pageParams]
  );

  // 列表项
  const columns: ColumnsType<HistoryCommissionColumns> = [
    // 合约
    {
      title: t("symbol"),
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: HistoryCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.symbol}
          </div>
        );
      },
    },
    // 订单类型
    {
      title: t("orderType"),
      dataIndex: "type",
      key: "type",
      align: "right",
      render: (_: any, record: HistoryCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {t(TypeMap[record.type])}
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
      render: (_: any, record: HistoryCommissionColumns) => {
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
    // 委托价格
    {
      title: t("orderPrice"),
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (_: any, record: HistoryCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.price}
          </div>
        );
      },
    },
    // 委托数量
    {
      title: t("orderAmount"),
      dataIndex: "volume",
      key: "volume",
      align: "right",
      render: (_: any, record: HistoryCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.volume}
          </div>
        );
      },
    },
    // 成交数量
    {
      title: t("filledAmount"),
      dataIndex: "dealVolume",
      key: "dealVolume",
      align: "right",
      render: (_: any, record: HistoryCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.dealVolume}
          </div>
        );
      },
    },
    // 成交均价
    {
      title: t("avgPrice"),
      dataIndex: "avgPrice",
      key: "avgPrice",
      align: "right",
      render: (_: any, record: HistoryCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.avgPrice}
          </div>
        );
      },
    },
    // 手续费
    {
      title: t("fee"),
      dataIndex: "tradeFee",
      key: "tradeFee",
      align: "right",
      render: (_: any, record: HistoryCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.tradeFee}
          </div>
        );
      },
    },
    // 只减仓
    // {
    //   title: t("reduceOnly"),
    //   dataIndex: "reduceOnly",
    //   key: "reduceOnly",
    //   align: "right",
    //   render: (_: any, record: HistoryCommissionColumns) => {
    //     return (
    //       <div className="text-[14px] text-[var(--text-color5)] font-[500]">
    //         {record.reduceOnly}
    //       </div>
    //     );
    //   },
    // },
    // 止盈止损
    // {
    //   title: t("tpsl"),
    //   dataIndex: "stopLoss",
    //   key: "stopLoss",
    //   align: "right",
    //   render: (_: any, record: HistoryCommissionColumns) => {
    //     return (
    //       <div className="text-[14px] text-[var(--text-color5)] font-[500]">
    //         {record.stopLoss}
    //       </div>
    //     );
    //   },
    // },
    // 状态
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
      align: "right",
      render: (_: any, record: HistoryCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {t(StatusMap[record.status])}
          </div>
        );
      },
    },
    // 时间
    {
      title: t("time"),
      dataIndex: "mtime",
      key: "mtime",
      align: "right",
      render: (_: any, record: HistoryCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {dayjs(record.mtime).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (activeKey === "3") {
      fetchData(pageParams.page, pageParams.limit);
    }
  }, [activeKey, fetchData]);

  // 返回
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
              value={!contractId ? NULL_PLACEHOLDER : contractId}
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

          {/* 全部类型 */}
          <Form.Item name="type" noStyle initialValue={NULL_PLACEHOLDER}>
            <Select
              allowClear
              value={!type ? NULL_PLACEHOLDER : type}
              prefix={t("type")}
              className="w-[200px] h-[50px]"
              style={{ textAlign: "end" }}
              options={[
                //全部
                {
                  label: t("all"),
                  value: NULL_PLACEHOLDER,
                },
                // 限价单
                {
                  label: t("order.common.limit"),
                  value: Type.LIMIT,
                },
                // 市价单
                {
                  label: t("order.common.market"),
                  value: Type.MARKET,
                },
                // // PostOnly
                // {
                //   label: "PostOnly",
                //   value: Type.POST_ONLY,
                // },
                // 强制减仓
                // {
                //   label: t("order.common.forceLiquidation"),
                //   value: Type.FORCE_LIQUIDATION,
                // },
                // 仓位合并
                // {
                //   label: t("order.common.positionMerge"),
                //   value: Type.POSITION_MERGE,
                // },
              ]}
              onChange={(value) => {
                const newValue =
                  value === NULL_PLACEHOLDER || value === undefined
                    ? NULL_PLACEHOLDER
                    : value;
                form.setFieldsValue({
                  type: newValue,
                });
              }}
            />
            {/* 全部类型 */}
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
        dataSource={dataSource.orderList}
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
        locale={{
          emptyText: <NoData height="45vh" />,
        }}
      />
    </div>
  );
};

export default HistoryCommission;
