import { observer } from "mobx-react-lite";
import { useTranslation } from "next-i18next";
import { getBackgroundImageConfig, getMyPosition } from "@/services/financial";
import { useEffect, useState } from "react";
import MaskableAmount from "@/components/MaskableAmount";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Image, Modal, Tooltip } from "antd";
import { FinancialConfig } from "../index";
import { FunctionEnabledStatusEnum } from "@/services/financial";
import { useRouter } from "next/router";

const MyFinancial = observer(
  ({
    financialConfig,
    isLoggedIn,
  }: {
    financialConfig: FinancialConfig;
    isLoggedIn: boolean;
  }) => {
    const { t } = useTranslation(["financial"]);
    const router = useRouter();

    const [showAmount, setShowAmount] = useState(false);
    const [myAmount, setMyAmount] = useState({
      holdings: 0.0,
      totalRevenue: 0.0,
      lastRevenue: 0.0,
    });
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

    const openProblem = () => {
      Modal.info({
        title: "什么是" + bgContent.mainTitle + "？",
        content: (
          <div>
            Staking是基于数字资产的理财，您购买的产品，在持仓期或锁仓期结束后均可以获得本息收益。主要包含“活期理财、定期理财”。我们将甄选优质项目提供丰富的持币收益，支持全球的持币用户参与。目前首发项目将提供“锁仓、持仓”等多种返利方式。持仓理财：用户只需持有该资产即可获得收益。定期理财：根据不同的项目，您可以选择不同项目的锁仓周期，到期后您将获得全部奖励和收益，若您在锁定期内提前将资产转出将损失已产生奖励。
          </div>
        ),
      });
    };

    useEffect(() => {
      // 确保只在客户端执行
      if (typeof window !== "undefined") {
      console.log(isLoggedIn);
        if (isLoggedIn) {
          initBackgroundImage();
          initMyPosition();
        }
      }
    }, [isLoggedIn]);

    return (
      <div
        className="flex flex-ai-center flex-jc-between p-[94px_120px] gap-[40px] flex-wrap min-h-[412px]"
        style={{
          backgroundImage: `url(${bgContent.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex-1">
          <div className="font-w-600 text-[48px] mb-[16px] leading-[normal] text-[var(--text-color5)]">
            {bgContent.mainTitle}
          </div>
          <div className="font-w-400 text-[18px] mb-[20px] leading-[normal] text-[var(--text-color6)]">
            {bgContent.subTitle}
          </div>
          {financialConfig?.isDisplayBackground &&
            financialConfig.isDisplayBackground === FunctionEnabledStatusEnum.OPEN && (
              <div
                className="font-w-400 text-[22px] text-[color:var(--theme-color)] cursor-pointer"
                onClick={openProblem}
              >
                什么是{bgContent.mainTitle}？
              </div>
            )}
        </div>
        {financialConfig?.isDisplayAssets &&
          financialConfig.isDisplayAssets === FunctionEnabledStatusEnum.OPEN && (
            <div className="w-[471px] rounded-[16px] bg-[var(--background12)] shadow-[0px_0px_36px_0px_rgba(165,165,165,0.2)] p-[24px_20px] text-[var(--text-color5)]">
              <div className={` flex flex-ai-center flex-jc-between mb-[40px]`}>
                <div className="flex gap-[4px] align-center">
                  <div className="font-w-400 text-[24px]">{t("financial.myProperty")}</div>
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
                  <div
                    className="w-[24px] h-[24px] cursor-pointer"
                    onClick={() => {
                      router.push("/financialOrder");
                    }}
                  >
                    <Tooltip title={t("common.financialOrder")}>
                      <Image
                        preview={false}
                        src={`/images/financial/a.svg`}
                        alt=""
                      />
                    </Tooltip>
                  </div>
                  <div
                    className="w-[24px] h-[24px] cursor-pointer"
                    onClick={() => {
                      router.push("/assets/financial");
                    }}
                  >
                    <Tooltip title={t("common.financialAccount")}>
                      <Image
                        preview={false}
                        src={`/images/financial/b.svg`}
                        alt=""
                      />
                    </Tooltip>
                  </div>
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
    );
  }
);

export default MyFinancial;
