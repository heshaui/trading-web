import { useEffect, useState } from "react";
import styles from "../styles/spotChart_coinInfo.module.css";
import { Image } from "antd";
import { Iconify } from "@/components/icon";
import { DownOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import { infoDataType } from "@/type/spot/coionInfo";

type Props = {
    className?: string;
}
const SpotChartCoinInfo = ({ className }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [infoData, setInfoData] = useState<infoDataType>({} as infoDataType);
    const { t } = useTranslation("spot");
    const infoDataList = [
        {
            label:t('spot.coinInfo.marketRank'),// "市值排行",
            key: "marketCapRan"
        },
        {
            label:t('spot.coinInfo.hotRank'),// "热度排行",
            key: "hotRank"
        },
        {
            label:t('spot.coinInfo.marketCap'),// "市值",
            key: "marketCap"
        },
        // {
        //     label:t('spot.coinInfo.marketShare'),// "市场占有率",
        //     key: "flowTotal"
        // },
        {
            label:t('spot.coinInfo.num'),// "流通数量",
            key: "flowTotal"
        },
        {
            label: t('spot.coinInfo.historyHigh'),//"历史最高价",
            key: "hisHighPrice"
        },
        {
            label: t('spot.coinInfo.historyLow'),//"历史最低价",
            key: "hisLowPrice"
        },
        {
            label: t('spot.coinInfo.issueDate'),//"发行日期",
            key: "issuingDate"
        },
        {
            label: t('spot.coinInfo.chain'),//"所属公链",
            key: "pubChain"
        },
        {
            label: t('spot.coinInfo.firstPrice'),//"首次发行价",
            key: "initialPrice"
        },
        {
            label: t('spot.coinInfo.maxSupply'),//"最大供应量",
            key: "maxSup"
        },
        // {
        //     label: t('spot.coinInfo.totalSupply'),//"总供应",
        //     key: "flowTotal"
        // },
        {
            label: t('spot.coinInfo.circulateRate'),//"流通率",
            key: "selNumPer"
        },
    ];

    return <div className={`${styles.container} ${className}`}>
        <div 
            className={`flex-x overflow-y-auto`} 
            id="coinInfo-baseData"
            style={{ display: isExpanded ? 'none' : 'flex' }}
        >
            <div className="flex-1 mr-10">
                <div className="w-full flex-x align-center">
                    <Image src="/images/exchange/icon_btc.png" alt="btc" width={20} height={20}
                    preview={false}
                    className="border-radius-50%" />
                    <div className="flex-x align-end">
                        <span className={`${styles.title_color} font-18 font-w-500 ml-1`}>
                            BTC/USDT
                        </span>
                        <span className={`${styles.tip_color} font-12 font-w-400 ml-1`}>Bitcoin</span>
                    </div>

                </div>
                <ul className="w-full mt-4 font-w-400 font-12 ">
                   {infoDataList.map((item, index) => (
                    <li className="flex-x align-center justify-between mb-2_5" key={`info_${index}`}>
                        <div className={styles.tip_color}>{item.label}</div>
                        <div className={styles.title_color}>
                            {(() => {
                                const value = infoData[item.key as keyof infoDataType];
                                if (typeof value === 'string' || typeof value === 'number') {
                                    return value || '--';
                                }
                                return '--';
                            })()}
                        </div>
                    </li>
                   ))}

                </ul>

            </div>
            <div className="flex-1">
                <div className={`${styles.title_color} font-14 font-w-500`}>
                    {/* 官方链接 */}
                    {t('spot.coinInfo.officialLink')}
                </div>
                <ul className={`${styles.tip_color} font-14 font-w-400`}>
                    <li className="flex-x align-center justify-between">
                        {/* 网站 */}
                        {t('spot.coinInfo.website')}
                        <div className="flex-x align-center ">
                            <button className={`default_btn ${styles.btn_style} mr-1`}>
                                {/* 官网 */}
                                {t('spot.coinInfo.official')}
                            </button>
                            <button className={`default_btn ${styles.btn_style}`}>
                                {/* 白皮书 */}
                                {t('spot.coinInfo.whitepaper')}
                            </button>
                        </div>
                    </li>
                    <li className="flex-x align-center justify-between mt-7">
                        {/* 区块浏览器 */}
                        {t('spot.coinInfo.blockchain')}
                        <div className="flex-x align-center ">
                            <button className={`default_btn ${styles.btn_style}`}>blockchain</button>
                        </div>
                    </li>
                    <li className="mt-7 font-12">
                        {/* *基础数据由第三方机构提供，仅供参考。此信息以“原样”呈现，
                        不构成任何形式的陈述或保证。 */}
                        *{t('spot.coinInfo.baseData')}
                    </li>
                </ul>
            </div>
        </div>
        <div className="font-14 font-w-400 mt-5" id="coinInfo-introduction">
            <p className={`${styles.title_color} font-w-500`}>
                {/* 介绍 */}
                {t('spot.coinInfo.introduction')}
            </p>
            <div className={`${styles.tip_color} mt-1`}>
                <div className={isExpanded ? '' : styles.textEllipsis}>
                    {/* 比特币(BTC)是一种点对点加密货币, 旨在充当独立于任何中央机构的一种交易手段。 BTC可以安全,
                    可验证和不变的方式进行电子现比特币(BTC)是一种点对点加密货币, 旨在充当独立于任何中央机构的一种交易手段。
                    BTC可以安全, 可验证和不变的方式进行电子交易，无需通过第三方中介。这种数字货币使用密码学原理来确保交易安全，并控制新单位的创建。 */}
                    {infoData.introduce||'--'}
                    <div className={` mt-1`}>
                        {/* 叙事摘要-带样式的文本 */}
                        {infoData.narrativeSummary||''}
                    </div>
                </div>
                <button
                    className={`${styles.title_color} font-12 mt-1 cursor-pointer`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? t('spot.coinInfo.collapse') : t('spot.coinInfo.expand')}
                    <DownOutlined rotate={isExpanded ? 180 : 0} className="ml-1 font-12" />
                </button>
            </div>
        </div>
    </div>
}

export default SpotChartCoinInfo;