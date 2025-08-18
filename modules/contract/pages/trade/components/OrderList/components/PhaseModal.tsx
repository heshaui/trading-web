import {
  ButtonTheme,
  modalStyle,
  ModalTheme,
  TokenTheme,
} from "@/theme/publicThemeConfig";
import { Button, Checkbox, ConfigProvider, Modal } from "antd";
import Image from "next/image";
import { useState } from "react";

const PhaseModal = ({
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
        closable={false}
        centered
        open={open}
        width={430}
        title={null}
        classNames={{
          header: styles["my-modal-header"],
          footer: styles["my-modal-footer"],
          content: styles["my-modal-content"],
        }}
        onCancel={onCancel}
        footer={
          <div className="p-[30px_20px] flex flex-col gap-[10px]">
            <Button
              className="h-[50px]"
              block
              type="primary"
              shape="round"
              onClick={onCancel}
            >
              保存
            </Button>
            <Button className="h-[50px]" block shape="round" onClick={onCancel}>
              取消
            </Button>
          </div>
        }
      >
        <div className="p-[30px] pb-[0px]">
          {/* info */}
          <div className="flex justify-between mb-[20px]">
            {/* 左 */}
            <div className="flex flex-col">
              {/* title */}
              <div>
                <div className="text-[16px] font-[500]">BTCUSDT</div>
                <div className="mt-[4px] mb-[6px] font-[500] text-[12px] text-[var(--text-color6)]">
                  <span className="text-[#00C788]">做多</span> | 50x | 逐仓
                </div>
                <div className="text-[12px] font-[400] text-[#FF5F1F]">
                  这点亏损小爷我还承受的起
                </div>
              </div>
              {/* 收益率 */}
              <div className="flex flex-col gap-[4px] mt-[20px] mb-[30px]">
                <div className="text-[14px] font-[400] text-[var(--text-color6)]">
                  收益率
                </div>
                <div className="text-[32px] font-[700] text-[#FF4D4F]">
                  -7.02%
                </div>
              </div>
              {/* 价格 */}
              <div className="flex justify-between text-[14px] font-[400] mb-[20px]">
                <div className="flex flex-col gap-[4px]">
                  <div className="text-[var(--text-color6)]">开仓均价</div>
                  <div className="text-[var(--text-color5)]">34,715.5</div>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <div className="text-[var(--text-color6)]">平仓均价</div>
                  <div className="text-[var(--text-color5)]">34,666.7</div>
                </div>
              </div>
              {/* 时间 */}
              <div className="text-[12px] font-[400] text-[var(--text-color6)]">
                2025-07-08 16:36:25
              </div>
            </div>
            {/* 右 */}
            <div>
              <Image
                className="mt-[67px]"
                src="/images/contract/phase.png"
                alt="phase"
                width={218}
                height={218}
              />
            </div>
          </div>
          {/* 邀请码 */}
          <div className="flex justify-between items-center p-[12px_16px] rounded-[8px] bg-[var(--background14)]">
            {/* 左边 */}
            <div className="flex items-center gap-[8px]">
              <div className="w-[36px] h-[36px] bg-[red]"></div>
              <div className="flex flex-col gap-[4px] text-[14px]">
                <div className="font-[500] text-[var(--text-color5)]">
                  IMBIT
                </div>
                <div className="font-[400] text-[var(--text-color6)]">
                  邀请码 QLTWTGTQ
                </div>
              </div>
            </div>
            {/* 右边 */}
            <div className="w-[58px] h-[58px] bg-[#fff]"></div>
          </div>
          {/* checkbox */}
          <div className="mt-[20px]">
            <Checkbox checked={checked} onChange={() => setChecked(!checked)}>
              <div className="text-[14px] text-[var(--text-color5)] font-[400]">
                显示收益金额
              </div>
            </Checkbox>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default PhaseModal;
