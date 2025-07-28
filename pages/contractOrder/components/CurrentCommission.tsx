import { Select, Table } from "antd";
import styles from "../../../styles/components/Financial.module.css";

const dataSource = [
  {
    name: "合约名称",
    key: "name",
  },
];
// 当前委托
const CurrentCommission = () => {
  const columns = [
    //合约
    {
      title: "合约",
      dataIndex: "name",
      key: "name",
    },
    //时间
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
    },
    //订单类型
    {
      title: "订单类型",
      dataIndex: "type",
      key: "type",
    },
    //方向
    {
      title: "方向",
      dataIndex: "direction",
      key: "direction",
    },
    //委托价格
    {
      title: "委托价格",
      dataIndex: "price",
      key: "price",
    },
    //委托数量
    {
      title: "委托数量",
      dataIndex: "number",
      key: "number",
    },
    //成交数量
    {
      title: "成交数量",
      dataIndex: "number",
      key: "number",
    },
    //成交均价
    {
      title: "成交均价",
      dataIndex: "price",
      key: "price",
    },
    //只减仓
    {
      title: "只减仓",
      dataIndex: "only",
      key: "only",
    },
    //止盈止损
    {
      title: "止盈止损",
      dataIndex: "stop",
      key: "stop",
    },
    //操作
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
        <Select
          options={[]}
          placeholder="请选择"
          style={{ width: "200px", height: "50px" }}
        />
      </div>
      <Table
        className={styles.table}
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
      />
    </div>
  );
};

export default CurrentCommission;
