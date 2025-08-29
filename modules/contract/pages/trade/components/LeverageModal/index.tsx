import React, { useState, useEffect } from 'react';
import { Modal, Button, Slider, InputNumber } from 'antd';
import { useTranslation } from 'next-i18next';
import { Iconify } from '@/components/icon';
import styles from './styles.module.css';
import appStore from '@/store';
import { levelEdit } from '@/services/contract';
import { useUserConfig } from "@/hooks/useUserConfig";
import { toast } from 'sonner';

interface LeverageModalProps {
  visible: boolean;
  onClose: () => void;
  currentLeverage: number;
  onLeverageChange: (leverage: number) => void;
  symbol?: string;
  positionLimit?: number;
}

const LeverageModal: React.FC<LeverageModalProps> = ({
  visible,
  onClose,
  currentLeverage,
  onLeverageChange,
  symbol = 'BTCUSDT',
  positionLimit = 0
}) => {
  const { t } = useTranslation(['contract']);
  const [tempLeverage, setTempLeverage] = useState(currentLeverage);
  const [lastValidLimitValue, setLastValidLimitValue] = useState<number | null>(null);
  const ContractInfo = appStore.currentContractInfo;
  console.log('ContractInfo',ContractInfo)
  const maxLeverage = ContractInfo.maxLever;


  const { loadUserConfig } = useUserConfig();
  const currentUserConfig = appStore.getUserConfig();

  const handleSliderChange = (value: number) => {
    setTempLeverage(value);
  };

  const handleInputChange = (value: number | null) => {
    if (value && value >= 1 && value <= maxLeverage) {
      setTempLeverage(value);
    }
  };

  // 初始化最后有效值
  useEffect(() => {
    const initialValue = currentUserConfig.leverCeiling?.[currentLeverage];
    if (initialValue !== undefined && initialValue !== null && lastValidLimitValue === null) {
      setLastValidLimitValue(initialValue);
    }
  }, [currentUserConfig.leverCeiling, currentLeverage, lastValidLimitValue]);

  // 获取要显示的持仓上限值
  const getDisplayLimitValue = () => {
    const currentValue = currentUserConfig.leverCeiling?.[tempLeverage];
    if (currentValue !== undefined && currentValue !== null) {
      // 如果当前杠杆有对应值，更新最后有效值并返回当前值
      if (lastValidLimitValue !== currentValue) {
        setLastValidLimitValue(currentValue);
      }
      return currentValue;
    } else {
      // 如果当前杠杆没有值，返回最后有效值
      return lastValidLimitValue !== null ? lastValidLimitValue : (currentUserConfig.leverCeiling?.[currentLeverage] ?? '');
    }
  };

  const handleConfirm = async () => {
    try {
      const res = await levelEdit({
        contractId: ContractInfo.id,
        nowLevel: tempLeverage,
      });

      if (res.code === '0') {
        toast.success(t('leverageModal.settingSuccess'));

        // 立即更新 store 中的 userConfig.nowLevel，确保 UI 立即响应
       
        appStore.setUserConfig({
          ...currentUserConfig,
          nowLevel: tempLeverage
        });

        // 先通知父组件杠杆值变化
        onLeverageChange(tempLeverage);

        // 异步重新获取用户配置，确保数据同步
        await loadUserConfig();

        // 最后关闭模态框
        onClose();
      } else {
        toast.error(res.message || t('leverageModal.settingFailed'));
      }
    } catch (error) {
      console.error('杠杆设置失败:', error);
      toast.error(t('leverageModal.settingFailedRetry'));
    }
  };


  // 创建slider的marks
  const marks = {
    1: '1x',
    25: '25x',
    50: '50x',
    75: '75x',
    100: '100x',
    125: '125x'
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={420}
      className={styles.leverageModal}
      closeIcon={<Iconify icon="mdi:close" className={styles.closeIcon} />}
    >
      <div className={styles.modalContent}>
        {/* 标题 */}
        <div className={styles.title}>
          {symbol} {t('leverageModal.contractLeverage')}
        </div>

        {/* 当前持仓支持杠杆范围 */}
        <div className={styles.supportRange}>
          {t('leverageModal.supportRange', { min: 1, max: maxLeverage })}
        </div>

        {/* 杠杆输入区域 */}
        <div className={styles.leverageInputSection}>

          <InputNumber
            value={tempLeverage}
            onChange={handleInputChange}
            min={1}
            max={maxLeverage}
            className={styles.leverageInputNumber}
          />
        </div>

        {/* 杠杆滑块 */}
        <div className={styles.sliderSection}>
          <Slider
            min={1}
            max={maxLeverage}
            marks={marks}
            step={1}
            value={tempLeverage}
            onChange={handleSliderChange}
            className={styles.leverageSlider}
            tooltip={{ open: false }}
          />
        </div>

        {/* 风险提示 */}
        <div className={styles.riskWarning}>
          {t('leverageModal.riskWarning')}
        </div>

        {/* 持仓上限 */}
        <div className={styles.positionLimit}>
          <span className={styles.limitLabel}>{t('leverageModal.positionLimit')}</span>
          <span className={styles.limitValue}>{getDisplayLimitValue()}USDT</span>
        </div>

        {/* 确认按钮 */}
        <Button
          type="primary"
          size="large"
          shape='round'
          onClick={handleConfirm}
          className={styles.confirmButton}
          block
        >
          {t('leverageModal.confirm')}
        </Button>
      </div>
    </Modal>
  );
};

export default LeverageModal; 