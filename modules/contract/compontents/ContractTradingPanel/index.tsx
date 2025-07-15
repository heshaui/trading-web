import React, { useState, useEffect } from 'react';
import { Button, Input, InputNumber, Slider, Select, Switch, Tabs, Form, Space, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { Iconify } from '@/components/icon';
import MarginModeModal from '../MarginModeModal/index';
import LeverageModal from '../LeverageModal/index';
import OrderSettingsModal from '../OrderSettingsModal/index';
import TradingSettingsDrawer from '../TradingSettingsDrawer/index';
import styles from './styles.module.css';

const { Option } = Select;

interface ContractTradingPanelProps {
  symbol?: string;
  lastPrice?: number;
  availableBalance?: number;
  onOrderSubmit?: (orderData: any) => void;
}

const ContractTradingPanel: React.FC<ContractTradingPanelProps> = ({
  symbol = 'BTCUSDT',
  lastPrice = 108330.8,
  availableBalance = 0,
  onOrderSubmit
}) => {
  const { t } = useTranslation(['contract']);
  const [form] = Form.useForm();
  
  // 状态管理
  const [orderType, setOrderType] = useState<'limit' | 'market' | 'condition'>('limit');
  const [positionSide, setPositionSide] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState(5);
  const [price, setPrice] = useState(lastPrice);
  const [quantity, setQuantity] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [enableTPSL, setEnableTPSL] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState(0);
  const [stopLossPrice, setStopLossPrice] = useState(0);
  const [marginMode, setMarginMode] = useState<'cross' | 'isolated'>('cross');
  const [showMarginModeModal, setShowMarginModeModal] = useState(false);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showOrderSettingsModal, setShowOrderSettingsModal] = useState(false);
  const [showTradingSettingsDrawer, setShowTradingSettingsDrawer] = useState(false);
  const [orderUnit, setOrderUnit] = useState<'BTC' | 'USDT' | '张'>('BTC');

  // 计算可买/可卖数量
  const calculateMaxQuantity = () => {
    if (orderType === 'market') {
      return availableBalance * leverage / lastPrice;
    }
    return availableBalance * leverage / price;
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
    const orderData = {
      symbol,
      side: positionSide,
      type: orderType,
      quantity,
      price: orderType === 'market' ? undefined : price,
      leverage,
      marginMode,
      takeProfit: enableTPSL ? takeProfitPrice : undefined,
      stopLoss: enableTPSL ? stopLossPrice : undefined,
    };
    
    onOrderSubmit?.(orderData);
  };

  // 处理保证金模式变更
  const handleMarginModeChange = (mode: 'cross' | 'isolated') => {
    setMarginMode(mode);
  };

  // 处理杠杆变更
  const handleLeverageChange = (newLeverage: number) => {
    setLeverage(newLeverage);
  };

  // 处理下单单位变更
  const handleOrderUnitChange = (unit: 'BTC' | 'USDT' | '张') => {
    setOrderUnit(unit);
  };

  // 订单类型标签
  const orderTypeTabs = [
    { key: 'limit', label: '限价' },
    { key: 'market', label: '市价' },
    { key: 'condition', label: '条件' },
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
            {marginMode === 'cross' ? '全仓' : '逐仓'}
          </Button>
          <Button
            type="text"
            size="small"
            className={styles.leverageBtn}
            onClick={() => setShowLeverageModal(true)}
          >
            {leverage}x
          </Button>
        </div>
        
        <div className={styles.toolbarIcons}>
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
          <div className={`${styles.toggleSlider} ${positionSide === 'short' ? styles.toggleSliderRight : ''}`} />
          <Button
            type="text"
            onClick={() => setPositionSide('long')}
            className={`${styles.toggleBtn} ${positionSide === 'long' ? styles.toggleBtnActive : ''}`}
          >
            开仓
          </Button>
          <Button
            type="text"
            onClick={() => setPositionSide('short')}
            className={`${styles.toggleBtn} ${positionSide === 'short' ? styles.toggleBtnActive : ''}`}
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
              onClick={() => setOrderType(tab.key as any)}
              className={`${styles.tabItem} ${orderType === tab.key ? styles.tabItemActive : ''}`}
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
          <Iconify icon="mdi:swap-horizontal" className={styles.swapIcon} />
        </span>
      </div>

      <Form form={form} layout="vertical" className={styles.orderForm}>
        {/* 委托价格 (限价单显示) */}
        {orderType === 'limit' && (
          <Form.Item className={styles.formItem}>
            <div className={styles.inputWrapper}>
              <span className={styles.inputLabel}>委托价格</span>
              <div className={styles.inputGroup}>
                <Input
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  placeholder="价格"
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
            <span className={styles.inputLabel}>委托数量</span>
            <div className={styles.inputGroup}>
              <Input
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                placeholder="数量"
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
            <span className={styles.buyLabel}>可买</span>
            <span className={styles.buyValue}>0 USDT</span>
            <span className={styles.sellLabel}>可卖</span>
            <span className={styles.sellValue}>0 USDT</span>
          </div>
        </div>

        {/* 止盈止损 */}
        <div className={styles.tpslSection}>
          <div className={styles.tpslHeader}>
            <Switch
              checked={enableTPSL}
              onChange={setEnableTPSL}
              size="small"
              className={styles.tpslSwitch}
            />
            <span className={styles.tpslLabel}>止盈止损</span>
          </div>
          
          {/* 止盈止损输入框 */}
          {enableTPSL && (
            <div className={styles.tpslInputs}>
              <div className={styles.tpslInputRow}>
                <span className={styles.tpslInputLabel}>止盈触发价</span>
                <Input
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(Number(e.target.value) || 0)}
                  placeholder="止盈触发价"
                  className={styles.tpslInput}
                  suffix="USDT"
                />
              </div>
              <div className={styles.tpslInputRow}>
                <span className={styles.tpslInputLabel}>止损触发价</span>
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
              defaultValue="GTC"
              size="small"
              className={styles.advancedSelect}
              suffixIcon={<Iconify icon="mdi:chevron-down" />}
            >
              <Option value="GTC">GTC</Option>
              <Option value="IOC">IOC</Option>
              <Option value="FOK">FOK</Option>
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
            {positionSide === 'long' ? '买入开多' : '买入平空'}
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            className={styles.sellBtn}
            block
          >
            {positionSide === 'long' ? '卖出开空' : '卖出平多'}
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
        currentMode={marginMode}
        onModeChange={handleMarginModeChange}
        symbol={symbol}
      />

      {/* 杠杆设置弹框 */}
      <LeverageModal
        visible={showLeverageModal}
        onClose={() => setShowLeverageModal(false)}
        currentLeverage={leverage}
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
    </div>
  );
};

export default ContractTradingPanel; 