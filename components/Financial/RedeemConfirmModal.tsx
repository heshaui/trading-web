import { FinancialType } from "@/services/financial";
import { Button, Modal } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface RedeemConfirmModalProps {
  redeemConfirmModal: {
    open: boolean;
    status: "error" | "success" | null;
    amount?: number;
    type?: FinancialType;
    unit?: string;
    endTime?: number;
  };
  setRedeemConfirmModal: (confirmModal: {
    open: boolean;
    status: "error" | "success" | null;
    amount?: number;
    type?: FinancialType;
    unit?: string;
    endTime?: number;
  }) => void;
}
const RedeemConfirmModal = ({
  redeemConfirmModal,
  setRedeemConfirmModal,
}: RedeemConfirmModalProps) => {
  const router = useRouter();
  const { t } = useTranslation(["financial"]);
  
  return (
    <Modal
      open={redeemConfirmModal.open}
      onCancel={() => setRedeemConfirmModal({ ...redeemConfirmModal, open: false })}
      closable={{ "aria-label": "Custom Close Button" }}
      footer={
        <div className="p-[30px_55px] flex justify-around gap-[20px]">
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
              router.push("/financialOrder");
            }}
          >
            {t("common.viewPosition")}
          </Button>
        </div>
      }
    >
      <div>
        {/* 图标 成功/失败*/}
        <div className="w-[105px] h-[96px] bg-[red] mb-[15px] m-[30px_180px_15px_180px]"></div>
        {/* 标题 成功了显示金额如:5 USDT 失败了显示申购失败 */}
        <div className="text-[20px] text-[var(--text-color5)] font-[500] text-center mb-[16px]">
          {redeemConfirmModal.status === "success"
            ? `${redeemConfirmModal.amount} ${redeemConfirmModal.unit}`
            : t("common.redeemFailed")}
        </div>
        {/* 副标题 */}
        <div className="text-[var(--text-color5)] font-[400] text-center mb-[30px]">
          {redeemConfirmModal.status === "success"
            ? t("common.redeemSuccess")
            : t("common.redeemFailed")}
        </div>
        {/* 时间 */}
        {redeemConfirmModal.status === "success" ? (
          <div className="border border-[var(--border-color4)] rounded-[8px] p-[20px] flex flex-column gap-[20px]">
            {redeemConfirmModal.type === FinancialType.FIXED ? (
              <>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.redeemSuccess")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {redeemConfirmModal.amount} {redeemConfirmModal.unit}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.accruedInterest")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {redeemConfirmModal.amount} {redeemConfirmModal.unit}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.redeemAmount")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {redeemConfirmModal.amount} {redeemConfirmModal.unit}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.submitTime")}
                  </div>
                  {/* 当前时间 */}
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {dayjs().format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.redeemTime")}
                  </div>
                  {/* 当前时间 */}
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {dayjs().format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.arrivalTime")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {dayjs(redeemConfirmModal.endTime).format("YYYY-MM-DD HH:mm:ss")}
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
