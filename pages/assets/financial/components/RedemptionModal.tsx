import { Button, ConfigProvider, InputNumber, Modal } from "antd";
import { createStyles } from "antd-style";

const useStyle = createStyles(() => ({
  "my-modal-header": {
    height: "60px !important",
    padding: "0 20px !important",
    borderRadius: "10px 10px 0px 0px",
    background: "#fff",
    boxShadow: "0px -0.5px 0px 0px #dcdcdc inset",
  },
  "my-modal-footer": {
    width: "100%",
    marginTop: "0 !important",
    borderRadius: "0 0 10px 10px !important",
  },
  "my-modal-content": {
    padding: "0 !important",
  },
}));

const RedemptionModal = ({
  openRedemption,
  setOpenRedemption,
}: {
  openRedemption: boolean;
  setOpenRedemption: (open: boolean) => void;
}) => {
  const { styles } = useStyle();
  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: { titleLineHeight: "60px" },
        },
      }}
    >
      <Modal
        classNames={{
          header: styles["my-modal-header"],
          footer: styles["my-modal-footer"],
          content: styles["my-modal-content"],
        }}
        title={
          <div className="text-[16px] text-[#0C0D0C] font-[500]">赎回USDT</div>
        }
        open={openRedemption}
        onCancel={() => setOpenRedemption(false)}
        footer={
          <div className="p-[30px_55px] flex justify-around gap-[20px]">
            <Button
              style={{
                background: "var(--cancel-btn)",
                color: "var(--cancel-color)",
              }}
              onClick={() => setOpenRedemption(false)}
              shape="round"
              size="large"
              className="h-[50px] flex-1 border-0"
            >
              取消
            </Button>
            <Button
              type="primary"
              shape="round"
              size="large"
              className="h-[50px] flex-1"
            >
              确认
            </Button>
          </div>
        }
      >
        <div className="p-[30px_20px_10px_20px]">
          {true ? (
            <>
              {/* label */}
              <div className="text-[14px] text-[#0C0D0C] font-[400] mb-[10px]">
                赎回金额
              </div>
              {/* 输入框 */}
              <InputNumber className="w-[100%] h-[50px] mb-[10px]" />
              {/* 显示内容 */}
              <div>
                <div className="mb-[4px]">
                  <span className="text-[12px] text-[#A4A5AC] font-[400] mr-[10px]">
                    今日资产
                  </span>
                  <span className="text-[12px] text-[#0C0D0C] font-[500]">
                    0.00000000 USDT
                  </span>
                </div>
                <div>
                  <span className="text-[12px] text-[#A4A5AC] font-[400] mr-[10px]">
                    今日赎回上限
                  </span>
                  <span className="text-[12px] text-[#0C0D0C] font-[500]">
                    0.00000000 USDT
                  </span>
                </div>
              </div>
              {/* 提示 */}
              <div
                className="rounded-[8px] p-[10px_16px]  text-[14px] font-[500] mt-[10px]"
                style={{
                  color: "var(--theme-color)",
                  background: "var(--bgc-color)",
                }}
              >
                <div>今日赎回金额上限：50USDT，请于明日重新操作！</div>
              </div>
            </>
          ) : (
            <>
              {/* 金额 */}
              <div className="text-[24px] text-[#0C0D0C] font-[500] mb-[8px] text-center">
                5 USDT
              </div>
              {/* subTitle */}
              <div className="text-[14px] text-[#676867] font-[400] mb-[37px] text-center">
                赎回数量
              </div>
              {/* 内容显示 */}
              <div className="border border-[#DCDCDC] rounded-[8px] p-[20px] flex flex-column gap-[20px]">
                <div className="flex justify-between">
                  <div className="text-[#676867] font-[400] text-[14px]">
                    申购金额
                  </div>
                  <div className="text-[#0C0D0C] font-[400] text-[14px]">
                    5 USDT
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
              </div>
              {/* 提示 */}
              <div
                className="rounded-[8px] p-[10px_16px]  text-[14px] font-[500] mt-[10px]"
                style={{
                  color: "var(--theme-color)",
                  background: "var(--bgc-color)",
                }}
              >
                <div>1.提前赎回将失去已获得利息。</div>
                <div>2.所有资产将在72小时内退回至您的现货账户。</div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default RedemptionModal;
