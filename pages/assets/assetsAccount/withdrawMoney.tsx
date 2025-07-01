import React from 'react';
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from '../styles/spotAccount.module.css'
import { Input, Steps, Breadcrumb, ConfigProvider, Tooltip, Select, Form, AutoComplete } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useThemeMode } from '@/hooks/useThemeMode';
import Image from 'next/image'
import Link from 'next/link'
import { NoData, NoAddress } from '@/components/noData';
import WithdrawMoneyCheck from '@/components/assetsModal/withdrawMoneyCheck'
import { useRouter } from 'next/router'
import NoUseCom from '../compontents/noSM'
import { getuserAddressList, getWithdrawCoinAll, getcoinExtList, getUserBalance, getProtocolTypeAll, getUserALlLimit, getUserBalanceAll } from '@/services/assets'
import { toast } from "sonner";
import { cut, nul, division, countNum, withdrawFee } from '@/utils'
import { getUserInfo } from '@/hooks/userInfo';
import TableBox from "../compontents/withDrawTable"
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { getLoginUserInfo } from "@/services/userCenter"
import { ROUTER_KEY_ASSETS } from '@/config/apiConfig';
import { ResetStateProvider, useResetStateContext } from '@/hooks/useStateProvider';
import appStore from '@/store';
import { observer } from 'mobx-react-lite';
import { getRate, getCoinRate } from '@/utils/getUseRate';
import { coinSelectType, coinExtAllListType, coinExtSelectType, addressSelectType, SearchHistoryItem, coinInfoType, limitType } from '@/type/assets/assetsAccount/withdraw';
import WithdrawSteps from '../compontents/withDrawSteps'

const WithdrawMoneyPage = observer(() => {
    const { t } = useTranslation('assets');
    const allConfig = appStore.getKvConfigAll();
    const { isDayMode } = useThemeMode(); // 使用 hook
    const [checkOpen, setCheckOpen] = useState(false);
    const rateData = appStore.getRateData() || [];
    const rateKey = appStore.getRateKey()?.replace(/\s+/g, '')
    const [current, setCurrent] = useState(0);

    // 商户支持的币种协议(网络)
    const [protocolTypeList, setProtocolTypeList] = useState<coinExtAllListType[]>([])
    // 币种
    const [coinSelect, setCoinSelect] = useState<coinSelectType[]>([])
    const [coinLoading, setCoinLoading] = useState(false)
    const [coinIdHistory, setCoinIdHistory] = useState(0)
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
    // 币种余额信息
    // const [userBalance, setUserBalance] = useState<userBalanceType>({} as userBalanceType)
    const [coninInfo, setConinInfo] = useState<coinInfoType>({} as coinInfoType)

    // 币种协议(网络)
    const [coinExtLoading, setCoinExtLoading] = useState(false)
    const [coinExtSelect, setCoinExtSelect] = useState<coinExtSelectType[]>([])

    // 提现地址
    const [addressSelect, setAddressSelect] = useState<addressSelectType[]>([])
    const [addressLoading, setAddressLoading] = useState(false)

    const [amountNum, setAmountNum] = useState<number | null>(null)
    // 提现信息
    const [withdrawInfo, setWithdrawInfo] = useState<any>(null)

    const [form] = Form.useForm();
    const router = useRouter()

    // 添加状态来存储用户信息
    const [userInfo, setUserInfo] = useState<any>(null);

    // 添加状态来跟踪是否显示 MEMO
    const [showMemo, setShowMemo] = useState(false);

    const [allowWithdraw, setAllowWithdraw] = useState(false)
    const { resetState } = useResetStateContext();
    const [addressInput, setAddressInput] = useState('');
    const [filteredAddressOptions, setFilteredAddressOptions] = useState(addressSelect);

    // 控制地址下拉菜单的显示状态
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [userAllLimit, setUserAllLimit] = useState<limitType>({} as limitType)
    const [btnSumbitError, setBtnSumbitError] = useState(false);

    // 在 useEffect 中获取用户信息
    useEffect(() => {
        // if (typeof window !== 'undefined') {
        //     setUserInfo(getUserInfo());
        // }
        getUserData()
    }, []);
    const getUserData = async () => {
        try {
            const res = await getLoginUserInfo()
            if (res.code === "0") {
                setUserInfo(res.data)
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            console.error(t('safeModal.getUserInfoError'), error);
        }


    }
    // 币种
    const getCoinAllList = async () => {
        if (coinSelect.length > 0 || coinLoading) return
        await getCoinAllData()
    }
    const getCoinAllData = async () => {
        setCoinLoading(true)
        try {
            const res = await getWithdrawCoinAll()
            if (res.code === '0') {
                // 先筛选 status === 1 的数据，然后再进行 map 转换
                const coinList = res.data
                    .filter((item: any) => item.status === 1 && item.canWithdraw === 1)  // 添加筛选
                    .map((item: any) => ({
                        ...item,
                        label: <div className="flex-x align-center font-14 font-w-400" >
                            <Image src={item.iconUrl} alt={item.coinName} width={20} height={20} className={styles.coninIcon} />&nbsp;
                            <span className={styles.title_color}>{item.coinName}</span>
                            &nbsp; <span className={styles.tip_color}>{item.nameDefault}</span>
                        </div>,
                        value: item.coinId,
                    }));
                const balanceAll = await getUserBalanceAllData()
                const coinListAll = coinList.map((item: any) => {
                    const balance = balanceAll.find((balance: any) => balance.coinName === item.coinName)
                    return {
                        ...item,
                        ...balance
                    }
                })

                setCoinSelect(coinListAll)
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        } finally {
            setCoinLoading(false)
        }
    }
    // 币种选中更改-筛选历史选中/获取币种余额
    const coinChange = async (value: string, option: any) => {
        console.log(option, 121, value);

        const coinId = form.getFieldValue('tenantId')
        // 判断同币种不重复请求
        if (coinId.toString() !== coinIdHistory.toString()) {
            // 重置表单字段
            form.resetFields(['protocolId']);
        }
        if (!value && !coinId) {
            setCurrent(0)
            form.resetFields(['protocolId']);

            return;
        }

        // console.log(123, option);
        setCurrent(1)
        // 获取当前选中项的完整信息
        const selectedCoin = coinSelect.find(coin => coin.coinId.toString() === value.toString());
        if (!selectedCoin) return;

        // 更新历史记录
        const newHistoryItem = {
            ...selectedCoin,
            value: value,
            label: selectedCoin.label,
            iconUrl: selectedCoin.iconUrl, // 确保包含图标URL
        };
        setSearchHistory(prev => {
            // 移除已存在的相同选项
            const filtered = prev.filter(item => item.value !== value).map(item => ({
                ...item,
                label: item.label,
                iconUrl: item.iconUrl
            }));
            // 将新选项添加到开头
            const newHistory = [newHistoryItem, ...filtered].slice(0, 4);
            // 保存到localStorage
            localStorage.setItem('coinSearchHistory', JSON.stringify(newHistory));
            return newHistory;
        });
        // setSearchHistory(prev => {
        //     // 移除已存在的相同选项
        //     const filtered = prev.filter(item => item.value !== value);
        //     // 将新选项添加到开头
        //     const newHistory = [{
        //         ...selectedCoin,
        //         value: value,
        //         label: selectedCoin.coinName,

        //     }, ...filtered].slice(0, 4);
        //     // 保存到localStorage
        //     localStorage.setItem('coinSearchHistory', JSON.stringify(newHistory));
        //     return newHistory;
        // });
        // 获取币种余额
        const balance = await getUserBalanceData()
        setConinInfo(Object.assign(balance, option))

        // 币种选中后自动请求网络列表
        await getCoinExt(Number(value))
    }
    // 币种余额
    const getUserBalanceData = async () => {
        const tenantId = form.getFieldValue('tenantId')
        if (!tenantId) {
            return toast.error(t('assetsAccount.selectCoin'))
        }
        try {
            const res = await getUserBalance(tenantId)
            if (res.code === '0') {
                // setUserBalance(res.data)
                return res.data
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        }
    }
    const getUserBalanceAllData = async () => {
        try {
            const res = await getUserBalanceAll()
            if (res.code === '0') {
                // setUserBalance(res.data)
                return res.data
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        }
    }
    // 历史币种快捷键
    const setFormCoin = async (coinId: string | number) => {
        // 1. 首先检查用户权限
        if (userInfo?.merchantWithdrawalStatus !== 1 || !userInfo?.googleCode || userInfo.withdrawalStatus === 0) {
            return toast.error(t('withdrawMoney.function'));
        }

        // 2. 检查是否是重复点击同一个币种
        const currentCoinId = form.getFieldValue('tenantId');
        if (currentCoinId === coinId) {
            return; // 如果是同一个币种，直接返回，避免不必要的操作
        }

        // 3. 检查并获取币种列表
        // if (coinSelect.length === 0) {
        //     await getCoinAllData();
        // }
        let currentCoinList = coinSelect;
        if (coinSelect.length === 0) {
            const res = await getWithdrawCoinAll();
            if (res.code === '0') {
                const coinList = res.data
                    .filter((item: any) => item.status === 1)
                    .map((item: any) => ({
                        ...item,
                        label: <div className="flex-x align-center font-14 font-w-400" >
                            <Image src={item.iconUrl} alt={item.coinName} width={20} height={20} className={styles.coninIcon} />&nbsp;
                            <span className={styles.title_color}>{item.coinName}</span>
                            &nbsp; <span className={styles.tip_color}>{item.nameDefault}</span>
                        </div>,
                        value: item.coinId,
                    })).sort((a: any, b: any) => a.sort - b.sort)
                setCoinSelect(coinList);
                currentCoinList = coinList;
            } else {
                throw new Error(res.message);
            }
        }

        // 4. 获取选中币种的信息
        const selectedCoin = currentCoinList.find(coin => coin.coinId.toString() === coinId.toString());
        if (!selectedCoin) {
            return toast.error(t('withdrawMoney.setCoinError'));
        }

        // 5. 重置相关字段
        if (coinId.toString() !== coinIdHistory.toString()) {
            form.resetFields(['protocolId']);
        }

        try {
            // 6. 设置表单值
            form.setFieldValue('tenantId', coinId);

            // 7. 如果在第一步，进入下一步
            if (current === 0 || (coinId.toString() !== coinIdHistory.toString())) {
                setCurrent(1);
            } else {
                returnStep(2)
            }

            // 8. 获取并更新余额信息
            const balance = await getUserBalanceData();
            setConinInfo(Object.assign(balance, selectedCoin)) //更新币种
            if (balance) {
                setConinInfo({
                    ...balance,
                    ...selectedCoin,
                    // 确保关键数值字段有默认值
                    balance: balance.balance || 0,
                    minWithdrawAmount: balance.minWithdrawAmount || 0,
                    maxWithdrawAmount: balance.maxWithdrawAmount || 0,
                    withdrawFee: balance.withdrawFee || 0,
                    minWithdrawFee: balance.minWithdrawFee || 0
                });
            }

            // 9. 历史选中按钮也需要请求网络列表
            await getCoinExt(Number(coinId))
        } catch (error) {
            console.error('setFormCoin error:', error);
            toast.error(t('withdrawMoney.setCoinError'));
        }
    };

    // 链名称(网络名称) - 已弃用，改为在币种选择时直接调用getCoinExt
    const getCoinExtList = async () => {
        const tenantId = form.getFieldValue('tenantId')
        if (!tenantId) {
            setCoinExtSelect([])
            return toast.error(t('assetsAccount.selectCoin'))
        }
        // 判断同币种不重复请求
        if (coinIdHistory.toString() === tenantId.toString() || coinExtLoading) return
        setCoinExtSelect([]) //初始化
        setCoinIdHistory(tenantId)
        // await getAllProtocolTypeList()
        await getCoinExt(tenantId)
    }
    // 商户支持的币种协议(网络)-所有
    const getAllProtocolTypeList = async () => {
        try {
            const res = await getProtocolTypeAll()
            if (res.code === '0') {
                const protocolList = res.data.map((item: any) => ({
                    ...item,
                    label: `${item?.protocol}(${item?.protocolName})`,
                    value: item.id,
                }))
                setProtocolTypeList(protocolList)
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        }

    }
    // 币种对应的协议（网络）-通过币种协议获取网络id进行匹配
    const getCoinExt = async (tenantId: number) => {
        if (!tenantId) {
            setCoinExtSelect([])
            return
        }
        
        // 判断同币种不重复请求
        if (coinIdHistory.toString() === tenantId.toString() || coinExtLoading) return
        
        setCoinExtSelect([]) //初始化
        setCoinIdHistory(tenantId)
        setCoinExtLoading(true)
        
        try {
            const res = await getcoinExtList(tenantId)
            if (res.code === '0') {
                const coinExtList = res.data.map((item: any) => {
                    const protocol = protocolTypeList.find(protocol => protocol.id === item.protocolId)
                    return {
                        ...item,
                        ...protocol,
                        label: `${protocol?.protocol || '--'}(${protocol?.protocolName || '--'})`,
                        value: item.protocolId,
                    }
                })
                setCoinExtSelect(coinExtList)
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        } finally {
            setCoinExtLoading(false)
        }
    }

    const coinExtChange = (value: string, option: any) => {
        if (value) {
            setConinInfo(Object.assign(coninInfo, option))
            form.setFieldValue('amount', coninInfo.minWithdrawAmount)
            
            // 检查当前选中的地址是否与新选择的网络兼容
            const currentAddress = form.getFieldValue('addressId');
            if (currentAddress) {
                const selectedAddress = filteredAddressOptions.find(item => item.addressName === currentAddress);
                if (selectedAddress) {
                    const isCompatible = option.protocolName === selectedAddress.protocolName ||
                                        option.protocol === selectedAddress.protocolName ||
                                        option.protocolId === selectedAddress.protocolId;
                    
                    if (!isCompatible) {
                        toast.warning(
                            t('withdrawMoney.addressNetworkMismatch') || '当前地址与选择的网络不匹配，请重新选择地址'
                        );
                        // 清空地址选择
                        form.setFieldValue('addressId', null);
                    }
                }
            }
        } else {
            returnStep(2)
        }
        checkStep2Required()
    }

    // 地址
    const getUserAddressList = async () => {
        // if (addressSelect.length > 0 || addressLoading) return
        if (addressLoading) return
        await getUserAddressListData()
    }
    const getUserAddressListData = async () => {
        const pageParam = {
            pageNo: 1,
            pageSize: 100,
        }
        setAddressLoading(true)
        try {
            const res = await getuserAddressList(pageParam)
            if (res.code === '0') {
                const addressList = res.data.list.map((item: any) => ({
                    ...item,
                    label: item.addressName,
                    value: item.id
                }))
                setAddressSelect(addressList)
            } else {
                toast.error(res.message)
            }
        } finally {
            setAddressLoading(false)
        }

    }
        const addressChange = (value: string, option: any) => {
        // 查找选中的地址信息
        const selectedAddress = filteredAddressOptions.find(item => item.addressName === value);
        
        if (selectedAddress) {
            // 在coinExtSelect中查找匹配的网络
            const matchedNetwork = coinExtSelect.find(coinExt => 
                coinExt.protocolName === selectedAddress.protocolName ||
                coinExt.protocol === selectedAddress.protocolName ||
                coinExt.protocolId === selectedAddress.protocolId
            );
            
            // 如果找到匹配的网络，自动回填到protocolId
            if (matchedNetwork) {
                form.setFieldValue('protocolId', matchedNetwork.value);
                // 更新币种信息
                setConinInfo(Object.assign(coninInfo, matchedNetwork));
                // 设置最小提现金额
                form.setFieldValue('amount', coninInfo.minWithdrawAmount);
                
                // 给用户提示网络已自动选择
                toast.success(
                    t('withdrawMoney.networkAutoSelected', { 
                        network: matchedNetwork.protocolName || matchedNetwork.protocol 
                    })
                );
            } else if (selectedAddress) {
                // 如果地址存在但找不到匹配的网络，给出提示
                toast.warning(
                    t('withdrawMoney.networkNotFound') 
                );
            }
        }
        
        form.setFieldValue('addressId', value);
        // checkAddressMatch(value);
        checkStep2Required()
    }
    useEffect(() => {
        // 每次 addressSelect 变化时，重置过滤
        setFilteredAddressOptions(addressSelect);
    }, [addressSelect]);

    const handleAddressSearch = (value: string) => {
        setAddressInput(value);
        if (!value) {
            setFilteredAddressOptions(addressSelect);
            return;
        }
        setFilteredAddressOptions(
            addressSelect.filter(option =>
                option.addressName?.toLowerCase().includes(value.toLowerCase()) ||
                option.addressTitle?.toLowerCase().includes(value.toLowerCase()) ||
                option.protocolName?.toLowerCase().includes(value.toLowerCase())
            )
        );
    };
    // 进入第三步-添加检查函数
    const checkStep2Required = () => {
        const addressId = form.getFieldValue('addressId');
        const protocolId = form.getFieldValue('protocolId');

        if (addressId && protocolId) {
            // setCurrent(2); // 进入第三步
            nextStep3()
        }
        else {
            // // 触发表单验证，显示错误信息
            // form.validateFields(['addressId', 'protocolId'])
            //     .catch(error => {
            //         console.log('表单验证失败:', error);
            //     });
            returnStep(2)
            // setCurrent(1);
        }
    };
    const returnStep = (step: number) => {
        if (step === 1) {
            setCurrent(0)
            // 重置表单字段
            form.resetFields(['addressId', 'protocolId', 'momo', 'amount']);
            // 显式设置空值
            form.setFieldValue('addressId', null);
            setShowMemo(false);
        } else if (step === 2) {
            setCurrent(1)
            // 重置输入框
            setInputInitialValues()
        }
    }
    const nextStep3 = () => {
        setCurrent(2)
        setInputInitialValues()
    }
    const setInputInitialValues = () => {
        // setAmountNum(coninInfo.minWithdraw || 0)
        // form.setFieldValue('amount', coninInfo.minWithdraw || 0)
        setAmountNum(getMinWithdraw('min') || 0)
        form.setFieldValue('amount', getMinWithdraw('min') || 0)

    }
    const isMemo = () => {
        // memoTag
        const coinId = form.getFieldValue('tenantId')
        const data = coinSelect.filter((item: any) => item.coinId == coinId)
        return data[0]?.memoTag

    }

    // 金额
    const amountChange = (e: any) => {
        const { value } = e.target;
        if (value) {
            // 只允许数字和一个小数点，限制小数位数
            const filteredValue = value
                .replace(/[^\d.]/g, '')  // 只保留数字和小数点
                .replace(/\.{2,}/g, '.') // 去除多个连续的小数点
                .replace(/^(\d*\.\d*)\./, '$1') // 只保留第一个小数点
                .replace(/^0+(\d)/, '$1')  // 如果以0开头，且后面有数字，则去除开头的0
                .replace(/^0+$/, '0')  // 如果全是0，则保留一个0
                .replace(/^\./, '0.')  // 如果以小数点开头，则在前面加0
                .replace(/^(\d+\.\d{8}).*$/, '$1'); // 限制小数位数为8位

            form.setFieldValue('amount', filteredValue);
            setAmountNum(filteredValue)
            // if (filteredValue > coninInfo.minWithdraw) {
            //     // setAllowWithdraw(true)
            //     if (filteredValue > userAllLimit.maxWithdraw) {
            //         setAllowWithdraw(false)
            //     }else{
            //         setAllowWithdraw(true)
            //     }
            //     if(filteredValue > userAllLimit.balance){
            //         setAllowWithdraw(false)
            //     }else{
            //         setAllowWithdraw(true)
            //     }
            // } else {
            //     setAllowWithdraw(false)
            // }
            // 小于最小提币量，大于最大提币量，大于现货余额 //，大于24h限额-接口未通
            // if (filteredValue < coninInfo.minWithdraw || filteredValue > coninInfo.maxWithdraw || filteredValue > Number(userAllLimit.max)) {
            //     setAllowWithdraw(false)
            // } else {
            //     setAllowWithdraw(true)
            // }
            // 检查是否允许提现
            checkAllowWithdraw(filteredValue);
        } else {
            setAmountNum(null)
            form.setFieldValue('amount', null)
            setAllowWithdraw(false)
        }

    }

    const antiFraud = () => {
        // if (!allowWithdraw) return toast.error(t('withdrawMoney.function'))
        if (!allowWithdraw) return
        form.validateFields()
            .then(async (values) => {
                console.log(values)
                const params = {
                    coinId: values.tenantId,
                    toAddress: values.addressId,
                    protocolId: values.protocolId,
                    momo: values.momo || null,
                    amount: values.amount,
                    minWithdrawAmount: coninInfo.minWithdrawAmount,
                    minWithdrawFee: coninInfo.minWithdrawFee,
                    withdrawFee: coninInfo.withdrawFee,
                    maxWithdrawAmount: coninInfo.maxWithdrawAmount,
                    minWithdraw: coninInfo.minWithdraw,
                    maxWithdraw: coninInfo.maxWithdraw,
                    minRecharge: coninInfo.minRecharge,

                    // amountAfter:cut(amountNum, coninInfo.withdrawFee ?
                    //     nul(amountNum, coninInfo.withdrawFee) : coninInfo.minWithdrawFee) || 0,
                    amountAfter: countNum(amountNum || 0, coninInfo.withdrawFee, coninInfo.minWithdrawFee) || 0,
                    protocolName: coinExtSelect.find(item => item.value === values.protocolId)?.protocolName,
                    coinName: coninInfo.coinName,
                    // countWithdrawFee: nul(amountNum, coninInfo.withdrawFee) > coninInfo.minWithdrawFee ? nul(amountNum, coninInfo.withdrawFee) : coninInfo.minWithdrawFee,
                    countWithdrawFee: withdrawFee(amountNum || 0, coninInfo.withdrawFee, coninInfo.minWithdrawFee) || 0,

                }
                setWithdrawInfo(params)
                setCheckOpen(true)

            })
            .catch(error => {
                console.log(error)
            })
    }


    // 添加过滤函数
    // const filterAddressOption = (input: string, option: any) => {
    //     return (
    //         option.addressName?.toLowerCase().includes(input.toLowerCase()) ||
    //         option.addressTitle?.toLowerCase().includes(input.toLowerCase()) ||
    //         option.protocolName?.toLowerCase().includes(input.toLowerCase())
    //     );
    // };
    const filterAddressOptions = (inputValue: string, option: addressSelectType | undefined): boolean => {
        if (!option) return false; // 如果 option 为 undefined，直接返回 false
        return option.addressName?.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.addressTitle?.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.protocolName?.toLowerCase().includes(inputValue.toLowerCase());

    };

    // 添加检查地址是否匹配的函数
    const checkAddressMatch = (value: string) => {
        if (!value) return
        const isMatch = addressSelect.some(item => item.addressName === value);
        setShowMemo(!isMatch); // 如果地址不匹配，显示 MEMO
    };
    //  输入金额校验
    const checkAmount = (_: any, value: string) => {
        if (!value) {
            return Promise.reject(t('withdrawMoney.inputAmount')); //请输入提现金额
        }
        const amount = Number(value);

        // 检查是否为有效数字
        if (isNaN(amount)) {
            setBtnSumbitError(true)
            return Promise.reject(t('withdrawMoney.invalidAmount'));
        }

        // 检查余额
        if (amount > coninInfo.balance) {
            setBtnSumbitError(true)
            return Promise.reject(t('withdrawMoney.insufficientBalance'));
        }

        // 检查单笔最大限额
        if (amount > coninInfo.maxWithdraw) {
            setBtnSumbitError(true)
            return Promise.reject(
                t('withdrawMoney.exceedMaxLimit3', { max: coninInfo.maxWithdraw })
            );
        }

        // 检查单笔最小限额
        if (amount < coninInfo.minWithdraw) {
            setBtnSumbitError(true)
            return Promise.reject(
                t('withdrawMoney.belowMinLimit3', { min: coninInfo.minWithdraw })
            );
        }
        // 检查24h限额
        // if (amount < getCoinRateData(coninInfo.coinName, userAllLimit.mix)) {
        //     setBtnSumbitError(true)
        //     return Promise.reject(
        //         t('withdrawMoney.belowMin24h3', { min: getCoinRateData(coninInfo.coinName, userAllLimit.mix) })
        //     );
        // }
        if (amount > getCoinRateData(coninInfo.coinName, userAllLimit.max)) {
            setBtnSumbitError(true)
            const max = getCoinRateData(coninInfo.coinName, userAllLimit.max)
            const min = getCoinRateData(coninInfo.coinName, userAllLimit.mix)
            return Promise.reject(
                t('withdrawMoney.belowMax24h3', { max:cut(max, min) })
            );
        }

        // 所有检查都通过
        setBtnSumbitError(false)
        return Promise.resolve();
    }
    const maxWithdrawAmountBtn = () => {
        if (!checkMaxWithdraw()) return;

        // 获取三个限制值
        const balanceLimit = Number(coninInfo.balance) || 0;
        const withdrawLimit = Number(coninInfo.maxWithdraw) || 0;
        const max = getCoinRateData(coninInfo.coinName, userAllLimit.max) || 0;
        const min = getCoinRateData(coninInfo.coinName, userAllLimit.mix) || 0;
        const rateLimit = Number(cut(max, min))||0
        // 找出三个值中的最小值
        const maxAmount = Math.min(balanceLimit, withdrawLimit, rateLimit);

        form.setFieldValue('amount', maxAmount);
        setAmountNum(maxAmount);

        // 检查是否允许提现
        checkAllowWithdraw(maxAmount);
    }
    // 新增 checkAllowWithdraw 函数来统一处理提现权限检查
    const checkAllowWithdraw = (amount: number | string) => {
        // 小于最小提币量，大于最大提币量，大于现货余额
        if (Number(amount) < coninInfo.minWithdraw ||
            Number(amount) > coninInfo.maxWithdraw ||
            Number(amount) > getCoinRateData(coninInfo.coinName, userAllLimit.max)) {
            setAllowWithdraw(false);
        } else {
            setAllowWithdraw(true);
        }
    }
    // 最大值检查
    const checkMaxWithdraw = () => {
        if ((allowWithdraw &&
            Number(amountNum) < Math.min(Number(coninInfo.balance || 0), Number(coninInfo.maxWithdraw || 0), getCoinRateData(coninInfo.coinName, userAllLimit.max)))
            || Number(amountNum) === 0) {
            return true
        } else {
            return false
        }
    }
    // 提现最小值获取，提现最大值获取
    const getMinWithdraw = (type: 'min' | 'max') => {
        const max=getCoinRateData(coninInfo.coinName, userAllLimit.max)
        const min = getCoinRateData(coninInfo.coinName, userAllLimit.mix)
        
        if (type === 'min') {
            return Math.max(Number(coninInfo.minWithdraw), getCoinRateData(coninInfo.coinName, cut(max,min)))
        } else {
            return Math.min(Number(coninInfo.maxWithdraw), getCoinRateData(coninInfo.coinName, cut(max,min)), Number(coninInfo.balance || 0))
        }
    }
    // 获取用户24小时限额
    const getUserALlLimitData = async () => {
        try {
            const res = await getUserALlLimit()
            if (res.code === '0') {
                setUserAllLimit(res.data)
            }
        } catch (error) {
            toast.error(String(error))
        }
    }
    const checkOK = () => {
        // resetState
        form.resetFields()
        setCurrent(1);
        setCheckOpen(false)
        // 获取24小时限额
        getUserALlLimitData()

    }
    // 手续费汇率-可用余额汇率（传baseCoinName）
    const getWithdrawFee = (number: number, baseCoinName?: string) => {
        let coinName = ''
        if (baseCoinName) {
            coinName = baseCoinName || ''
        } else {
            coinName = coninInfo.coinName ||
                coinSelect.find((item: any) => item.coinId === form.getFieldValue('tenantId'))?.coinName || ''
        }
        const rateKeyName = rateKey.split('-')[0]; // 获取汇率key
        const { shortName, rate, symbol } = getRate(coinName, number, rateKeyName);
        return {
            coinName: coinName || '--',
            shortName,
            rate,
            symbol,
            text: `${rate} ${shortName}`
        }

    }
    // 24h限额换算
    const getCoinRateData = (coinName: string, number: number | string) => {
        const { coinRate, price } = getCoinRate(coinName, Number(number), 'USDT', 1)
        return coinRate || 0
    }
    // 自定义提现网络校验规则
    const validateProtocol = (rule: any, value: any, callback: any) => {
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (!value) {
            return Promise.reject(new Error(t('withdrawMoney.selectNetwork2')));
        }
        // const a=addressId
        // const addressId = form.getFieldValue('addressId');
        // const address=filteredAddressOptions.find((item: any) => item.addressName === addressId);
        // if (address?.protocolId !== value) {
        //     return Promise.reject(new Error(t('withdrawMoney.selectNetwork2Error')));
        // }

        return Promise.resolve();
    }
    // 提现地址校验规则
    const validateAddress = (rule: any, value: any, callback: any) => {
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (!value) {
            return Promise.reject(new Error(t('withdrawMoney.inputAddress')));
        }
        return Promise.resolve();
    }


    useEffect(() => {
        if (amountNum && amountNum > 0) {
            checkAllowWithdraw(amountNum);
        }
    }, [coninInfo, userAllLimit, amountNum]);
    useEffect(() => {
        getAllProtocolTypeList()
        getCoinAllData()
        getUserALlLimitData()
    }, [rateKey])
    useEffect(() => {
        // 只在客户端执
        if (typeof window === 'undefined') return;

        try {
            appStore.loadCurrencyPairs()
        } catch (error) {
            console.error('初始化货币对数据错误:', error);
        }
    }, []);

    const steps = [
        {
            title: <p className={`${styles.tip_title}`}>
                {/* 提现币种 */}
                {t('withdrawMoney.withdrawCoin')}
            </p>,
            description: <div className={`${styles.steps_item_content} mt-2`}>
                {current >= 0 && <>
                    <Form.Item name='tenantId' rules={[{ required: true, message: t('withdrawMoney.select') }]}>
                        <Select
                            allowClear={false}
                            placeholder={t('withdrawMoney.select')}
                            options={coinSelect || []}  // 添加默认空数组
                            className={`${styles.select_box} custom-select`}
                            optionRender={(option) => {
                                if (!option?.data) return null;  // 添加空值检查
                                return (<div className='flex-x align-center justify-between'>
                                    {/* <div className="flex items-center py-1">
                                          {option.data.label}
                                    </div> */}

                                    <div className="flex-x align-center font-14 font-w-400" >
                                        <Image src={option.data.iconUrl} alt={option.data.coinName} width={20} height={20} className={styles.coninIcon} />&nbsp;
                                        <span >{option.data.coinName}</span>
                                        &nbsp; <span className={styles.tip_color}>{option.data.nameDefault}</span>
                                    </div>
                                    <div className='flex-y align-end font-14 font-w-500'>
                                        <span>{option.data.balance}</span>
                                        <span className={`${styles.tip_color} font-w-400 font-12`}>{`≈${getWithdrawFee(option.data.balance, option.data.coinName).text}`}</span>
                                    </div>
                                </div>
                                );
                            }}
                            dropdownRender={(menu) => (
                                <>
                                    {coinSelect.length > 0 && (
                                        <div className={`font-14 font-w-400 mb-2_5`}>
                                            <div className={`${styles.tip_color2} w-full flex-x justify-between`}>
                                                {/* 搜索历史 */}
                                                <span> {t('withdrawMoney.searchHistory')}</span>

                                                <button
                                                    type='button'
                                                    onClick={() => delHistory()}
                                                >
                                                    <Iconify icon="mingcute:delete-2-line" size={20} className={`${styles.title_color}`} />
                                                </button>
                                            </div>
                                            {searchHistory.length > 0 ? (
                                                <div className='mt-2 mb-2_5 flex-x'>
                                                    {searchHistory.map((item) => (
                                                        <button
                                                            type='button'
                                                            key={item.value}
                                                            className={`${styles.selsect_btn} cancel_btn5 mr-2 flex-x align-center justify-between font-14`}
                                                            // cancel_btn5
                                                            // style={{
                                                            //     backgroundColor: '#F5F5F5'
                                                            // }}
                                                            onClick={() => setFormCoin(item.value)}
                                                        >
                                                            <Image
                                                                // src={`/images/assets/assets_account/icon_money.png`}
                                                                src={item.iconUrl}
                                                                alt={item.coinName}
                                                                width={20}
                                                                height={20}
                                                                className={`mr-2`}
                                                                style={{ borderRadius: '50%', height: '12px', width: '12px' }}
                                                            />
                                                            {item.coinName}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className='mt-2 mb-2_5'>
                                                    {t('withdrawMoney.noRecord')}
                                                </p>
                                            )}
                                            <p className={`${styles.tip_color2}`}>
                                                {t('withdrawMoney.coinList')}
                                            </p>
                                        </div>
                                    )}
                                    {menu}
                                </>
                            )}
                            notFoundContent={<NoData title={t('withdrawMoney.noRecord')} />}
                            onFocus={getCoinAllList}
                            onChange={coinChange}
                            loading={coinLoading}
                        />
                    </Form.Item>
                    <div className='mt-2_5'>
                        {searchHistory.map((item) => (
                            <button
                                type='button'
                                key={item.value}
                                className={`cancel_btn5 ${styles.selsect_btn} mr-2`}
                                onClick={() => setFormCoin(item.value)}
                            >
                                {item.coinName}
                            </button>
                        ))}
                        {/* 
                        </button>
                        <button className={`${styles.btn_style} cancel_btn5 mr-2`}>
                            ETH
                        </button>
                        <button className={`${styles.btn_style} cancel_btn5 mr-2`}>
                            FIL
                        </button> */}
                    </div>

                </>}
            </div>,

        },
        {
            title: <p className={`${styles.tip_title}`}>
                {/* 提现网络/选择网络 */}
                {t('withdrawMoney.selectNetwork')}
            </p>,
            description: <div className={`${styles.steps_item_content2} mt-2`}>
                {current >= 1 && <>
                    <Form.Item name='addressId'
                        // rules={[{ required: true, message: t('withdrawMoney.selectAddress') }]}
                        rules={[{ validator: validateAddress }]}
                    >
                        <AutoComplete
                            style={{ height: 50 }}
                            open={dropdownOpen} // 控制下拉菜单的显示状态
                            options={filteredAddressOptions.map(item => {
                                // 检查当前地址的protocolName是否在coinExtSelect中存在
                                const isProtocolSupported = coinExtSelect.some(
                                    coinExt => coinExt.protocolName === item.protocolName||coinExt.protocol === item.protocolName||
                                    coinExt.protocolId === item.protocolId
                                );
                                
                                return {
                                    ...item,
                                    key: item.id,
                                    disabled: !isProtocolSupported, // 如果协议不支持则禁用
                                    label: (
                                        <div className={`flex-y py-1 ${!isProtocolSupported ? 'opacity-50' : ''}`} key={item.id}>
                                            <p className={`${styles.title_color} font-14 font-w-400`}>{item.addressTitle}</p>
                                            <p className={`${styles.tip_color2} font-14 font-w-400`}>
                                                {`${t('withdrawMoney.address')}：${item.addressName}`}
                                            </p>
                                            <p className={`${styles.tip_color2} font-14 font-w-400`}>
                                                {`${t('withdrawMoney.network')}：${item.protocolName || '--'}`}
                                                {!isProtocolSupported && (
                                                    <span className="ml-2 text-red-500 font-12">
                                                        ({t('withdrawMoney.selectNetwork3Error')})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    ),
                                    value: item.addressName
                                };
                            })}
                            onFocus={(e) => {
                                // 在输入框聚焦时获取地址列表，但不显示下拉菜单
                                getUserAddressList();
                                // 阻止默认的下拉菜单显示行为
                                e.preventDefault();
                            }}
                            notFoundContent={<NoAddress />}
                            dropdownRender={(menu) => {
                                // // 检查是否有可用的地址
                                // const availableAddresses = filteredAddressOptions.filter(item => 
                                //     coinExtSelect.some(coinExt => coinExt.protocolName === item.protocolName)
                                // );
                                
                                return (
                                    <>
                                        {menu}
                                        <button
                                            type='button'
                                            className={`default_btn font-16 font-w-500 mt-6 mb-6 ${styles.btn_style2}`}
                                            onClick={() => router.push(ROUTER_KEY_ASSETS.ADDADRESS)}
                                        >
                                            {t('withdrawMoney.addAddress')}
                                        </button>
                                    </>
                                );
                            }}
                            onChange={(value, option) => {
                                addressChange(value, option);
                                setDropdownOpen(false); // 选择后关闭下拉菜单
                            }}
                        // onSearch={handleAddressSearch} // 关键：输入变化时过滤
                        >
                            <Input
                                type="text"
                                className={`${styles.input_box3} modal-input`}
                                placeholder={t('withdrawMoney.inputAddress')}
                                allowClear
                                suffix={
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation(); // 阻止事件冒泡
                                            setDropdownOpen(!dropdownOpen); // 切换下拉菜单的显示状态
                                            if(dropdownOpen) return
                                                getUserAddressList(); // 点击图标时获取地址列表
                                            
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Iconify icon="mdi:map-outline" size={24} className={`${styles.title_color}`} />
                                    </div>
                                }
                            />
                        </AutoComplete>
                    </Form.Item>
                    <Form.Item >
                        <Form.Item name='protocolId'
                            rules={[{ validator: validateProtocol }]}
                            // rules={[{ required: true, message: t('withdrawMoney.selectNetwork2') }]}
                            noStyle>
                            <Select allowClear
                                placeholder={t('withdrawMoney.selectNetwork2')}
                                options={coinExtSelect} //protocolTypeList coinExtSelect
                                className={`${styles.select_box}  custom-select `}
                                optionRender={(option) => {
                                    return (
                                        <div className="flex-x justify-between align-center py-1 font-14 font-w-400">
                                            <p className={`flex-y `}>
                                                <span >{option.data.protocol}</span>
                                                <span className={`${styles.tip_color}`}>{option.data.protocolName}</span>
                                            </p>
                                            <p className={`${styles.tip_color2} `}>
                                                {/* {`${t('withdrawMoney.fee')} ${division(option.data.withdrawFee, 100)} %`} */}
                                                {`${t('withdrawMoney.fee')} ${option.data.withdrawFee}${getWithdrawFee(option.data.withdrawFee).coinName}≈${getWithdrawFee(option.data.withdrawFee).symbol} ${getWithdrawFee(option.data.withdrawFee).rate}`}
                                            </p>
                                        </div>
                                    );
                                }}
                                dropdownRender={(menu) => (<>
                                    <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5`}>
                                        <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                                        <span>
                                            {/* 请注意，这里仅展示了Metawave平台所支持的充币网络，如果您使用本平台不支持的网络充币，将可能导致资产损失。 */}
                                            {t('withdrawMoney.networkWarning2', { platformName: allConfig?.tenant_cache_name || '--' })}
                                        </span>
                                    </p>
                                    {menu}
                                </>
                                )}
                                notFoundContent={<NoData title={t('withdrawMoney.noRecord')} />}
                                // onFocus={getCoinExtList}
                                loading={coinExtLoading}
                                onChange={coinExtChange}
                            />

                        </Form.Item>
                        {/* showMemo */}
                        {isMemo() ?
                            <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-1 mt-2_5`}>
                                <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                                <span>
                                    {/* 提币至其他交易所时需要填写标签，否则提币将失败 */}
                                    {t('withdrawMoney.memoWarning')}
                                </span>
                            </p> : null}
                    </Form.Item>
                    {isMemo() ? <Form.Item>
                        <Form.Item name='momo' noStyle>
                            <Input className={`${styles.input_box3} modal-input2`}
                                placeholder={t('withdrawMoney.memoPlaceholder')}
                                allowClear
                            />

                        </Form.Item>
                        <Tooltip title={<p className='font-12'>{t('withdrawMoney.tipText')}</p>} placement="bottom">
                            <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb1 mt-2_5`}>
                                <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                                <span>
                                    {/* 请确认收币地址是否要求填写MEMO */}
                                    {t('withdrawMoney.memoConfirm')}
                                </span>
                            </p>
                        </Tooltip>
                    </Form.Item> : null}
                </>
                }
            </div >,

        },
        {
            title: <p className={`${styles.tip_title}`}>
                {/* 提现信息 */}
                {t('withdrawMoney.withdrawInfo')}
            </p>,
            description: <div className={`${styles.steps_item_content3} mt-2`}>
                {current >= 2 && <>
                    <Form.Item name='amount'
                        rules={[{ validator: checkAmount }]}>
                        <Input className={`${styles.input_box3} modal-input mr-7`}
                            // placeholder={t('withdrawMoney.withdrawAmount')}
                            placeholder={t('withdrawMoney.withdrawAmountMin', { min: getMinWithdraw('min') })}
                            allowClear
                            suffix={<div className='flex-x align-center  font-14 font-w-400'>
                                <p className={`${styles.tip_color2} pr-2`}>
                                    {/* USDT */}
                                    {coninInfo.coinName || '--'}
                                </p><span className={`${styles.tip_color2}`}>|</span>
                                <button className={`${checkMaxWithdraw() ? 'theme_color' : styles.tip_color2} pl-2`}
                                    onClick={() => { maxWithdrawAmountBtn() }}
                                // disabled={allowWithdrawBtn()}
                                >{t('withdrawMoney.max')}</button>
                            </div>}
                            onChange={amountChange}
                            value={amountNum || ''}
                        />
                    </Form.Item>
                    <div className={`${styles.card_bgc3} mt-5  font-14 font-w-400`}>
                        <ul className={`${styles.tip_color} ${styles.icon_btn_bottom} w-full mb-5`}>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>{t('withdrawMoney.spotAvailable')}</p>
                                <p className={`${styles.title_color}`}>
                                    {/* 50.13USDT */}
                                    {coninInfo.balance || '0'}&nbsp;
                                    {coninInfo.coinName || '--'}
                                </p>
                            </li>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>{t('withdrawMoney.singleLimit')}</p>
                                <p className={`${styles.title_color}`}>
                                    {/* 10-10,000USDT */}
                                    {/* {coninInfo.minWithdraw||'0'}-{coninInfo.maxWithdraw||'0'}{coninInfo.coinName||'--'} */}
                                    {coninInfo.minWithdraw || '0'}-{coninInfo.maxWithdraw || '0'}&nbsp;{coninInfo.coinName || '--'}
                                </p>
                            </li>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>{t('withdrawMoney.dayLimit')}</p>
                                {/* 24h限额 */}
                                <p><span className={`${styles.title_color}`}>{userAllLimit.mix ? getCoinRateData(coninInfo.coinName, userAllLimit.mix) : '0'}</span>
                                    / {userAllLimit.max ? getCoinRateData(coninInfo.coinName, userAllLimit.max) : '0'}&nbsp;{coninInfo.coinName || '--'}</p>
                            </li>
                        </ul>
                        <div className='flex-x justify-between align-center'>
                            <div>
                                <p className={`${styles.tip_color} mb-3`}>{t('withdrawMoney.estimatedArrival')}</p>
                                <p className={`${styles.title_color} mb-3 font-24 font-w-500`}>
                                    {/* 1 USDT */}
                                    {/* {cut(amountNum, coninInfo.withdrawFee ?
                                        nul(amountNum, division(coninInfo.withdrawFee,100)) : coninInfo.minWithdrawFee) || 0} */}
                                    {countNum(amountNum || 0, coninInfo.withdrawFee, coninInfo.minWithdrawFee) || 0}
                                    {coninInfo.coinName || '--'}

                                </p>
                                <p className={`${styles.tip_color} mb-3`}>{t('withdrawMoney.fee')} <span className={`${styles.title_color}`}>
                                    {/* 1 USDT */}

                                    {/* {nul(amountNum, division(coninInfo.withdrawFee,100)) > coninInfo.minWithdrawFee ? nul(amountNum, division(coninInfo.withdrawFee,100)) : coninInfo.minWithdrawFee} */}
                                    {withdrawFee(amountNum || 0, coninInfo.withdrawFee, coninInfo.minWithdrawFee) || 0}
                                    {coninInfo.coinName || '--'}
                                </span></p>
                            </div>
                            {/* default_btn */}
                            <button type='submit' className={`${styles.withdraw_btn} mr-2 ${allowWithdraw ? 'default_btn' : 'disabled_btn2 cursor-not-allowed'}`}
                                onClick={antiFraud}>
                                {t('withdrawMoney.withdraw')}
                            </button>
                        </div>
                    </div>
                </>}
            </div>,

        },
    ]
    // 删除历史记录
    const delHistory = () => {
        localStorage.removeItem('coinSearchHistory');
        setSearchHistory([]);
    }

    // 添加 useEffect 来加载历史记录
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('coinSearchHistory');
            if (saved) {
                setSearchHistory(JSON.parse(saved));
            }
        }
    }, []); // 空依赖数组表示只在组件挂载时执行一次

    return (<ResetStateProvider>
        <div className={` page-h w-full page-box flex-y align-center`} style={{ paddingBottom: '10vh' }}>
            <div className={`${styles.spot_auth_box}`} >
                <div className='flex justify-between align-center'>
                    <Breadcrumb items={[
                        {
                            title: <Link href={ROUTER_KEY_ASSETS.ACCOUNT}><span className={`${styles.tip_color}`}>
                                {/* 现货账户 */}
                                {t('assets.assetsAccount')}
                            </span></Link>,
                        },
                        {
                            title: <span className={`${styles.title_color}`}>
                                {/* 提现 */}
                                {t('assets.withdraw')}
                            </span>,
                        },
                    ]} style={{ fontSize: 14 }} />

                </div>
                <div className={`${styles.card_box}  mt-6  `}>
                    {/* {!userInfo ? null : (
                    userInfo.MerchantWithdrawalStatus !== 1 ? <NoUseCom type='1' /> :
                        userInfo.securityIntensity < 2 ? <NoUseCom type='2' /> :
                            userInfo.withdrawalStatus === 0 ? <NoUseCom type='3' /> : null
                )} */}
                    {!userInfo ? null : (
                        userInfo.merchantWithdrawalStatus !== 1 ? <NoUseCom type='3' /> :
                            (!userInfo.googleCode || userInfo.isGoogleAuth === 0) ? <NoUseCom type='2' /> :
                                userInfo.withdrawalStatus === 0 ? <NoUseCom type='3' /> : null
                    )}
                    <div className={` w-full flex-x justify-between ${styles.card_content2}`}>

                        <div className={`${styles.step_box}`}>
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Select: {
                                            clearBg: "#ffffff",
                                            selectorBg: 'transparent',
                                            singleItemHeightLG: 50,
                                            paddingXXS: 10, // 下拉框选项最小内边距
                                            optionHeight: 40, //选项高度
                                            optionLineHeight: 2, //选项行高
                                        },
                                        Steps: {
                                            navArrowColor: "var(--text-color6)",
                                        },
                                        Form: {
                                            itemMarginBottom: 20
                                            // singleItemHeightLG
                                        },
                                        Input: {
                                            activeBorderColor: 'var(--theme-color)',
                                            hoverBorderColor: 'var(--theme-color)',
                                            controlHeightLG: 50,
                                            // activeBg: 'var(--background5)',
                                            // hoverBg: 'var(--background5)',
                                            activeBg: 'transparent',
                                            hoverBg: 'transparent',
                                        },

                                    }
                                }}
                            >
                                <Form
                                    form={form}
                                    disabled={(userInfo?.merchantWithdrawalStatus !== 1 || !userInfo?.googleCode || userInfo.withdrawalStatus === 0)}
                                >
                                    <Steps
                                        direction="vertical"
                                        current={current}
                                        labelPlacement="vertical"
                                        items={steps}
                                        className='custom-steps' />
                                </Form>
                            </ConfigProvider>
                        </div>
                       <WithdrawSteps />
                    </div>
                    <TableBox coinId={form.getFieldValue('tenantId')} coinAll={coinSelect} />

                </div>
                <WithdrawMoneyCheck open={checkOpen}
                    withdrawInfo={withdrawInfo}
                    onCancel={() => setCheckOpen(false)}
                    onOk={checkOK}
                />
            </div>
        </div>
    </ResetStateProvider>
    );
});
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'en', ['assets', 'common'])),
        },
    };
};
export default WithdrawMoneyPage;