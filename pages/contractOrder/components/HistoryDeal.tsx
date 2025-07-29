import { Select, Table, DatePicker, Form, Flex } from "antd";
import styles from "../../../styles/components/Financial.module.css";
import dayjs from "dayjs";
import { Iconify } from "@/components/icon";
import { useTranslation } from "react-i18next";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { NoData } from "@/components/noData";
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
// 历史成交
const HistoryDeal = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

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
    // 方向
    {
      title: "方向",
      dataIndex: "direction",
      key: "direction",
      align: "right",
      render: (_: any, record: any) => {
        const direction = record.direction as DirectionEnum;
        return (
          <div className="text-[14px] font-[500]" style={{ color: directionMap[direction].color }}>
            {directionMap[direction].text}
          </div>
        );
      },
    },
    // 角色
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.role}
          </div>
        );
      },
    },
    // 成交数量
    {
      title: "成交数量",
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
    // 成交价格
    {
      title: "成交价格",
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
    // 手续费
    {
      title: "手续费",
      dataIndex: "fee",
      key: "fee",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.fee}
          </div>
        );
      },
    },
    // 时间
    {
      title: "时间",
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
  ];

  const fetchData = async () => {
    setTimeout(() => {
      setDataSource([
        {
          name: "BTCUSDT",
          direction: 1,
          role: "买",
          price: "10000",
          number: "100",
          fee: "10000",
          time: "2021-01-01 12:00:00",
        },
        {
          name: "BTCUSDT",
          direction: 2,
          role: "买",
          price: "10000",
          number: "100",
          fee: "10000",
          time: "2021-01-01 12:00:00",
        },
      ]);
    }, 1000);
  };

  // 获取列表
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* 筛选 */}
      <Form
        form={form}
        className="p-[24px_20px]  border-t-[1px] border-t-[var(--border-color)] h-[100%]"
      >
        <Flex gap={20}>
          {/* 全部合约 */}
          <Form.Item name="contractId" noStyle>
            <Select
              allowClear
              value={
                !form.getFieldValue("contractId")
                  ? NULL_PLACEHOLDER
                  : form.getFieldValue("contractId")
              }
              prefix={"全部合约"}
              className="w-[200px] h-[50px]"
              style={{ textAlign: "end" }}
              options={[
                {
                  label: t("common.all"),
                  value: NULL_PLACEHOLDER,
                },
              ]}
              onChange={(value) =>
                form.setFieldsValue({
                  contractId: value === NULL_PLACEHOLDER ? null : Number(value),
                })
              }
            />
          </Form.Item>

          {/* 开始时间-结束时间 */}
          <Form.Item name="time" noStyle>
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
              value={form.getFieldValue("time")}
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

export default HistoryDeal;
