import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Slider, Tabs, Select, ConfigProvider } from 'antd';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation(['contract']);

  // MobX store access
  const futureStore = appStore.getCurrentContractInfo();

  // 使用传入的 dataInfo 或者从 store 获取数据
  const contractInfo = dataInfo || futureStore;
  const contractId = contractInfo?.id || '';
  const coUnitType = contractInfo?.coUnitType || 1;
  const coUnit = contractInfo?.coUnit || t('tradingSettings.units.sheet');
  const volfix = contractInfo?.volfix || 4;
  const priceUnit = contractInfo?.priceUnit || 'USDT';
  const multiplier = contractInfo?.multiplier || 1;
  const pricefix = contractInfo?.pricefix || 2;
  const publicMarkertInfo = contractInfo?.publicMarkertInfo || {};

  // State definitions
  const [categoryType, setCategoryType] = useState('1');
  const [sideType, setSideType] = useState(1);
  const [leverage, setLeverage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [openMargin, setOpenMargin] = useState<string>('0 USDT');
  const [revenue, setRevenue] = useState<string>('0 USDT');
  const [returnRate, setReturnRate] = useState<string>('0%');
  const [targetReturnRate, setTargetReturnRate] = useState<string>(''); // 目标回报率输入
  const [calculatedClosePrice, setCalculatedClosePrice] = useState<string>('0 USDT'); // 计算出的平仓价格
  const [positionSize, setPositionSize] = useState<string>(''); // 仓位数量
  const [availableBalance, setAvailableBalance] = useState<string>(''); // 可用余额
  const [marginMode, setMarginMode] = useState<1 | 2>(1); // 保证金模式：1全仓，2逐仓
  const [liquidationPrice, setLiquidationPrice] = useState<string>('0 USDT'); // 计算出的强平价格
  const [positionError, setPositionError] = useState<string>(''); // 仓位验证错误信息
  const [formData, setFormData] = useState<FormData>(() => ({
    formData_1: { title: '', units: priceUnit, fix: 8, errorText: null, value: null, isShow: true },
    formData_2: { title: '', units: priceUnit, fix: 8, errorText: null, value: null, isShow: true },
    formData_3: { title: '', units: coUnit, fix: volfix, errorText: null, value: null, isShow: true },
  }));

  // 杠杆标记点
  const leverageMarks = React.useMemo(() => ({
    1: '1x',
    25: '25x',
    50: '50x',
    75: '75x',
    100: '100x',
    125: '125x'
  }), []);

  // Tabs 配置
  const profitTabLabel = t('calculator.profitTab');
  const closePriceTabLabel = t('calculator.closePriceTab');
  const liquidationTabLabel = t('calculator.liquidationTab');
  
  const tabItems = React.useMemo(() => [
    {
      key: '1',
      label: profitTabLabel,
    },
    {
      key: '2',
      label: closePriceTabLabel,
    },
    {
      key: '3',
      label: liquidationTabLabel,
    },
  ], [profitTabLabel, closePriceTabLabel, liquidationTabLabel]);

  const initForm = React.useCallback(() => {
    setOpenMargin('0 USDT');
    setRevenue('0 USDT');
    setReturnRate('0%');
    setTargetReturnRate('');
    setCalculatedClosePrice('0 USDT');
    setPositionSize('');
    setAvailableBalance('');
    setLiquidationPrice('0 USDT');
    setPositionError('');
    setFormData(prev => ({
      formData_1: { ...prev.formData_1, value: null, errorText: null },
      formData_2: { ...prev.formData_2, value: null, errorText: null },
      formData_3: { ...prev.formData_3, value: null, errorText: null },
    }));
    form.resetFields();
  }, [form]);

  useEffect(() => {
    if (isShow) {
      setIsClosing(false);
      initForm();
      setLeverage(1);
    }
  }, [isShow, initForm]);

  // 验证仓位数量是否可行
  const validatePositionSize = React.useCallback((openPrice: number, position: number, balance: number) => {
    if (openPrice <= 0 || position <= 0) return true;

    let maxPosition = 0;
    
    if (contractInfo.contractSide === 1) {
      // 正向合约：最大仓位 = (可用余额 × 杠杆) / (开仓价格 × 面值)
      maxPosition = (balance * leverage) / (openPrice * multiplier);
    } else {
      // 反向合约：最大仓位 = (可用余额 × 杠杆 × 开仓价格) / 面值
      maxPosition = (balance * leverage * openPrice) / multiplier;
    }

    return position <= maxPosition;
  }, [leverage, multiplier, contractInfo.contractSide]);

  // 当语言变化时，更新表单数据的标题
  const openPriceLabel = t('calculator.openPrice');
  const closePriceLabel = t('calculator.closePrice');
  const quantityLabel = t('calculator.quantity');
  
  useEffect(() => {
    setFormData(prev => ({
      formData_1: { ...prev.formData_1, title: openPriceLabel },
      formData_2: { ...prev.formData_2, title: closePriceLabel },
      formData_3: { ...prev.formData_3, title: quantityLabel },
    }));
  }, [openPriceLabel, closePriceLabel, quantityLabel]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      close();
    }, 300);
  };

  const switchType = React.useCallback((type: string, id: number) => {
    if (type === 'sideType') setSideType(id);
    initForm();
  }, [initForm]);

  const handleTabChange = React.useCallback((key: string) => {
    setCategoryType(key);
    initForm();
  }, [initForm]);

  const changeInput = React.useCallback((key: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: { ...prev[key], value, errorText: value && Number(value) ? null : prev[key].errorText },
    }));
  }, []);


  const submit = React.useCallback(() => {
    // 内联表单验证逻辑，避免循环依赖
    const values = form.getFieldsValue();
    let isValid = false;
    
    if (categoryType === '2') {
      // 平仓价格计算只需要开仓价格和目标回报率
      isValid = values.formData_1 && targetReturnRate;
    } else if (categoryType === '3') {
      // 强平价格计算需要开仓价格和仓位数量，全仓还需要可用余额
      const hasBasicFields = values.formData_1 && positionSize;
      if (marginMode === 1) {
        // 全仓模式还需要可用余额
        if (!hasBasicFields || !availableBalance) {
          isValid = false;
        } else {
          isValid = true;
        }
      } else {
        // 逐仓模式只需要基本字段
        isValid = hasBasicFields;
      }
    } else {
      // 其他计算需要开仓价格和平仓价格
      if (!values.formData_1 || !values.formData_2) {
        isValid = false;
      } else if (categoryType !== '2' && !values.formData_3) {
        isValid = false;
      } else {
        isValid = true;
      }
    }
    
    if (!isValid) return;
    const openPrice = Number(values.formData_1);

    if (categoryType === '1') {
      // 收益计算
      const closePrice = Number(values.formData_2);
      const volume = coUnitType === 2 ? Number(values.formData_3) * multiplier : Number(values.formData_3);

      // 计算名义价值和开仓保证金
      let nominalValue = 0;
      let openMarginValue = 0;
      
      if (contractInfo.contractSide === 1) {
        // 正向合约 (如BTCUSDT)
        nominalValue = volume * multiplier * openPrice; // 名义价值 = 数量 × 面值 × 开仓价格
        openMarginValue = nominalValue / leverage; // 保证金 = 名义价值 / 杠杆
      } else {
        // 反向合约 (如BTCUSD) 
        nominalValue = volume * multiplier; // 名义价值 = 数量 × 面值(BTC)
        openMarginValue = nominalValue / (openPrice * leverage); // 保证金 = 名义价值 / (开仓价格 × 杠杆)
      }
      
      setOpenMargin(`${openMarginValue.toFixed(contractInfo.coinResultVo?.marginCoinPrecision || 4)} ${contractInfo?.marginCoin || 'USDT'}`);

      // 计算收益额
      let revenueValue = 0;
      
      if (contractInfo.contractSide === 1) {
        // 正向合约收益 = (平仓价格 - 开仓价格) × 数量 × 面值
        const priceDiff = closePrice - openPrice;
        revenueValue = priceDiff * volume * multiplier;
      } else {
        // 反向合约收益 = 数量 × 面值 × (1/开仓价格 - 1/平仓价格)
        const priceDiff = (1 / openPrice) - (1 / closePrice);
        revenueValue = volume * multiplier * priceDiff;
      }
      
      // 根据做多做空调整收益方向
      if (sideType === 2) { // 做空
        revenueValue = -revenueValue;
      }
      
      setRevenue(`${revenueValue.toFixed(contractInfo.coinResultVo?.marginCoinPrecision || 4)} ${contractInfo?.marginCoin || 'USDT'}`);

      // 计算回报率 = (收益 / 保证金) × 100%
      const returnRateValue = openMarginValue > 0 ? (revenueValue / openMarginValue) * 100 : 0;
      setReturnRate(`${returnRateValue.toFixed(2)}%`);
    } else if (categoryType === '2') {
      // 平仓价格计算
      const targetRate = Number(targetReturnRate) / 100;

      if (openPrice > 0 && targetRate !== 0) {
        let closePriceValue = 0;

        if (contractInfo.contractSide === 1) {
          // 正向合约 (如BTCUSDT)
          if (sideType === 1) {
            // 做多：平仓价格 = 开仓价格 × (1 + 目标回报率 / 杠杆)
            closePriceValue = openPrice * (1 + targetRate / leverage);
          } else {
            // 做空：平仓价格 = 开仓价格 × (1 - 目标回报率 / 杠杆)
            closePriceValue = openPrice * (1 - targetRate / leverage);
          }
        } else {
          // 反向合约 (如BTCUSD)
          if (sideType === 1) {
            // 做多：平仓价格 = 1 / (1/开仓价格 + 目标回报率/(杠杆×开仓价格))
            closePriceValue = 1 / (1 / openPrice + targetRate / (leverage * openPrice));
          } else {
            // 做空：平仓价格 = 1 / (1/开仓价格 - 目标回报率/(杠杆×开仓价格))
            closePriceValue = 1 / (1 / openPrice - targetRate / (leverage * openPrice));
          }
        }

        // 检查计算结果是否有效
        if (closePriceValue > 0 && isFinite(closePriceValue)) {
          setCalculatedClosePrice(`${closePriceValue.toFixed(pricefix)} ${priceUnit}`);
        } else {
          setCalculatedClosePrice(t('calculator.cannotAchieveReturn'));
        }
      }
    } else if (categoryType === '3') {
      // 强平价格计算
      const position = Number(positionSize);
      const balance = marginMode === 1 ? Number(availableBalance) : 0;

      if (openPrice > 0 && position > 0) {
        // 全仓模式下检查可用余额是否足够开仓
        if (marginMode === 1) {
          const requiredMargin = contractInfo.contractSide === 1 
            ? (position * multiplier * openPrice) / leverage  // 正向合约
            : (position * multiplier) / (openPrice * leverage); // 反向合约
          
          if (balance < requiredMargin) {
            setLiquidationPrice(t('calculator.insufficientBalance') || '可用余额不足以开仓');
            return;
          }
        }

        let liquidationPriceValue = 0;

        // 确保维持保证金率有合理的值，通常在0.5%-5%之间
        let maintenanceMarginRate = contractInfo.marginRate;
        if (typeof maintenanceMarginRate !== 'number' || maintenanceMarginRate <= 0 || maintenanceMarginRate >= 1) {
          maintenanceMarginRate = 0.01; // 默认1%维持保证金率
        }

        // 调试信息
        console.log('强平价格计算调试信息:', {
          openPrice,
          position,
          leverage,
          maintenanceMarginRate,
          marginMode,
          sideType,
          contractSide: contractInfo.contractSide,
          originalMarginRate: contractInfo.marginRate,
          contractInfo: contractInfo
        });

        if (contractInfo.contractSide === 1) {
          // 正向合约 (如BTCUSDT)
          if (marginMode === 2) {
            // 逐仓模式
            // 检查杠杆是否足够大以支持强平价格计算
            // 当杠杆小于等于1时，理论上不会强平（1倍杠杆相当于现货）
            if (leverage <= 1) {
              // 当杠杆小于等于1时，理论上不会强平
              liquidationPriceValue = 0;
              console.log('逐仓模式警告:', {
                message: '杠杆倍数过低，理论上不会触发强平',
                leverage,
                maintenanceMarginRate,
                condition: `leverage (${leverage}) <= 1`
              });
            } else {
              if (sideType === 1) {
                // 做多逐仓：强平价格 = 开仓价格 × (1 - (1 - 维持保证金率) / 杠杆)
                const factor = (1 - maintenanceMarginRate) / leverage;
                liquidationPriceValue = openPrice * (1 - factor);
                console.log('做多逐仓计算:', { 
                  factor, 
                  result: liquidationPriceValue,
                  calculation: `${openPrice} * (1 - ${factor}) = ${liquidationPriceValue}`,
                  step1: `(1 - ${maintenanceMarginRate}) / ${leverage} = ${factor}`,
                  step2: `1 - ${factor} = ${1 - factor}`,
                  step3: `${openPrice} * ${1 - factor} = ${liquidationPriceValue}`
                });
              } else {
                // 做空逐仓：强平价格 = 开仓价格 × (1 + (1 - 维持保证金率) / 杠杆)
                const factor = (1 - maintenanceMarginRate) / leverage;
                liquidationPriceValue = openPrice * (1 + factor);
                console.log('做空逐仓计算:', { 
                  factor, 
                  result: liquidationPriceValue,
                  calculation: `${openPrice} * (1 + ${factor}) = ${liquidationPriceValue}`,
                  step1: `(1 - ${maintenanceMarginRate}) / ${leverage} = ${factor}`,
                  step2: `1 + ${factor} = ${1 + factor}`,
                  step3: `${openPrice} * ${1 + factor} = ${liquidationPriceValue}`
                });
              }
            }
          } else {
            // 全仓模式
            const positionMargin = (position * multiplier * openPrice) / leverage;
            const totalMargin = positionMargin + balance;
            
            if (sideType === 1) {
              // 做多全仓：当账户权益不足以维持仓位时强平
              // 强平条件：总权益 = 维持保证金
              // 总权益 = 总保证金 + 未实现盈亏
              // 维持保证金 = 强平价格 × 数量 × 面值 × 维持保证金率
              // 设强平价格为 P，则：totalMargin + (P - openPrice) × position × multiplier = P × position × multiplier × maintenanceMarginRate
              // 解得：P = (totalMargin + openPrice × position × multiplier) / (position × multiplier × (1 + maintenanceMarginRate))
              liquidationPriceValue = (totalMargin + openPrice * position * multiplier) / (position * multiplier * (1 + maintenanceMarginRate));
            } else {
              // 做空全仓
              // 强平条件：总权益 = 维持保证金
              // 总权益 = 总保证金 + 未实现盈亏
              // 维持保证金 = 强平价格 × 数量 × 面值 × 维持保证金率
              // 设强平价格为 P，则：totalMargin + (openPrice - P) × position × multiplier = P × position × multiplier × maintenanceMarginRate
              // 解得：P = (totalMargin + openPrice × position × multiplier) / (position × multiplier × (1 - maintenanceMarginRate))
              liquidationPriceValue = (totalMargin + openPrice * position * multiplier) / (position * multiplier * (1 - maintenanceMarginRate));
            }
          }
        } else {
          // 反向合约 (如BTCUSD)
          if (marginMode === 2) {
            // 逐仓模式
            // 检查杠杆是否足够大以支持强平价格计算
            // 当杠杆小于等于1时，理论上不会强平（1倍杠杆相当于现货）
            if (leverage <= 1) {
              // 当杠杆小于等于1时，理论上不会强平
              liquidationPriceValue = 0;
              console.log('反向合约逐仓模式警告:', {
                message: '杠杆倍数过低，理论上不会触发强平',
                leverage,
                maintenanceMarginRate,
                condition: `leverage (${leverage}) <= 1`
              });
            } else {
              if (sideType === 1) {
                // 做多逐仓
                liquidationPriceValue = 1 / ((1 / openPrice) + (1 - maintenanceMarginRate) / (leverage * openPrice));
                console.log('反向合约做多逐仓计算:', {
                  result: liquidationPriceValue,
                  calculation: `1 / ((1 / ${openPrice}) + (1 - ${maintenanceMarginRate}) / (${leverage} * ${openPrice})) = ${liquidationPriceValue}`
                });
              } else {
                // 做空逐仓
                liquidationPriceValue = 1 / ((1 / openPrice) - (1 - maintenanceMarginRate) / (leverage * openPrice));
                console.log('反向合约做空逐仓计算:', {
                  result: liquidationPriceValue,
                  calculation: `1 / ((1 / ${openPrice}) - (1 - ${maintenanceMarginRate}) / (${leverage} * ${openPrice})) = ${liquidationPriceValue}`
                });
              }
            }
          } else {
            // 全仓模式
            const positionValue = position * multiplier; // 面值数量
            const positionMargin = positionValue / (openPrice * leverage);
            const totalMargin = positionMargin + balance;
            
            if (sideType === 1) {
              // 做多全仓
              // 强平条件：总权益 = 维持保证金
              // 总权益 = 总保证金 + 未实现盈亏
              // 维持保证金 = 面值数量 × 维持保证金率 / 强平价格
              // 设强平价格为 P，则：totalMargin + positionValue × (1/openPrice - 1/P) = positionValue × maintenanceMarginRate / P
              // 解得：1/P = (1/openPrice) + (totalMargin - positionValue × maintenanceMarginRate) / positionValue
              // 即：P = 1 / ((1/openPrice) + (totalMargin - positionValue × maintenanceMarginRate) / positionValue)
              liquidationPriceValue = 1 / ((1 / openPrice) + (totalMargin - positionValue * maintenanceMarginRate) / positionValue);
            } else {
              // 做空全仓
              // 强平条件：总权益 = 维持保证金
              // 总权益 = 总保证金 + 未实现盈亏
              // 维持保证金 = 面值数量 × 维持保证金率 / 强平价格
              // 设强平价格为 P，则：totalMargin + positionValue × (1/P - 1/openPrice) = positionValue × maintenanceMarginRate / P
              // 解得：1/P = (1/openPrice) - (totalMargin - positionValue × maintenanceMarginRate) / positionValue
              // 即：P = 1 / ((1/openPrice) - (totalMargin - positionValue × maintenanceMarginRate) / positionValue)
              liquidationPriceValue = 1 / ((1 / openPrice) - (totalMargin - positionValue * maintenanceMarginRate) / positionValue);
            }
          }
        }

        // 确保强平价格为正数且合理
        if (liquidationPriceValue > 0 && isFinite(liquidationPriceValue)) {
          setLiquidationPrice(`${liquidationPriceValue.toFixed(pricefix)} ${priceUnit}`);
        } else if (liquidationPriceValue === 0) {
          setLiquidationPrice(t('calculator.noLiquidationRisk') || '无强平风险');
        } else {
          setLiquidationPrice(t('calculator.noLiquidation'));
        }
      }
    }
  }, [form, categoryType, sideType, leverage, coUnitType, multiplier, contractInfo, pricefix, priceUnit, t, targetReturnRate, positionSize, availableBalance, marginMode]);

  // 计算按钮禁用状态，避免循环依赖
  const isButtonDisabled = React.useMemo(() => {
    const values = form.getFieldsValue();
    if (categoryType === '2') {
      // 平仓价格计算只需要开仓价格和目标回报率
      return !(values.formData_1 && targetReturnRate);
    }
    if (categoryType === '3') {
      // 强平价格计算需要开仓价格和仓位数量，全仓还需要可用余额
      const hasBasicFields = values.formData_1 && positionSize;
      if (marginMode === 1) {
        // 全仓模式还需要可用余额
        return !(hasBasicFields && availableBalance);
      }
      // 逐仓模式只需要基本字段
      return !hasBasicFields;
    }
    // 其他计算需要开仓价格和平仓价格
    if (!values.formData_1 || !values.formData_2) return true;
    if (categoryType !== '2' && !values.formData_3) return true;
    return false;
  }, [form, categoryType, targetReturnRate, positionSize, marginMode, availableBalance]);

  if (!isShow) {
    return null;
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Select: {
            borderRadius: 8,
            controlHeight: 48,
            fontSize: 14,
            colorBorder: '#d9d9d9',
            optionSelectedBg: '#e6f4ff',
            controlPaddingHorizontal: 16,
            boxShadow: 'none',
            boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      }}
    >
      <div className={styles.calculatorMode}>
        <div className={`${styles.calculatorOverlay} ${isClosing ? styles.fadeOut : ''}`} onClick={handleClose} />
        <div className={`${styles.calculatorModeBox} ${isClosing ? styles.slideOut : ''}`}>
          {/* 标题栏 */}
          <div className={styles.calculatorHeader}>
            <h4 className={styles.calculatorTitle}>{t('calculator.title')}</h4>
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

          {/* 强平价格保证金模式选择 */}
          {categoryType === '3' && (
            <div style={{ marginBottom: '20px' }}>
              <Select
                value={marginMode}
                onChange={(value) => setMarginMode(value)}
                style={{ width: '100px', height: '44px', marginLeft: '20px' }}
                options={[
                  { value: 1, label: t('calculator.crossMargin') },
                  { value: 2, label: t('calculator.isolatedMargin') }
                ]}
                placeholder={t('calculator.selectMarginMode')}
              />
            </div>
          )}

          {/* 买入/卖出切换 */}
          <div className={styles.categorySelectBox}
          style={{ borderColor: sideType === 1 ? '#00C788' : '#FF4D4F' }}
          >
            <em
              className={styles.tabActiveBg}
              style={{
                left: sideType === 1 ? '4px' : 'calc(50% + 2px)',
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
              {t('calculator.buyLong')}
            </span>
            <span
              className={styles.tab}
              style={{
                color: sideType === 2 ? '#ffffff' : '#6b7280'
              }}
              onClick={() => switchType('sideType', 2)}
            >
              {t('calculator.sellShort')}
            </span>
          </div>

          {/* 杠杆滑块 */}
          <div className={styles.leverageSection}>
            <Slider
              min={1}
              max={125}
              value={leverage}
              onChange={(value) => setLeverage(value)}
              marks={leverageMarks}
            />
            {/* <div className={styles.maxPosition}>
              {t('calculator.maxPosition')} <span className={styles.maxNumber}>0 {coUnit}</span>
            </div> */}
          </div>

          {/* 表单输入 */}
          <Form
            form={form}
            layout="vertical"
            onValuesChange={(changedValues) => {
              Object.keys(changedValues).forEach((key) => changeInput(key as keyof FormData, changedValues[key]));
            }}
          >
            {categoryType === '2' ? (
              // 平仓价格计算表单
              <>
                <Form.Item
                  name="formData_1"
                  validateStatus={formData.formData_1.errorText ? 'error' : ''}
                  help={formData.formData_1.errorText}
                >
                  <Input
                    suffix={priceUnit}
                    placeholder={t('calculator.openPrice')}
                    className={styles.calculatorInput}
                  />
                </Form.Item>
                <Form.Item name="returnRate">
                  <Input
                    suffix="%"
                    placeholder={t('calculator.targetReturnRate')}
                    className={styles.calculatorInput}
                    value={targetReturnRate}
                    onChange={(e) => setTargetReturnRate(e.target.value)}
                  />
                </Form.Item>
              </>
            ) : categoryType === '3' ? (
              // 强平价格计算表单
              <>
                <Form.Item
                  name="formData_1"
                  validateStatus={formData.formData_1.errorText ? 'error' : ''}
                  help={formData.formData_1.errorText}
                >
                  <Input
                    suffix={priceUnit}
                    placeholder={t('calculator.openPrice')}
                    className={styles.calculatorInput}
                  />
                </Form.Item>
                <Form.Item 
                  name="positionSize"
                  validateStatus={positionError ? 'error' : ''}
                  help={positionError}
                >
                  <Input
                    suffix={coUnit}
                    placeholder={t('calculator.positionSize')}
                    className={styles.calculatorInput}
                    value={positionSize}
                    onChange={(e) => {
                      setPositionSize(e.target.value);
                      setPositionError(''); // 输入时清除错误信息
                    }}
                  />
                </Form.Item>
                {marginMode === 1 && (
                  <Form.Item name="availableBalance">
                    <Input
                      suffix={contractInfo?.marginCoin}
                      placeholder={t('calculator.availableBalance')}
                      className={styles.calculatorInput}
                      value={availableBalance}
                      onChange={(e) => setAvailableBalance(e.target.value)}
                    />
                  </Form.Item>
                )}
              </>
            ) : (
              // 其他计算的原始表单
              (Object.keys(formData) as Array<keyof FormData>).map((key) =>
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
              )
            )}
          </Form>

          {/* 计算按钮 */}
          <Button
            type="primary"
            shape="round"
            disabled={isButtonDisabled}
            onClick={submit}
            className={styles.calculateBtn}
            style={{
              marginBottom:'20px'
            }}
          >
            {t('calculator.calculate')}
          </Button>

          {/* 计算结果 */}
          <div className={styles.resultSection}>
            <div className={styles.resultTitle}>{t('calculator.result')}</div>
            {categoryType === '1' && (
              // 收益计算结果
              <>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>{t('calculator.openMargin')}</span>
                  <span className={styles.resultValue}>{openMargin}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>{t('calculator.profit')}</span>
                  <span className={styles.resultValue}>{revenue}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>{t('calculator.returnRate')}</span>
                  <span className={styles.resultValue}>{returnRate}</span>
                </div>
              </>
            )}
            {categoryType === '2' && (
              // 平仓价格计算结果
              <>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>{t('calculator.closePrice')}</span>
                  <span className={styles.resultValue}>{calculatedClosePrice}</span>
                </div>
              </>
            )}
            {categoryType === '3' && (
              // 强平价格计算结果
              <>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>{t('calculator.liquidationPrice')}</span>
                  <span className={styles.resultValue}>{liquidationPrice}</span>
                </div>
              </>
            )}
            <p className={styles.disclaimer}>
              {t('calculator.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
});

export default CalculatorMode;