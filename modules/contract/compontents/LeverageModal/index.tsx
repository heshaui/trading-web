import React, { useState } from 'react';
import { Modal, Button, Slider, InputNumber } from 'antd';
import { Iconify } from '@/components/icon';
import styles from './styles.module.css';

interface LeverageModalProps {
  visible: boolean;
  onClose: () => void;
  currentLeverage: number;
  onLeverageChange: (leverage: number) => void;
  symbol?: string;
  maxLeverage?: number;
  positionLimit?: number;
}

const LeverageModal: React.FC<LeverageModalProps> = ({
  visible,
  onClose,
  currentLeverage,
  onLeverageChange,
  symbol = 'BTCUSDT',
  maxLeverage = 125,
  positionLimit = 815.4018
}) => {
  const [tempLeverage, setTempLeverage] = useState(currentLeverage);

  // 当弹框打开时，重置临时杠杆值
  React.useEffect(() => {
    if (visible) {
      setTempLeverage(currentLeverage);
    }
  }, [visible, currentLeverage]);

  const handleConfirm = () => {
    onLeverageChange(tempLeverage);
    onClose();
  };

  const handleSliderChange = (value: number) => {
    setTempLeverage(value);
  };

  const handleInputChange = (value: number | null) => {
    if (value && value >= 1 && value <= maxLeverage) {
      setTempLeverage(value);
    }
  };

  // 预设杠杆倍数
  const leveragePresets = [1, 25, 50, 75, 100, 125];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      className={styles.leverageModal}
      closeIcon={<Iconify icon="mdi:close" />}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{symbol} 合约杠杆</h3>
        </div>

        <div className={styles.leverageInfo}>
          <div className={styles.infoText}>
            当前持仓支持杠杆范围 [1,{maxLeverage}]
          </div>
        </div>

        <div className={styles.leverageInputSection}>
          <div className={styles.leverageDisplay}>
            <InputNumber
              value={tempLeverage}
              onChange={handleInputChange}
              min={1}
              max={maxLeverage}
              className={styles.leverageInput}
              controls={{
                upIcon: <Iconify icon="mdi:chevron-up" />,
                downIcon: <Iconify icon="mdi:chevron-down" />
              }}
            />
            <span className={styles.leverageUnit}>x</span>
          </div>
        </div>

        <div className={styles.sliderSection}>
          <Slider
            value={tempLeverage}
            onChange={handleSliderChange}
            min={1}
            max={maxLeverage}
            step={1}
            className={styles.leverageSlider}
            tooltip={{ formatter: (value) => `${value}x` }}
            marks={{
              1: '',
              25: '',
              50: '',
              75: '',
              100: '',
              125: ''
            }}
          />
          
          <div className={styles.presetButtons}>
            {leveragePresets.map(preset => (
              <button
                key={preset}
                onClick={() => setTempLeverage(preset)}
                className={`${styles.presetBtn} ${tempLeverage === preset ? styles.activePreset : ''}`}
              >
                {preset}x
              </button>
            ))}
          </div>
        </div>

        <div className={styles.positionInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>持仓上限</span>
            <span className={styles.infoValue}>{positionLimit} BTC</span>
          </div>
        </div>

        <div className={styles.actionButton}>
          <Button
            type="primary"
            size="large"
            onClick={handleConfirm}
            className={styles.confirmButton}
            block
          >
            确认
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LeverageModal; 