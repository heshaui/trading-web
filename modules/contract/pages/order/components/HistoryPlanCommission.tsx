import { Select, Table, DatePicker, Form, Flex, message } from "antd";
import styles from "@/styles/components/Table.module.css";
import { useTranslation } from "react-i18next";
import { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import { NoData } from "@/components/noData";
import dayjs from "dayjs";
import { Iconify } from "@/components/icon";
import { getHistoryPlanOrderList } from "@/services/contract";
import { useWatch } from "antd/es/form/Form";
const { RangePicker } = DatePicker;

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null

enum DirectionEnum {
  Pinduo = 1,
  Kongduo = 2,
  Pingkong = 3,
}
const directionMap: Record<DirectionEnum, { text: string; color: string }> = {
  [DirectionEnum.Pinduo]: {
    text: "平多",
    color: "#FF4D4F",
  },
  [DirectionEnum.Kongduo]: {
    text: "开空",
    color: "#FF4D4F",
  },
  [DirectionEnum.Pingkong]: {
    text: "开多",
    color: "#00C788",
  },
};
// 历史计划委托
const HistoryPlanCommission = ({ activeKey }: { activeKey: string }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const contractId = useWatch("contractId", form);
  const time = useWatch("time", form);

  const [dataSource, setDataSource] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  // 列表项
  const columns: ColumnsType<any> = [
    // 合约
    {
      title: "合约",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.name}
          </div>
        );
      },
    },
    // 类型
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.type}
          </div>
        );
      },
    },
    // 方向
    {
      title: "方向",
      dataIndex: "direction",
      key: "direction",
      align: "right",
      render: (_: any, record: any) => {
        const direction = record.direction as DirectionEnum;
        return (
          <div
            className="text-[14px] font-[500]"
            style={{ color: directionMap[direction].color }}
          >
            {directionMap[direction].text}
          </div>
        );
      },
    },
    // 触发价
    {
      title: "触发价",
      dataIndex: "triggerPrice",
      key: "triggerPrice",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.triggerPrice}
          </div>
        );
      },
    },
    // 委托价格
    {
      title: "委托价格",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.price}
          </div>
        );
      },
    },
    // 委托数量
    {
      title: "委托数量",
      dataIndex: "number",
      key: "number",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.number}
          </div>
        );
      },
    },
    // 只减仓
    {
      title: "只减仓",
      dataIndex: "only",
      key: "only",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.only}
          </div>
        );
      },
    },
    // 状态
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.status}
          </div>
        );
      },
    },
    // 提交委托时间
    {
      title: "提交委托时间",
      dataIndex: "time",
      key: "time",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.time}
          </div>
        );
      },
    },
    // 操作
    {
      title: "触发时间",
      dataIndex: "triggerTime",
      key: "triggerTime",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.triggerTime}
          </div>
        );
      },
    },
  ];

  // 获取列表
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

      const res = await getHistoryPlanOrderList({
        limit: 10,
        page: 1,
        uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        contractId: paramsContractId,
        beginTime: paramsTime[0].valueOf(),
        endTime: paramsTime[1].valueOf(),
      });
      if (res.code === 0) {
        setDataSource(res.data.list);
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setTableLoading(false);
    }
  }, [contractId, time]);

  useEffect(() => {
    if (activeKey === "4") {
      fetchData();
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
          <Form.Item name="contractId" noStyle initialValue={NULL_PLACEHOLDER}>
            <Select
              allowClear
              value={
                !contractId
                  ? NULL_PLACEHOLDER
                  : contractId
              }
              prefix={"合约"}
              className="w-[200px] h-[50px]"
              style={{ textAlign: "end" }}
              options={[
                {
                  label: "全部",
                  value: NULL_PLACEHOLDER,
                },
                {
                  label: "测试",
                  value: 1,
                },
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
              placeholder={["开始时间", "结束时间"]}
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
        dataSource={dataSource}
        loading={tableLoading}
        locale={{ emptyText: <NoData height="45vh" /> }}
      />
    </div>
  );
};

export default HistoryPlanCommission;
