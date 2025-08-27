import React, { useState } from 'react';
import { Drawer, Button, Switch, Radio } from 'antd';
import { Iconify } from '@/components/icon';
import styles from './styles.module.css';
import { useTranslation } from 'next-i18next';

interface TradingSettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const TradingSettingsDrawer: React.FC<TradingSettingsDrawerProps> = ({
  visible,
  onClose
}) => {
  const { t } = useTranslation('contract');
  const [positionMode, setPositionMode] = useState<'single' | 'hedge'>('hedge');
  const [contractUnit, setContractUnit] = useState<'张' | 'BTC' | 'USDT'>('张');
  const [orderValidity, setOrderValidity] = useState<'24H' | '7天' | '14天' | '长期有效'>('14天');
  const [preOrderConfirm, setPreOrderConfirm] = useState(true);
  const [reverseConfirm, setReverseConfirm] = useState(true);
  const [isShow, setIsShow] = useState(false);

  const handleConfirm = () => {
    // 保存设置
    console.log('Settings saved:', {
      positionMode,
      contractUnit,
      orderValidity,
      preOrderConfirm,
      reverseConfirm
    });
    onClose();
  };

  // 获取合约单位显示文本
  const getContractUnitText = (unit: string) => {
    switch (unit) {
      case '张':
        return t('tradingSettings.units.sheet');
      case 'BTC':
        return t('tradingSettings.units.btc');
      case 'USDT':
        return t('tradingSettings.units.usdt');
      default:
        return unit;
    }
  };

  // 获取有效期显示文本
  const getValidityText = (period: string) => {
    switch (period) {
      case '24H':
        return t('tradingSettings.validity.24h');
      case '7天':
        return t('tradingSettings.validity.7days');
      case '14天':
        return t('tradingSettings.validity.14days');
      case '长期有效':
        return t('tradingSettings.validity.longTerm');
      default:
        return period;
    }
  };

  return (
    <Drawer
      title={t('tradingSettings.title')}
      placement="right"
      width={420}
      onClose={onClose}
      open={visible}
      className={styles.tradingSettingsDrawer}
      closeIcon={<Iconify icon="mdi:close" className={styles.closeIcon} />}
      footer={
        <div className={styles.drawerFooter}>
          <Button
            type="primary"
            size="large"
            onClick={handleConfirm}
            className={styles.confirmBtn}
            block
          >
            {t('tradingSettings.confirm')}
          </Button>
        </div>
      }
    >
      <div className={styles.settingsContent}>
        {/* 持仓类型 */}
        {isShow && (
          <div className={styles.settingSection}>
            <div className={styles.sectionTitle}>
              <span>{t('tradingSettings.positionType')}：</span>
              <span className={styles.sectionNote}>
                {t('tradingSettings.positionTypeNote')}
              </span>
            </div>

            <div className={styles.positionModes}>
              <div
                className={`${styles.positionMode} ${positionMode === 'single' ? styles.selectedMode : ''}`}
                onClick={() => setPositionMode('single')}
              >
                <div className={styles.radioWrapper}>
                  <div className={`${styles.radioButton} ${positionMode === 'single' ? styles.radioChecked : ''}`}>
                    {positionMode === 'single' && <div className={styles.radioInner} />}
                  </div>
                  <div className={styles.modeContent}>
                    <span className={styles.modeTitle}>{t('tradingSettings.singlePosition')}</span>
                    <div className={styles.modeDescription}>
                      {t('tradingSettings.singlePositionDesc')}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`${styles.positionMode} ${positionMode === 'hedge' ? styles.selectedMode : ''}`}
                onClick={() => setPositionMode('hedge')}
              >
                <div className={styles.radioWrapper}>
                  <div className={`${styles.radioButton} ${positionMode === 'hedge' ? styles.radioChecked : ''}`}>
                    {positionMode === 'hedge' && <div className={styles.radioInner} />}
                  </div>
                  <div className={styles.modeContent}>
                    <span className={styles.modeTitle}>{t('tradingSettings.hedgePosition')}</span>
                    <div className={styles.modeDescription}>
                      {t('tradingSettings.hedgePositionDesc')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 合约单位 */}
        {isShow && (
          <div className={styles.settingSection}>
            <div className={styles.sectionTitle}>
              <span>{t('tradingSettings.contractUnit')}：</span>
            </div>

            <div className={styles.contractUnits}>
              {['张', 'BTC', 'USDT'].map(unit => (
                <div
                  key={unit}
                  className={`${styles.unitOption} ${contractUnit === unit ? styles.selectedUnit : ''}`}
                  onClick={() => setContractUnit(unit as any)}
                >
                  <div className={`${styles.radioButton} ${contractUnit === unit ? styles.radioChecked : ''}`}>
                    {contractUnit === unit && <div className={styles.radioInner} />}
                  </div>
                  <span className={styles.unitLabel}>{getContractUnitText(unit)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 条件单/止盈止损有效期 */}
        {isShow && (
          <div className={styles.settingSection}>
            <div className={styles.sectionTitle}>
              <span>{t('tradingSettings.orderValidity')}：</span>
            </div>

            <div className={styles.validityOptions}>
              {['24H', '7天', '14天', '长期有效'].map(period => (
                <div
                  key={period}
                  className={`${styles.validityOption} ${orderValidity === period ? styles.selectedValidity : ''}`}
                  onClick={() => setOrderValidity(period as any)}
                >
                  <div className={`${styles.radioButton} ${orderValidity === period ? styles.radioChecked : ''}`}>
                    {orderValidity === period && <div className={styles.radioInner} />}
                  </div>
                  <span className={styles.validityLabel}>{getValidityText(period)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 下单前弹窗确认 */}
        <div className={styles.settingSection}>

          <div className={styles.confirmOptions}>
            <div className={styles.confirmOption}>
              <span className={styles.confirmLabel}>{t('tradingSettings.preOrderConfirm')}</span>
              <Switch
                checked={preOrderConfirm}
                onChange={setPreOrderConfirm}
                className={`${styles.confirmSwitch} ${preOrderConfirm ? styles.switchChecked : ''}`}
              />
            </div>
            {isShow && (
              <div className={styles.confirmOption}>
                <span className={styles.confirmLabel}>{t('tradingSettings.reverseConfirm')}</span>
                <Switch
                  checked={reverseConfirm}
                  onChange={setReverseConfirm}
                  className={`${styles.confirmSwitch} ${reverseConfirm ? styles.switchChecked : ''}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default TradingSettingsDrawer; 