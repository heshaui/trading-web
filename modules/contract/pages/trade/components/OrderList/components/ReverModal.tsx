import { SvgIcon } from "@/components/icon";
import {
  ButtonTheme,
  modalStyle,
  ModalTheme,
  TokenTheme,
} from "@/theme/publicThemeConfig";
import { Button, Checkbox, ConfigProvider, Modal } from "antd";
import { useState } from "react";

const ReverModal = ({
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
            反向开仓
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
          {/* titile */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-[2px]">
              <div className="text-[14px] text-[var(--text-color5)] font-[500]">
                BTCUSDT
              </div>
              <div className="text-[12px] font-[400] flex gap-[4px]">
                <span className="p-[1px_4px] text-[var(--text-color5)] bg-[var(--background14)] rounded-[3px]">
                  逐仓
                </span>
                <span className="p-[1px_4px] bg-[#FF4D4F] bg-opacity-20 text-[#FF4D4F] rounded-[3px]">
                  多反空
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-[2px] text-[14px] font-[400]">
              <div className="text-[var(--text-color6)]">最新价格</div>
              <div className="text-[var(--text-color5)] text-right">0</div>
            </div>
          </div>
          {/* top-box */}
          <div className="border border-[var(--border-color4)] rounded-[8px] p-[16px_10px] mt-[18px]">
            <div className="flex flex-col gap-[12px]">
              <div className="text-[14px] flex items-center">
                <div className="w-[2px] h-[10px] bg-[#00C788]"></div>
                <div className="font-[500] ml-[2px] mr-[4px]">市价平多</div>
                <div className="font-[400] p-[1px_4px] bg-[#00C788] bg-opacity-20 rounded-[3px] text-[#00C788]">
                  多 50x
                </div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">平仓数量</div>
                <div className="text-[var(--text-color5)]">595.27 USDT</div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">委托价格</div>
                <div className="text-[var(--text-color5)]">市价</div>
              </div>
            </div>
          </div>
          {/* transfer */}
          <div className="py-[7px]">
            <Button className="flex gap-[4px] mx-auto">
              <div> 反向开空</div>
              <SvgIcon width={16} height={16} viewBox="0 0 16 16">
                <path
                  d="M7.33324 11.4953L4.6999 8.862C4.63841 8.79833 4.56484 8.74754 4.48351 8.7126C4.40217 8.67766 4.31469 8.65927 4.22617 8.6585C4.13765 8.65773 4.04986 8.6746 3.96793 8.70812C3.886 8.74164 3.81157 8.79114 3.74897 8.85374C3.68638 8.91633 3.63688 8.99077 3.60336 9.0727C3.56983 9.15463 3.55297 9.24241 3.55374 9.33093C3.55451 9.41945 3.5729 9.50693 3.60784 9.58827C3.64277 9.66961 3.69356 9.74317 3.75724 9.80467L7.52857 13.576C7.65359 13.701 7.82313 13.7712 7.9999 13.7712C8.17668 13.7712 8.34622 13.701 8.47124 13.576L12.2426 9.80467C12.364 9.67893 12.4312 9.51053 12.4297 9.33573C12.4282 9.16093 12.3581 8.99373 12.2344 8.87012C12.1108 8.74652 11.9436 8.6764 11.7688 8.67488C11.594 8.67337 11.4256 8.74056 11.2999 8.862L8.66657 11.4953V2.66667C8.66657 2.48986 8.59633 2.32029 8.47131 2.19526C8.34628 2.07024 8.17671 2 7.9999 2C7.82309 2 7.65352 2.07024 7.5285 2.19526C7.40347 2.32029 7.33324 2.48986 7.33324 2.66667V11.4953Z"
                  fill="#FF4D4F"
                />
              </SvgIcon>
            </Button>
          </div>
          {/* bottom-box */}
          <div className="border border-[var(--border-color4)] rounded-[8px] p-[16px_10px]">
            <div className="flex flex-col gap-[12px]">
              <div className="text-[14px] flex items-center">
                <div className="w-[2px] h-[10px] bg-[#FF4D4F]"></div>
                <div className="font-[500] ml-[2px] mr-[4px]">市价开空</div>
                <div className="font-[400] p-[1px_4px] bg-[#FF4D4F] bg-opacity-20 rounded-[3px] text-[#FF4D4F]">
                  多 50x
                </div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">开仓数量</div>
                <div className="text-[var(--text-color5)]">595.27 USDT</div>
              </div>
              <div className="flex justify-between items-center text-[14px] font-[400]">
                <div className="text-[var(--text-color6)]">委托价格</div>
                <div className="text-[var(--text-color5)]">市价</div>
              </div>
            </div>
          </div>
          {/* tips */}
          <div className="text-[12px] text-[var(--text-color4)] font-[400] mt-[10px]">
            <div>
              *如果账户余额不足以开立相同规模的反向仓位，则以可用保证金开设方向相反的仓位。
            </div>
            <div>反向仓位的规模上限为每个合约的市价最大下单数量。</div>
            <div>
              请注意，反向开仓受市场状况、保证金要求和风险管理等多种因素影响，因此我们无法保证此操作100%成功。
            </div>
          </div>
          {/* checkbox */}
          <div className="mt-[10px]">
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

export default ReverModal;
