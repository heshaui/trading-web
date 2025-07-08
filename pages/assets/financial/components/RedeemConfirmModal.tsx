import { FinancialType } from "@/services/financial";
import { Button, Modal } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";

const ConfirmModal = ({
  confirmModal,
  setConfirmModal,
}: {
  confirmModal: {
    open: boolean;
    status: "error" | "success" | null;
    amount?: number;
    type?: FinancialType;
    unit?: string;
    endTime?: number;
  };
  setConfirmModal: (confirmModal: {
    open: boolean;
    status: "error" | "success" | null;
    amount?: number;
    type?: FinancialType;
    unit?: string;
    endTime?: number;
  }) => void;
}) => {
  const router = useRouter()
  return (
    <Modal
      open={confirmModal.open}
      onCancel={() => setConfirmModal({ ...confirmModal, open: false })}
      closable={{ "aria-label": "Custom Close Button" }}
      footer={
        <div className="p-[30px_55px] flex justify-around gap-[20px]">
          <Button
            className="bg-[var(--cancel-btn)] text-[var(--cancel-color)] h-[50px] flex-1 border-0"
            onClick={() =>{
              router.push('/financial')
            }}
            shape="round"
            size="large"
          >
            前往理财
          </Button>
          <Button
            type="primary"
            shape="round"
            size="large"
            className="h-[50px] flex-1"
            onClick={() =>{
              router.push('/financialOrder')
            }}
          >
            查看持仓
          </Button>
        </div>
      }
    >
      <div>
        {/* 图标 成功/失败*/}
        <div className="w-[105px] h-[96px] bg-[red] mb-[15px] m-[30px_180px_15px_180px]"></div>
        {/* 标题 成功了显示金额如:5 USDT 失败了显示申购失败 */}
        <div className="text-[20px] text-[var(--text-color5)] font-[500] text-center mb-[16px]">
          {confirmModal.status === "success" ? `${confirmModal.amount} ${confirmModal.unit}` : "申购失败"}
        </div>
        {/* 副标题 */}
        <div className="text-[var(--text-color5)] font-[400] text-center mb-[30px]">
          {confirmModal.status === "success" ? "赎回成功" : "赎回失败，订单取消！"}
        </div>
        {/* 时间 */}
        {confirmModal.status === "success" ? (
          <div className="border border-[var(--border-color4)] rounded-[8px] p-[20px] flex flex-column gap-[20px]">
            {confirmModal.type === FinancialType.FIXED ? (
              <>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    赎回成功
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {confirmModal.amount} {confirmModal.unit}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    已获得利息
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {confirmModal.amount} {confirmModal.unit}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    赎回金额
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {confirmModal.amount} {confirmModal.unit}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    提交时间
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
                    赎回时间
                  </div>
                  {/* 当前时间 */}
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {dayjs().format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                    到账时间
                  </div>
                  <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                    {dayjs(confirmModal.endTime).format("YYYY-MM-DD HH:mm:ss")}
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

export default ConfirmModal;
