import { Collapse, ConfigProvider } from "antd";

const textStyle = {
  fontSize: "16px",
  fontWeight: "500",
  color: "var(--text-color5)",
  borderBottom: "1px solid var(--border-color4)",
  borderRadius: "0",
};

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
const items = [
  {
    key: "1",
    label: "如何使用理财功能？",
    children: <p>{text}</p>,
    style: textStyle,
  },
  {
    key: "2",
    label: "如何使用理财功能？",
    children: <p>{text}</p>,
    style: textStyle,
  },
  {
    key: "3",
    label: "如何使用理财功能？",
    children: <p>{text}</p>,
    style: textStyle,
  },
];

const Problem = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            /* 这里是你的组件 token */
            headerPadding: "20px 0",
          },
        },
      }}
    >
      <div className="p-[30px_120px]">
        <div className="text-[32px] font-w-500 mb-[40px] text-[var(--text-color5)]">
          常见问题
        </div>

        <div className="m-[5px_20px]">
          <Collapse
            expandIconPosition="end"
            defaultActiveKey={["1"]}
            ghost
            items={items}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Problem;
