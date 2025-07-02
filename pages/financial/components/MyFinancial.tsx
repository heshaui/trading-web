import { observer } from "mobx-react-lite";
import { useTranslation } from 'next-i18next';
import { getBackgroundImageConfig, getMyPosition } from "@/services/financial";
import { useEffect, useState } from "react";
import MaskableAmount from "@/components/MaskableAmount";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Image } from "antd";
import { FinancialConfig } from "../index";
import { StatusEnum } from "@/services/financial";

const MyFinancial = observer(
  ({ financialConfig }: { financialConfig: FinancialConfig }) => {
    const { t } = useTranslation(["financial"]);

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
        console.error('Failed to load background image config:', error);
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
        console.error('Failed to load position data:', error);
      }
    };

    useEffect(() => {
      // 确保只在客户端执行
      if (typeof window !== 'undefined') {
        initBackgroundImage();
        initMyPosition();
      }
    }, []);

    return (
      <div
        className="flex flex-ai-center flex-jc-between p-[94px_120px] gap-[40px] flex-wrap"
        style={{ backgroundImage: `url(${bgContent.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="flex-1">
          <div className="font-w-600 text-[48px] mb-[16px] leading-[normal] text-[var(--text-color5)]">
            {bgContent.mainTitle}
          </div>
          <div className="font-w-400 text-[20px] mb-[12px] leading-[normal] text-[var(--text-color6)]">
            门槛低 | 安全性高 | 收益率高
          </div>
          <div className="font-w-400 text-[18px] mb-[20px] leading-[normal] text-[var(--text-color6)]">
            {bgContent.subTitle}
          </div>
          <div className="font-w-400 text-[22px] text-[color:var(--theme-color)]">
            什么是{bgContent.mainTitle}？
          </div>
        </div>
        {financialConfig?.isDisplayAssets &&
          financialConfig.isDisplayAssets === StatusEnum.OPEN && (
            <div className="w-[471px] rounded-[16px] bg-[var(--background12)] shadow-[0px_0px_36px_0px_rgba(165,165,165,0.2)] p-[24px_20px] text-[var(--text-color5)]">
              <div className={` flex flex-ai-center flex-jc-between mb-[40px]`}>
                <div className="flex gap-[4px] align-center">
                  <div className="font-w-400 text-[24px]">我的资产</div>
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
                  <div className="w-[24px] h-[24px]">
                    <Image
                      preview={false}
                      src={`/images/financial/a.svg`}
                      alt=""
                    />
                  </div>
                  <div className="w-[24px] h-[24px]">
                    <Image
                      preview={false}
                      src={`/images/financial/b.svg`}
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-ai-center flex-jc-between">
                <div className="text-[16px] flex flex-column gap-[18px]">
                  <div>我的持仓</div>
                  <MaskableAmount
                    show={showAmount}
                    amount={myAmount.holdings}
                  />
                </div>
                <div className="text-[16px] flex flex-column gap-[18px]">
                  <div>总收益</div>
                  <div className="text-center">
                    <MaskableAmount
                      show={showAmount}
                      amount={myAmount.totalRevenue}
                    />
                  </div>
                </div>
                <div className="text-[16px] flex flex-column gap-[18px]">
                  <div>昨日收益</div>
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
