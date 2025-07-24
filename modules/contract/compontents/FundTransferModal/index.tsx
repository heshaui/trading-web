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
  const [availableBalance] = useState(103.03); // 可用余额

  // 币种选项
  const coinOptions = [
    { value: 'USDT', label: 'USDT', subLabel: 'tetherUSD' },
    { value: 'BTC', label: 'BTC', subLabel: 'Bitcoin' },
    { value: 'ETH', label: 'ETH', subLabel: 'Ethereum' }
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

  // 处理最大按钮
  const handleMaxAmount = () => {
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

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "#ffffff",
            footerBg: "#ffffff",
            headerBg: "#ffffff",
          },
          Input: {
            activeBorderColor: '#ff6b35',
            hoverBorderColor: '#ff6b35',
            controlHeightLG: 48,
            activeBg: '#ffffff',
            hoverBg: '#ffffff',
          },
          Button: {
            controlHeightLG: 48,
          },
          Select: {
            selectorBg: '#ffffff',
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
        footer={null}
        width={500}
        className={`modal_box ${styles.transferModal}`}
        closable={false}
        maskClosable={false}
      >
        <div className={styles.modalContent}>
          {/* 账户选择区域 */}
          <div className={styles.accountSection}>
            <div className={styles.accountItem}>
              <label className={styles.accountLabel}>从</label>
              <Select
                value={fromAccount}
                onChange={(value) => {
                  setFromAccount(value);
                  setToAccount(value === 'spot' ? 'contract' : 'spot');
                }}
                className={styles.accountSelect}
                size="large"
                suffixIcon={<Iconify icon="mdi:chevron-down" />}
              >
                <Option value="spot">现货账户</Option>
                <Option value="contract">合约账户</Option>
              </Select>
            </div>

            <div className={styles.swapButtonWrapper}>
              <Button
                type="text"
                icon={<Iconify icon="mdi:swap-horizontal" />}
                onClick={handleAccountSwitch}
                className={styles.swapButton}
              />
            </div>

            <div className={styles.accountItem}>
              <label className={styles.accountLabel}>到</label>
              <Select
                value={toAccount}
                onChange={(value) => {
                  setToAccount(value);
                  setFromAccount(value === 'spot' ? 'contract' : 'spot');
                }}
                className={styles.accountSelect}
                size="large"
                suffixIcon={<Iconify icon="mdi:chevron-down" />}
              >
                <Option value="spot">现货账户</Option>
                <Option value="contract">合约账户</Option>
              </Select>
            </div>
          </div>

          {/* 币种选择 */}
          <div className={styles.formItem}>
            <label className={styles.formLabel}>币种</label>
            <Select
              value={selectedCoin}
              onChange={setSelectedCoin}
              className={styles.coinSelect}
              size="large"
              suffixIcon={<Iconify icon="mdi:chevron-down" />}
            >
              {coinOptions.map(coin => (
                <Option key={coin.value} value={coin.value}>
                  <div className={styles.coinOption}>
                    <div className={styles.coinIcon}>
                      {coin.value === 'USDT' && <span style={{fontSize: '14px', fontWeight: 'bold', color: '#26a17b'}}>₮</span>}
                      {coin.value === 'BTC' && <span style={{fontSize: '14px', fontWeight: 'bold', color: '#f7931a'}}>₿</span>}
                      {coin.value === 'ETH' && <span style={{fontSize: '14px', fontWeight: 'bold', color: '#627eea'}}>Ξ</span>}
                    </div>
                    <div className={styles.coinInfo}>
                      <span className={styles.coinSymbol}>{coin.label}</span>
                      <span className={styles.coinName}>{coin.subLabel}</span>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          {/* 数量输入 */}
          <div className={styles.formItem}>
            <label className={styles.formLabel}>数量</label>
            <div className={styles.amountInputWrapper}>
              <Input
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="最少10"
                className={styles.amountInput}
                size="large"
                suffix={
                  <div className={styles.inputSuffix}>
                    <span className={styles.coinUnit}>USDT</span>
                    <Button
                      type="text"
                      size="small"
                      onClick={handleMaxAmount}
                      className={styles.maxButton}
                    >
                      最大
                    </Button>
                  </div>
                }
              />
              <div className={styles.availableBalance}>
                <span>可用 </span>
                <span className={styles.balanceAmount}>{availableBalance.toFixed(2)} USDT</span>
              </div>
            </div>
          </div>

          {/* 确认按钮 */}
          <Button
            type="primary"
            size="large"
            onClick={handleConfirm}
            disabled={!transferAmount || Number(transferAmount) <= 0}
            className={styles.confirmButton}
            block
          >
            确认
          </Button>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default FundTransferModal; 