import { Modal, ConfigProvider, Form, Input, Steps, QRCode } from "antd";
import type { ModalProps,StepProps } from "antd";
import styles from "../styles/steps.module.css";
import { Iconify } from "@/components/icon/index";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
type Props = {
  open: boolean;
  onCancel: () => void;
};

function WithdrawStepsModal({ open, onCancel, }: Props) {
  const { t } = useTranslation('assets');

  const [current, setCurrent] = useState(3);


  const steps: StepProps[] = [
    {
      title: (
        <p className={`${styles.tip_title}`}>
          {/* Android/iOS 谷歌验证器下载 */}
          {t("withdrawSteps.stepTitle1")}
        </p>
      ),
      status: 'process',
      description: (
          <p className={`${styles.tip_color} ${styles.steps_box} font-12 font-w-400`}>
            {t("withdrawSteps.stepTip1")}
          </p>
      ),
    },
    {
      title: (
        <p className={`${styles.tip_title}`}>
          {/* 在谷歌验证器中添加密钥并备份 */}
          {t("withdrawSteps.stepTitle2")}
        </p>
      ),
      status: 'process',
      description: (
          <p className={`${styles.tip_color} ${styles.steps_box} font-12 font-w-400`}>
            {t("withdrawSteps.stepTip2")}
          </p>
      ),
    },
    {
      title: (
        <p className={`${styles.tip_title}`}>
          {/* 验证谷歌验证码 */}
          {t("withdrawSteps.stepTitle3")}
        </p>
      ),
      status: 'process',
      description: (
        <p className={`${styles.tip_color} ${styles.steps_box} font-12 font-w-400`}>
        {t("withdrawSteps.stepTip3")}
      </p>
      ),
    },
    {
      title: (
        <p className={`${styles.tip_title}`}>
          {/* 验证谷歌验证码 */}
          {t("withdrawSteps.stepTitle4")}
        </p>
      ),
      description: (
        <p className={`${styles.tip_color}  font-12 font-w-400`}>
        {t("withdrawSteps.stepTip4")}
      </p>
      ),
    },
  ];


  const ModalFooter: ModalProps["footer"] = () => {
    return (<></>
    );
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "var(--background5)",
            footerBg: "var(--background5)",
            headerBg: "var(--background5)",
          },
        },
        token: {
          // colorBgContainerDisabled: '#fff',
        },
      }}
    >
      <Modal
        open={open}
        title={
          <p className={`${styles.title}`}>
            {/* 如何提现数字货币 */}
            {t("withdrawSteps.title")}
          </p>
        }
        centered
        onCancel={onCancel}
        footer={ModalFooter}
        width={450}
        className={`modal_box`}
        classNames={{
          content: styles.modal_content,
          body: styles.modal_body,
          footer: styles.modal_footer,
        }}
        maskClosable={false}
      >
        <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
          <Steps
            direction="vertical"
            current={current}
            labelPlacement="vertical"
            items={steps}
            className="withdraw_steps"
          />
          {/* {items[current].content} */}
        </div>
      </Modal>
    </ConfigProvider>
  );
}

export default WithdrawStepsModal;
