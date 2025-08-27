import { Button } from "antd";
import FundTransferModal from "../FundTransferModal";
import { useState } from "react";
import { encryptData } from "@/hooks/user-encrypt";
import { transferAll } from "@/services/assets";
import { toast } from "sonner";
import router from "next/router";
import { ROUTER_KEY_ASSETS } from "@/config/apiConfig";
import { useTranslation } from "next-i18next";

interface ContractAssetProps {
  spotBalance: any;
  contractBalance: any;
  onBalanceUpdate?: () => void;
  style?: React.CSSProperties;
}

const ContractAsset = ({ spotBalance, contractBalance, onBalanceUpdate, style }: ContractAssetProps) => {
  const [showFundTransferModal, setShowFundTransferModal] = useState(false);
  const { t } = useTranslation(['contract']);

  // 处理资金划转确认
  const handleFundTransferConfirm = async (transferData: any) => {
    const dataEncrypt = await encryptData(transferData);
    const res = await transferAll(dataEncrypt);
    console.log("res:", res);
    if (res.code === "0" && res.data) {
      toast.success(t('fundTransfer.transferSuccess'));
      // 通知父组件更新余额
    } else {
      toast.error(t('fundTransfer.transferFailed'));
    }
    onBalanceUpdate?.();
  };
  return (
    <>
      <FundTransferModal
        visible={showFundTransferModal}
        spotBalance={spotBalance}
        contractBalance={contractBalance}
        onClose={() => setShowFundTransferModal(false)}
        onConfirm={handleFundTransferConfirm}
      />
      <div className="p-[10px_16px] text-[14px] font-[400] bg-[var(--background9)]" style={style}>
        <div className="text-[var(--text-color5)] font-[500] mb-[16px]">{t('contractAsset.title')}</div>
        <div className="flex flex-col gap-[10px] mb-[14px]">
          <div className="flex justify-between items-center">
            <div className="text-[var(--text-color6)]">{t('contractAsset.totalEquity')}</div>
            <div className="text-[var(--text-color5)]">0.00 USDT</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[var(--text-color6)]">{t('contractAsset.walletBalance')}</div>
            <div className="text-[var(--text-color5)]">0.00 USDT</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[var(--text-color6)]">{t('contractAsset.unrealizedPnl')}</div>
            <div className="text-[var(--text-color5)]">0.00 USDT</div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowFundTransferModal(true)}
            type="primary"
            className="w-[144px] h-[32px] text-[var(--text-color5)] font-[500]"
            shape="round"
            style={{ background: "var(--btncolor6)" }}
          >
            {t('contractAsset.transfer')}
          </Button>
          <Button
            // onClick={() => router.push(ROUTER_KEY_ASSETS.CONTRACT_TOP_UP)}
            onClick={() => toast.error(t('contractAsset.notOpenYet'))}
            type="primary"
            className="w-[144px] h-[32px] text-[var(--text-color5)] font-[500]"
            shape="round"
            style={{ background: "var(--btncolor6)" }}
          >
            {t('contractAsset.deposit')}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ContractAsset;
