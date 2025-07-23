import React from 'react';
import { Modal } from 'antd';
import { Iconify } from '@/components/icon';
import styles from './styles.module.css';

interface MarginModeModalProps {
  visible: boolean;
  onClose: () => void;
  currentMode: 1 | 2;
  onModeChange: (mode: 1 | 2) => void;
  symbol?: string;
}

const MarginModeModal: React.FC<MarginModeModalProps> = ({
  visible,
  onClose,
  currentMode,
  onModeChange,
  symbol = 'BTCUSDT'
}) => {
  const [selectedMode, setSelectedMode] = React.useState<1 | 2>(2); // 默认选择逐仓

  const handleConfirm = () => {
    onModeChange(selectedMode);
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={420}
      className={styles.marginModeModal}
      closeIcon={<Iconify icon="mdi:close" />}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{symbol}保证金模式</h3>
        </div>

        <div className={styles.modeSelector}>
          <div className={`${styles.slideIndicator} ${selectedMode === 2 ? styles.slideRight : styles.slideLeft}`}></div>
          <div 
            className={`${styles.modeTab} ${selectedMode === 1 ? styles.activeTab : ''}`}
            onClick={() => setSelectedMode(1)}
          >
            全仓
          </div>
          <div 
            className={`${styles.modeTab} ${selectedMode === 2 ? styles.activeTab : ''}`}
            onClick={() => setSelectedMode(2)}
          >
            逐仓
          </div>
        </div>

        {selectedMode === 2 && (
          <div className={styles.modeDescription}>
            逐仓保证金模式:一定数量保证金被分配到仓位上。如果仓位保证金亏损到低于维持保证金的水平，仓位将被强平。在逐仓模式下，您可以为这个仓位添加和减少保证金。
          </div>
        )}
        {
          selectedMode === 1 && (
            <div className={styles.modeDescription}>
              全仓保证金模式: 所有仓位共用合约账户中的保证金来避免仓位被强平。在强平事件中，交易者可能会损失所有的保证金和仓位。
            </div>
          )
        }

        <div className={styles.confirmButton}>
          <button
            onClick={handleConfirm}
            className={styles.confirmBtn}
          >
            设置为{selectedMode === 1 ? '全仓' : '逐仓'}模式
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MarginModeModal; 