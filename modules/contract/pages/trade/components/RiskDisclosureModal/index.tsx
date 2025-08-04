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
            <span>合约交易风险确认书</span>
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
          <div><p>一、当您在合约市场进行交易时，若因市场走势对您不利产生亏损，导致您的持仓保证金不足。本交易所合约将会按照系统约定对您的持仓进行强平委托并披露强平明细，请您留意。</p><p>二、请您务必认真阅读并遵守本交易所的业务规则。了解合约机制和运行原理，了解市场的各种风险，合理安排资金进行交易。</p><p>三、在某些极端的市场行情下，您可能会难以或无法将持有的未平仓合约平仓。例如，当你的盈利在整个合约市场中有效杠杆PnL中排位第一，且保险基金不足以垫付亏损方的穿仓损失情况下。</p><p>四、由于当地法律、法规、政策的变化、合约交易所交易规则的修改、紧急措施的出台等原因，本交易所会提前披露声明，您持有的未平仓合约可能无法继续持有，但持仓保证金和盈利的结余平台仍会兑现！</p><p>五、由于非本交易所所能控制的原因，例如：地震、水灾、火灾等不可抗力因素或者计算机系统、通讯系统故障等，可能造成您的指令无法成交或者无法全部成交，您可能会承担由此导致的损失。</p><p>六、“套期保值”交易同投机交易一样，同样面临价格波动引起的风险。请您提前了解相关机制。</p><p>七、若您账号借给非本人操作，将可能会影响到您的合约保证金安全性。请务必保证个人账户安全。</p></div>
          {/* 底部按钮 */}
          <div className={styles.modalFooter}>
            <Button
              className={styles.cancelButton}
              onClick={handleCancel}
            >
            取消
            </Button>
            <Button
              type="primary"
              className={styles.confirmButton}
              onClick={handleConfirm}
            >
            确认
            </Button>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default ContractRiskDisclosureModal; 