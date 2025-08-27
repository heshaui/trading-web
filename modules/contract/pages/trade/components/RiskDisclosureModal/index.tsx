import React from "react";
import { Modal, ConfigProvider, Button } from "antd";
import { useTranslation } from "next-i18next";
import { Iconify } from "@/components/icon";
import styles from "./RiskDisclosureModal.module.css";

interface ContractRiskDisclosureModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ContractRiskDisclosureModal: React.FC<ContractRiskDisclosureModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation(["contract"]);

  const handleCancel = () => {
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "var(--background5)",
            footerBg: "var(--background5)",
            headerBg: "var(--background5)",
            titleColor: "var(--text-color1)",
          },
        },
      }}
    >
      <Modal
        open={open}
        title={
          <div className={styles.modalTitle}>
            <span>{t("riskDisclosure.title")}</span>
            <Button
              type="text"
              icon={<Iconify icon="mdi:close" />}
              onClick={handleCancel}
              className={styles.closeButton}
            />
          </div>
        }
        centered
        onCancel={handleCancel}
        footer={null}
        width={450}
        className={`modal_box ${styles.riskDisclosureModal}`}
        closable={false}
        maskClosable={false}
      >
        <div className={styles.modalContent}>
          {/* 风险披露内容 */}
          <div>
            <p>{t("riskDisclosure.content.paragraph1")}</p>
            <p>{t("riskDisclosure.content.paragraph2")}</p>
            <p>{t("riskDisclosure.content.paragraph3")}</p>
            <p>{t("riskDisclosure.content.paragraph4")}</p>
            <p>{t("riskDisclosure.content.paragraph5")}</p>
            <p>{t("riskDisclosure.content.paragraph6")}</p>
            <p>{t("riskDisclosure.content.paragraph7")}</p>
          </div>
          {/* 底部按钮 */}
          <div className={styles.modalFooter}>
            <Button
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              {t("riskDisclosure.cancel")}
            </Button>
            <Button
              type="primary"
              className={styles.confirmButton}
              onClick={handleConfirm}
            >
              {t("riskDisclosure.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default ContractRiskDisclosureModal; 