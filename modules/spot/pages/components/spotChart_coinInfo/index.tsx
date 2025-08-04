import { useEffect, useState } from "react";
import styles from "../styles/spotChart_coinInfo.module.css";
import { Image } from "antd";
import { Iconify } from "@/components/icon";
import { DownOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import { infoDataType, introductionDataType } from "@/type/spot/coionInfo";
import { getCoinInfo, getCoinIntroduction } from "@/services/spot";
import { toast } from "sonner";
import { getNextJsLocale } from "@/utils/filterLang";
import dayjs from "dayjs";
import { division ,roundDown} from "@/utils";

type Props = {
    className?: string;
    coinName: string;
    baseCoinName: string;
}
const SpotChartCoinInfo = ({ className, coinName, baseCoinName }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [infoData, setInfoData] = useState<infoDataType>({} as infoDataType);
    const { t, i18n } = useTranslation(["spot","market"]);

    // 优化的安全跳转函数
    const safeOpenUrl = (url: string, linkType: string = 'link') => {
        if (!url) {
            toast.error(t('spot.coinInfo.invalidLink'));
            return;
        }

        // 验证URL格式
        try {
            const validUrl = url.startsWith('http') ? url : `https://${url}`;
            new URL(validUrl); // 验证URL格式

            // 使用安全的window.open参数
            const newWindow = window.open(
                validUrl,
                '_blank',
                'noopener=yes,noreferrer=yes,scrollbars=yes,resizable=yes,toolbar=yes,location=yes,status=yes'
            );

            // 检查是否被浏览器拦截
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                // 被拦截时提供备用方案
                toast.warning(t('spot.coinInfo.popupBlocked'));
                // 备用方案：创建隐藏的a标签点击
                const link = document.createElement('a');
                link.href = validUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // 清除opener引用以增加安全性
                newWindow.opener = null;
            }
        } catch (error) {
            console.error('Invalid URL:', url, error);
            // toast.error(t('spot.coinInfo.invalidLink'));
        }
    };
    const infoDataList = [
        {
            label: t('spot.coinInfo.marketRank'),// "市值排行",
            key: "marketCapRan"
        },
        {
            label: t('spot.coinInfo.hotRank'),// "热度排行",
            key: "hotRank"
        },
        {
            label: t('spot.coinInfo.marketCap'),// "市值",
            key: "marketCap",
            render: (_value: string) => {
                const unit = _value?.split('_')[1]
                const value = _value?.split('_')[0]
                let unitValue
                if (unit === 'B') {
                    unitValue = t('header.billion',{ns:'market'})
                } else if (unit === 'M') {
                    unitValue = t('header.million',{ns:'market'})
                } else if (unit === 'K') {
                    unitValue = t('header.kthousand',{ns:'market'})
                }
                return _value ? `$${parseFloat(value).toLocaleString()}${unitValue ? `${unitValue}` : ''}` : '--'
            }
        },
        // {
        //     label:t('spot.coinInfo.marketShare'),// "市场占有率",
        //     key: "flowTotal"
        // },
        {
            label: t('spot.coinInfo.num'),// "流通量",
            key: "flowTotal",
            render: (value: string) => {
                return value ? `${parseFloat(value).toLocaleString()} ${coinName || '--'}` : '--'
            }
        },
        {
            label: t('spot.coinInfo.historyHigh'),//"历史最高价",
            key: "hisHighPrice",
            render: (value: string) => {
                return value ? `$${parseFloat(value).toLocaleString()} (${infoData?.hisHighPriceTs ? dayjs(infoData?.hisHighPriceTs).format('YYYY-MM-DD') : '--'})` : '--'
            }
        },
        {
            label: t('spot.coinInfo.historyLow'),//"历史最低价",
            key: "hisLowPrice",
            render: (value: string) => {
                return value ? `$${value} (${infoData?.hisLowPriceTs ? dayjs(infoData?.hisHighPriceTs).format('YYYY-MM-DD') : '--'})` : '--'
            }
        },
        {
            label: t('spot.coinInfo.issueDate'),//"发行日期",
            key: "issuingDate",
            render: (value: string) => {
                return value ? dayjs(value).format('YYYY-MM-DD') : '--'
            }
        },
        {
            label: t('spot.coinInfo.chain'),//"所属公链",
            key: "pubChain",
            render: (value: string[]) => {
                return value && value.length > 0 ? value.join(',') : '--'
            }
        },
        {
            label: t('spot.coinInfo.firstPrice'),//"首次发行价",
            key: "initialPrice",
            render: (value: string) => {
                return value ? `$${parseFloat(value).toLocaleString()}` : '--'
            }
        },
        {
            label: t('spot.coinInfo.maxSupply'),//"最大供应量",
            key: "maxSup",
            render: (value: string) => {
                return value ? `${parseFloat(value).toLocaleString()} ${coinName || '--'}` : '--'
            }
        },
        {
            label: t('spot.coinInfo.maxSupplyMarket'),//"最大供应市值",
            key: "maxSupMar",
            render: (value: string) => {
                return value ? `$${parseFloat(value).toLocaleString()}` : '--'
            }
        },
        {
            label: t('spot.coinInfo.circulateRate'),//"流通率",
            key: "selNumPer2",
            render: (value: string) => {
                return value ? `${roundDown(value,2)}%` : '--'
            }
        },
    ];
    const getCoinInfoData = async () => {
        if (!coinName) return
        try {
            const res = await getCoinInfo({ coinName: coinName });
            if (res.code === '0' && res.data) {
                if (res.data.selNumPer) {
                    res.data.selNumPer2 = res.data?.maxSup ? division(res.data?.flowTotal, res.data?.maxSup) * 100 : 0
                }
                setInfoData(res.data);
            } else {
                console.warn('Failed to get coin info:', res.message);
                // 不显示错误提示，静默失败
            }
        } catch (error) {
            console.error('Error fetching coin info:', error);
            // 网络错误静默处理，避免干扰用户体验
        }
    }

    useEffect(() => {
        if (!coinName) return
        getCoinInfoData()
    }, [coinName]);

    return <div className={`${styles.container} ${className}`}>
        <div
            className={`flex-x overflow-y-auto`}
            id="coinInfo-baseData"
            style={{ display: isExpanded ? 'none' : 'flex' }}
        >
            <div className="flex-1 mr-10">
                <div className="w-full flex-x align-center">
                    <Image src={infoData?.icon || ''} alt="btc" width={20} height={20}
                        preview={false}
                        className="border-radius-50%" />
                    <div className="flex-x align-end">
                        <span className={`${styles.title_color} font-18 font-w-500 ml-1`}>
                            {coinName || '--'}/{baseCoinName || '--'}
                        </span>
                        <span className={`${styles.tip_color} font-12 font-w-400 ml-1`}>{infoData?.fullName || '--'}</span>
                    </div>

                </div>
                <ul className="w-full mt-4 font-w-400 font-12 ">
                    {infoDataList.map((item, index) => (
                        <li className="flex-x align-center justify-between mb-2_5" key={`info_${index}`}>
                            <div className={styles.tip_color}>{item.label}</div>
                            <div className={styles.title_color}>
                                {(() => {
                                    if (!infoData) return '--';
                                    const value = infoData[item.key as keyof infoDataType];
                                    // 如果字段有自定义的 render 函数，使用它
                                    if (item.render) {
                                        return item.render(value as any);
                                    }
                                    // 否则使用默认逻辑
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
                            <button className={`default_btn ${styles.btn_style} mr-1`}
                                onClick={() => {
                                    const url = infoData?.socialMediaList?.find(item => item.name === 'officialUrl')?.url
                                    if (url) {
                                        safeOpenUrl(url, 'official')
                                    }
                                }}>
                                {/* 官网 */}
                                {t('spot.coinInfo.official')}
                            </button>
                            <button className={`default_btn ${styles.btn_style}`}
                                onClick={() => {
                                    const url = infoData?.socialMediaList?.find(item => item.name === 'whitePaper')?.url
                                    if (url) {
                                        safeOpenUrl(url, 'whitepaper')
                                    }
                                }}>
                                {/* 白皮书 */}
                                {t('spot.coinInfo.whitepaper')}
                            </button>
                        </div>
                    </li>
                    <li className="flex-x align-center justify-between mt-7">
                        {/* 区块浏览器 */}
                        {t('spot.coinInfo.blockchain')}
                        <div className="flex-x align-center ">
                            <button className={`default_btn ${styles.btn_style}`}
                                onClick={() => {
                                    const url = infoData?.socialMediaList?.find(item => item.name === 'blockBrowser')?.url
                                    if (url) {
                                        safeOpenUrl(url, 'blockchain')
                                    }
                                }}>
                                blockchain
                            </button>
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
                    {infoData?.introduce || '--'}
                    <div className={` mt-1`}>
                        {/* 叙事摘要-带样式的文本 */}
                        {infoData?.narrativeSummary || ''}
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