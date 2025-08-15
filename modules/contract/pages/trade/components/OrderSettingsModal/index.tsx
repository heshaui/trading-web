import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { Iconify } from '@/components/icon';
import styles from './styles.module.css';

interface OrderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  currentUnit: 'BTC' | 'USDT' | '张';
  onUnitChange: (unit: 'BTC' | 'USDT' | '张') => void;
}

const OrderSettingsModal: React.FC<OrderSettingsModalProps> = ({
  visible,
  onClose,
  currentUnit,
  onUnitChange
}) => {
  const [selectedUnit, setSelectedUnit] = useState(currentUnit);

  // 当弹框打开时，重置选中的单位
  React.useEffect(() => {
    if (visible) {
      setSelectedUnit(currentUnit);
    }
  }, [visible, currentUnit]);

  const handleConfirm = () => {
    onUnitChange(selectedUnit);
    onClose();
  };

  const orderUnits = [
    { key: 'BTC', label: '按数量下单', unit: 'BTC', selected: selectedUnit === 'BTC' },
    { key: '张', label: '按数量下单', unit: '张', selected: selectedUnit === '张' },
    { key: 'USDT', label: '按价值下单', unit: 'USDT', selected: selectedUnit === 'USDT' }
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      className={styles.orderSettingsModal}
      closeIcon={<Iconify icon="mdi:close" />}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>下单设置</h3>
        </div>

        <div className={styles.unitOptions}>
          {orderUnits.map(option => (
            <div 
              key={option.key}
              className={`${styles.unitOption} ${option.selected ? styles.selectedUnit : ''}`}
              onClick={() => setSelectedUnit(option.key as any)}
            >
              <div className={styles.unitContent}>
                <div className={styles.unitInfo}>
                  <span className={styles.unitLabel}>{option.label}</span>
                  <span className={styles.unitValue}>{option.unit}</span>
                </div>
                {option.selected && (
                  <div className={styles.selectedIndicator}>
                    <div className={styles.cornerTriangle} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.confirmButton}>
          <Button
            type="primary"
            size="large"
            onClick={handleConfirm}
            className={styles.confirmBtn}
            block
          >
            确定
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderSettingsModal; 