import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button } from 'antd';
import { observer } from 'mobx-react-lite';
import appStore from '@/store'; // Assuming this is how you access your MobX store
import styles from './calculator.module.css';

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
  const dragStepWrapRef = useRef<HTMLDivElement>(null);
  const dragStepRef = useRef<HTMLSpanElement>(null);

  // 如果不显示则返回 null
  if (!isShow) {
    return null;
  }

  // MobX store access
  const futureStore = appStore.getCurrentContractInfo(); // Adjust based on your store structure
  
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
  const [categoryType, setCategoryType] = useState(1);
  const [sideType, setSideType] = useState(1);
  const [leverage, setLeverage] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [stepPosition, setStepPosition] = useState(1);
  const [inputActiveClass, setInputActiveClass] = useState('a-3-bd');
  const [maxNumber, setMaxNumber] = useState(0);
  const [openMargin, setOpenMargin] = useState<string>('0.0');
  const [revenue, setRevenue] = useState<string>('0.0');
  const [closePrice, setClosePrice] = useState<string | number>('0.0');
  const [forceClosePrice, setForceClosePrice] = useState<string>('0.0');
  const [formData, setFormData] = useState<FormData>({
    formData_1: { title: '开仓价格', units: priceUnit, fix: 8, errorText: null, value: null, isShow: true },
    formData_2: { title: '平仓价格', units: priceUnit, fix: 8, errorText: null, value: null, isShow: true },
    formData_3: { title: '数量', units: coUnit, fix: volfix, errorText: null, value: null, isShow: true },
  });

  // Static text
  const lanText = {
    text1: '计算器',
    text2: '杠杆',
    text3: '当前杠杆最高可持有头寸数',
    text4: '计算',
    text5: '计算结果',
    text6: '开仓保证金',
    text7: '收益额',
    text8: '回报率',
    text9: '平仓价格',
    text10: '无法达到该收益率',
    text11: '强平价格',
    text12: '开仓价格',
    text13: '平仓价格',
    text14: '数量',
    text71: '计算结果仅供参考',
  };

  const categoryTypeList = [
    { id: 1, text: '收益计算' },
    { id: 2, text: '平仓价格' },
    { id: 3, text: '强平价格' },
  ];

  const sideTypeList = [
    { id: 1, text: '买入', classes: sideType === 1 ? 'u-16-cl' : 'b-1-cl b-4-f-h' }, // Placeholder text
    { id: 2, text: '卖出', classes: sideType === 2 ? 'u-16-cl' : 'b-1-cl b-4-f-h' }, // Placeholder text
  ];

  const initForm = () => {
    setOpenMargin('0.0');
    setRevenue('0.0');
    setClosePrice('0.0');
    setForceClosePrice('0.0');
    setFormData({
      formData_1: { ...formData.formData_1, title: lanText.text12, value: null, errorText: null },
      formData_2: { ...formData.formData_2, title: lanText.text13, value: null, errorText: null },
      formData_3: { ...formData.formData_3, title: lanText.text14, value: null, errorText: null },
    });
    form.resetFields();
  };

  useEffect(() => {
    if (isShow) {
      setIsClosing(false);
      initForm();
      setLeverage(20);
    }
  }, [isShow]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      close();
    }, 300);
  };

  const switchType = (type: string, id: number) => {
    if (type === 'categoryType') setCategoryType(id);
    if (type === 'sideType') setSideType(id);
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
    if (categoryType !== 2 && !values.formData_3) return false;
    return true;
  };

  const submit = () => {
    if (!formVerify()) return;
    const values = form.getFieldsValue();
    const openPrice = Number(values.formData_1);
    const value2 = Number(values.formData_2);
    const volume = coUnitType === 2 ? Number(values.formData_3) * multiplier : Number(values.formData_3);

    if (categoryType === 1) {
      const v1 = contractInfo.contractSide === 1 ? volume * openPrice : volume / openPrice;
      const openMarginValue = v1 / leverage / contractInfo.marginRate;
      setOpenMargin(openMarginValue.toFixed(contractInfo.coinResultVo?.marginCoinPrecision || 4));

      const n2 = contractInfo.contractSide === 1 ? value2 - openPrice : (1 / value2) - (1 / openPrice);
      const n3 = (n2 * volume) / contractInfo.marginRate;
      const revenueValue = sideType === 1 ? n3 : -n3;
      setRevenue(revenueValue.toFixed(contractInfo.coinResultVo?.marginCoinPrecision || 4));
    }
  };

  const add = () => {
    if (leverage < 100) setLeverage((prev) => prev + 1);
  };

  const subtract = () => {
    if (leverage > 1) setLeverage((prev) => prev - 1);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const bar = dragStepWrapRef.current;
    const self = dragStepRef.current;
    if (!bar || !self) return;
    
    const leftVal = e.clientX - self.offsetLeft;

    const onMouseMove = (moveEvent: MouseEvent) => {
      let movement = moveEvent.clientX - leftVal;
      movement = Math.max(0, Math.min(movement, bar.offsetWidth));
      const newStepPosition = Math.round((movement / bar.offsetWidth) * 100);
      setStepPosition(newStepPosition < 1 ? 1 : newStepPosition);
      setLeverage(Math.round((newStepPosition < 1 ? 1 : newStepPosition) * (100 / 100)));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className={styles.calculatorMode}>
      <div className={`${styles.calculatorOverlay} ${isClosing ? styles.fadeOut : ''}`} onClick={handleClose} />
      <div className={`${styles.calculatorModeBox} ${isClosing ? styles.slideOut : ''}`}>
        {/* 标题栏和关闭按钮 */}
        <div className={styles.calculatorHeader}>
          <h4 className={styles.calculatorTitle}>{lanText.text1}</h4>
          <Button 
            type="text" 
            size="small" 
            onClick={handleClose}
            icon={<span style={{ fontSize: '16px' }}>×</span>}
            className={styles.closeBtn}
          />
        </div>

        {/* 计算类型切换 */}
        <div className={styles.calculatorTabs}>
          {categoryTypeList.map((item) => (
            <button
              key={item.id}
              onClick={() => switchType('categoryType', item.id)}
              className={`${styles.calculatorTab} ${categoryType === item.id ? styles.calculatorTabActive : ''}`}
            >
              {item.text}
            </button>
          ))}
        </div>
        
        <div className={styles.categorySelectBox}>
          <em
            className={`${styles.tabActiveBg}`}
            style={{ 
              left: sideType === 1 ? '0' : '50%',
              backgroundColor: sideType === 1 ? '#22c55e' : '#ef4444'
            }}
          />
          {sideTypeList.map((item) => (
            <span
              key={item.id}
              className={`${styles.tab}`}
              style={{
                color: sideType === item.id ? '#ffffff' : '#666666'
              }}
              onClick={() => switchType('sideType', item.id)}
            >
              {item.text}
            </span>
          ))}
        </div>
        <div className={`${styles.addAndSub} a-3-bd`} style={{ display: 'none' }}>
          <label className="label">{lanText.text2}</label>
          <div className="content">
            <input
              className="b-1-cl"
              type="text"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              onFocus={() => setInputActiveClass('a-12-bd')}
              onBlur={() => setInputActiveClass('a-3-bd')}
            />
          </div>
          <div className="options">
            <a className="add a-3-bd" onClick={add}><i>+</i></a>
            <a className="sub a-3-bd" onClick={subtract}><i>-</i></a>
          </div>
        </div>
        <div className={`${styles.transactionDrag} b-1-cl`} ref={dragStepWrapRef}>
          <span
            className={`${styles.dragStep} c-8-bd c-8-bg`}
            ref={dragStepRef}
            style={{ left: `${stepPosition}%` }}
            onMouseDown={onMouseDown}
          >
            {leverage > 0 && (
              <div className="value a-5-bg">
                {leverage}X
                <em className="arrow a-5-bg" />
              </div>
            )}
          </span>
          <span className={`${styles.dragDef} b-2-bg`}>
            <em className={`${styles.dragBar} c-8-bg`} style={{ width: `${stepPosition}%` }} />
          </span>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <i
              key={index}
              className={`b-2-bg a-6-bd ${styles[`dragStep${index}`]} ${index * 20 > stepPosition ? 'b-2-bg' : 'c-8-bg'}`}
              style={{ left: `${index === 0 ? 1 : index * 20}%` }}
            >
              <b className="mark">{index === 0 ? '1X' : `${index * 20}X`}</b>
            </i>
          ))}
        </div>
        <div className={styles.maxCanOpen}>
          {lanText.text3} <span className={styles.maxNumber}>{maxNumber}{coUnit}</span>
        </div>
        <Form form={form} onValuesChange={(changedValues) => {
          Object.keys(changedValues).forEach((key) => changeInput(key as keyof FormData, changedValues[key]));
        }}>
          {(Object.keys(formData) as Array<keyof FormData>).map((key) =>
            formData[key].isShow ? (
              <Form.Item
                key={key}
                name={key}
                label={formData[key].title}
                validateStatus={formData[key].errorText ? 'error' : ''}
                help={formData[key].errorText}
              >
                <Input suffix={formData[key].units} />
              </Form.Item>
            ) : null
          )}
        </Form>
        <Button
          style={{ height: '40px', width: '100%', marginTop: '20px' }}
          disabled={!formVerify()}
          onClick={submit}
        >
          {lanText.text4}
        </Button>
        <div className={styles.formInfo}>
          <div className={styles.formInfoTitle}>{lanText.text5}</div>
          {categoryType === 1 && (
            <>
              <div className={styles.infoItem}>
                <p className={styles.text1}>{lanText.text6}</p>
                <p className={styles.text2}>{openMargin} {contractInfo?.marginCoin}</p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.text1}>{lanText.text7}</p>
                <p className={styles.text2}>{revenue} {contractInfo?.marginCoin}</p>
              </div>
            </>
          )}
          {categoryType === 2 && (
            <div className={styles.infoItem}>
              <p className={styles.text1}>{lanText.text9}</p>
              <p className={styles.text2}>
                {closePrice === 'none' ? lanText.text10 : `${closePrice} ${priceUnit}`}
              </p>
            </div>
          )}
          {categoryType === 3 && (
            <div className={styles.infoItem}>
              <p className={styles.text1}>{lanText.text11}</p>
              <p className={styles.text2}>{forceClosePrice} {priceUnit}</p>
            </div>
          )}
          <p className={styles.warningText}>{lanText.text71}</p>
        </div>
      </div>
    </div>
  );
});

export default CalculatorMode;