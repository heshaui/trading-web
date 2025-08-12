import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  InputNumber,
  Slider,
  Select,
  Switch,
  Tabs,
  Form,
  Space,
  Tooltip,
  Checkbox,
  Image,
  ConfigProvider,
  Segmented,
  Dropdown,
} from "antd";
import { useTranslation } from "next-i18next";
import { Iconify } from "@/components/icon";
import MarginModeModal from "../MarginModeModal/index";
import LeverageModal from "../LeverageModal/index";
import OrderSettingsModal from "../OrderSettingsModal/index";
import TradingSettingsDrawer from "../TradingSettingsDrawer/index";
import FundTransferModal from "../FundTransferModal/index";
import PlaceOrder_modal from "../placeOrder_modal";
import Calculator from "../Calculator";
import { transferAll } from "@/services/assets";
import { toast } from "sonner";
import { encryptData } from "@/utils/encrypt";
import styles from "./styles.module.css";
import appStore from "@/store";
import { useUserConfig } from "@/hooks/useUserConfig";

const { Option } = Select;

interface ContractTradingPanelProps {
  symbol?: string;
  lastPrice?: number;
  availableBalance?: number;
  onOrderSubmit?: (orderData: any) => void;
  onBalanceUpdate?: () => void; // 新增余额更新回调
}

const ContractTradingPanel: React.FC<ContractTradingPanelProps> = ({
  symbol = "BTCUSDT",
  lastPrice = "",
  availableBalance = 0,
  onOrderSubmit,
  onBalanceUpdate, // 解构新增的回调
}) => {
  // 确保所有Hooks在组件顶层按固定顺序调用
  const { t } = useTranslation(["contract"]);
  const [form] = Form.useForm();

  // 状态管理 - 按固定顺序声明所有状态
  const [currentCategory, setCurrentCategory] = useState<1 | 2 | 3>(1);
  const [transactionType, setTransactionType] = useState<1 | 2>(1);
  const [leverageLevel, setLeverageLevel] = useState(1);
  const [price, setPrice] = useState<string | number>(lastPrice);
  const [quantity, setQuantity] = useState<string | number>();
  const [percentage, setPercentage] = useState(0);
  const [enableTPSL, setEnableTPSL] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState<string | number>("");
  const [stopLossPrice, setStopLossPrice] = useState<string | number>("");
  const [marginModel, setMarginModel] = useState<1 | 2>(1);
  const [showMarginModeModal, setShowMarginModeModal] = useState(false);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showOrderSettingsModal, setShowOrderSettingsModal] = useState(false);
  const [showTradingSettingsDrawer, setShowTradingSettingsDrawer] =
    useState(false);
  const [showFundTransferModal, setShowFundTransferModal] = useState(false);
  const [showOrderConfirmModal, setShowOrderConfirmModal] = useState(false);
  const [orderUnit, setOrderUnit] = useState<"BTC" | "USDT" | "张">("BTC");
  const [showCalculator, setShowCalculator] = useState(false);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  // 新增触发价状态
  const [triggerPrice, setTriggerPrice] = useState<string>("");
  const [submitData, setSubmitData] = useState({}); //下单提交数据
  const [confirmData, setConfirmData] = useState({
    direction: 0,
    type: 1,
    price: "" as string | number,
    amount: 0 as string | number,
    account: 0,
    symbol: symbol,
    marginMode: 1 as number,
    leverage: 65,
    orderType: "limit",
  }); //二次确认数据

  // 在所有Hooks声明之后获取store数据
  const currentContractInfo = appStore.getCurrentContractInfo();
  const { userConfig } = useUserConfig();

  console.log("currentContractInfo:", currentContractInfo);
  console.log("ContractTradingPanel userConfig:", userConfig);

  // 监听 userConfig.nowLevel 变化，同步更新本地 leverageLevel 状态
  useEffect(() => {
    if (userConfig?.nowLevel && userConfig.nowLevel !== leverageLevel) {
      console.log('ContractTradingPanel: 同步杠杆值', userConfig.nowLevel, '当前值:', leverageLevel);
      setLeverageLevel(userConfig.nowLevel);
    }
  }, [userConfig?.nowLevel]); // 移除 leverageLevel 依赖，避免无限循环

  // 获取当前订单类型
  const getOrderType = () => {
    if (currentCategory === 1) return "limit";
    if (currentCategory === 2) return "market";
    if (currentCategory === 3) return "conditional";
    return "limit";
  };

  const orderType = getOrderType();

  // 计算可买/可卖数量
  const calculateMaxQuantity = () => {
    const lastPriceNum =
      typeof lastPrice === "string" ? parseFloat(lastPrice) : lastPrice;
    const priceNum =
      typeof price === "string" ? parseFloat(price as string) : price;

    if (orderType === "market") {
      return (availableBalance * leverageLevel) / (lastPriceNum || 1);
    }
    return (availableBalance * leverageLevel) / (priceNum || 1);
  };

  // 处理百分比滑块变化
  const handlePercentageChange = (value: number) => {
    setPercentage(value);
    const maxQuantity = calculateMaxQuantity();
    const newQuantity = (maxQuantity * value) / 100;
    setQuantity(newQuantity);
  };

  const handleSettings = () => {
    setShowTradingSettingsDrawer(true);
  };

  // 处理订单提交
  const handleSubmit = (side: "BUY" | "SELL") => {
    // 检查用户是否选择不再提醒
    const dontShowConfirm =
      localStorage.getItem("dontShowOrderConfirm") === "true";
    setSide(side);

    if (dontShowConfirm) {
      // 直接执行下单，不显示确认框
      const orderData = {
        direction: transactionType === 1 ? 0 : 1,
        type: currentCategory === 1 ? 1 : 0,
        price: price,
        amount: quantity || 0,
        account:
          (typeof quantity === "string"
            ? parseFloat(quantity)
            : quantity || 0) *
          (typeof price === "string" ? parseFloat(price) : price || 0),
        symbol: symbol,
        marginMode: marginModel,
        leverage: leverageLevel,
        orderType:
          currentCategory === 1
            ? "limit"
            : currentCategory === 2
              ? "market"
              : "conditional",
      };
      handleConfirmOrder(orderData, false);
      return;
    }

    const orderData = {
      direction: transactionType === 1 ? 0 : 1, // 0: 买入, 1: 卖出
      type: currentCategory === 1 ? 1 : 0, // 1: 限价, 0: 市价
      price: price,
      amount: quantity || 0,
      account:
        (typeof quantity === "string" ? parseFloat(quantity) : quantity || 0) *
        (typeof price === "string" ? parseFloat(price) : price || 0),
      symbol: symbol,
      marginMode: marginModel,
      leverage: leverageLevel,
      orderType:
        currentCategory === 1
          ? "limit"
          : currentCategory === 2
            ? "market"
            : "conditional",
    };

    setConfirmData(orderData);
    setShowOrderConfirmModal(true);
  };

  // 处理确认下单
  const handleConfirmOrder = (orderData: any, dontRemind: boolean) => {
    const data = {
      positionType: 1, // 持仓类型(1 全仓，2 仓逐)
      side: side,
      leverageLevel: leverageLevel, // 杠杆倍数
      price: currentCategory === 1 ? price : 0, // 下单价格(市价单传0)
      volume: quantity, // 下单数量(开仓 市价单：开仓价值)
      triggerPrice: triggerPrice, // 触发价格
      open: transactionType === 1 ? "OPEN" : "CLOSE", // 开平仓方向(open 开仓，close 平仓)
      type: currentCategory === 1 ? 1 : currentCategory === 2 ? 2 : 3, // 订单类型 (1 limit， 2 market，3 IOC，4 FOK，5 POST_ONLY)
      isConditionOrder: currentCategory === 3, // 是否是条件单
      // expireTime: this.expireTime, // 到期时间
      isOto: enableTPSL, // 是否止盈止损单
      takerProfitTrigger: takeProfitPrice || null, // 止盈触发价
      takerProfitPrice: 0, // 止盈委托价格（0为市价）
      takerProfitType: 2, // 止盈类型
      stopLossTrigger: stopLossPrice || null, // 止损触发价格
      stopLossPrice: 0, // 止损委托价格（0为市价）
      stopLossType: 2, // 止损类型
      marginModel: marginModel,
    };

    // 如果用户选择不再提醒，可以在这里保存设置
    if (dontRemind) {
      // 保存到本地存储或全局状态
      localStorage.setItem("dontShowOrderConfirm", "true");
    }

    onOrderSubmit?.(data);
    setShowOrderConfirmModal(false);
  };

  // 处理保证金模式变更
  const handleMarginModeChange = (mode: 1 | 2) => {
    setMarginModel(mode);
  };

  // 处理杠杆变更
  const handleLeverageChange = (newLeverage: number) => {
    setLeverageLevel(newLeverage);
  };

  // 处理下单单位变更
  const handleOrderUnitChange = (unit: "BTC" | "USDT" | "张") => {
    setOrderUnit(unit);
  };

  const goTransfer = () => {
    setShowFundTransferModal(true);
  };

  // 处理资金划转确认
  const handleFundTransferConfirm = async (transferData: any) => {
    const dataEncrypt = await encryptData(transferData);
    const res = await transferAll(dataEncrypt);
    console.log("res:", res);
    if (res.code === "0" && res.data) {
      toast.success("划转成功");
      // 通知父组件更新余额
    } else {
      toast.error("划转失败");
    }
    onBalanceUpdate?.();
  };

  // 订单类型标签
  const orderTypeTabs = [
    { key: 1, label: "限价" },
    { key: 2, label: "市价" },
    // { key: 3, label: '条件' } 2027-07-29 zyj暂时注释
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            // 悬停背景颜色
            defaultHoverBg: "var(--background14)",
            defaultHoverColor: "var(--text-color5)",
            defaultActiveBg: "var(--background14)",
            defaultActiveColor: "var(--text-color5)",
          },
          Segmented: {
            itemSelectedBg: "var(--theme-color)",
            itemHoverBg: "transparent",
            itemActiveBg: "transparent",
            itemColor: "var(--text-color6)",
            trackPadding: 3,
            borderRadius: 50,
            borderRadiusSM: 50,
          },
          Slider: {
            railBg: "var(--background16)",
            handleColor: "var(--theme-color)",
            dotSize: 10,
            dotActiveBorderColor: "var(--theme-color)",
          },
        },
      }}
    >
      <div className="p-[10px_16px]">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between mb-[16px]">
          <div className="flex items-center gap-[10px]">
            <Button
              size="small"
              shape="round"
              className="h-[28px] w-[72px] rounded-[23px] text-[var(--text-color5)] bg-[var(--background14)] border-none text-[12px]"
              onClick={() => setShowMarginModeModal(true)}
            >
              {marginModel === 1 ? "全仓" : "逐仓"}
            </Button>
            <Button
              size="small"
              shape="round"
              className="h-[28px] w-[72px] rounded-[23px] text-[var(--text-color5)] bg-[var(--background14)] border-none text-[12px]"
              onClick={() => setShowLeverageModal(true)}
            >
              {userConfig.nowLevel}x
            </Button>
          </div>

          <div className="flex items-center gap-[8px]">
            <Button
              type="text"
              size="small"
              icon={<Iconify icon="mdi:calculator" width={20} height={20} />}
              className="border-none text-[var(--text-color6)]"
              onClick={() => setShowCalculator(true)}
              title="计算器"
            />
            <Button
              type="text"
              size="small"
              onClick={handleSettings}
              icon={<Iconify icon="mdi:cog-outline" width={20} height={20} />}
              className="border-none text-[var(--text-color6)]"
            />
          </div>
        </div>

        {/* 开仓/平仓切换 */}
        <div className="mb-[16px]">
          <Segmented
            shape="round"
            className="h-[50px] max-w-[298px] w-[100%] border border-[var(--theme-color)] bg-[transparent]"
            options={[
              {
                label: (
                  <div className="h-[44px] flex items-center justify-center">
                    {" "}
                    开仓
                  </div>
                ),
                value: 1,
              },
              {
                label: (
                  <div className="h-[44px] flex items-center justify-center">
                    {" "}
                    平仓
                  </div>
                ),
                value: 2,
              },
            ]}
            value={transactionType}
            block
            onChange={(value) => setTransactionType(value as 1 | 2)}
          />
        </div>

        {/* 订单类型标签 */}
        <div className="flex gap-[10px] mb-[10px]">
          {orderTypeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCurrentCategory(tab.key as any)}
              className={`text-[14px] font-[400] ${currentCategory === tab.key
                  ? "text-[var(--text-color5)] font-[500]"
                  : "text-[var(--text-color6)]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 可用余额 */}
        <div className="flex items-center mb-[10px] text-[14px] text-[var(--text-color5)] gap-[4px]">
          <div className="flex items-center gap-[8px]">
            <span>可用:</span>
            <span>{availableBalance.toFixed(2)} USDT</span>
          </div>
          <Iconify
            icon="mdi:swap-horizontal"
            className="text-[16px] text-[var(--theme-color)] cursor-pointer"
            onClick={() => goTransfer()}
          />
        </div>

        <Form form={form} layout="vertical" className="m-[0]">
          {/* 触发价格 (条件单显示) */}
          {currentCategory === 3 && (
            <Form.Item>
              <div className="flex flex-col gap-[8px]">
                <div className="flex items-center">
                  <Input
                    value={triggerPrice}
                    onChange={(e) => setTriggerPrice(e.target.value)}
                    placeholder="触发价格"
                    className="w-[100%] h-[32px] p-[0_12px] border-none text-[var(--text-color5)] font-[12px] rounded-[6px] bg-[#F5F5F5]"
                    suffix="USDT"
                  />
                </div>
              </div>
            </Form.Item>
          )}

          {/* 委托价格 (限价单和条件单显示) */}
          {(currentCategory === 1 || currentCategory === 3) && (
            <Form.Item style={{ marginBottom: "16px" }}>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="委托价格"
                className="w-[100%] h-[50px] text-[var(--text-color5)] text-[14px] round-[6px]"
                suffix="USDT"
                style={{ width: currentCategory === 3 ? "80%" : "100%" }}
              />
              {currentCategory === 3 && <Button type="text">市价</Button>}
            </Form.Item>
          )}

          {/* 委托数量 */}
          <Form.Item style={{ marginBottom: "16px" }}>
            <Input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="委托数量"
              className="w-[100%] h-[50px] text-[var(--text-color5)] text-[14px] round-[6px]"
              suffix="USDT"
            />
          </Form.Item>

          {/* 百分比滑块 */}
          <Slider
            style={{
              marginTop: " 16px",
              marginBottom: "10px",
            }}
            value={percentage}
            onChange={handlePercentageChange}
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
            tooltip={{ formatter: (value) => `${value}%` }}
          />

          {/* 可买/可卖数量显示 */}
          <div className="mb-[16px]">
            <div className="flex items-center justify-between text-[14px] text-[var(--text-color6)] font-[400]">
              <div className="flex items-center gap-[4px]">
                <span>可买</span>
                <span>0 USDT</span>
              </div>
              <div className="flex items-center gap-[4px]">
                <span>可卖</span>
                <span>0 USDT</span>
              </div>
            </div>
          </div>

          {/* 止盈止损 */}
          {/* <div className={styles.tpslSection}>
          <div className={styles.tpslHeader}>
            <Checkbox
              checked={enableTPSL}
              onChange={(e) => setEnableTPSL(e.target.checked)}
              className={styles.tpslSwitch}
            />
            <span className={styles.tpslLabel}>止盈止损</span> 
          </div> 2027-07-29 zyj暂时注释 */}

          {/* 止盈止损输入框 */}
          {/* {enableTPSL && (
            <div className={styles.tpslInputs}>
              <div className={styles.tpslInputRow}>
                <Input
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(Number(e.target.value) || 0)}
                  placeholder="止盈触发价"
                  className={styles.tpslInput}
                  suffix="USDT"
                />
              </div>
              <div className={styles.tpslInputRow}>
                <Input
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(Number(e.target.value) || 0)}
                  placeholder="止损触发价"
                  className={styles.tpslInput}
                  suffix="USDT"
                />
              </div>
            </div>
          )}
        </div> 2027-07-29 zyj暂时注释*/}

          {/* 高级设置 */}
          <div className="flex items-center mb-[22px] gap-[4px]">
            <span className="text-[14px] text-[var(--text-color6)] font-[400]">
              高级设置
            </span>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  { key: "5", label: "P/O" },
                  { key: "3", label: "IOC" },
                  { key: "4", label: "FOK" },
                ],
              }}
            >
              <Space size={4}>
                GTC
                <Iconify icon="mdi:chevron-down" />
              </Space>
            </Dropdown>
          </div>

          {/* 提交按钮 */}
          <div className="mb-[10px] flex justify-between gap-[12px]">
            <Button
              type="primary"
              size="large"
              onClick={() => handleSubmit("BUY")}
              block
              shape="round"
              className=" text-[16px] font-[400] text-[#FFF]"
              style={{
                background: "#00C788",
              }}
            >
              {transactionType === 1 ? "买入开多" : "买入平空"}
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => handleSubmit("SELL")}
              className=" text-[16px] font-[400] text-[#FFF]"
              style={{
                background: "#FF4D4F",
              }}
              block
              shape="round"
            >
              {transactionType === 2 ? "卖出平多" : "卖出开空"}
            </Button>
          </div>

          {/* 成本显示 */}
          <div className="flex items-center justify-between  font-[400] text-[14px] text-[var(--text-color6)]">
            <div className="flex gap-[4px]">
              <span>成本</span>
              <span>0 USDT</span>
            </div>
            <div className="flex gap-[4px]">
              <span>成本</span>
              <span>0 USDT</span>
            </div>
          </div>
        </Form>

        {/* 保证金模式弹框 */}
        <MarginModeModal
          visible={showMarginModeModal}
          onClose={() => setShowMarginModeModal(false)}
          currentMode={marginModel}
          onModeChange={handleMarginModeChange}
          symbol={symbol}
        />

        {/* 杠杆设置弹框 */}
        <LeverageModal
          visible={showLeverageModal}
          onClose={() => setShowLeverageModal(false)}
          currentLeverage={leverageLevel}
          onLeverageChange={handleLeverageChange}
          symbol={symbol}
          maxLeverage={125}
          positionLimit={815.4018}
        />

        {/* 下单设置弹框 */}
        <OrderSettingsModal
          visible={showOrderSettingsModal}
          onClose={() => setShowOrderSettingsModal(false)}
          currentUnit={orderUnit}
          onUnitChange={handleOrderUnitChange}
        />

        {/* 交易设置抽屉 */}
        <TradingSettingsDrawer
          visible={showTradingSettingsDrawer}
          onClose={() => setShowTradingSettingsDrawer(false)}
        />

        {/* 资金划转弹框 */}
        <FundTransferModal
          visible={showFundTransferModal}
          onClose={() => setShowFundTransferModal(false)}
          onConfirm={handleFundTransferConfirm}
        />

        {/* 下单确认弹框 */}
        <PlaceOrder_modal
          open={showOrderConfirmModal}
          modalData={confirmData}
          onCancel={() => {
            setShowOrderConfirmModal(false);
          }}
          onOk={(confirmed) => {
            if (confirmed) {
              handleConfirmOrder(confirmData, false);
            }
            setShowOrderConfirmModal(false);
          }}
        />
        {/* 计算器组件 */}
        <Calculator
          isShow={showCalculator}
          close={() => setShowCalculator(false)}
          dataInfo={currentContractInfo}
        />
      </div>
    </ConfigProvider>
  );
};

export default ContractTradingPanel;
