import { FinancialType } from "@/services/financial";
import { Button, Modal } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { getCurrentTimeZone } from "@/utils/currentTimeZone";

export interface SubscribeConfirmModalType {
  open: boolean; // 是否打开
  status: "error" | "success" | null; // 状态
  type?: FinancialType; // 类型
  amount?: number; // 金额
  unit?: string; // 单位
  autoSubscribe?: boolean; // 是否自动申购
  fixedDays?: string | number; // 定期几天
}

interface SubscribeConfirmModalProps {
  subscribeConfirmModal: SubscribeConfirmModalType;
  setSubscribeConfirmModal: (
    subscribeConfirmModal: SubscribeConfirmModalType
  ) => void;
}

const SubscribeConfirmModal: React.FC<SubscribeConfirmModalProps> = ({
  subscribeConfirmModal,
  setSubscribeConfirmModal,
}: SubscribeConfirmModalProps) => {
  const router = useRouter();
  const { t } = useTranslation(["financial"]);

  return (
    <Modal
      width={subscribeConfirmModal.status === "success" ? 470 : 400}
      open={subscribeConfirmModal.open}
      onCancel={() => setSubscribeConfirmModal({ open: false, status: null })}
      closable={{ "aria-label": "Custom Close Button" }}
      footer={
        <div className="flex justify-around gap-[20px]">
          <Button
            className="bg-[var(--cancel-btn)] text-[var(--cancel-color)] h-[50px] flex-1 border-0"
            onClick={() =>
              setSubscribeConfirmModal({ open: false, status: null })
            }
            shape="round"
            size="large"
          >
            {t("common.goToFinancial")}
          </Button>
          <Button
            onClick={() => {
              router.push(
                `/assets/financial?type=${subscribeConfirmModal.type}`
              );
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
        <div className="w-[126px] h-[126px] mx-auto mt-[48px]">
          {subscribeConfirmModal.status === "success" ? (
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
          {subscribeConfirmModal.status === "success"
            ? `${subscribeConfirmModal.amount} ${subscribeConfirmModal.unit}`
            : t("common.subscribeFailed")}
        </div>
        {/* 副标题 */}
        <div className="text-[var(--text-color6)] font-[400] text-center mb-[30px]  text-[14px]">
          {subscribeConfirmModal.status === "success"
            ? t("common.subscribeSuccess")
            : t("common.subscribeFailedSubtitle")}
        </div>
        {/* 时间 */}
        {subscribeConfirmModal.status === "success" ? (
          <div className="border border-[var(--border-color4)] rounded-[8px] p-[20px] flex flex-column gap-[20px]">
            {/* 期限 */}
            <div className="flex justify-between">
              <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                {t("common.term")}
              </div>
              <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                {subscribeConfirmModal.type === FinancialType.CURRENT
                  ? t("common.current")
                  : `${t("common.fixed")} (${
                      subscribeConfirmModal.fixedDays
                    } ${t("common.day")})`}
              </div>
            </div>
            {/* 申购时间 */}
            <div className="flex justify-between">
              <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                {t("common.subscribeTime")}
              </div>
              {/* 当前年月日 时分秒 */}
              <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                {dayjs().format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            {/* 开始计息 申购时间+1天 当前时区(08):00:00 开始计息 */}
            <div className="flex justify-between">
              <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                {t("common.startInterest")}
              </div>
              <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                {dayjs().add(1, "day").format("YYYY-MM-DD") +
                  " " +
                  `${getCurrentTimeZone()}:00:00`}
              </div>
            </div>
            {/* 首次发息 申购时间+2天 当前时区(08):00:00 首次发息 */}
            <div className="flex justify-between">
              <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                {t("common.firstInterest")}
              </div>
              <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                {dayjs().add(2, "day").format("YYYY-MM-DD") +
                  " " +
                  `${getCurrentTimeZone()}:00:00`}
              </div>
            </div>
            {/* 定期 */}
            {subscribeConfirmModal.type === FinancialType.FIXED ? (
              <>
                {/* 最后发息 申购时间+定期天数+2天 当前时区(08):00:00 最后发息 */}
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    {t("common.lastDue")}
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {dayjs()
                      .add(Number(subscribeConfirmModal.fixedDays), "day")
                      .add(2, "day")
                      .format("YYYY-MM-DD") +
                      " " +
                      `${getCurrentTimeZone()}:00:00`}
                  </div>
                </div>
                {/* 下次申购 没选择自动申购,就不显示 */}
                {/* 下次申购 申购时间+定期天数+2天 当前时区(08):00:00 下次申购 */}
                {subscribeConfirmModal.autoSubscribe ? (
                  <div className="flex justify-between">
                    <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                      {t("common.nextSubscribe")}
                    </div>
                    <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                      {dayjs()
                        .add(Number(subscribeConfirmModal.fixedDays), "day")
                        .add(2, "day")
                        .format("YYYY-MM-DD") +
                        " " +
                        `${getCurrentTimeZone()}:00:00`}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default SubscribeConfirmModal;
