import {
  ButtonTheme,
  modalStyle,
  ModalTheme,
  TokenTheme,
} from "@/theme/publicThemeConfig";
import { Button, ConfigProvider, Modal } from "antd";
const TipModal = ({
  title = "title",
  tip = "tip",
  open,
  onCancel,
}: {
  title: string;
  tip: string;
  open: boolean;
  onCancel: () => void;
}) => {
  const { styles } = modalStyle();
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
            {title}
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
        <div className="text-[16px] text-[var(--text-color6)] font-[400] px-[20px] pt-[28px]">
          {tip}
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default TipModal;
