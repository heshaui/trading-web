import { Button } from "antd";
import FundTransferModal from "../FundTransferModal";
import { useEffect, useState } from "react";
import { encryptData } from "@/hooks/user-encrypt";
import { transferAll } from "@/services/assets";
import { toast } from "sonner";
import { useTranslation } from "next-i18next";
import BigNumber from "bignumber.js";

interface ContractAssetProps {
  spotBalance: any;
  contractBalance: any;
  onBalanceUpdate?: () => void;
  style?: React.CSSProperties;
}

interface AccountBalance {
  canUseAmount: string; // 可用余额
  isolateMargin: string; // 逐仓保证金
  lockAmount: string; // 锁定金额
  realizedAmount: string; // 已实现盈亏
  symbol: string; // 币种
  totalAmount: string; // 总余额
  totalMargin: string; // 总保证金
  totalMarginRate: string; // 总保证金率
  unRealizedAmount: string; // 未实现盈亏
}

const ContractAsset = ({
  spotBalance,
  contractBalance,
  onBalanceUpdate,
  style,
}: ContractAssetProps) => {
  const [showFundTransferModal, setShowFundTransferModal] = useState(false);
  const [accountBalance, setAccountBalance] = useState<
    AccountBalance | undefined
  >();
  const { t } = useTranslation(["contract"]);

  // 处理资金划转确认
  const handleFundTransferConfirm = async (transferData: any) => {
    const dataEncrypt = await encryptData(transferData);
    const res = await transferAll(dataEncrypt);
    console.log("res:", res);
    if (res.code === "0" && res.data) {
      toast.success(t("fundTransfer.transferSuccess"));
      // 通知父组件更新余额
    } else {
      toast.error(t("fundTransfer.transferFailed"));
    }
    onBalanceUpdate?.();
  };

  useEffect(() => {
    const balance = contractBalance.find((item: any) => item.symbol === "USDT");
    if (balance) {
      setAccountBalance(balance);
    }else{
      setAccountBalance(contractBalance[1])
    }
  }, [contractBalance]);

  return (
    <>
      <FundTransferModal
        visible={showFundTransferModal}
        spotBalance={spotBalance}
        contractBalance={contractBalance}
        onClose={() => setShowFundTransferModal(false)}
        onConfirm={handleFundTransferConfirm}
      />
      <div
        className="p-[10px_16px] text-[14px] font-[400] bg-[var(--background9)]"
        style={style}
      >
        <div className="text-[var(--text-color5)] font-[500] mb-[16px]">
          {t("contractAsset.title")}
        </div>
        <div className="flex flex-col gap-[10px] mb-[14px]">
          <div className="flex justify-between items-center">
            <div className="text-[var(--text-color6)]">
              {t("contractAsset.totalEquity")}
            </div>
            <div className="text-[var(--text-color5)]">
              {/* 合约账户总权益。账户总权益=全仓总权益+逐仓总权益+冻结保证金 */}
              {new BigNumber(accountBalance?.realizedAmount || 0)
                .plus(Number(accountBalance?.totalMargin) || 0)
                .plus(accountBalance?.isolateMargin || 0)
                .toFixed(2)}{" "}
              {accountBalance?.symbol}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[var(--text-color6)]">
              {t("contractAsset.walletBalance")}
            </div>
            <div className="text-[var(--text-color5)]">
              {new BigNumber(accountBalance?.canUseAmount || 0).toFixed(2)}{" "}
              {accountBalance?.symbol}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[var(--text-color6)]">
              {t("contractAsset.unrealizedPnl")}
            </div>
            <div className="text-[var(--text-color5)]">
              {new BigNumber(accountBalance?.unRealizedAmount || 0).toFixed(2)}{" "}
              {accountBalance?.symbol}
            </div>
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
            {t("contractAsset.transfer")}
          </Button>
          <Button
            // onClick={() => router.push(ROUTER_KEY_ASSETS.CONTRACT_TOP_UP)}
            onClick={() => toast.error(t("contractAsset.notOpenYet"))}
            type="primary"
            className="w-[144px] h-[32px] text-[var(--text-color5)] font-[500]"
            shape="round"
            style={{ background: "var(--btncolor6)" }}
          >
            {t("contractAsset.deposit")}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ContractAsset;
