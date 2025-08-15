import {
  ButtonTheme,
  modalStyle,
  ModalTheme,
  TokenTheme,
} from "@/theme/publicThemeConfig";
import { Button, Checkbox, ConfigProvider, Modal } from "antd";
import { useState } from "react";
const ConfirmModal = ({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) => {
  const { styles } = modalStyle();
  const [checked, setChecked] = useState(false);
  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: ModalTheme,
          Button: ButtonTheme,
        },
        token: TokenTheme,
      }}
    >
      <Modal
        maskClosable={false}
        centered
        open={open}
        width={430}
        title={
          <div className="text-[16px] text-[var(--text-color5)] font-[500]">
            下单确认
          </div>
        }
        classNames={{
          header: styles["my-modal-header"],
          footer: styles["my-modal-footer"],
          content: styles["my-modal-content"],
        }}
        onCancel={onCancel}
        footer={
          <div className="p-[30px_20px]">
            <Button
              className="h-[50px]"
              block
              type="primary"
              shape="round"
              onClick={onCancel}
            >
              确定
            </Button>
          </div>
        }
      >
        <div className="px-[20px] pt-[16px]">
          {/* title */}
          <div className="flex flex-col gap-[4px] mb-[18px]">
            <div className="font-[500] text-[18px] text-[var(--text-color5)]">
              买入开多BTCUSDT
            </div>
            <div className="text-[14px] text-[var(--text-color6)] font-[400]">
              逐仓 50x
            </div>
          </div>
          {/* info */}
          <div className="flex flex-col gap-[20px] font-[400] text-[14px] p-[20px_10px] border border-[var(--border-color4)] rounded-[8px]">
            <div className="flex justify-between">
              <div className=" text-[var(--text-color6)]">价格</div>
              <div className="text-[var(--text-color6)]">市价</div>
            </div>
            <div className="flex justify-between">
              <div className="text-[var(--text-color6)]">数量</div>
              <div className="text-[var(--text-color6)]">20 USDT</div>
            </div>
          </div>
          {/* checkbox */}
          <div className="flex items-center gap-[10px] mt-[10px]">
            <Checkbox checked={checked} onChange={() => setChecked(!checked)}>
              <div className="text-[14px] text-[var(--text-color5)] font-[400]">
                不再提醒。可在交易设置中，开启或关闭提示。
              </div>
            </Checkbox>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default ConfirmModal;
