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
import { FunctionEnabledStatusEnum } from "@/services/financial";
import { useRouter } from "next/router";
import { createStyles } from "antd-style";
import appStore from "@/store";
import BigNumber from "bignumber.js";
import { useAuth } from "@/context/AuthContext";

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
    borderTop: "1px solid var(--border-color4) !important",
  },
  "my-modal-content": {
    padding: "0 !important",
  },
}));

const MyFinancial = observer(() => {
  const { t } = useTranslation(["financial"]);
  const router = useRouter();
  const { styles } = useStyle();
  const rateKey = appStore.getRateKey()?.replace(/\s+/g, ""); // 汇率key
  const rateData = appStore.getRateData();
  const { isLoggedIn } = useAuth();
  const financialConfig = appStore.financialConfig;

  const [current, setCurrent] = useState<{
    accuracy: number | null;
    symbol: string;
    rate: number | undefined;
    shortName: string;
  }>({
    accuracy: null, // 精度
    symbol: "", // 币种符号",
    rate: undefined, // 汇率
    shortName: "", // 币种名称
  });

  const [problemModalVisible, setProblemModalVisible] = useState(false);

  // 是否显示金额
  const [showAmount, setShowAmount] = useState(true);

  // 我的持仓
  const [myAmount, setMyAmount] = useState({
    holdings: 0.0, // 我的持仓
    totalRevenue: 0.0, // 总收益
    lastRevenue: 0.0, // 昨日收益
  });

  // 背景图片内容
  const [bgContent, setBgContent] = useState<any>({
    languageCode: "",
    mainTitle: t("financial.default.mainTitle"),
    subTitle: t("financial.default.subTitle"),
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
      initMyPosition();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    initBackgroundImage();
    const amountShow = appStore.getBanlanceShow();
    setShowAmount(amountShow);
  }, []);

  // 获取汇率
  useEffect(() => {
    const currentInfo = rateData.find(
      (item: any) => item.shortName === rateKey
    );
    if (currentInfo) {
      setCurrent({
        accuracy: currentInfo?.accuracy,
        shortName: currentInfo?.shortName,
        symbol: currentInfo?.symbol,
        rate: currentInfo?.exchangeRate,
      });
    } else {
      setCurrent({
        accuracy: null,
        shortName: "USD",
        symbol: "$",
        rate: 1,
      });
    }
  }, [rateKey, rateData]);

  return (
    <>
      <div
        className="flex flex-ai-center flex-jc-between py-[94px] gap-[40px] flex-wrap min-h-[412px]"
        style={{
          backgroundImage: `url(${
            bgContent.backgroundImage || "/images/financial/bg.png"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-[1200px] mx-auto flex gap-[60px]">
          {/* 左侧内容 */}
          <div className="flex-1 max-w-[calc(100%-471px)]">
            <div className="font-w-600 text-[48px] mb-[16px] leading-[normal] text-[var(--text-color5)]">
              {bgContent.mainTitle}
            </div>
            <div className="font-w-400 text-[18px] mb-[20px] leading-[normal] text-[var(--text-color6)] whitespace-pre-wrap">
              {bgContent.subTitle}
            </div>
            {financialConfig?.isDisplayBackground &&
              financialConfig.isDisplayBackground ===
                FunctionEnabledStatusEnum.OPEN && (
                <div
                  className="font-w-400 text-[22px] text-[color:var(--theme-color)] cursor-pointer"
                  onClick={openProblem}
                >
                  {t("financial.default.whatIs")} {bgContent.mainTitle}？
                </div>
              )}
          </div>

          {/* 右侧内容-我的资产 */}
          {financialConfig?.isDisplayAssets &&
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
                      {showAmount ? (
                        <EyeOutlined
                          style={{ color: "var(--text-color6)" }}
                          size={18}
                          className="cursor-pointer"
                          onClick={() => {
                            if (isLoggedIn) {
                              setShowAmount(!showAmount);
                              appStore.setBanlanceShow(!showAmount);
                            }
                          }}
                        />
                      ) : (
                        <EyeInvisibleOutlined
                          style={{ color: "var(--text-color6)" }}
                          size={18}
                          className="cursor-pointer"
                          onClick={() =>
                            isLoggedIn && setShowAmount(!showAmount)
                          }
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-ai-center flex-jc-between gap-[8px]">
                    <Tooltip title={t("common.financialOrder")}>
                      <div
                        className="w-[24px] h-[24px] cursor-pointer"
                        onClick={() => {
                          if (!isLoggedIn) {
                            router.push("/login");
                          } else {
                            router.push("/financialOrder");
                          }
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
                          if (!isLoggedIn) {
                            router.push("/login");
                          } else {
                            router.push("/assets/financial");
                          }
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
                  {/* 我的持仓 */}
                  <div className="text-[16px] flex flex-column gap-[18px] w-[33%]">
                    <div className="text-left">{t("financial.myPosition")}</div>
                    <div className="text-left font-[700]">
                      <MaskableAmount
                        prefix={`≈ ${current.symbol} `}
                        show={showAmount && isLoggedIn}
                        amount={
                          // 有汇率的存在
                          current.rate
                            ? // 有精度存在
                              current.accuracy
                              ? new BigNumber(myAmount.holdings)
                                  .times(new BigNumber(current.rate))
                                  .toFixed(Number(current.accuracy))
                              : new BigNumber(myAmount.holdings)
                                  .times(new BigNumber(current.rate))
                                  .toString()
                            : // 有汇率的存在
                              myAmount.holdings
                        }
                      />
                    </div>
                  </div>

                  {/* 总收益 */}
                  <div className="text-[16px] flex flex-column gap-[18px] w-[33%]">
                    <div className="text-center">
                      {t("financial.totalIncome")}
                    </div>
                    <div className="text-center font-[700]">
                      <MaskableAmount
                        prefix={`≈ ${current.symbol} `}
                        show={showAmount && isLoggedIn}
                        amount={
                          // 有汇率的存在
                          current.rate
                            ? // 有精度存在
                              current.accuracy
                              ? new BigNumber(myAmount.totalRevenue)
                                  .times(new BigNumber(current.rate))
                                  .toFixed(Number(current.accuracy))
                              : new BigNumber(myAmount.totalRevenue)
                                  .times(new BigNumber(current.rate))
                                  .toString()
                            : // 没有汇率的存在
                              myAmount.totalRevenue
                        }
                      />
                    </div>
                  </div>

                  {/* 昨日收益 */}
                  <div className="text-[16px] flex flex-column gap-[18px] w-[33%]">
                    <div className="text-right">
                      {t("financial.yesterdayIncome")}
                    </div>
                    <div className="text-right font-[700]">
                      <MaskableAmount
                        prefix={`≈ ${current.symbol} `}
                        show={showAmount && isLoggedIn}
                        amount={
                          // 有汇率的存在
                          current.rate
                            ? // 有精度存在
                              current.accuracy
                              ? new BigNumber(myAmount.lastRevenue)
                                  .times(new BigNumber(current.rate))
                                  .toFixed(Number(current.accuracy))
                              : new BigNumber(myAmount.lastRevenue)
                                  .times(new BigNumber(current.rate))
                                  .toString()
                            : // 没有汇率的存在
                              myAmount.lastRevenue
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
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
          {t("financial.default.whatIs")} {bgContent.mainTitle}？
        </div>
        <div className="text-[var(--text-color6)] text-[14px] p-[0_20px_20px_20px]">
          {t("financial.questionStaking.answer")}
        </div>
      </Modal>
    </>
  );
});

export default MyFinancial;
