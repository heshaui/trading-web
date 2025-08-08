import {
  ButtonTheme,
  modalStyle,
  ModalTheme,
  SliderTheme,
  TokenTheme,
} from "@/theme/publicThemeConfig";
import {
  Button,
  ConfigProvider,
  InputNumber,
  Modal,
  Segmented,
  Slider,
} from "antd";
import { useState } from "react";

const AdjustModal = ({
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
          Slider: SliderTheme,
          Segmented: {
            fontSize: 14,
            borderRadius: 50, // 分段器圆角
            borderRadiusSM: 50, // 分段器圆角
            itemHoverBg: "transparent",
            itemActiveBg: "transparent",
            itemColor: "var(--text-color6)",
            itemHoverColor: "var(--text-color6)",
            itemSelectedBg: "var(--segmented-item-active-bg)",
            itemSelectedColor: "var(--text-color5)",
          },
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
            调节逐仓仓位保证金
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
              disabled={!checked}
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
          {/* 切换模式 */}
          <Segmented
            block
            shape="round"
            options={[
              {
                label: (
                  <div className="h-[36px] w-[100%] flex items-center justify-center">
                    增加保证金
                  </div>
                ),
                value: 1,
              },
              {
                label: (
                  <div className="h-[36px] w-[100%] flex items-center justify-center">
                    减少保证金
                  </div>
                ),
                value: 2,
              },
            ]}
            className="h-[44px] w-[215px] mb-[16px] bg-[var(--btncolor3)] p-[3px]"
            onChange={(value) => setChecked(value === 1)}
          />
          {/* 输入框 */}
          <InputNumber
            placeholder="增加保证金数量"
            className="w-[100%] h-[50px] leading-[50px]"
            suffix="USDT"
          />
          {/* 滑动条 */}
          <Slider
            min={0}
            max={100}
            step={1}
            className="!my-[16px]"
            marks={{
              0: " ",
              25: " ",
              50: " ",
              75: " ",
              100: " ",
            }}
          />
          {/* 可用资产 */}
          <div className="flex gap-[4px] text-[14px] font-[400] mb-[16px]">
            <div className="text-[var(--text-color6)]">可用:</div>
            <div className="text-[var(--text-color5)]">63.19 USDT</div>
          </div>
          {/* 信息 */}
          <div className="w-full font-[400] text-[14px] p-[20px_10px] border border-[var(--border-color4)] rounded-[8px]">
            {/* table-header */}
            <div className="mb-[10px]">
              <div className="flex justify-between text-[var(--text-color6)]">
                <div className="flex-1"></div>
                <div className="flex-1 text-right">当前</div>
                <div className="flex-1 text-right">变更后</div>
              </div>
            </div>
            {/* table-body */}
            <div className="flex flex-col gap-[12px]">
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">仓位</div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  5955.29 USDT
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  5955.29 USDT
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">
                  仓位保证金
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  11.62 USDT
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  11.62 USDT
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">
                  仓位保证金
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  51.2x
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  51.2x
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex-1 text-[var(--text-color6)]">强平价</div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  106,601.2 USDT
                </div>
                <div className="flex-1 text-right text-[var(--text-color5)]">
                  106,601.2 USDT
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default AdjustModal;
