import React from 'react';
import { Modal, Button } from 'antd';
import { useTranslation } from 'next-i18next';
import { Iconify } from '@/components/icon';
import styles from './styles.module.css';
import { marginModelEdit } from '@/services/contract';
import appStore from '@/store';
import { toast } from 'sonner';
import { useUserConfig } from "@/hooks/useUserConfig";
// marginModelEdit

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
  const { t } = useTranslation(['contract']);
  const [selectedMode, setSelectedMode] = React.useState<1 | 2>(2); // 默认选择逐仓
  const { currentContractInfo } = appStore;
  const handleConfirm = async () => {

    onClose();
    const res = await marginModelEdit({
      marginModel: selectedMode,
      contractId: currentContractInfo.id,
    });
    console.log(res);
    if (res.code === '0') {
      onModeChange(selectedMode);
      onClose();
      toast.success(t('marginMode.settingSuccess'));
    } else {
      toast.error(res.msg);
    }
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
          <h3 className={styles.modalTitle}>{symbol}{t('marginMode.title')}</h3>
        </div>
        <div className={styles.modeSelector}>
          <div className={`${styles.slideIndicator} ${selectedMode === 2 ? styles.slideRight : styles.slideLeft}`}></div>
          <div
            className={`${styles.modeTab} ${selectedMode === 1 ? styles.activeTab : ''}`}
            onClick={() => setSelectedMode(1)}
          >
            {t('crossMargin')}
          </div>
          <div
            className={`${styles.modeTab} ${selectedMode === 2 ? styles.activeTab : ''}`}
            onClick={() => setSelectedMode(2)}
          >
            {t('isolatedMargin')}
          </div>
        </div>

        {selectedMode === 2 && (
          <div className={styles.modeDescription}>
            {t('marginMode.isolatedDescription')}
          </div>
        )}
        {
          selectedMode === 1 && (
            <div className={styles.modeDescription}>
              {t('marginMode.crossDescription')}
            </div>
          )
        }

        <div className={styles.confirmButton}>
          <Button
            type='primary'
            size='large'
            shape='round'
            onClick={handleConfirm}
            className={styles.confirmBtn}
          >
            {t('marginMode.setTo', { mode: selectedMode === 1 ? t('crossMargin') : t('isolatedMargin') })}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MarginModeModal; 