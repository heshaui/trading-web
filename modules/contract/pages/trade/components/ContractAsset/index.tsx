import { Button } from "antd";
import FundTransferModal from "../FundTransferModal";
import { useState } from "react";
import { encryptData } from "@/hooks/user-encrypt";
import { transferAll } from "@/services/assets";
import { toast } from "sonner";
import router from "next/router";
import { ROUTER_KEY_ASSETS } from "@/config/apiConfig";

interface ContractAssetProps {
  spotBalance: any;
  contractBalance: any;
  onBalanceUpdate?: () => void;
}

const ContractAsset = ({ spotBalance, contractBalance, onBalanceUpdate }: ContractAssetProps) => {
  const [showFundTransferModal, setShowFundTransferModal] = useState(false);

  // 处理资金划转确认
  const handleFundTransferConfirm = async (transferData: any) => {
    const dataEncrypt = await encryptData(transferData);
    const res = await transferAll(dataEncrypt);
    console.log("res:", res);
    if (res.code === "0" && res.data) {
      toast.success("划转成功");
      // 通知父组件更新余额
    } else {
      toast.error("划转失败");
    }
    onBalanceUpdate?.();
  };
  return (
    <div>
      <FundTransferModal
        visible={showFundTransferModal}
        spotBalance={spotBalance}
        contractBalance={contractBalance}
        onClose={() => setShowFundTransferModal(false)}
        onConfirm={handleFundTransferConfirm}
      />
      <div className="p-[10px_16px] text-[14px] font-[400] bg-[var(--background9)] h-[100%]">
        <div className="text-[var(--text-color5)] font-[500] mb-[16px]">资产</div>
        <div className="flex flex-col gap-[10px] mb-[14px]">
          <div className="flex justify-between items-center">
            <div className="text-[var(--text-color6)]">总权益</div>
            <div className="text-[var(--text-color5)]">0.00 USDT</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[var(--text-color6)]">钱包余额</div>
            <div className="text-[var(--text-color5)]">0.00 USDT</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[var(--text-color6)]">未实现盈亏</div>
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
            划转
          </Button>
          <Button
            // onClick={() => router.push(ROUTER_KEY_ASSETS.CONTRACT_TOP_UP)}
            onClick={() => toast.error("暂未开放")}
            type="primary"
            className="w-[144px] h-[32px] text-[var(--text-color5)] font-[500]"
            shape="round"
            style={{ background: "var(--btncolor6)" }}
          >
            充值
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContractAsset;
