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
// 历史成交
const HistoryDeal = () => {
  const columns = [
    // 合约
    {
      title: "合约",
      dataIndex: "name",
      key: "name",
    },
    // 方向
    {
      title: "方向",
      dataIndex: "direction",
      key: "direction",
    },
    // 角色
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
    },
    // 成交数量
    {
      title: "成交数量",
      dataIndex: "number",
      key: "number",
    },
    // 成交价格
    {
      title: "成交价格",
      dataIndex: "price",
      key: "price",
    },
    // 手续费
    {
      title: "手续费",
      dataIndex: "fee",
      key: "fee",
    },
    // 时间
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
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

export default HistoryDeal;
