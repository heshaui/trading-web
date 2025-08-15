import React, { useState } from 'react';
import { Modal, ConfigProvider, Input, Button, Select, Image } from 'antd';
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
  spotBalance?: any[];
  contractBalance?: any[];
}

const FundTransferModal: React.FC<FundTransferModalProps> = ({
  visible,
  onClose,
  onConfirm,
  spotBalance = [],
  contractBalance = []
}) => {
  const { t } = useTranslation(['contract']);

  // 状态管理
  const [fromAccount, setFromAccount] = useState<'spot' | 'contract'>('spot');
  const [toAccount, setToAccount] = useState<'spot' | 'contract'>('contract');
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [transferAmount, setTransferAmount] = useState('');
  const [availableBalance] = useState(11111555503.012312338123); // 可用余额
  const coinList = appStore.getCoinList();
  console.log('coinList', coinList);
  console.log('spotBalance', spotBalance);
  console.log('contractBalance', contractBalance);

  // 币种选项
  // const coinOptions = [
  //   { value: 'USDT', label: 'USDT', subLabel: 'tetherUSD' },
  //   { value: 'BTC', label: 'BTC', subLabel: 'Bitcoin' },
  //   { value: 'ETH', label: 'ETH', subLabel: 'Ethereum' }
  // ];
  const coinOptions = coinList.map(coin => ({
    id: coin.id,
    value: coin.coinName,
    label: coin.coinName,
    icon: coin.iconUrl,
  }));

  // 获取指定币种的余额
  const getBalance = (balanceList: any[], coinName: string) => {
    if (!Array.isArray(balanceList) || balanceList.length === 0) return 0;
    const balanceItem = balanceList.find((item: any) => item.coinName === coinName || item.symbol === coinName);
    const balance = balanceItem ? (balanceItem.balance || balanceItem.canUseAmount || 0) : 0;
    // 确保balance是数字类型
    const numericBalance = typeof balance === 'number' ? balance : parseFloat(balance) || 0;
    return Number(numericBalance.toFixed(4));
  };

  // 获取当前选择的币种在现货账户的余额
  const getSpotBalance = () => {
    return getBalance(spotBalance, selectedCoin);
  };

  // 获取当前选择的币种在合约账户的余额
  const getContractBalance = () => {
    return getBalance(contractBalance, selectedCoin);
  };

  // 检查是否有足够的余额进行转账
  const hasEnoughBalance = () => {
    const currentBalance = fromAccount === 'spot' ? getSpotBalance() : getContractBalance();
    const amount = Number(transferAmount) || 0;
    return amount > 0 && amount <= currentBalance;
  };

  // 调试信息
  console.log('FundTransferModal Debug Info:', {
    selectedCoin,
    fromAccount,
    toAccount,
    transferAmount,
    spotBalance: getSpotBalance(),
    contractBalance: getContractBalance(),
    hasEnoughBalance: hasEnoughBalance(),
    isFormValid: transferAmount && Number(transferAmount) > 0 && hasEnoughBalance()
  });

  // 处理关闭
  const handleCancel = () => {
    setTransferAmount('');
    onClose();
  };

  // 处理确认转账
  const handleConfirm = async () => {

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
    let maxAmount = 0;
    if (fromAccount === 'spot') {
      maxAmount = getSpotBalance();
    } else {
      maxAmount = getContractBalance();
    }
    setTransferAmount(maxAmount.toString());
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
      width={520}
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
            <label className={styles.accountLabel}>划转到</label>
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
        <div className={styles.availableBalance}>
          <div>
            <span>可用 </span>
            <span className={styles.balanceAmount}>{getSpotBalance()} {selectedCoin}</span>
          </div>
          <div>
            <span>可用 </span>
            <span className={styles.balanceAmount}>{getContractBalance()} {selectedCoin}</span>
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
                    <Image src={coin.icon} alt={coin.label} width={20} height={20} preview={false} />
                  </div>
                  <div className={styles.coinInfo}>
                    <span className={styles.coinSymbol}>{coin.label}</span>                    </div>
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

          </div>
        </div>


        {/* 确认按钮 */}
        <Button
          type="primary"
          size="large"
          onClick={handleConfirm}
          disabled={!transferAmount || Number(transferAmount) <= 0 || !hasEnoughBalance()}
          className={styles.confirmButton}
          block
          title={!transferAmount || Number(transferAmount) <= 0 ? "请输入有效的转账数量" : !hasEnoughBalance() ? "余额不足" : ""}
        >
          确认
        </Button>
      </div>
    </Modal>
  );
};

export default FundTransferModal; 