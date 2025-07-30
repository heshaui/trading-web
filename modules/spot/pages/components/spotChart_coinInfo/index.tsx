import { useEffect, useState } from "react";
import styles from "../styles/spotChart_coinInfo.module.css";
import { Image } from "antd";
import { Iconify } from "@/components/icon";
import { DownOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";


interface infoDataType {
    rank: string,
    marketCap: string,
    marketShare: string,
    num: string,
    historyHigh: string,
    historyLow: string,
    issueDate: string,
    chain: string,
    firstPrice: string,
    maxSupply: string,
    totalSupply: string,
    circulateRate: string,
}
type Props = {
    className?: string;
}
const SpotChartCoinInfo = ({ className }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [infoData, setInfoData] = useState<infoDataType>({} as infoDataType);
    const { t } = useTranslation("assets");
    const infoDataList = [
        {
            label: "排行",
            key: "rank"
        },
        {
            label: "市值",
            key: "marketCap"
        },
        {
            label: "市场占有率",
            key: "marketShare"
        },
        {
            label: "流通数量",
            key: "num"
        },
        {
            label: "历史最高价",
            key: "historyHigh"
        },
        {
            label: "历史最低价",
            key: "historyLow"
        },
        {
            label: "发行日期",
            key: "issueDate"
        },
        {
            label: "所属公链",
            key: "chain"
        },
        {
            label: "首次发行价",
            key: "firstPrice"
        },
        {
            label: "最大供应量",
            key: "maxSupply"
        },
        {
            label: "总供应",
            key: "totalSupply"
        },
        {
            label: "流通率",
            key: "circulateRate"
        },
    ];

    return <div className={`${styles.container} ${className}`}>
        <div className="flex-x">
            <div className="flex-1 mr-10">
                <div className="w-full flex-x align-center">
                    <Image src="/images/exchange/icon_btc.png" alt="btc" width={20} height={20} />
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
                        <div className={styles.title_color}>{infoData[item.key as keyof infoDataType] || '0'}</div>
                    </li>
                   ))}

                </ul>

            </div>
            <div className="flex-1">
                <div className={`${styles.title_color} font-14 font-w-500`}>
                    官方链接
                </div>
                <ul className={`${styles.tip_color} font-14 font-w-400`}>
                    <li className="flex-x align-center justify-between">
                        网站
                        <div className="flex-x align-center ">
                            <button className={`default_btn ${styles.btn_style} mr-1`}>官网</button>
                            <button className={`default_btn ${styles.btn_style}`}>白皮书</button>
                        </div>
                    </li>
                    <li className="flex-x align-center justify-between mt-7">
                        区块浏览器
                        <div className="flex-x align-center ">
                            <button className={`default_btn ${styles.btn_style}`}>blockchain</button>
                        </div>
                    </li>
                    <li className="mt-7 font-12">
                        *基础数据由第三方机构提供，仅供参考。此信息以“原样”呈现，
                        不构成任何形式的陈述或保证。
                    </li>
                </ul>
            </div>
        </div>
        <div className="font-14 font-w-400 mt-5">
            <p className={`${styles.title_color} font-w-500`}>
                介绍
            </p>
            <div className={`${styles.tip_color} mt-1`}>
                <div className={isExpanded ? '' : styles.textEllipsis}>
                    比特币(BTC)是一种点对点加密货币, 旨在充当独立于任何中央机构的一种交易手段。 BTC可以安全,
                    可验证和不变的方式进行电子现比特币(BTC)是一种点对点加密货币, 旨在充当独立于任何中央机构的一种交易手段。
                    BTC可以安全, 可验证和不变的方式进行电子交易，无需通过第三方中介。这种数字货币使用密码学原理来确保交易安全，并控制新单位的创建。
                </div>
                <button
                    className={`${styles.title_color} font-12 mt-1 cursor-pointer`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? '收起' : '展开'}
                    <DownOutlined rotate={isExpanded ? 180 : 0} className="ml-1 font-12" />
                </button>
            </div>
        </div>
    </div>
}

export default SpotChartCoinInfo;