import {
  Button,
  Checkbox,
  ConfigProvider,
  Flex,
  Form,
  InputNumber,
  Modal,
  Slider,
  Tabs,
} from "antd";
import {
  ButtonTheme,
  modalStyle,
  ModalTheme,
  SliderTheme,
  TabsTheme,
  TokenTheme,
} from "@/theme/publicThemeConfig";

const StopModal = ({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) => {
  const { styles } = modalStyle();

  const items = [
    {
      label: "市价",
      key: "market",
      children: (
        <div>
          {/* 表单 */}
          <Form>
            <Flex vertical gap={10}>
              {/* 止盈触发价 */}
              <Form.Item name="profitTriggerPrice" noStyle>
                <InputNumber
                  placeholder="请输入止盈触发价"
                  className="w-[100%] h-[50px] leading-[50px]"
                  suffix="USDT"
                />
              </Form.Item>
              {/* 止盈触发价 */}
              <Form.Item name="lossTriggerPrice" noStyle>
                <InputNumber
                  placeholder="请输入止损触发价"
                  className="w-[100%] h-[50px] leading-[50px]"
                  suffix="USDT"
                />
              </Form.Item>
              {/* 委托数量 */}
              <Form.Item name="size" noStyle>
                <InputNumber
                  placeholder="请输入委托数量"
                  className="w-[100%] h-[50px] leading-[50px]"
                  suffix="USDT"
                />
              </Form.Item>
            </Flex>
          </Form>
          {/* 滑动条 */}
          <Slider
            min={0}
            max={100}
            step={1}
            className="w-[100%] !my-[16px]"
            marks={{
              0: " ",
              25: " ",
              50: " ",
              75: " ",
              100: " ",
            }}
          />
          {/* 可平仓位 */}
          <div className="text-[14px] font-[400] flex items-center gap-[10px]">
            <div className="text-[var(--text-color6)]">可平仓位:</div>
            <div className="text-[var(--text-color5)]">63.19 USDT</div>
          </div>
        </div>
      ),
    },
    {
      label: "限价",
      key: "limit",
      children: (
        <div>
          {/* 表单 */}
          <Form>
            <Flex vertical gap={10}>
              {/* 止盈触发价 */}
              <Form.Item name="profitTriggerPrice" noStyle>
                <InputNumber
                  placeholder="请输入止盈触发价"
                  className="w-[100%] h-[50px] leading-[50px]"
                  suffix="USDT"
                />
              </Form.Item>
              {/* 止盈触发价 */}
              <Form.Item name="lossTriggerPrice" noStyle>
                <InputNumber
                  placeholder="请输入止损触发价"
                  className="w-[100%] h-[50px] leading-[50px]"
                  suffix="USDT"
                />
              </Form.Item>
              {/* 止损触发价 */}
              <Form.Item name="lossTriggerPrice" noStyle>
                <InputNumber
                  placeholder="请输入止损触发价"
                  className="w-[100%] h-[50px] leading-[50px]"
                  suffix="USDT"
                />
              </Form.Item>
              {/* 止损委托价 */}
              <Form.Item name="lossTriggerPrice" noStyle>
                <InputNumber
                  placeholder="请输入止损委托价"
                  className="w-[100%] h-[50px] leading-[50px]"
                  suffix="USDT"
                />
              </Form.Item>
              {/* 委托数量 */}
              <Form.Item name="size" noStyle>
                <InputNumber
                  placeholder="请输入委托数量"
                  className="w-[100%] h-[50px] leading-[50px]"
                  suffix="USDT"
                />
              </Form.Item>
            </Flex>
          </Form>
          {/* 滑动条 */}
          <Slider
            min={0}
            max={100}
            step={1}
            className="w-[100%]"
            marks={{
              0: " ",
              25: " ",
              50: " ",
              75: " ",
              100: " ",
            }}
          />
          {/* 可平仓位 */}
          <div className="text-[14px] text-[var(--text-color6)]">
            可平仓位：63.19 USDT
          </div>
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: ModalTheme,
          Button: ButtonTheme,
          Slider: SliderTheme,
          Tabs: {
            ...TabsTheme,
            inkBarColor: "transparent",
          },
        },
        token: TokenTheme,
      }}
    >
      <Modal
        maskClosable={false}
        centered
        open={open}
        width={430}
        title={
          <div className="text-[16px] text-[var(--text-color5)] font-[500]">
            止盈止损
          </div>
        }
        classNames={{
          header: styles["my-modal-header"],
          footer: styles["my-modal-footer"],
          content: styles["my-modal-content"],
        }}
        onCancel={onCancel}
        footer={
          <div className="p-[30px_20px]">
            <Button
              disabled
              className="h-[50px]"
              block
              type="primary"
              shape="round"
              onClick={onCancel}
            >
              确定
            </Button>
          </div>
        }
      >
        <div className="px-[20px] pt-[16px]">
          {/* 头部 */}
          <div className="h-[90px] bg-[var(--background14)] rounded-[8px] p-[20px_10px] flex justify-between items-center">
            {/* 合约 */}
            <div className="flex flex-col items-center gap-[10px] text-[14px] font-[400]">
              <div className="text-[var(--text-color5)] ">BTCUSDT</div>
              <div className="text-[#00C788]">多 50x</div>
            </div>
            {/* 成本价 */}
            <div className="flex flex-col items-center gap-[10px] text-[14px]">
              <div className="text-[var(--text-color6)]">成本价</div>
              <div className="text-[var(--text-color5)]">108,232.0</div>
            </div>
            {/* 最新价格 */}
            <div className="flex flex-col items-center gap-[10px] text-[14px] font-[400]">
              <div className="text-[var(--text-color6)]">最新价格</div>
              <div className="text-[var(--text-color5)]">0</div>
            </div>
            {/* 强平价格 */}
            <div className="flex flex-col items-center gap-[10px] text-[14px] font-[400]">
              <div className="text-[var(--text-color6)]">强平价格</div>
              <div className="text-[var(--text-color5)]">106,601.2</div>
            </div>
          </div>
          {/* 选择止盈止损 */}
          <div className="mt-[20px] mb-[14px]">
            <Checkbox.Group
              options={[
                { label: "止盈", value: "profit" },
                { label: "止损", value: "loss" },
              ]}
              onChange={() => {}}
            />
          </div>
          {/* 市价/限价 */}
          <div className="flex items-center gap-[10px]">
            <Tabs
              tabBarStyle={{
                marginBottom: 10,
                fontSize: 14,
              }}
              tabBarGutter={10}
              size="small"
              items={items}
              className="w-[100%]"
            />
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default StopModal;
