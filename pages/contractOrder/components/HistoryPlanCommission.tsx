import { Select, Table, DatePicker } from "antd";
import styles from "../../../styles/components/Financial.module.css";
const { RangePicker } = DatePicker;

const dataSource = [
  {
    name: "BTCUSDT",
    time: "2021-01-01 12:00:00",
    type: "限价",
    direction: "买",
    price: "10000",
    number: "100",
    orderType: "限价",
    triggerPrice: "10000",
    only: "是",
    expirationTime: "2021-01-01 12:00:00",
    operation: "撤单",
  },
  {
    name: "BTCUSDT",
    time: "2021-01-01 12:00:00",
    type: "限价",
    direction: "买",
    price: "10000",
    number: "100",
    orderType: "限价",
    triggerPrice: "10000",
    only: "是",
    expirationTime: "2021-01-01 12:00:00",
    operation: "撤单",
  },          
];
// 历史计划委托
const HistoryPlanCommission = () => {
  const columns = [
    // 合约
    {
      title: "合约",
      dataIndex: "name",
      key: "name",
    },
    // 类型  
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
    },
    // 时间
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
    },
    // 订单类型
    {
      title: "订单类型",
      dataIndex: "orderType",
      key: "orderType",
    },
    // 方向
    {
      title: "方向",
      dataIndex: "direction",
      key: "direction",
    },
    // 触发价
    {
      title: "触发价",
      dataIndex: "triggerPrice",
      key: "triggerPrice",
    },
    // 委托价格
    {
      title: "委托价格",
      dataIndex: "price",
      key: "price",
    },
    // 委托数量
    {
      title: "委托数量",
      dataIndex: "number",
      key: "number",
    },
    // 只减仓
    {
      title: "只减仓",
      dataIndex: "only",
      key: "only",
    },
    // 过期时间
    {
      title: "过期时间",
      dataIndex: "expirationTime",
      key: "expirationTime",
    },
    // 操作
    {
      title: "全撤",
      dataIndex: "operation",
      key: "operation",
      render: (text: string) => {
        return (
          <div className="text-[var(--theme-color)] cursor-pointer">{text}</div>
        );
      },
    },
  ];
  return (
    <div>
      {/* 筛选 */}
      <div className="p-[24px_20px]  border-t-[1px] border-t-[var(--border-color)] h-[100%] flex gap-[20px]">
        <Select
          options={[]}
          placeholder="请选择"
          style={{ width: "200px", height: "50px" }}
        />
        {/* 时间选择器 开始时间-结束时间 */}
        <RangePicker
          placeholder={["开始时间", "结束时间"]}
          style={{ width: "278px", height: "50px" }}
          picker="date"
          format="YYYY-MM-DD"
          allowClear={false}
        />
      </div>
      <Table
        scroll={{ x: "max-content" }}
        className={styles.table}
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
      />
    </div>
  );
};

export default HistoryPlanCommission;
