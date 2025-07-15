import React, { useState } from 'react';
import { Drawer, Button, Switch, Radio } from 'antd';
import { Iconify } from '@/components/icon';
import styles from './styles.module.css';

interface TradingSettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const TradingSettingsDrawer: React.FC<TradingSettingsDrawerProps> = ({
  visible,
  onClose
}) => {
  const [positionMode, setPositionMode] = useState<'single' | 'hedge'>('hedge');
  const [contractUnit, setContractUnit] = useState<'张' | 'BTC' | 'USDT'>('BTC');
  const [orderValidity, setOrderValidity] = useState<'24H' | '7天' | '14天' | '长期有效'>('长期有效');
  const [preOrderConfirm, setPreOrderConfirm] = useState(true);
  const [reverseConfirm, setReverseConfirm] = useState(true);

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
      width={400}
      onClose={onClose}
      open={visible}
      className={styles.tradingSettingsDrawer}
      closeIcon={<Iconify icon="mdi:close" />}
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
              <div className={styles.modeHeader}>
                <div className={styles.modeIcon}>
                  <Iconify icon={positionMode === 'single' ? 'mdi:check-circle' : 'mdi:circle-outline'} />
                </div>
                <span className={styles.modeTitle}>单向持仓</span>
              </div>
              <div className={styles.modeDescription}>
                单向持仓模式下，一个合约只允许持有一个方向的仓位
              </div>
            </div>

            <div 
              className={`${styles.positionMode} ${positionMode === 'hedge' ? styles.selectedMode : ''}`}
              onClick={() => setPositionMode('hedge')}
            >
              <div className={styles.modeHeader}>
                <div className={styles.modeIcon}>
                  <Iconify icon={positionMode === 'hedge' ? 'mdi:check-circle' : 'mdi:circle-outline'} />
                </div>
                <span className={styles.modeTitle}>双向持仓</span>
              </div>
              <div className={styles.modeDescription}>
                双向持仓模式下，一个合约可允许同时持有多空两个方向的仓位，并且同一合约下不同方向仓位风险对冲
              </div>
            </div>
          </div>
        </div>

        {/* 合约单位 */}
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
                <div className={styles.unitIcon}>
                  <Iconify icon={contractUnit === unit ? 'mdi:check-circle' : 'mdi:circle-outline'} />
                </div>
                <span className={styles.unitLabel}>{unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 条件单/止盈止损有效期 */}
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
                <div className={styles.validityIcon}>
                  <Iconify icon={orderValidity === period ? 'mdi:check-circle' : 'mdi:circle-outline'} />
                </div>
                <span className={styles.validityLabel}>{period}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 下单前弹框确认 */}
        <div className={styles.settingSection}>
          <div className={styles.sectionTitle}>
            <span>下单前弹框确认：</span>
          </div>
          
          <div className={styles.confirmOptions}>
            <div className={styles.confirmOption}>
              <span className={styles.confirmLabel}>下单前弹框确认</span>
              <Switch
                checked={preOrderConfirm}
                onChange={setPreOrderConfirm}
                className={styles.confirmSwitch}
              />
            </div>
            
            <div className={styles.confirmOption}>
              <span className={styles.confirmLabel}>反向开仓弹框确认</span>
              <Switch
                checked={reverseConfirm}
                onChange={setReverseConfirm}
                className={styles.confirmSwitch}
              />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default TradingSettingsDrawer; 