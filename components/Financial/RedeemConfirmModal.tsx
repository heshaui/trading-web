import { FinancialType, SettlementInterest } from "@/services/financial";
import { Button, Modal } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export interface RedeemConfirmModalType {
  open: boolean;
  status: "error" | "success" | null;
  amount?: number;
  interest?: number;
  type?: FinancialType;
  unit?: string;
  settlementInterest?: SettlementInterest;
}

interface RedeemConfirmModalProps {
  redeemConfirmModal: RedeemConfirmModalType;
  setRedeemConfirmModal: (redeemConfirmModal: RedeemConfirmModalType) => void;
}
const RedeemConfirmModal = ({
  redeemConfirmModal,
  setRedeemConfirmModal,
}: RedeemConfirmModalProps) => {
  const router = useRouter();
  const { t } = useTranslation(["financial"]);

  return (
    <Modal
      centered
      width={redeemConfirmModal.status === "success" ? 470 : 400}
      open={redeemConfirmModal.open}
      onCancel={() =>
        setRedeemConfirmModal({ ...redeemConfirmModal, open: false })
      }
      closable={{ "aria-label": "Custom Close Button" }}
      footer={
        <div className="flex justify-around gap-[20px]">
          <Button
            className="bg-[var(--cancel-btn)] text-[var(--cancel-color)] h-[50px] flex-1 border-0"
            onClick={() => {
              router.push("/financial");
            }}
            shape="round"
            size="large"
          >
            {t("common.goToFinancial")}
          </Button>
          <Button
            type="primary"
            shape="round"
            size="large"
            className="h-[50px] flex-1"
            onClick={() => {
              router.push("/assets/financial");
            }}
          >
            {t("common.viewPosition")}
          </Button>
        </div>
      }
    >
      <div>
        {/* 图标 成功/失败*/}
        <div className="w-[126px] h-[126px] mx-auto mt-[48px]">
          {redeemConfirmModal.status === "success" ? (
            <Image
              src="/images/financial/success.png"
              alt=""
              width={126}
              height={126}
            />
          ) : (
            <Image
              src="/images/financial/error.png"
              alt=""
              width={126}
              height={126}
            />
          )}
        </div>
        {/* 标题 成功了显示金额如:5 USDT 失败了显示申购失败 */}
        <div className="text-[20px] text-[var(--text-color5)] font-[500] text-center mb-[16px]">
          {redeemConfirmModal.status === "success"
            ? `${redeemConfirmModal.amount} ${redeemConfirmModal.unit}`
            : t("common.redeemFailed")}
        </div>
        {/* 副标题 */}
        <div
          className={`text-[var(--text-color5)] font-[400] text-center mb-[${
            redeemConfirmModal.status === "success" ? "30px" : "40px"
          }]`}
        >
          {redeemConfirmModal.status === "success"
            ? t("common.redeemSuccess")
            : t("common.redeemFailed")}
        </div>
        {/* 时间 */}
        {redeemConfirmModal.status === "success" ? (
          <div className="border border-[var(--border-color4)] rounded-[8px] p-[20px] flex flex-column gap-[20px]">
            {/* 定期赎回 */}
            {redeemConfirmModal.type === FinancialType.FIXED ? (
              <>
                {/* 赎回成功 */}
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.redeemSuccess")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {t("common.fixed")}
                  </div>
                </div>
                {/* 已获得利息 */}
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {redeemConfirmModal.settlementInterest ===
                    SettlementInterest.DAILY
                      ? t("common.accruedInterest")
                      : t("common.totalInterest")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {redeemConfirmModal.interest} {redeemConfirmModal.unit}
                  </div>
                </div>
                {/* 赎回金额 */}
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.redeemAmount")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {redeemConfirmModal.amount} {redeemConfirmModal.unit}
                  </div>
                </div>
                {/* 提交时间 */}
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.submitTime")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {dayjs().format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                </div>
              </>
            ) : (
              // 活期赎回
              <>
                <div className="flex justify-between">
                  {/* 赎回时间 */}
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.redeemTime")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {dayjs().format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                </div>
                <div className="flex justify-between">
                  {/* 到账时间 */}
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.arrivalTime")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {dayjs().format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default RedeemConfirmModal;
