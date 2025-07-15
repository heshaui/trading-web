import React from 'react';
import { Modal, Button } from 'antd';
import { Iconify } from '@/components/icon';
import styles from './styles.module.css';

interface MarginModeModalProps {
  visible: boolean;
  onClose: () => void;
  currentMode: 'cross' | 'isolated';
  onModeChange: (mode: 'cross' | 'isolated') => void;
  symbol?: string;
}

const MarginModeModal: React.FC<MarginModeModalProps> = ({
  visible,
  onClose,
  currentMode,
  onModeChange,
  symbol = 'BTCUSDT'
}) => {
  const handleModeSelect = (mode: 'cross' | 'isolated') => {
    onModeChange(mode);
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      className={styles.marginModeModal}
      closeIcon={<Iconify icon="mdi:close" />}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{symbol}保证金模式</h3>
        </div>

        <div className={styles.modeOptions}>
          {/* 全仓模式 */}
          <div 
            className={`${styles.modeOption} ${currentMode === 'cross' ? styles.selectedMode : ''}`}
            onClick={() => handleModeSelect('cross')}
          >
            <div className={styles.modeHeader}>
              <span className={styles.modeTitle}>全仓</span>
              {currentMode === 'cross' && (
                <div className={styles.selectedIndicator}>
                  <Iconify icon="mdi:check" />
                </div>
              )}
            </div>
            <div className={styles.modeDescription}>
              全仓保证金模式：所有仓位共用合约账户中的保证金来避免爆仓。在强平事件中，交易者可能会损失所有的保证金和仓位。
            </div>
          </div>

          {/* 逐仓模式 */}
          <div 
            className={`${styles.modeOption} ${currentMode === 'isolated' ? styles.selectedMode : ''}`}
            onClick={() => handleModeSelect('isolated')}
          >
            <div className={styles.modeHeader}>
              <span className={styles.modeTitle}>逐仓</span>
              {currentMode === 'isolated' && (
                <div className={styles.selectedIndicator}>
                  <Iconify icon="mdi:check" />
                </div>
              )}
            </div>
            <div className={styles.modeDescription}>
              逐仓保证金模式：每个仓位的保证金是独立的，仓位的最大损失仅限于该仓位的保证金。
            </div>
          </div>
        </div>

        <div className={styles.confirmButton}>
          <Button
            type="primary"
            size="large"
            onClick={() => handleModeSelect(currentMode)}
            className={styles.confirmBtn}
            block
          >
            设置为{currentMode === 'cross' ? '全仓' : '逐仓'}模式
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MarginModeModal; 