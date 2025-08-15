import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Slider, Tabs } from 'antd';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import styles from './calculator.module.css';
import { CloseOutlined } from '@ant-design/icons';

interface CalculatorModeProps {
  isShow: boolean;
  close: () => void;
  dataInfo?: any;
}

interface FormDataItem {
  title: string;
  units: string;
  fix: number;
  errorText: string | null;
  value: string | null;
  isShow: boolean;
}

interface FormData {
  formData_1: FormDataItem;
  formData_2: FormDataItem;
  formData_3: FormDataItem;
}

const CalculatorMode = observer(({ isShow, close, dataInfo }: CalculatorModeProps) => {
  const [form] = Form.useForm();

  // MobX store access
  const futureStore = appStore.getCurrentContractInfo();

  // 使用传入的 dataInfo 或者从 store 获取数据
  const contractInfo = dataInfo || futureStore;
  const contractId = contractInfo?.id || '';
  const coUnitType = contractInfo?.coUnitType || 1;
  const coUnit = contractInfo?.coUnit || 'BTC';
  const volfix = contractInfo?.volfix || 4;
  const priceUnit = contractInfo?.priceUnit || 'USDT';
  const multiplier = contractInfo?.multiplier || 1;
  const pricefix = contractInfo?.pricefix || 2;
  const publicMarkertInfo = contractInfo?.publicMarkertInfo || {};

  // State definitions
  const [categoryType, setCategoryType] = useState('1');
  const [sideType, setSideType] = useState(1);
  const [leverage, setLeverage] = useState(75);
  const [isClosing, setIsClosing] = useState(false);
  const [openMargin, setOpenMargin] = useState<string>('0 USDT');
  const [revenue, setRevenue] = useState<string>('0 USDT');
  const [returnRate, setReturnRate] = useState<string>('0%');
  const [formData, setFormData] = useState<FormData>({
    formData_1: { title: '开仓价格', units: priceUnit, fix: 8, errorText: null, value: null, isShow: true },
    formData_2: { title: '平仓价格', units: priceUnit, fix: 8, errorText: null, value: null, isShow: true },
    formData_3: { title: '数量', units: coUnit, fix: volfix, errorText: null, value: null, isShow: true },
  });

  // 杠杆标记点
  const leverageMarks = {
    1: '1x',
    25: '25x',
    50: '50x',
    75: '75x',
    100: '100x',
    125: '125x'
  };

  // Tabs 配置
  const tabItems = [
    {
      key: '1',
      label: '收益',
    },
    {
      key: '2',
      label: '平仓价格',
    },
    {
      key: '3',
      label: '强平价格',
    },
  ];

  const initForm = () => {
    setOpenMargin('0 USDT');
    setRevenue('0 USDT');
    setReturnRate('0%');
    setFormData({
      formData_1: { ...formData.formData_1, value: null, errorText: null },
      formData_2: { ...formData.formData_2, value: null, errorText: null },
      formData_3: { ...formData.formData_3, value: null, errorText: null },
    });
    form.resetFields();
  };

  useEffect(() => {
    if (isShow) {
      setIsClosing(false);
      initForm();
      setLeverage(75);
    }
  }, [isShow]);

  if (!isShow) {
    return null;
  }

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      close();
    }, 300);
  };

  const switchType = (type: string, id: number) => {
    if (type === 'sideType') setSideType(id);
    initForm();
  };

  const handleTabChange = (key: string) => {
    setCategoryType(key);
    initForm();
  };

  const changeInput = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: { ...prev[key], value, errorText: value && Number(value) ? null : prev[key].errorText },
    }));
  };

  const formVerify = () => {
    const values = form.getFieldsValue();
    if (!values.formData_1 || !values.formData_2) return false;
    if (categoryType !== '2' && !values.formData_3) return false;
    return true;
  };

  const submit = () => {
    if (!formVerify()) return;
    const values = form.getFieldsValue();
    const openPrice = Number(values.formData_1);
    const closePrice = Number(values.formData_2);
    const volume = coUnitType === 2 ? Number(values.formData_3) * multiplier : Number(values.formData_3);

    if (categoryType === '1') {
      // 计算开仓保证金
      const v1 = contractInfo.contractSide === 1 ? volume * openPrice : volume / openPrice;
      const openMarginValue = v1 / leverage / contractInfo.marginRate;
      setOpenMargin(`${openMarginValue.toFixed(contractInfo.coinResultVo?.marginCoinPrecision || 4)} ${contractInfo?.marginCoin || 'USDT'}`);

      // 计算收益额
      const n2 = contractInfo.contractSide === 1 ? closePrice - openPrice : (1 / closePrice) - (1 / openPrice);
      const n3 = (n2 * volume) / contractInfo.marginRate;
      const revenueValue = sideType === 1 ? n3 : -n3;
      setRevenue(`${revenueValue.toFixed(contractInfo.coinResultVo?.marginCoinPrecision || 4)} ${contractInfo?.marginCoin || 'USDT'}`);

      // 计算回报率
      const returnRateValue = openMarginValue > 0 ? (revenueValue / openMarginValue) * 100 : 0;
      setReturnRate(`${returnRateValue.toFixed(2)}%`);
    }
  };

  return (
    <div className={styles.calculatorMode}>
      <div className={`${styles.calculatorOverlay} ${isClosing ? styles.fadeOut : ''}`} onClick={handleClose} />
      <div className={`${styles.calculatorModeBox} ${isClosing ? styles.slideOut : ''}`}>
        {/* 标题栏 */}
        <div className={styles.calculatorHeader}>
          <h4 className={styles.calculatorTitle}>计算器</h4>
          <Button
            type="text"
            size="small"
            onClick={handleClose}
            icon={<CloseOutlined />}
            className={styles.closeBtn}
          />
        </div>

        {/* 收益/平仓价格/强平价格 切换 - 使用 Ant Design Tabs */}
        <div className={styles.tabBox}>
          <Tabs
            activeKey={categoryType}
            onChange={handleTabChange}
            items={tabItems}
          />
        </div>

        {/* 买入/卖出切换 */}
        <div className={styles.categorySelectBox}>
          <em
            className={styles.tabActiveBg}
            style={{
              left: sideType === 1 ? '0' : '50%',
              backgroundColor: sideType === 1 ? '#00C788' : '#FF4D4F'
            }}
          />
          <span
            className={styles.tab}
            style={{
              color: sideType === 1 ? '#ffffff' : '#6b7280'
            }}
            onClick={() => switchType('sideType', 1)}
          >
            买入开多
          </span>
          <span
            className={styles.tab}
            style={{
              color: sideType === 2 ? '#ffffff' : '#6b7280'
            }}
            onClick={() => switchType('sideType', 2)}
          >
            卖出开空
          </span>
        </div>

        {/* 杠杆滑块 */}
        <div className={styles.leverageSection}>
          <div className={styles.leverageHeader}>
            <span className={styles.leverageLabel}>杠杆</span>
            <span className={styles.leverageValue}>{leverage}x</span>
          </div>
          <Slider
            min={1}
            max={125}
            value={leverage}
            onChange={(value) => setLeverage(value)}
            marks={leverageMarks}
            // className={styles.leverageSlider}
            trackStyle={{ backgroundColor: sideType === 1 ? '#22c55e' : '#ef4444' }}
            handleStyle={{ borderColor: sideType === 1 ? '#22c55e' : '#ef4444' }}
          />
          <div className={styles.maxPosition}>
            当前杠杆最高可持有头寸数 <span className={styles.maxNumber}>0 {coUnit}</span>
          </div>
        </div>

        {/* 表单输入 */}
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues) => {
            Object.keys(changedValues).forEach((key) => changeInput(key as keyof FormData, changedValues[key]));
          }}
        >
          {(Object.keys(formData) as Array<keyof FormData>).map((key) =>
            formData[key].isShow ? (
              <Form.Item
                key={key}
                name={key}
                validateStatus={formData[key].errorText ? 'error' : ''}
                help={formData[key].errorText}
              >
                <Input
                  suffix={formData[key].units}
                  placeholder={formData[key].title}
                  className={styles.calculatorInput}
                />
              </Form.Item>
            ) : null
          )}
        </Form>

        {/* 计算按钮 */}
        <Button
          type="primary"
          shape="round"
          disabled={!formVerify()}
          onClick={submit}
          className={styles.calculateBtn}
        >
          计算
        </Button>

        {/* 计算结果 */}
        <div className={styles.resultSection}>
          <div className={styles.resultTitle}>计算结果</div>
          {categoryType === '1' && (
            <>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>开仓保证金</span>
                <span className={styles.resultValue}>{openMargin}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>收益额</span>
                <span className={styles.resultValue}>{revenue}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>回报率</span>
                <span className={styles.resultValue}>{returnRate}</span>
              </div>
            </>
          )}
          <p className={styles.disclaimer}>
            *计算结果仅供参考，实际操作中可能会因为手续费、资金费率等因素导致结果出现偏差
          </p>
        </div>
      </div>
    </div>
  );
});

export default CalculatorMode;