import { DatePicker, Select, Table } from "antd";
import styles from "../../../styles/components/Financial.module.css";
const { RangePicker } = DatePicker;

const dataSource = [
  {
    name: "BTCUSDT",
    orderType: "限价",
    direction: "买",
    price: "10000",
    number: "100",
    number2: "100",
    price2: "10000",
    fee: "10000",
    only: "是",
    stop: "是",
    status: "已撤单",
  },
  {
    name: "BTCUSDT",
    orderType: "限价",
    direction: "买",
    price: "10000",
    number: "100",
    number2: "100",
    price2: "10000",
    fee: "10000",
    only: "是",
    stop: "是",
    status: "已撤单",
  },
];
// 历史委托
const HistoryCommission = () => {
  const columns = [
    // 合约
    {
      title: "合约",
      dataIndex: "name",
      key: "name",
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
    // 成交数量
    {
      title: "成交数量",
      dataIndex: "number2",
      key: "number2",
    },
    // 成交均价
    {
      title: "成交均价",
      dataIndex: "price2",
      key: "price2",
    },
    // 手续费
    {
      title: "手续费",
      dataIndex: "fee",
      key: "fee",
    },
    // 只减仓
    {
      title: "只减仓",
      dataIndex: "only",
      key: "only",
    },
    // 止盈止损
    {
      title: "止盈止损",
      dataIndex: "stop",
      key: "stop",
    },
    // 状态
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
    },
    // 操作
    {
      title: "全撤",
      dataIndex: "operation",
      key: "operation",
      render: (_: any, record: any) => {
        return (
          <div className="text-[var(--theme-color)] cursor-pointer">
            {record.status === "已撤单" ? "全撤" : "撤单"}
          </div>
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

export default HistoryCommission;
