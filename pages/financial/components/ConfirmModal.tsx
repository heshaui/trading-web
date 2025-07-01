import { Button, Modal } from "antd";
import { useState } from "react";

const ConfirmModal = ({
  success = false,
  openConfirm,
  setOpenConfirm,
  setOpenSubscribe,
}: {
  success?: boolean;
  openConfirm: boolean;
  setOpenConfirm: (open: boolean) => void;
  setOpenSubscribe: (open: boolean) => void;
}) => {
  return (
    <Modal
      open={openConfirm}
      onCancel={() => setOpenConfirm(false)}
      closable={{ "aria-label": "Custom Close Button" }}
      footer={
        <div className="p-[30px_55px] flex justify-around gap-[20px]">
          <Button
            style={{
              background: "var(--cancel-btn)",
              color: "var(--cancel-color)",
            }}
            onClick={() => setOpenConfirm(false)}
            shape="round"
            size="large"
            className="h-[50px] flex-1 border-0"
          >
            前往理财
          </Button>
          <Button
            type="primary"
            shape="round"
            size="large"
            className="h-[50px] flex-1"
          >
            查看持仓
          </Button>
        </div>
      }
    >
      <div>
        {/* 图标 成功/失败*/}
        <div className="w-[105px] h-[96px] bg-[#DCDCDC] mb-[15px] m-[30px_180px_15px_180px]"></div>
        {/* 标题 成功了显示金额如:5 USDT 失败了显示申购失败 */}
        <div className="text-[20px] text-[#0C0D0C] font-[500] text-center mb-[16px]">
          {success ? "5 USDT" : "申购失败"}
        </div>
        {/* 副标题 */}
        <div className="text-[#0C0D0C] font-[400] text-center mb-[30px]">
          {success ? "申购成功" : "申购失败，订单取消！"}
        </div>
        {/* 时间 */}
        {success ? <div className="border border-[#DCDCDC] rounded-[8px] p-[20px] flex flex-column gap-[20px]">
          <div className="flex justify-between">
            <div className="text-[#676867] font-[400] text-[14px]">期限</div>
            <div className="text-[#0C0D0C] font-[400] text-[14px]">活期</div>
          </div>
          <div className="flex justify-between">
            <div className="text-[#676867] font-[400] text-[14px]">申购时间</div>
            <div className="text-[#0C0D0C] font-[400] text-[14px]">2025-02-13 13:13:13</div>
          </div>
          <div className="flex justify-between">
            <div className="text-[#676867] font-[400] text-[14px]">开始计息</div>
            <div className="text-[#0C0D0C] font-[400] text-[14px]">2025-02-14 08:00:00</div>
          </div>
          <div className="flex justify-between">
            <div className="text-[#676867] font-[400] text-[14px]">首次发息</div>
            <div className="text-[#0C0D0C] font-[400] text-[14px]">2025-02-15 08:00:00</div>
          </div>
        </div> : null}
      </div>
    </Modal>
  );
};

export default ConfirmModal;
