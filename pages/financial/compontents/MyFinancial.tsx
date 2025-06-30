import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import styles from "../styles/MyFinancial.module.css";

export const MyFinancial = observer(() => {
  const { t } = useTranslation(["financial"]);
  return (
    <div style={{
      background: "linear-gradient(270deg, #E6EFFF 0%, #EBF2FF 46%, #FAFBFF 100%)",
    }} className="flex flex-ai-center flex-jc-between p-[94px_120px] gap-[40px]">
      <div style={{ flex: 1 }}>
        <div
          className="font-w-600 text-[48px] mb-[16px] leading-[normal]"
          style={{ color: "var(--text-color5)" }}
        >
          Staking
        </div>
        <div
          className="font-w-400 text-[20px] mb-[12px] leading-[normal]"
          style={{ color: "var(--text-color6)" }}
        >
          门槛低 | 安全性高 | 收益率高
        </div>
        <div
          className="font-w-400 text-[18px] mb-[20px] leading-[normal]"
          style={{ color: "var(--text-color6)" }}
        >
          一站式综合理财服务中心，拥有活期、定期理财方案，为用户提供多个种类上百种数
          字货币金融产品
        </div>
        <div
          className="font-w-400 text-[22px]"
          style={{ color: "var(--theme-color)" }}
        >
          什么是Staking？
        </div>
      </div>
      <div className={styles.right_box}>
        <div className={` flex flex-ai-center flex-jc-between mb-[40px]`}>
          <div className="font-w-400 text-[24px]">我的资产</div>
          <div className="flex flex-ai-center flex-jc-between gap-[8px]">
            <div style={{ width: 24, height: 24, background: "red" }}></div>
            <div style={{ width: 24, height: 24, background: "red" }}></div>
          </div>
        </div>
        <div
          className={`${styles.right_box_bottom} flex flex-ai-center flex-jc-between`}
        >
          <div className="text-[16px] flex flex-column gap-[18px]">
            <div>我的持仓</div>
            <div>***</div>
          </div>
          <div className="text-[16px] flex flex-column gap-[18px]">
            <div>总收益</div>
            <div className="text-center">***</div>
          </div>
          <div className="text-[16px] flex flex-column gap-[18px]">
            <div>昨日收益</div>
            <div className="text-right">***</div>
          </div>
        </div>
      </div>
    </div>
  );
});
