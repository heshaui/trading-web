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

  return (
    <Drawer
      title="交易设置"
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
            确定
          </Button>
        </div>
      }
    >
      <div className={styles.settingsContent}>
        {/* 持仓类型 */}
        {isShow && (
          <div className={styles.settingSection}>
            <div className={styles.sectionTitle}>
              <span>持仓类型：</span>
              <span className={styles.sectionNote}>
                （持有任何合约仓位/有挂单时不可更改持仓类型）
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
                    <span className={styles.modeTitle}>单向持仓</span>
                    <div className={styles.modeDescription}>
                      单向持仓模式下，一个合约只允许持有一个方向的仓位
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
                    <span className={styles.modeTitle}>双向持仓</span>
                    <div className={styles.modeDescription}>
                      双向持仓模式下，一个合约可允许同时持有多空两个方向的仓位，并且同一合约下不同方向仓位风险对冲
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
              <span>合约单位：</span>
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
                  <span className={styles.unitLabel}>{unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 条件单/止盈止损有效期 */}
        {isShow && (
          <div className={styles.settingSection}>
            <div className={styles.sectionTitle}>
              <span>条件单/止盈止损有效期：</span>
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
                  <span className={styles.validityLabel}>{period}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 下单前弹窗确认 */}
        <div className={styles.settingSection}>

          <div className={styles.confirmOptions}>
            <div className={styles.confirmOption}>
              <span className={styles.confirmLabel}>下单前弹窗确认</span>
              <Switch
                checked={preOrderConfirm}
                onChange={setPreOrderConfirm}
                className={`${styles.confirmSwitch} ${preOrderConfirm ? styles.switchChecked : ''}`}
              />
            </div>
            {isShow && (
              <div className={styles.confirmOption}>
                <span className={styles.confirmLabel}>反向开仓弹窗确认</span>
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