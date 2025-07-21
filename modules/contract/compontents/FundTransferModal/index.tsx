import React, { useState } from 'react';
import { Modal, ConfigProvider, Input, Button, Select } from 'antd';
import { useTranslation } from 'next-i18next';
import { Iconify } from '@/components/icon';
import styles from './styles.module.css';
import { transferAll } from "@/services/assets";
import { toast } from "sonner";
import { encryptData } from "@/utils/encrypt";
import appStore from "@/store";
const { Option } = Select;

interface FundTransferModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (transferData: any) => void;
}

const FundTransferModal: React.FC<FundTransferModalProps> = ({
  visible,
  onClose,
  onConfirm
}) => {
  const { t } = useTranslation(['contract']);
  
  // 状态管理
  const [fromAccount, setFromAccount] = useState<'spot' | 'contract'>('spot');
  const [toAccount, setToAccount] = useState<'spot' | 'contract'>('contract');
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [transferAmount, setTransferAmount] = useState('');
  const [availableBalance] = useState(0.00); // 可转余额

  // 币种选项
  const coinOptions = [
    { value: 'USDT', label: 'USDT' },
    { value: 'BTC', label: 'BTC' },
    { value: 'ETH', label: 'ETH' }
  ];

  // 处理关闭
  const handleCancel = () => {
    setTransferAmount('');
    onClose();
  };

  // 处理确认转账
  const handleConfirm = async() => {
  
    const transferData = {
      transferType: fromAccount === 'spot' ? 'wallet_to_contract' : 'contract_to_wallet',
      coinSymbol: selectedCoin,
      amount: transferAmount
    };
  
    onConfirm?.(transferData);
    handleCancel();
  };

  // 处理全部按钮
  const handleAllAmount = () => {
    setTransferAmount(availableBalance.toString());
  };

  // 处理账户切换
  const handleAccountSwitch = () => {
    setFromAccount(fromAccount === 'spot' ? 'contract' : 'spot');
    setToAccount(toAccount === 'spot' ? 'contract' : 'spot');
  };

  // 获取账户显示名称
  const getAccountName = (accountType: 'spot' | 'contract') => {
    return accountType === 'spot' ? '现货账户' : '合约账户';
  };

  // 弹框底部按钮
  const ModalFooter = () => {
    return (
      <div className={styles.footerButtons}>
        <Button
          size="large"
          onClick={handleCancel}
          className={styles.cancelBtn}
        >
          取消
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handleConfirm}
          disabled={!transferAmount || Number(transferAmount) <= 0}
          className={styles.confirmBtn}
        >
          确定
        </Button>
      </div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "var(--background5)",
            footerBg: "var(--background5)",
            headerBg: "var(--background5)",
          },
          Input: {
            activeBorderColor: 'var(--theme-color)',
            hoverBorderColor: 'var(--theme-color)',
            controlHeightLG: 50,
            activeBg: 'var(--background5)',
            hoverBg: 'var(--background5)',
          },
          Button: {
            controlHeightLG: 50,
          },
          Select: {
            selectorBg: 'var(--background5)',
          }
        },
      }}
    >
      <Modal
        open={visible}
        title={
          <div className={styles.modalHeader}>
            <span className={styles.modalTitle}>资金划转</span>
            <Button
              type="text"
              icon={<Iconify icon="mdi:close" />}
              onClick={handleCancel}
              className={styles.closeButton}
            />
          </div>
        }
        centered
        onCancel={handleCancel}
        footer={<ModalFooter />}
        width={470}
        className={`modal_box ${styles.transferModal}`}
        closable={false}
        maskClosable={false}
      >
        <div className={styles.modalContent}>
          {/* 划转方向 */}
          <div className={styles.transferDirection}>
            <div className={styles.directionSection}>
              <span className={styles.directionLabel}>从</span>
              <div className={styles.accountBox}>
                <span className={styles.accountName}>{getAccountName(fromAccount)}</span>
                <div className={styles.balanceInfo}>
                  <span className={styles.balanceLabel}>可转</span>
                  <span className={styles.balanceValue}>{availableBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className={styles.swapContainer}>
              <div className={styles.swapButton} onClick={handleAccountSwitch}>
                <Iconify icon="mdi:swap-horizontal" className={styles.swapIcon} />
              </div>
            </div>

            <div className={styles.directionSection}>
              <span className={styles.directionLabel}>划转到</span>
              <div className={styles.accountBox}>
                <span className={styles.accountName}>{getAccountName(toAccount)}</span>
                <div className={styles.balanceInfo}>
                  <span className={styles.balanceLabel}>可转</span>
                  <span className={styles.balanceValue}>{availableBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 币种选择 */}
          <div className={styles.coinSection}>
            <div className={styles.sectionLabel}>币种</div>
            <Select
              value={selectedCoin}
              onChange={setSelectedCoin}
              className={styles.coinSelect}
              size="large"
              suffixIcon={<Iconify icon="mdi:chevron-down" />}
            >
              {coinOptions.map(coin => (
                <Option key={coin.value} value={coin.value}>
                  {coin.label}
                </Option>
              ))}
            </Select>
          </div>

          {/* 划转数量 */}
          <div className={styles.amountSection}>
            <div className={styles.sectionLabel}>划转数量</div>
            <div className={styles.amountInputWrapper}>
              <Input
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="划转数量"
                className={styles.amountInput}
                size="large"
                suffix={
                  <div className={styles.inputSuffix}>
                    <Button
                      type="text"
                      size="small"
                      onClick={handleAllAmount}
                      className={styles.allButton}
                    >
                      全部
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default FundTransferModal; 