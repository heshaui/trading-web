import React from "react";
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from "../styles/spotAccount.module.css";
import { Input, Steps, Breadcrumb, ConfigProvider, Dropdown, Select, Form, QRCode, Button, Skeleton } from "antd";
import { Iconify } from "@/components/icon";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useState, useEffect, useRef, useMemo, } from "react";
import { useThemeMode } from "@/hooks/useThemeMode";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { NoData, NoAddress } from "@/components/noData";
import NoUseCom from "../components/noSM";
import RechargeTable from "../components/rechargeTable";
import { ROUTER_KEY_ASSETS } from "@/config/apiConfig";
import TopUpSteps from "../components/withDrawSteps";
import {
  getTopUpChainsAll, //充值支持的网络列表
  getChainType, //根据链类型获取支持的代币列表
  getWithdrawCoinAll,
  getProtocolTypeAll,//所有网络列表
  getWalletAddress, //查询钱包地址
  createWalletAddress,//创建钱包地址
  getcoinExtList,
  getcoinExtList2
} from "@/services/assets";
import { toast } from 'sonner'
import {
  coinSelectType,
  SearchHistoryItem,
  coinExtSelectType
} from "@/type/assets/assetsAccount/toUp";
import appStore from "@/store";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { DownOutlined } from "@ant-design/icons";

const TopUpPage = () => {
  const { t } = useTranslation("assets");
  const router = useRouter();
  const { coinId, coinName } = router.query as { coinId: string, coinName: string };

  const userInfo = appStore.getUserInfo()
  const { isDayMode } = useThemeMode(); // 使用 hook
  const [form] = Form.useForm();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [coinIdHistory, setCoinIdHistory] = useState(0);
  const [chainTypeList, setChainTypeList] = useState<coinExtSelectType[]>([]);
  const [coinInfo, setCoinInfo] = useState({} as any);
  const { copyFn } = useCopyToClipboard();

  const [current, setCurrent] = useState(0);

  const [coinList, setCoinList] = useState<any>([]);
  const [coinLoading, setCoinLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const [coinExtAll, setCoinExtAll] = useState<any>([]);
  const [coinExtSelect, setCoinExtSelect] = useState<any>([]);
  const [coinExtLoading, setCoinExtLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<any>({});
  const [isMemo, setIsMemo] = useState(false); // 是否为memo币

  // 下拉允许自由开关，倒计时与选中状态保持在内存，不依赖下拉是否开启
  const [selectedProtocolId, setSelectedProtocolId] = useState<any>(undefined);
  const [selectedProtocolCoinId, setSelectedProtocolCoinId] = useState<any>(undefined);
  const [confirmRemainingMap, setConfirmRemainingMap] = useState<Record<string, number>>({});
  const [protoOpen, setProtoOpen] = useState(false);
  const [addAddressLoading, setAddAddressLoading] = useState(false);
  const protoWrapRef = useRef<HTMLDivElement | null>(null);
  const routeAppliedRef = useRef(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const allConfig = appStore.getKvConfigAll()

  const selectedProtocolLabel = useMemo(() => {
    const currentValue = selectedProtocolId ?? form.getFieldValue('protocolId');
    const opt = coinExtSelect.find((o: any) => o.value === currentValue);
    if (!opt) return '';
    if (typeof opt.label === 'string') return opt.label as string;
    return `${opt?.protocolName || "--"}(${opt?.protocol || "--"})`;
  }, [selectedProtocolId, coinExtSelect, form]);


  const isNotAllowToUp = useMemo(() => {
    // const verified11 = currentUserInfo?.verifiedRechargeStatus === 1 && currentUserInfo?.realnessStatus === 1 //已认证且实名-允许
    const verified10 = userInfo?.verifiedRechargeStatus === 1 && userInfo?.realnessStatus !== 1 //已认证且未实名-判断unverifiedRechargeStatus
    // const unverifie10 = userInfo?.unverifiedRechargeStatus === 1 && userInfo?.realnessStatus === 0 //未认证且未实名-允许
    const unverifie11 = userInfo?.unverifiedRechargeStatus === 1 && userInfo?.realnessStatus === 1 //未认证且实名-判断verifiedRechargeStatus

    const needsKyc = verified10 && userInfo?.unverifiedRechargeStatus !== 1
    // const needsGoogleAuth = !userInfo?.isGoogleAuth || !userInfo?.googleCode
    const needsMerchantRecharge = (userInfo?.verifiedRechargeStatus !== 1 && userInfo?.unverifiedRechargeStatus !== 1) ||
      (unverifie11 && userInfo?.verifiedRechargeStatus !== 1)
    return needsKyc || needsMerchantRecharge
    // return false
  }, [userInfo])


  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!protoOpen) return;
      const el = protoWrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setProtoOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [protoOpen]);


  const goSteps = (step: 1 | 2 | 3) => {
    if (step === 1) {
      setCurrent(0);
      // 重置表单字段 -步骤1之后的所有字段
      form.resetFields(["protocolId", "address"]);
      setModalOpen(true)
      setWalletAddress({})
      setIsMemo(false)
    } else if (step === 2) {
      setCurrent(1);
      form.resetFields(["protocolId"]);
      setModalOpen(true)
      setWalletAddress({})
    } else if (step === 3) {
      setCurrent(2);
      setModalOpen(true)
    }
  }
  // 3.获取充值币种列表
  const getTopUpCoinAllList = async () => {
    setCoinLoading(true);
    try {
      const res = await getWithdrawCoinAll();
      if (res.code === "0") {
        // 先筛选 status === 1 的数据，然后再进行 map 转换
        const coinList = res.data
          .filter((item: any) => item.status === 1 && item.canRecharge === 1) // 添加筛选
          .map((item: any) => ({
            ...item,
            label: (
              <div className="flex-x align-center font-14 font-w-400">
                <Image
                  src={item.iconUrl}
                  alt={item.coinName}
                  width={20}
                  height={20}
                  className={styles.coninIcon}
                />
                &nbsp;
                <span className={styles.title_color}>{item.coinName}</span>
                &nbsp;{" "}
                <span className={styles.tip_color}>{item.nameDefault}</span>
              </div>
            ),
            value: item.coinId,
          }));
        setCoinList(coinList);

      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(String(error));
    } finally {
      setCoinLoading(false);
    }
  };
  // 1.获取所有网络列表
  const getCoinExtAllList = async () => {
    setCoinLoading(true);
    try {
      const res = await getProtocolTypeAll();
      if (res.code === '0') {
        const chainList = res.data.map((item: any) => {
          return {
            ...item,
            label: item.protocol,
            value: item.chainId,
          }
        })
        setCoinExtAll(chainList);

        // const chainRes = await getTopUpChainsAll()
        // if (chainRes.code === '0') {
        //   const chainList = chainRes.data.map((item: any) => {
        //     const protocolRes = res.data.find((resItem: any) => resItem.symbol === item.chainType)
        //     if (!protocolRes) return null;
        //     return {
        //       ...item,
        //       ...protocolRes,
        //       label: `${protocolRes.protocol}(${protocolRes.protocolName})`,
        //       value: item.chainType
        //     }
        //   })
        //     .filter(Boolean);
        //   // console.log(chainList, chainRes.data, 999);
        //   setChainTypeList(chainList)
        // } else {
        //   toast.error(chainRes.message)
        // }

      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error(String(error))
    } finally {
      setCoinLoading(false);
    }
  }
  // // 2.获取钱包支持网络（链）--弃用
  // const getChainsAll = async () => {
  //   const chainRes = await getTopUpChainsAll()
  //   if (chainRes.code === '0') {
  //     const chainList = chainRes.data.map((item: any) => {
  //       return {
  //         ...item,
  //         label: item.chainName,
  //         value: item.chainType
  //       }
  //     })
  //     // console.log(chainList, chainRes.data, 999);
  //     setChainTypeList(chainList)
  //   }
  // }
  // 4.2币种对应的协议（网络）-通过币种协议获取网络id进行匹配
  const getCoinExt = async (coinId: number) => {
    if (!coinId) {
      setCoinExtSelect([]);
      return;
    }

    // 判断同币种不重复请求
    if (coinIdHistory.toString() === coinId.toString() || coinExtLoading)
      return;

    setCoinExtSelect([]); //初始化
    setCoinIdHistory(coinId);
    setCoinExtLoading(true);

    try {
      const res = await getcoinExtList(coinId);
      if (res.code === "0") {
        const coinExtList = res.data.map((item: any) => {
          const protocol = coinExtAll.find(
            (protocol: any) => protocol.id === item.protocolId
          );
        return {
            ...item,
            ...protocol,
            label: `${protocol?.protocolName || "--"}(${protocol?.protocol || "--"})`,
            value: protocol?.symbol || null,
            confirmCount: item.confirms && item.confirms > 0 ? item.confirms : 1,
            coinId: coinId,
          };
        }).filter((item: any) => item.value !== null)
        // .filter((item: any) => {
        //   const chainType = chainTypeList.find((chain: any) => chain.chainType === item.symbol)
        //   return chainType
        // })
        // console.log('币种对应网络(链)', coinExtList, chainTypeList);
        setCoinExtSelect(coinExtList);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(String(error));
    } finally {
      setCoinExtLoading(false);
    }
  };

  // 删除历史记录
  const delHistory = () => {
    localStorage.removeItem("rechargeCoinHistory");
    setSearchHistory([]);
  };
  const updateSearchHistory = (option: any) => {
    setCoinInfo(option)
    // 更新历史记录
    const newHistoryItem = {
      value: option.value,
      coinId: option.coinId,
      coinName: option.coinName,
      nameDefault: option.nameDefault,
      iconUrl: option.iconUrl,
      chainType: option.chainType // 确保包含图标URL
    };
    setSearchHistory((prev: any) => {
      const filtered = prev.filter((i: any) => i.value !== newHistoryItem.value);
      const next = [newHistoryItem, ...filtered].slice(0, 4);
      localStorage.setItem('rechargeCoinHistory', JSON.stringify(next));
      return next;
    });
  }

  // 历史币种快捷键
  const setFormCoin = async (coinId: string | number) => {
    // 1. 首先检查用户权限
    if (isNotAllowToUp) {
      return toast.error(t("withdrawMoney.function"));
    }

    // 2. 检查是否是重复点击同一个币种
    const currentCoinId = form.getFieldValue("coinName");
    if (currentCoinId === coinId) {
      return; // 如果是同一个币种，直接返回，避免不必要的操作
    }

    const currentCoinList = coinList;
    if (coinList.length === 0) {
      getTopUpCoinAllList()
    }
    const selectedCoin = currentCoinList.find(
      (coin: any) => coin.coinId.toString() === coinId.toString()
    );
    if (!selectedCoin) {
      return toast.error(t("withdrawMoney.setCoinError"));
    }
    // 判断是否为memo币
    const memoTag = selectedCoin.memoTag === 1
    setIsMemo(memoTag)
    // 3. 设置表单值
    form.setFieldValue("coinName", coinId);
    // 重置网络选中状态，避免跨币种复用
    setSelectedProtocolId(undefined);
    setSelectedProtocolCoinId(undefined);
    // 4.   // 获取币种对应网络
    await getCoinExt(Number(coinId))

    goSteps(2);
  };
  // 4.1币种选择
  const coinChange = async (value: number, option: any) => {
    // 同步表单值，确保下拉显示选中
    form.setFieldValue("coinName", value)
    setCoinIdHistory(value)
    setCoinInfo(option)

    updateSearchHistory(option)
    goSteps(2);
    const memoTag = option.memoTag === 1
    setIsMemo(memoTag)
    // 获取币种对应网络
    if (!coinExtAll || coinExtAll.length === 0) {
      await getCoinExtAllList();
    }
    await getCoinExt(option.coinId)


  }
  // 币种对应网络
  // const getChainTypeDeatil = async (chainType: string) => {
  //   try {
  //     const res = await getChainType(chainType);
  //     if (res.code === '0') {
  //       const chainRes = res.data.map((item: any) => {
  //         return {
  //           ...item,
  //           label: item.chainName,
  //           value: item.id,
  //         }
  //       })
  //       // setChainTypeList(chainRes);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  // 5.网络选择
  const chainChange = async (value: number, option: any) => {
    const chainInfoAssign = Object.assign({}, coinInfo, option)
    setCoinInfo(chainInfoAssign)
    // console.log(chainInfoAssign, 999);
    // getChainTypeDeatil(option.chainType)
    // getChainTypeDeatil(option.symbol) //钱包网络对应代币-4.2已判断代币对应网络 可不用

    goSteps(3);
  }
  // 标准下拉选择网络
  const networkChange = async (value: any, option: any) => {
    const optData = option?.data || option;
    form.setFieldValue('protocolId', value);
    chainChange(value, optData);
    if (Number(optData?.memoTag) !== 1) {
      await getWalletAddressDataFn();
    }
  }
  const getWalletAddressDataFn = async () => {
    form.validateFields().then((values) => {
      getWalletAddressData(values)
    })
  }
  const handleProtocolSelect = (value: any, option: any) => {
    const optData = option?.data || option;
    const baseNew = optData?.confirmCount ?? 1;
    const currentCoinId = optData?.coinId ?? coinInfo?.coinId ?? form.getFieldValue('coinName');
    const newKey = `${currentCoinId}|${String(value)}`;

    // 切换到相同选项：继续递减
    if (selectedProtocolId === value && selectedProtocolCoinId === currentCoinId) {
      const currentRemain = (confirmRemainingMap[newKey] ?? baseNew);
      const nextRemain = currentRemain - 1;
      if (nextRemain <= 0) {
        setConfirmRemainingMap((prev) => ({ ...prev, [newKey]: 0 }));
        form.setFieldValue('protocolId', value);
        setSelectedProtocolId(value);
        setSelectedProtocolCoinId(currentCoinId);
        setProtoOpen(false);
        chainChange(value, optData);
        if (Number(optData?.memoTag) !== 1) {
          getWalletAddressDataFn();
        }
        return;
      }
      setConfirmRemainingMap((prev) => ({ ...prev, [newKey]: nextRemain }));
      form.setFieldValue('protocolId', value);
      goSteps(2);
      return;
    }

    // 切换到不同选项：
    // 1) 先把上一个选项的剩余次数恢复为其基础次数
    if (selectedProtocolId !== undefined && selectedProtocolId !== null) {
      const prevKey = `${selectedProtocolCoinId}|${String(selectedProtocolId)}`;
      if (selectedProtocolCoinId === currentCoinId) {
        const prevOpt = coinExtSelect.find((o: any) => String(o.value) === String(selectedProtocolId));
        const prevBase = prevOpt?.confirmCount || 1;
        setConfirmRemainingMap((prev) => ({ ...prev, [prevKey]: prevBase }));
      } else {
        // 不同币种时，清理旧键，避免跨币种残留
        setConfirmRemainingMap((prev) => {
          const next = { ...prev };
          delete next[prevKey];
          return next;
        });
      }
    }

    // 2) 新选项立刻减 1（本次点击算一次确认）
    const nextRemainNew = Math.max(baseNew - 1, 0);
    if (nextRemainNew === 0) {
      // 直接完成
      setConfirmRemainingMap((prev) => ({ ...prev, [newKey]: 0 }));
      form.setFieldValue('protocolId', value);
      setSelectedProtocolId(value);
      setSelectedProtocolCoinId(currentCoinId);
      setProtoOpen(false);
      chainChange(value, optData);
      if (Number(optData?.memoTag) !== 1) {
        getWalletAddressDataFn();
      }
      return;
    }

    // 未完成：记录剩余次数并停留步骤 2
    setConfirmRemainingMap((prev) => ({ ...prev, [newKey]: nextRemainNew }));
    setSelectedProtocolId(value);
    setSelectedProtocolCoinId(currentCoinId);
    form.setFieldValue('protocolId', value);
    goSteps(2);
  };

  // 6.查询钱包地址
  const getWalletAddressData = async (value: any) => {
    setAddAddressLoading(true);
    setWalletAddress({})
    try {
      const chainType = selectedProtocolId ?? value.protocolId ?? form.getFieldValue('protocolId')
      const res = await getWalletAddress(chainType)
      if (res.code === '0') {
        setWalletAddress(res.data)
        setModalOpen(false)
      } else if (res.code === '10161') {
        fetchWalletAddress(value)
      } else {

        toast.error(res.message)
      }
    } catch (error) {
      toast.error(String(error))

      setModalOpen(true)
    } finally {
      setAddAddressLoading(false);
    }
  }
  // 7.没有钱包地址时创建钱包地址
  const fetchWalletAddress = async (value: any) => {
    try {
      const params = {
        blockchain: selectedProtocolId ?? value.protocolId ?? form.getFieldValue('protocolId'),
        label: value.coinName
      }
      const res = await createWalletAddress(params)
      if (res.code === '0') {
        setWalletAddress(res.data)
        setModalOpen(false)
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error(String(error))
      setModalOpen(true)
    }

  }
  const onCoinSearch = (value: string) => {
    console.log(value, 999);
  }

  useEffect(() => {
    // 只在客户端执
    if (typeof window === "undefined") return;

    try {
      // appStore.loadCurrencyPairs(); //加载币对数据
      appStore.loadGetUserInfo(); //加载币种数据
    } catch (error) {
      console.error("初始化货币对数据错误:", error);
    }
  }, []);
  useEffect(() => {
    getTopUpCoinAllList();
    getCoinExtAllList();
    // getChainsAll();
  }, [])
  // 添加 useEffect 来加载历史记录
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rechargeCoinHistory");
      if (isNotAllowToUp) return
      if (saved && coinList.length > 0) {
        const history = JSON.parse(saved).filter((item: any) => {
          return coinList.some((coin: any) => coin.coinId === item.coinId || coin.coinName === item.coinName)
        })
        setSearchHistory(history);
      }
    }
  }, [coinList, userInfo, isNotAllowToUp]);

  useEffect(() => {
    if (!router?.isReady) return;
    if (routeAppliedRef.current) return;
    if (coinList.length === 0) return;
    if (!coinExtAll || coinExtAll.length === 0) return;
    // const verified11 = currentUserInfo?.verifiedRechargeStatus === 1 && currentUserInfo?.realnessStatus === 1 //已认证且实名-允许
    const verified10 = userInfo?.verifiedRechargeStatus === 1 && userInfo?.realnessStatus !== 1 //已认证且未实名-判断unverifiedRechargeStatus
    // const unverifie10 = userInfo?.unverifiedRechargeStatus === 1 && userInfo?.realnessStatus === 0 //未认证且未实名-允许
    const unverifie11 = userInfo?.unverifiedRechargeStatus === 1 && userInfo?.realnessStatus === 1 //未认证且实名-判断verifiedRechargeStatus

    const needsKyc = verified10 && userInfo?.unverifiedRechargeStatus !== 1
    // const needsGoogleAuth = !userInfo?.isGoogleAuth || !userInfo?.googleCode
    const needsMerchantRecharge = (userInfo?.verifiedRechargeStatus !== 1 && userInfo?.unverifiedRechargeStatus !== 1) ||
      (unverifie11 && userInfo?.verifiedRechargeStatus !== 1)
    if (needsMerchantRecharge || needsKyc) return

    let target: any | undefined;
    if (coinId !== undefined && coinId !== null && coinId !== "") {
      target = coinList.find((c: any) => String(c.coinId) === String(coinId) || String(c.value) === String(coinId));
    }
    if (!target && coinName) {
      target = coinList.find((c: any) => String(c.coinName).toLowerCase() === String(coinName).toLowerCase());
    }
    if (target) {
      routeAppliedRef.current = true;
      // 触发与用户选择相同的流程：更新历史、获取网络并进入步骤2
      coinChange(target.value ?? target.coinId, target);
    }
  }, [router?.isReady, coinId, coinName, coinList, coinExtAll]);

  const steps = [
    {
      title: <p className={`${styles.tip_title} `}>
        {/* 充值币种 */}
        {t("toUpSteps.rechargeCoin")}
      </p>,
      description: (
        <div className={`${styles.steps_item_content} mt-2`}>
          {current >= 0 && (
            <>
              <Form.Item name="coinName" >
                <Select
                  allowClear={false}
                  placeholder={t("withdrawMoney.select")}
                  options={coinList || []} // 添加默认空数组
                  showSearch
                  filterOption={(input, option) => {
                    // console.log(input,option,999);
                    const data = (option && (option as any)) || {};
                    const query = (input || '')
                      .toLowerCase()
                      .trim()
                      .replace(/\s+/g, '');
                    if (!query) return true;

                    return data.coinName?.toLowerCase().includes(query) ||
                      data.nameDefault?.toLowerCase().includes(query)
                  }}
                  // onSearch={onCoinSearch}
                  className={`${styles.select_box} custom-select`}
                  optionRender={(option) => {
                    if (!option?.data) return null; // 添加空值检查
                    return (
                      <div className="flex-x align-center justify-between ">
                        {/* <div className="flex items-center py-1">
                                          {option.data.label}
                                    </div> */}

                        <div className="flex-x align-center font-14 font-w-400">
                        <Image
                            src={option.data.iconUrl}
                            alt={option.data.coinName}
                          width={20}
                          height={20}
                            className={styles.coninIcon}
                          />
                          &nbsp;
                          <span >{option.data.coinName}</span>
                          &nbsp;
                          <span className={styles.tip_color}>
                            {option.data.nameDefault}
                        </span>
                        </div>
                        {/* <div className="flex-y align-end font-14 font-w-500">
                          <span>{option.data.balance}</span>
                          <span
                            className={`${styles.tip_color} font-w-400 font-12`}
                          >{`≈${getWithdrawFee(
                            option.data.balance,
                            option.data.coinName
                          ).text
                            }`}</span>
                        </div> */}
                      </div>
                    );
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {coinList.length > 0 && (
                        <div className={`font-14 font-w-400 mb-2_5`}>
                          <div
                            className={`${styles.tip_color2} w-full flex-x justify-between`}
                          >
                            {/* 搜索历史 */}
                            <span> {t("withdrawMoney.searchHistory")}</span>

                            <button type="button" onClick={() => delHistory()}>
                              <Iconify
                                icon="mingcute:delete-2-line"
                                size={20}
                                className={`${styles.title_color}`}
                              />
                            </button>
                          </div>
                          {searchHistory.length > 0 ? (
                            <div className="mt-2 mb-2_5 flex-x">
                              {searchHistory.map((item, index) => (
                            <button
                                  type="button"
                                  key={`key-${index}`}
                                  className={`${styles.selsect_btn} cancel_btn5 mr-2 flex-x align-center justify-between font-14`}
                                  onClick={() => setFormCoin(item.value)}
                                >
                                  <Image
                                    src={item.iconUrl}
                                    alt={item.coinName}
                                    width={20}
                                    height={20}
                                    className={`mr-2`}
                                    style={{
                                      borderRadius: "50%",
                                      height: "12px",
                                      width: "12px",
                                    }}
                                  />
                                  {item.coinName}
                            </button>
                          ))}
                            </div>
                          ) : (
                            <p className="mt-2 mb-2_5">
                              {t("withdrawMoney.noRecord")}
                            </p>
                          )}
                          <p className={`${styles.tip_color2}`}>
                            {t("withdrawMoney.coinList")}
                          </p>
                        </div>
                      )}
                      {menu}
                    </>
                  )}
                  notFoundContent={
                    <NoData title={t("withdrawMoney.noRecord")} />
                  }
                  onFocus={getTopUpCoinAllList}
                  onChange={coinChange}
                  loading={coinLoading}
                />
              </Form.Item>
              <div className="mt-2_5">
                {searchHistory.length > 0 && searchHistory.map((item, index) => (
                  <button
                    key={`key-${index}`}
                    className={`${styles.btn_style} cancel_btn5 mr-2`}
                    onClick={() => setFormCoin(item.value)}>
                    {item.coinName}
                </button>
                ))}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      title: <p className={`${styles.tip_title} `}>
        {/* 网络 */}
        {t("toUpSteps.network")}
      </p>,
      description: (
        <div className={`${styles.steps_item_content2} mt-2`}>
          {current >= 1 && (<Form.Item name="protocolId" >
            <Select
              allowClear={false}
              placeholder={t("toUpSteps.placeholder")}
              options={coinExtSelect || []} // 添加默认空数组
              showSearch
              filterOption={(input, option) => {
                // console.log(input,option,999);
                const data = (option && (option as any).data) || {};
                const query = (input || '')
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, '');
                if (!query) return true;

                return (
                  data.symbol?.toLowerCase().includes(query) ||
                  data.protocolName?.toLowerCase().includes(query) ||
                  data.protocol?.toLowerCase().includes(query)
                )
              }}
              // onSearch={onCoinSearch}
              className={`${styles.select_box} custom-select`}
              optionRender={(option) => {
                return <div
                  key={option.data.value}
                  className="flex justify-between px-3 py-2 cursor-pointer"
                // onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleProtocolSelect(option.data.value, option.data); }}
                >
                  <div className="min-w-0">
                    <p>{option.data.symbol || '--'}</p>
                    <p className="text-[var(--text-color6)]">{option.data.protocolName || '--'}（{option.data.protocol || '--'}）</p>
                  </div>
                  <div className="shrink-0">{option.data.confirmCount ?? 1}
                    {t("toUpSteps.confirmCountTip")}</div>
                </div>
              }}
              notFoundContent={
                <NoData title={t("withdrawMoney.noRecord")} />
              }
              onChange={networkChange}
              loading={coinExtLoading}
            />

          </Form.Item>)}
        </div>
      ),
    },
    {
      title: <p className={`${styles.tip_title} `}>
        {/* 充值地址 */}
        {t("toUpSteps.rechargeAddress")}
      </p>,
      description: (
        <div className={`${styles.steps_item_content3} mt-2 relative `} >
          {current >= 2 && (<>
            {/* 提示信息1 */}
            {/* <p
              className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5`}
            >
              <Iconify
                icon="ep:warning-filled"
                className="warning_color mr-1"
                size={16}
              />
              <span>
                请勿向上述地址充值任何非本币种资产，否则资产将不可找回

              </span>
            </p> */}
            {/* 充值地址 */}
            <div className={`${styles.qrCode_box} px-5 py-5 flex-x align-center`}  >
              {addAddressLoading ? <div className="flex-x align-center w-full">
                <Skeleton.Node active={addAddressLoading} style={{ width: 86, height: 86 }} />
                <Skeleton active className="ml-3" title={false} paragraph={{ rows: 3 }} loading={true} />
              </div> : <>
              <div className={`${styles.qr_code}`}>
                  <QRCode value={walletAddress?.address || '--'}
                  color={isDayMode ? "#000" : "#fff"}
                  bgColor={isDayMode ? "#fff" : "#000"}
                  bordered={false}
                  size={86}
                />
              </div>
                <div className="ml-3 font-14 flex-1 min-w-0">
                  <p className={`${styles.tip_color2} font-w-400`}>
                    {/* 充值地址 */}
                    {t("toUpSteps.rechargeAddress")}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="mr-3 flex-1 min-w-0 break-all">
                      {walletAddress?.address || '--'}
                    </span>
                    <Iconify
                      icon="mingcute:copy-2-line"
                      size={20}
                      className="shrink-0 ml-2 w-5 h-5"
                      onClick={() => copyFn(walletAddress?.address || '')}
                    />
                  </div>
                </div>
              </>}
              {/* </Skeleton> */}
            </div>
            {/* 提示信息2 */}
            <p
              className={`${styles.warning_box} font-12 font-w-400 flex align-start mt-2_5`}
            >
              <Iconify
                icon="ep:warning-filled"
                className="warning_color mr-1"
                size={16}
              />
              <span>
                {/* 请勿向上述地址充值任何非本币种资产，否则资产将不可找回. */}
                {t("toUpSteps.networkWarning2")}
                {/* {t("withdrawMoney.networkWarning2", {
                  platformName:
                    allConfig?.tenant_cache_name || "--",
                })} */}
              </span>
            </p>
            {/* MEMO */}
            {/*{coinInfo.memoTag===1 && <div className={`${styles.qrCode_box} px-5 py-5 flex-x align-center mt-5`} >
              <div className={`${styles.qr_code}`}>
                <QRCode value="https://ant.design/"
                  color={isDayMode ? "#000" : "#fff"}
                  bgColor={isDayMode ? "#fff" : "#000"}
                  bordered={false}
                  size={86}
                />
              </div>
              <div className="ml-3 font-14 ">
                <p className={`${styles.tip_color2} font-w-400`}>MEMO</p>
                <div className="flex-x align-center mt-2">
                  <span className="mr-3">2166554412211</span>
                  <Iconify icon="mingcute:copy-2-line" size={20} />
                </div>
                <div className={`${styles.error_icon} mt-2`}>
                  *请务必填写Memo，否则将无法到账
                </div>
              </div>

            </div> }*/}
            {/* 充值信息 */}
            <ul className={`${styles.qrCode_box} ${styles.tip_color} px-5 py-5  mt-5`} >
              <li className="flex-x algin-center  justify-between">
                {/* 最小充值 */}
                {t("toUpSteps.minRecharge")}
                <span className={`${styles.title_color}`}>
                  {/* 0.001USDT */}
                  {coinInfo?.minRecharge || 0}{coinInfo?.coinName || '--'}
                </span>
              </li>
              <li className="flex-x algin-center mt-5 mb-5  justify-between">
                {/* 将资金充入 */}
                {t("toUpSteps.rechargeTo")}
                <span className={`${styles.title_color}`}>
                  {/* 现货账户 */}
                  {t("toUpSteps.rechargeTo2")}
                </span>
              </li>
              <li className="flex-x algin-center  justify-between">
                {/* 区块确认次数 */}
                {t("toUpSteps.confirmCount")}
                <span className={`${styles.title_color}`}>{coinInfo?.confirmCount || 1}{t("toUpSteps.confirmCountTip3")}</span>
              </li>
            </ul>
          </>)}
          {coinInfo.memoTag === 1 && modalOpen && current >= 2 && <div className={`${styles.modal_box} flex-y-cc text-center pb-5 px-4`} >
            <Image src="/images/pubic_icon/icon_address.svg" alt="modal" width={160} height={160} />
            <div className="text-[#fff] text-[20px] font-w-500">
              {t("toUpSteps.memoTip1")}
            </div>
            <div className="text-[#D9D9D9] text-[14px] font-w-400 w-[350px]  mt-[3%] ">
              {t("toUpSteps.memoTip2")}
            </div>
            <Button className="default_btn !rounded-[36px] !h-[36px] px-[24px] mt-[4%]"
              htmlType="submit"
              onClick={getWalletAddressDataFn}
            // loading={true}
            >
              {t("toUpSteps.memoTip3")}
            </Button>
          </div>}
        </div>
      ),
    },
  ];

  return (
    <div className={` page-h w-full page-box flex-y align-center `}>
      <div className={`${styles.spot_auth_box} max-w-[1200px]`}>
        <div className="flex justify-between align-center">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link href={ROUTER_KEY_ASSETS.SPOT_ACCOUNT}>
                    <span className={`${styles.tip_color}`}>
                      {/* 现货账户 */}
                      {t("assets.assetsAccount")}
                    </span>
                  </Link>
                ),
              },
              {
                title: (
                  <span className={`${styles.title_color}`}>
                    {/* 充值 */}
                    {t("assets.deposit")}
                  </span>
                ),
              },
            ]}
            style={{ fontSize: 14 }}
          />
        </div>

          <div className={`${styles.card_box}  mt-6  `}>
          {(() => {
            // const verified11 = currentUserInfo?.verifiedRechargeStatus === 1 && currentUserInfo?.realnessStatus === 1 //已认证且实名-允许
            const verified10 = userInfo?.verifiedRechargeStatus === 1 && userInfo?.realnessStatus !== 1 //已认证且未实名-判断unverifiedRechargeStatus
            // const unverifie10 = userInfo?.unverifiedRechargeStatus === 1 && userInfo?.realnessStatus === 0 //未认证且未实名-允许
            const unverifie11 = userInfo?.unverifiedRechargeStatus === 1 && userInfo?.realnessStatus === 1 //未认证且实名-判断verifiedRechargeStatus

            const needsKyc = verified10 && userInfo?.unverifiedRechargeStatus !== 1
            // const needsGoogleAuth = !userInfo?.isGoogleAuth || !userInfo?.googleCode
            const needsMerchantRecharge = (userInfo?.verifiedRechargeStatus !== 1 && userInfo?.unverifiedRechargeStatus !== 1) ||
              (unverifie11 && userInfo?.verifiedRechargeStatus !== 1)

            return needsMerchantRecharge ? <NoUseCom type="5" /> : needsKyc ? <NoUseCom type="1" /> : <></>
          })()}
            <div
              className={` w-full flex-x justify-between ${styles.card_content2}`}
            >
            <div className={`${styles.step_box} flex-1 max-w-[500px]`} style={{ width: '50%' }}>
                <ConfigProvider
                  theme={{
                    components: {
                      Select: {
                        clearBg: "#ffffff",
                      selectorBg: "var(--background7)", // select框背景色 //transparent
                        singleItemHeightLG: 50,
                        paddingXXS: 10, // 下拉框选项最小内边距
                        optionHeight: 40, //选项高度
                        optionLineHeight: 2, //选项行高
                      },
                      Steps: {
                        navArrowColor: "var(--text-color6)",
                      },
                    Button: {
                      controlHeightLG: 50,
                      defaultBg: "var(--theme-color)",
                      defaultBorderColor: "var(--theme-color)",
                      defaultColor: "#fff",
                      // defaultActiveBg: '#fff',
                      // defaultActiveBorderColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                      // defaultActiveColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                      // defaultHoverBg: '#fff',
                      // defaultHoverBorderColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                      // defaultHoverColor: segmentedvalue === 'buy' ? "#00C788" : "#FF4D4F",
                      defaultActiveBg: "var(--theme-color)",
                      defaultActiveBorderColor: "var(--theme-color)",
                      defaultActiveColor: "#fff",
                      defaultHoverBg: "var(--theme-color)",
                      defaultHoverBorderColor: "var(--theme-color)",
                      defaultHoverColor: "#fff",
                      },
                    },
                  }}
                >
                <Form form={form} disabled={isNotAllowToUp}>
                  <Steps
                    direction="vertical"
                    current={current}
                    labelPlacement="vertical"
                    items={steps}
                    className="custom-steps"
                  />
                </Form>
                </ConfigProvider>
              </div>
            <TopUpSteps type="topUp" className="flex-1 ml-5 max-w-[500px]" style={{ width: '50%' }} />
            </div>
            <div className={`${styles.table_box} w-full `}>
            <RechargeTable coinId={coinInfo?.coinId || form.getFieldValue('coinName') || ''} />
          </div>
        </div>

      </div>
    </div>
  );
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["assets", "common"])),
    },
  };
};

export default TopUpPage
