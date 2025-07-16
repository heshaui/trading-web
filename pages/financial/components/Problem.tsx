import { Collapse, ConfigProvider } from "antd";
import { useTranslation } from "react-i18next";

const textStyle = {
  fontSize: "16px",
  fontWeight: "500",
  color: "var(--text-color5)",
  borderBottom: "1px solid var(--border-color4)",
  borderRadius: "0",
};

const Problem = () => {
  const { t } = useTranslation(["financial"]);
  const items = [
    {
      key: "1",
      label: t("financial.question1.title"),
      children: <p className="text-[14px] text-[var(--text-color6)] font-[400]">{t("financial.question1.answer")}</p>,
      style: textStyle,
    },
    {
      key: "2",
      label: t("financial.question2.title"),
      children: <p className="text-[14px] text-[var(--text-color6)] font-[400]">{t("financial.question2.answer")}</p>,
      style: textStyle,
    },
    {
      key: "3",
      label: t("financial.question3.title"),
      children: <p className="text-[14px] text-[var(--text-color6)] font-[400]">{t("financial.question3.answer")}</p>,
      style: textStyle,
    },
    {
      key: "4",
      label: t("financial.question4.title"),
      children: <p className="text-[14px] text-[var(--text-color6)] font-[400]">{t("financial.question4.answer")}</p>,
      style: textStyle,
    },
    {
      key: "5",
      label: t("financial.question5.title"),
      children: <p className="text-[14px] text-[var(--text-color6)] font-[400]">{t("financial.question5.answer")}</p>,
      style: textStyle,
    },
  ];
  
  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            headerPadding: "20px 0",
          },
        },
      }}
    >
      <div id="problem" className="p-[30px_120px]">
        <div className="text-[32px] font-w-500 mb-[40px] text-[var(--text-color5)]">
          {t("financial.question")}
        </div>

        <div className="m-[5px_20px]">
          <Collapse expandIconPosition="end" ghost items={items} />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Problem;
