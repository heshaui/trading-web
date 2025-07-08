import { FinancialType } from "@/services/financial";
import { Button, Modal } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ConfirmModal = ({
  confirmModal,
  setConfirmModal,
}: {  
  confirmModal: {
    open: boolean;
    status: "error" | "success" | null;
    type?: FinancialType;
    amount?: number;
    unit?: string;
    endTime?: number;
  };
  setConfirmModal: (confirmModal: {
    open: boolean;
    status: "error" | "success" | null;
    type?: FinancialType;
    amount?: number;
    unit?: string;
    endTime?: number;
  }) => void;
}) => {
  const router = useRouter();
  const { t } = useTranslation(["financial"]);
  return (
    <Modal
      open={confirmModal.open}
      onCancel={() => setConfirmModal({ open: false, status: null })}
      closable={{ "aria-label": "Custom Close Button" }}
      footer={
        <div className="p-[30px_55px] flex justify-around gap-[20px]">
          <Button
            className="bg-[var(--cancel-btn)] text-[var(--cancel-color)] h-[50px] flex-1 border-0"
            onClick={() => setConfirmModal({ open: false, status: null })}
            shape="round"
            size="large"
          >
            {t("common.goToFinancial")}
          </Button>
          <Button
            onClick={() => {
              router.push(`/assets/financial?type=${confirmModal.type}`);
            }}
            type="primary"
            shape="round"
            size="large"
            className="h-[50px] flex-1"
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
          {confirmModal.status === "success" ? `${confirmModal.amount} ${confirmModal.unit}` : t("common.subscribeFailed")}
        </div>
        {/* 副标题 */}
        <div className="text-[var(--text-color5)] font-[400] text-center mb-[30px]">
          {confirmModal.status === "success" ? t("common.subscribeSuccess") : t("common.subscribeFailed")}
        </div>
        {/* 时间 */}
        {confirmModal.status === "success" ? <div className="border border-[var(--border-color4)] rounded-[8px] p-[20px] flex flex-column gap-[20px]">
          <div className="flex justify-between">
            <div className="text-[var(--text-color6)] font-[400] text-[14px]">{t("common.term")}</div>
            <div className="text-[var(--text-color5)] font-[400] text-[14px]">{confirmModal.type === FinancialType.CURRENT ? t("common.current") : t("common.fixed")}</div>
          </div>
          {/* 申购时间 */}
          <div className="flex justify-between">
            <div className="text-[var(--text-color6)] font-[400] text-[14px]">{t("common.subscribeTime")}</div>
            {/* 当前年月日 时分秒 */}
            <div className="text-[var(--text-color5)] font-[400] text-[14px]">{dayjs().format("YYYY-MM-DD HH:mm:ss")}</div>
          </div>
          {/* 开始计息 */}
          <div className="flex justify-between">
            <div className="text-[var(--text-color6)] font-[400] text-[14px]">{t("common.startInterest")}</div>
            {/* 当前年月日 时分秒+1天 */}
            <div className="text-[var(--text-color5)] font-[400] text-[14px]">{dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss")}</div>
          </div>
          {/* 首次发息 */}
          <div className="flex justify-between">
            <div className="text-[var(--text-color6)] font-[400] text-[14px]">{t("common.firstInterest")}</div>
            {/* 当前年月日 时分秒+2天 */}
            <div className="text-[var(--text-color5)] font-[400] text-[14px]">{dayjs().add(2 ,"day").format("YYYY-MM-DD HH:mm:ss")}</div>
          </div>
          {/* 定期 */}
          {confirmModal.type === FinancialType.FIXED ? null : (
            <>
              {/* 最后发息 */}
              <div className="flex justify-between">
                <div className="text-[var(--text-color6)] font-[400] text-[14px]">{t("common.lastDue")}</div>
                {/* 当前年月日 时分秒+3天 */}
                <div className="text-[var(--text-color5)] font-[400] text-[14px]">{dayjs(confirmModal.endTime).add(1, "day").format("YYYY-MM-DD HH:mm:ss")}</div>
              </div>
              {/* 下次申购 */}
              <div className="flex justify-between">
                <div className="text-[var(--text-color6)] font-[400] text-[14px]">{t("common.nextSubscribe")}</div>
                <div className="text-[var(--text-color5)] font-[400] text-[14px]">{dayjs(confirmModal.endTime).add(1, "day").format("YYYY-MM-DD HH:mm:ss")}</div>
              </div>
            </>
          )}
        </div> : null}
      </div>
    </Modal>
  );
};

export default ConfirmModal;
