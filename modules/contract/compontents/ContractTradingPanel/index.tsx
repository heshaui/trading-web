import React, { useState, useEffect } from 'react';
import { Button, Input, InputNumber, Slider, Select, Switch, Tabs, Form, Space, Tooltip,Checkbox,Image } from 'antd';
import { useTranslation } from 'next-i18next';
import { Iconify } from '@/components/icon';
import MarginModeModal from '../MarginModeModal/index';
import LeverageModal from '../LeverageModal/index';
import OrderSettingsModal from '../OrderSettingsModal/index';
import TradingSettingsDrawer from '../TradingSettingsDrawer/index';
import FundTransferModal from '../FundTransferModal/index';
import PlaceOrder_modal from '../placeOrder_modal';
import Calculator from '../Calculator';
import { transferAll } from "@/services/assets";
import { toast } from "sonner";
import { encryptData } from "@/utils/encrypt";
import styles from './styles.module.css';
import appStore from '@/store';

const { Option } = Select;

interface ContractTradingPanelProps {
  symbol?: string;
  lastPrice?: number;
  availableBalance?: number;
  onOrderSubmit?: (orderData: any) => void;
  onBalanceUpdate?: () => void; // 新增余额更新回调
}

const ContractTradingPanel: React.FC<ContractTradingPanelProps> = ({
  symbol = 'BTCUSDT',
  lastPrice = '',
  availableBalance = 0,
  onOrderSubmit,
  onBalanceUpdate // 解构新增的回调
}) => {
  const { t } = useTranslation(['contract']);
  const [form] = Form.useForm();
  const currentContractInfo = appStore.getCurrentContractInfo();
  console.log('currentContractInfo:', currentContractInfo);
  // 状态管理
  const [currentCategory, setCurrentCategory] = useState<1 | 2 | 3>(1);
  const [transactionType, setTransactionType] = useState<1 | 2>(1);
  const [leverageLevel, setLeverageLevel] = useState(65);
  const [price, setPrice] = useState<string | number>(lastPrice);
  const [quantity, setQuantity] = useState<string | number>(0);
  const [percentage, setPercentage] = useState(0);
  const [enableTPSL, setEnableTPSL] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState<string | number>('');
  const [stopLossPrice, setStopLossPrice] = useState<string | number>('');
  const [marginModel, setMarginModel] = useState<1 | 2>(1);
  const [showMarginModeModal, setShowMarginModeModal] = useState(false);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showOrderSettingsModal, setShowOrderSettingsModal] = useState(false);
  const [showTradingSettingsDrawer, setShowTradingSettingsDrawer] = useState(false);
  const [showFundTransferModal, setShowFundTransferModal] = useState(false);
  const [showOrderConfirmModal, setShowOrderConfirmModal] = useState(false);
  const [orderUnit, setOrderUnit] = useState<'BTC' | 'USDT' | '张'>('BTC');
  const [showCalculator, setShowCalculator] = useState(false);
  // 新增触发价状态
  const [triggerPrice, setTriggerPrice] = useState<string>('');
  const [submitData, setSubmitData] = useState({}); //下单提交数据
  const [confirmData, setConfirmData] = useState({
    direction: 0,
    type: 1,
    price: '' as string | number,
    amount: 0 as string | number,
    account: 0,
    symbol: symbol,
    marginMode: 1 as number,
    leverage: 65,
    orderType: 'limit'
  }); //二次确认数据

  // 获取当前订单类型
  const getOrderType = () => {
    if (currentCategory === 1) return 'limit';
    if (currentCategory === 2) return 'market';
    if (currentCategory === 3) return 'conditional';
    return 'limit';
  };

  const orderType = getOrderType();

  // 计算可买/可卖数量
  const calculateMaxQuantity = () => {
    const lastPriceNum = typeof lastPrice === 'string' ? parseFloat(lastPrice) : lastPrice;
    const priceNum = typeof price === 'string' ? parseFloat(price as string) : price;
    
    if (orderType === 'market') {
      return availableBalance * leverageLevel / (lastPriceNum || 1);
    }
    return availableBalance * leverageLevel / (priceNum || 1);
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
  const handleSubmit = () => {
    // 检查用户是否选择不再提醒
    const dontShowConfirm = localStorage.getItem('dontShowOrderConfirm') === 'true';
    
    if (dontShowConfirm) {
      // 直接执行下单，不显示确认框
      handleConfirmOrder(null, false);
      return;
    }

    const orderData = {
      direction: transactionType === 1 ? 0 : 1, // 0: 买入, 1: 卖出
      type: currentCategory === 1 ? 1 : 0, // 1: 限价, 0: 市价
      price: price,
      amount: quantity,
      account: (typeof quantity === 'string' ? parseFloat(quantity) : quantity) * (typeof price === 'string' ? parseFloat(price) : price),
      symbol: symbol,
      marginMode: marginModel,
      leverage: leverageLevel,
      orderType: currentCategory === 1 ? 'limit' : currentCategory === 2 ? 'market' : 'conditional'
    };

    setConfirmData(orderData);
    setShowOrderConfirmModal(true);
  };

  // 处理确认下单
  const handleConfirmOrder = (orderData: any, dontRemind: boolean) => {
    const data = {
      positionType: 1, // 持仓类型(1 全仓，2 仓逐)
      side: transactionType === 1 ? 'BUY' : 'SELL', // 买卖方向（buy 买入，sell 卖出）
      leverageLevel: leverageLevel, // 杠杆倍数
      price: price, // 下单价格(市价单传0)
      volume: quantity, // 下单数量(开仓 市价单：开仓价值)
      triggerPrice: triggerPrice, // 触发价格
      open: transactionType === 1 ? 'OPEN' : 'CLOSE', // 开平仓方向(open 开仓，close 平仓)
      type: currentCategory === 1 ? 1 : currentCategory === 2 ? 2 : 3, // 订单类型 (1 limit， 2 market，3 IOC，4 FOK，5 POST_ONLY)
      isConditionOrder: currentCategory === 3, // 是否是条件单
      // expireTime: this.expireTime, // 到期时间
      isOto: enableTPSL, // 是否止盈止损单
      takerProfitTrigger: takeProfitPrice||null, // 止盈触发价
      takerProfitPrice: 0, // 止盈委托价格（0为市价）
      takerProfitType: 2, // 止盈类型
      stopLossTrigger: stopLossPrice||null, // 止损触发价格
      stopLossPrice: 0, // 止损委托价格（0为市价）
      stopLossType: 2, // 止损类型
      marginModel: marginModel,
    }
    
    // 如果用户选择不再提醒，可以在这里保存设置
    if (dontRemind) {
      // 保存到本地存储或全局状态
      localStorage.setItem('dontShowOrderConfirm', 'true');
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
  const handleOrderUnitChange = (unit: 'BTC' | 'USDT' | '张') => {
    setOrderUnit(unit);
  };

  const goTransfer = () => {
    setShowFundTransferModal(true);
  };

  // 处理资金划转确认
  const handleFundTransferConfirm = async (transferData: any) => {

    const dataEncrypt = await encryptData(transferData);
    const res = await transferAll(dataEncrypt);
    console.log('res:', res);
    if (res.code === '0' && res.data) {
      toast.success('划转成功');
      // 通知父组件更新余额

    } else {
      toast.error('划转失败');
    }
    onBalanceUpdate?.();
  };

  // 订单类型标签
  const orderTypeTabs = [
    { key: 1, label: '限价' },
    { key: 2, label: '市价' },
    { key: 3, label: '条件' },
  ];

  return (
    <div className={styles.tradingPanel}>
      {/* 顶部工具栏 */}
      <div className={styles.topToolbar}>
        <div className={styles.marginLeverageGroup}>
          <Button
            type="text"
            size="small"
            className={styles.marginBtn}
            onClick={() => setShowMarginModeModal(true)}
          >
            {marginModel === 1 ? '全仓' : '逐仓'}
          </Button>
          <Button
            type="text"
            size="small"
            className={styles.leverageBtn}
            onClick={() => setShowLeverageModal(true)}
          >
            {leverageLevel}x
          </Button>
        </div>

        <div className={styles.toolbarIcons}>
          <Button
            type="text"
            size="small"
            icon={<Iconify icon="mdi:calculator" />}
            className={styles.iconBtn}
            onClick={() => setShowCalculator(true)}
            title="计算器"
          />
          <Button
            type="text"
            size="small"
            icon={<Iconify icon="mdi:calendar-blank" />}
            className={styles.iconBtn}
          />
          <Button
            type="text"
            size="small"
            onClick={handleSettings}
            icon={<Iconify icon="mdi:cog-outline" />}
            className={styles.iconBtn}
          />
        </div>
      </div>

      {/* 开仓/平仓切换 */}
      <div className={styles.positionToggle}>
        <div className={styles.toggleWrapper}>
          <div className={`${styles.toggleSlider} ${transactionType === 2 ? styles.toggleSliderRight : ''}`} />
          <Button
            type="text"
            onClick={() => setTransactionType(1)}
            className={`${styles.toggleBtn} ${transactionType === 1 ? styles.toggleBtnActive : ''}`}
          >
            开仓
          </Button>
          <Button
            type="text"
            onClick={() => setTransactionType(2)}
            className={`${styles.toggleBtn} ${transactionType === 2 ? styles.toggleBtnActive : ''}`}
          >
            平仓
          </Button>
        </div>
      </div>

      {/* 订单类型标签 */}
      <div className={styles.orderTypeTabs}>
        <div className={styles.tabsWrapper}>
          {orderTypeTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentCategory(tab.key as any)}
              className={`${styles.tabItem} ${currentCategory === tab.key ? styles.tabItemActive : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 可用余额 */}
      <div className={styles.balanceSection}>
        <span className={styles.balanceLabel}>可用：</span>
        <span className={styles.balanceValue}>
          {availableBalance.toFixed(2)} USDT
          <Iconify icon="mdi:swap-horizontal" className={styles.swapIcon} onClick={() => goTransfer()} />
        </span>
      </div>

      <Form form={form} layout="vertical" className={styles.orderForm}>
        {/* 触发价格 (条件单显示) */}
        {currentCategory === 3 && (
          <Form.Item className={styles.formItem}>
            <div className={styles.inputWrapper}>
              <div className={styles.inputGroup}>
                <Input
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  placeholder="触发价格"
                  className={styles.priceInput}
                  suffix="USDT"
                />
              </div>
            </div>
          </Form.Item>
        )}

        {/* 委托价格 (限价单和条件单显示) */}
        {(currentCategory === 1 || currentCategory === 3) && (
          <Form.Item className={styles.formItem}>
            <div className={styles.inputWrapper}>
              <div className={styles.inputGroup}>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="委托价格"
                  className={styles.priceInput}
                  suffix="USDT"
                />
              </div>
            </div>
          </Form.Item>
        )}

        {/* 委托数量 */}
        <Form.Item className={styles.formItem}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputGroup}>
              <Input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="委托数量"
                className={styles.quantityInput}
                suffix={
                  <div className={styles.inputSuffixGroup}>
                    <span>{orderUnit}</span>
                    <Iconify
                      icon="mdi:chevron-down"
                      className={styles.dropdownIcon}
                      onClick={() => setShowOrderSettingsModal(true)}
                    />
                  </div>
                }
              />
            </div>
          </div>
        </Form.Item>

        {/* 百分比滑块 */}
        <div className={styles.percentageSection}>
          <Slider
            value={percentage}
            onChange={handlePercentageChange}
            min={0}
            max={100}
            step={1}
            className={styles.percentageSlider}
            marks={{
              0: '',
              25: '',
              50: '',
              75: '',
              100: ''
            }}
            tooltip={{ formatter: (value) => `${value}%` }}
          />
          <div className={styles.percentageMarks}>
            <span className={percentage === 0 ? styles.activeMark : ''}>0%</span>
            <span className={percentage === 25 ? styles.activeMark : ''}>25%</span>
            <span className={percentage === 50 ? styles.activeMark : ''}>50%</span>
            <span className={percentage === 75 ? styles.activeMark : ''}>75%</span>
            <span className={percentage === 100 ? styles.activeMark : ''}>100%</span>
          </div>
        </div>

        {/* 可买/可卖数量显示 */}
        <div className={styles.quantityInfo}>
          <div className={styles.quantityRow}>
            <div>
              <span className={styles.buyLabel}>可买</span>
              <span className={styles.buyValue}>0 USDT</span>
            </div>
            <div>
              <span className={styles.sellLabel}>可卖</span>
              <span className={styles.sellValue}>0 USDT</span>
            </div>

          </div>
        </div>

        {/* 止盈止损 */}
        <div className={styles.tpslSection}>
          <div className={styles.tpslHeader}>
            <Checkbox
              checked={enableTPSL}
              onChange={(e) => setEnableTPSL(e.target.checked)}
              className={styles.tpslSwitch}
            />
             <span className={styles.tpslLabel}>止盈止损</span> 
          </div>

          {/* 止盈止损输入框 */}
          {enableTPSL && (
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
        </div>

        {/* 高级设置 */}
        <div className={styles.advancedSettings}>
          <span className={styles.advancedLabel}>高级设置</span>
          <div className={styles.advancedRight}>
            <Select
              defaultValue="5"
              size="small"
              className={styles.advancedSelect}
              suffixIcon={<Iconify icon="mdi:chevron-down" />}
            >
              <Option value="5">P/O</Option>
              <Option value="3">IOC</Option>
              <Option value="4">FOK</Option>
            </Select>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className={styles.submitSection}>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            className={styles.buyBtn}
            block
          >
            {transactionType === 1 ? '买入开多' : '买入平空'}
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            className={styles.sellBtn}
            block
          >
            {transactionType === 2 ? '卖出开空' : '卖出平多'}
          </Button>
        </div>

        {/* 成本显示 */}
        <div className={styles.costSection}>
          <div className={styles.costRow}>
            <span className={styles.costLabel}>成本</span>
            <span className={styles.costValue}>0 USDT</span>
            <span className={styles.costLabel}>成本</span>
            <span className={styles.costValue}>0 USDT</span>
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
  );
};

export default ContractTradingPanel; 