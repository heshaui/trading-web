import { Button, Modal } from "antd";

const ConfirmModal = ({
  success = false,
  openConfirm,
  setOpenConfirm,
}: {
  success?: boolean;
  openConfirm: boolean;
  setOpenConfirm: (open: boolean) => void;
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
        {success ? (
          <div className="border border-[#DCDCDC] rounded-[8px] p-[20px] flex flex-column gap-[20px]">
            {true ? (
              <>
                <div className="flex justify-between">
                  <div className="text-[#676867] font-[400] text-[14px]">
                    申购金额
                  </div>
                  <div className="text-[#0C0D0C] font-[400] text-[14px]">
                    申购金额
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[#676867] font-[400] text-[14px]">
                    已获得利息
                  </div>
                  <div className="text-[#0C0D0C] font-[400] text-[14px]">
                    0.12 USDT
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[#676867] font-[400] text-[14px]">
                    赎回金额
                  </div>
                  <div className="text-[#0C0D0C] font-[400] text-[14px]">
                    4.88 USDT
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[#676867] font-[400] text-[14px]">
                    提交时间
                  </div>
                  <div className="text-[#0C0D0C] font-[400] text-[14px]">
                    2025-06-16 19:00:23
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <div className="text-[#676867] font-[400] text-[14px]">
                    赎回时间
                  </div>
                  <div className="text-[#0C0D0C] font-[400] text-[14px]">
                    2025-02-13 13:13:13
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[#676867] font-[400] text-[14px]">
                    到账时间
                  </div>
                  <div className="text-[#0C0D0C] font-[400] text-[14px]">
                    2025-02-13 13:13:13
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
