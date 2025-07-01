import {
  Button,
  ConfigProvider,
  InputNumber,
  Modal,
  Radio,
  Segmented,
  Switch,
  Tabs,
} from "antd";
import style from "../styles/SubscribeModal.module.css";
import { useState } from "react";

const Subscription: React.FC = () => {
  const [timerIndex, setTimerIndex] = useState(0); //申购时间选择
  const [amount, setAmount] = useState(0); //申购数量
  const [autoSubscribe, setAutoSubscribe] = useState(false); //自动申购

  return (
    <div className="p-[0_20px_20px_20px]">
      {/* 选择时间 7天 */}
      <div className="flex flex-ai-center flex-jc-between gap-[17px] mb-[16px]">
        <div className="flex-1 rounded-[10px] bg-white border border-[#DCDCDC] py-[5px] px-[14px] cursor-pointer">
          <div>7天</div>
          <div>2.22%</div>
        </div>
        <div className="flex-1 rounded-[10px] bg-white border border-[#DCDCDC] py-[5px] px-[14px] cursor-pointer">
          <div>活期</div>
          <div>2.22%</div>
        </div>
        <div className="flex-1 rounded-[10px] bg-white border border-[#DCDCDC] py-[5px] px-[14px] cursor-pointer">
          <div>14天</div>
          <div>2.22%</div>
        </div>
      </div>
      {/* 申购数量input */}
      <div className="mb-[16px]">
        <div className="text-[14px] text-[#333] font-[500]">申购数量</div>
        <InputNumber className="m-[10px_0] w-[100%] h-[50px]" />
        <div>
          <span className="text-[#9E9E9E] font-[400]">现货可用:</span> 10.30 BTC
        </div>
        <div>
          <span className="text-[#9E9E9E] font-[400]">可申购:</span> 10,000 USDT
        </div>
      </div>
      {/* 申购数量shownumber */}
      <div className="flex flex-column gap-[10px] mb-[24px]">
        <div className="text-[14px] text-[#333] font-[500]">申购数量</div>
        <div className="flex flex-ai-center flex-jc-between">
          <div>预估每日收益</div>
          <div>-- USDT</div>
        </div>
        <div className="flex flex-ai-center flex-jc-between">
          <div>自动申购</div>
          <div>
            <Switch />
          </div>
        </div>
      </div>
      {/* 提示 */}
      <div className="rounded-[8px] bg-[#FF8A260D] p-[10px_16px] text-[#FF8A26] text-[14px] font-[500]">
        该产品支持提前赎回，查看规则
      </div>
    </div>
  );
};

const ProductRule: React.FC = () => {
  const [activeKey, setActiveKey] = useState("1");

  // 定期
  const Regular = () => {
    return (
      <>
        {/* 1.交易规则 */}
        <div className="mb-[16px]">
          {/* label */}
          <div className="flex flex-ai-center flex-jc-between mb-[12px]">
            <div className="text-[14px] text-[#0C0D0C] font-[400]">
              1.交易规则
            </div>
            <div className="text-[14px] text-[#0C0D0C] font-[400]">定期</div>
          </div>
          {/* 内容 */}
          <div className="p-[16px_20px] rounded-[10px] border-[#DCDCDC] border-[1px] flex flex-column gap-[20px]">
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[#676867] font-[400]">
                申购时间
              </div>
              <div className="text-[14px] text-[#676867] font-[400]">
                2025-02-13 13:13:13
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[#676867] font-[400]">
                开始计息
              </div>
              <div className="text-[14px] text-[#676867] font-[400]">
                2025-02-13 13:13:13
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[#676867] font-[400]">
                首次发息
              </div>
              <div className="text-[14px] text-[#676867] font-[400]">
                2025-02-13 13:13:13
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[#676867] font-[400]">
                最后发息
              </div>
              <div className="text-[14px] text-[#676867] font-[400]">
                2025-02-13 13:13:13
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[#676867] font-[400]">
                下次申购
              </div>
              <div className="text-[14px] text-[#676867] font-[400]">
                2025-02-13 13:13:13
              </div>
            </div>
          </div>
        </div>
        {/* 2.奖励规则 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[#0C0D0C] font-[400] mb-[10px]">
            2.奖励规则
          </div>
          <div className="text-[14px] text-[#676867] font-[400]">
            您申购的定期产品的年化收益率按照申购成功时年利率计算。
            收益将于申购次日 08:00 (UTC+8)
            开始计算。收益将于开始计算后次日（即申购后两天）的 08:00 (UTC+8)
            开始发放至您的现货账户。 每日收益 = 已申购资产 * 年化收益率 /
            365（精确到小数位，具体位数取决于币种）
          </div>
        </div>
        {/* 3.提前赎回 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[#0C0D0C] font-[400] mb-[10px]">
            3.提前赎回
          </div>
          <div className="text-[14px] text-[#676867] font-[400]">
            针对指定定期产品，您可以在到期前随时赎回资产，一经确认，赎回流程将不可逆。如果提前赎回，您将放弃该产品已计息的收益。您用于申购定期产品的本金将于72小时内返还至您的现货钱包。如遇极端市场波动、网络延迟或请求数量过多，赎回可能会延迟。
          </div>
        </div>
        {/* 4.取消申购 */}
        <div>
          <div className="text-[14px] text-[#0C0D0C] font-[400] mb-[10px]">
            4.取消申购
          </div>
          <div className="text-[14px] text-[#676867] font-[400]">
            如果您在申购当天取消申购，且在次日07:59 (UTC+8)
            之前确认取消,则可以成功取消申购，您的本金将退还至个人现货账户。在
            07:59 (UTC+8) 之后，则无法取消申购，您将需要遵守提前赎回政策。
          </div>
        </div>
      </>
    );
  };
  //活期
  const Current = () => {
    return (
      <>
        {/* 1.交易规则 */}
        <div className="mb-[10px]">
          {/* label */}
          <div className="flex flex-ai-center flex-jc-between mb-[12px]">
            <div className="text-[14px] text-[#0C0D0C] font-[400]">
              1.交易规则
            </div>
            <div className="text-[14px] text-[#0C0D0C] font-[400]">活期</div>
          </div>
          {/* 内容 */}
          <div className="p-[16px_20px] rounded-[10px] border-[#DCDCDC] border-[1px] flex flex-column gap-[20px]">
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[#676867] font-[400]">
                申购时间
              </div>
              <div className="text-[14px] text-[#676867] font-[400]">
                2025-02-13 13:13:13
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[#676867] font-[400]">
                开始计息
              </div>
              <div className="text-[14px] text-[#676867] font-[400]">
                2025-02-13 13:13:13
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[#676867] font-[400]">
                首次发放利息
              </div>
              <div className="text-[14px] text-[#676867] font-[400]">
                2025-02-13 13:13:13
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[#676867] font-[400]">赎回</div>
              <div className="text-[14px] text-[#676867] font-[400]">
                立即赎回
              </div>
            </div>
          </div>
        </div>
        {/* 交易规则补充 */}
        <div className="text-[14px] text-[#676867] font-[400] mb-[16px]">
          针对活期产品, 我们将提供阶梯年化收益,
          该收益采用阶梯分級结构。该收益于申购隔日08:00（UTC+8）开始计算。在计算后隔日
          (即申购日+两天) 的08:00 (UTC+8) 开始发放至您的现货钱包。
          ​​阶梯年化收益率可能每天变化。
        </div>
        {/* 2.赎回 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[#0C0D0C] font-[400] mb-[10px]">
            2.赎回
          </div>
          <div className="text-[14px] text-[#676867] font-[400]">
            一旦赎回操作完成, 活期产品资产将立即返还到您的现货钱包。 请注意,
            每个活期产品都有每日赎回上限, 且赎回上限可能会进行调整。
            若出现大量的赎回请求, 可能会暂时延迟赎回, 并在流动性恢复后完成
            赎回操作。
          </div>
        </div>
        {/* 3.收益币种 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[#0C0D0C] font-[400] mb-[10px]">
            3.收益币种
          </div>
          <div className="text-[14px] text-[#676867] font-[400]">
            持仓币种和收益币种并非同一币种，则以质押币种计算利息并且以结息当时的汇率换算收益币种。
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="p-[0_20px_20px_20px]">
      {/* 活期 定期 */}
      <div className="mb-[20px]">
        <Segmented
          options={[
            { value: "1", label: "活期" },
            { value: "2", label: "定期" },
          ]}
          value={activeKey}
          className="rounded-[10px]"
          onChange={(value) => setActiveKey(value)}
        />
      </div>
      {activeKey === "1" ? <Current /> : <Regular />}
    </div>
  );
};

 const SubscribeModal = ({ openSubscribe, setOpenSubscribe, setOpenConfirm }: { openSubscribe: boolean; setOpenSubscribe: (open: boolean) => void; setOpenConfirm: (open: boolean) => void }) => {
  const [tabsKey, setTabsKey] = useState("1");

  const items = [
    {
      key: "1",
      label: "申购",
      children: <Subscription />,
    },
    {
      key: "2",
      label: "产品规则",
      children: <ProductRule />,
    },
  ];
  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: { cardPadding: "20px" },
          Modal: { titleLineHeight: "60px" },
        },
      }}
    >
      <Modal
        classNames={{
          body: style.modal_body,
          mask: style.modal_mask,
          header: style.modal_header,
          footer: style.modal_footer,
          content: style.modal_content,
        }}
        open={openSubscribe}
        onCancel={() => setOpenSubscribe(false)}
        title={<div>USDT</div>}
        closable={{ "aria-label": "Custom Close Button" }}
        footer={
          tabsKey === "1" ? (
            <div className="p-[30px_55px] flex justify-around gap-[20px]">
              <Button
                style={{
                  background: "var(--cancel-btn)",
                  color: "var(--cancel-color)",
                }}
                onClick={() => setOpenSubscribe(false)}
                shape="round"
                size="large"
                className="h-[50px] flex-1 border-0"
              >
                取消
              </Button>
              <Button
                type="primary"
                shape="round"
                size="large"
                className="h-[50px] flex-1"
                onClick={() => setOpenConfirm(true)}
              >
                申购
              </Button>
            </div>
          ) : null
        }
      >
        <Tabs
          activeKey={tabsKey}
          defaultActiveKey="1"
          tabBarStyle={{ padding: "0 28px" }}
          items={items}
          onChange={(key) => setTabsKey(key)}
        />
      </Modal>
    </ConfigProvider>
  );
};

export default SubscribeModal;