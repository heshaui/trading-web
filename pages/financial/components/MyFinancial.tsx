import { observer } from "mobx-react-lite";
import { useTranslation } from "next-i18next";
import { getBackgroundImageConfig, getMyPosition } from "@/services/financial";
import { useEffect, useState } from "react";
import MaskableAmount from "@/components/MaskableAmount";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Image, Modal, Tooltip } from "antd";
import { FinancialConfig } from "../index";
import { FunctionEnabledStatusEnum } from "@/services/financial";
import { useRouter } from "next/router";
import { createStyles } from "antd-style";

const useStyle = createStyles(() => ({
  "my-modal-header": {
    height: "60px !important",
    padding: "0 20px !important",
    borderRadius: "10px 10px 0px 0px",
    background: "#fff",
    boxShadow: "0px -0.5px 0px 0px #dcdcdc inset",
  },
  "my-modal-footer": {
    width: "100%",
    marginTop: "0 !important",
    borderRadius: "0 0 10px 10px !important",
    padding: "20px !important",
    borderTop: "0.5px solid var(--border-color2) !important",
  },
  "my-modal-content": {
    padding: "0 !important",
  },
}));
interface MyFinancialProps {
  financialConfig: FinancialConfig;
  isLoggedIn: boolean;
}

const MyFinancial = observer(
  ({ financialConfig, isLoggedIn }: MyFinancialProps) => {
    const { t } = useTranslation(["financial"]);

    const router = useRouter();
    const { styles } = useStyle();
    const [problemModalVisible, setProblemModalVisible] = useState(false);

    // 是否显示金额
    const [showAmount, setShowAmount] = useState(false);

    // 我的持仓
    const [myAmount, setMyAmount] = useState({
      holdings: 0.0, // 我的持仓
      totalRevenue: 0.0, // 总收益
      lastRevenue: 0.0, // 昨日收益
    });

    // 背景图片内容
    const [bgContent, setBgContent] = useState<any>({
      languageCode: "",
      mainTitle: "",
      subTitle: "",
      backgroundImage: "",
    });

    // 初始化背景图片
    const initBackgroundImage = async () => {
      try {
        const res = await getBackgroundImageConfig();
        if (res.code === "0") {
          setBgContent(res.data);
        }
      } catch (error) {
        console.error("Failed to load background image config:", error);
      }
    };

    // 初始化我的持仓
    const initMyPosition = async () => {
      try {
        const res = await getMyPosition();
        if (res.code === "0") {
          setMyAmount(res.data);
        }
      } catch (error) {
        console.error("Failed to load position data:", error);
      }
    };

    // 打开常见问题
    const openProblem = () => {
      setProblemModalVisible(true);
    };

    // 初始化
    useEffect(() => {
      if (isLoggedIn) {
        initBackgroundImage();
        initMyPosition();
      }
    }, [isLoggedIn]);

    return (
      <>
        <div
          className="flex flex-ai-center flex-jc-between p-[94px_120px] gap-[40px] flex-wrap min-h-[412px]"
          style={{
            backgroundImage: `url(${
              bgContent.backgroundImage || "/images/financial/bg.png"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* 左侧内容 */}
          <div className="flex-1">
            <div className="font-w-600 text-[48px] mb-[16px] leading-[normal] text-[var(--text-color5)]">
              {bgContent.mainTitle}
            </div>
            <div className="font-w-400 text-[18px] mb-[20px] leading-[normal] text-[var(--text-color6)]">
              {bgContent.subTitle}
            </div>
            {financialConfig?.isDisplayBackground &&
              financialConfig.isDisplayBackground ===
                FunctionEnabledStatusEnum.OPEN && (
                <div
                  className="font-w-400 text-[22px] text-[color:var(--theme-color)] cursor-pointer"
                  onClick={openProblem}
                >
                  什么是{bgContent.mainTitle}？
                </div>
              )}
          </div>

          {/* 右侧内容-我的资产 */}
          {financialConfig?.isDisplayAssets && isLoggedIn &&
            financialConfig.isDisplayAssets ===
              FunctionEnabledStatusEnum.OPEN && (
              <div className="w-[471px] rounded-[16px] bg-[var(--background12)] shadow-[0px_0px_36px_0px_rgba(165,165,165,0.2)] p-[24px_20px] text-[var(--text-color5)]">
                <div
                  className={` flex flex-ai-center flex-jc-between mb-[40px]`}
                >
                  <div className="flex gap-[4px] align-center">
                    <div className="font-w-400 text-[24px]">
                      {t("financial.myProperty")}
                    </div>
                    <div>
                      {!showAmount ? (
                        <EyeOutlined
                          size={18}
                          className="cursor-pointer"
                          onClick={() => setShowAmount(!showAmount)}
                        />
                      ) : (
                        <EyeInvisibleOutlined
                          size={18}
                          className="cursor-pointer"
                          onClick={() => setShowAmount(!showAmount)}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-ai-center flex-jc-between gap-[8px]">
                    <Tooltip title={t("common.financialOrder")}>
                      <div
                        className="w-[24px] h-[24px] cursor-pointer"
                        onClick={() => {
                          router.push("/financialOrder");
                        }}
                      >
                        <Image
                          preview={false}
                          src={`/images/financial/a.svg`}
                          alt=""
                        />
                      </div>
                    </Tooltip>
                    <Tooltip title={t("common.financialAccount")}>
                      <div
                        className="w-[24px] h-[24px] cursor-pointer"
                        onClick={() => {
                          router.push("/assets/financial");
                        }}
                      >
                        <Image
                          preview={false}
                          src={`/images/financial/b.svg`}
                          alt=""
                        />
                      </div>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex flex-ai-center flex-jc-between">
                  <div className="text-[16px] flex flex-column gap-[18px]">
                    <div>{t("financial.myPosition")}</div>
                    <MaskableAmount
                      show={showAmount}
                      amount={myAmount.holdings}
                    />
                  </div>
                  <div className="text-[16px] flex flex-column gap-[18px]">
                    <div>{t("financial.totalIncome")}</div>
                    <div className="text-center">
                      <MaskableAmount
                        show={showAmount}
                        amount={myAmount.totalRevenue}
                      />
                    </div>
                  </div>
                  <div className="text-[16px] flex flex-column gap-[18px]">
                    <div>{t("financial.yesterdayIncome")}</div>
                    <div className="text-right">
                      <MaskableAmount
                        show={showAmount}
                        amount={myAmount.lastRevenue}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
        <Modal
          open={problemModalVisible}
          onCancel={() => setProblemModalVisible(false)}
          footer={
            <div
              className="text-left text-[var(--text-color5)] text-[16px] flex flex-ai-center gap-[8px] cursor-pointer"
              onClick={() => {
                setProblemModalVisible(false);
                // 滚动到Problem组件
                const problem = document.getElementById("problem");
                if (problem) {
                  problem.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <div>{t("financial.question")}</div>
              <RightOutlined />
            </div>
          }
          title={null}
          classNames={{
            header: styles["my-modal-header"],
            footer: styles["my-modal-footer"],
            content: styles["my-modal-content"],
          }}
        >
          <div className="text-[var(--text-color5)] text-[16px] font-bold p-[19px_20px_16px_20px]">
            {t("financial.questionStaking.title")}
          </div>
          <div className="text-[var(--text-color6] text-[14px] p-[0_20px_20px_20px]">
            {t("financial.questionStaking.answer")}
          </div>
        </Modal>
      </>
    );
  }
);

export default MyFinancial;
