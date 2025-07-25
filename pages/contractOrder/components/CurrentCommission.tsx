import { Select } from "antd";

// 当前委托
const CurrentCommission = () => {
  return <div>
    {/* 筛选 */}
    <div>
      <Select
        options={[]}
        placeholder="请选择"
        style={{ width: "200px" ,height: "50px"}}
      />
    </div>
  </div>;
};

export default CurrentCommission;