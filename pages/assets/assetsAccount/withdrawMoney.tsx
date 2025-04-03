import React from 'react';
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from '../styles/spotAccount.module.css'
import { Input, Steps, Breadcrumb, ConfigProvider, Table, Select, Form, AutoComplete } from 'antd';
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
import { getuserAddressList, getCoinAll, getcoinExtList, getUserBalance, getProtocolTypeAll } from '@/services/assets'
import { toast } from "sonner";
import { cut, nul, division, countNum, withdrawFee } from '@/utils'
import { getUserInfo } from '@/hooks/userInfo';
import TableBox from "../compontents/withDrawTable"
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { getLoginUserInfo } from "@/services/userCenter"

interface coinSelectType {
    coinId: string,
    coinName: string,
    iconUrl: string,
    nameDefault: string,
    value: string,
    label: string,
}
interface coinExtAllListType {
    id: number,
    protocol: string,
    protocolName: string,
    browser: string,
    symbol: string,
    chainId: number
}
interface coinExtSelectType {
    coinId: number,
    coinName: string,
    protocolId: number,
    decimals: number,
    withdrawFee: number,
    minWithdrawFee: number,
    withdraw: number,
    minWithdraw: number,
    maxWithdraw: number,
    minRecharge: number,
    confirms: number,
    value: string,
    label: string,
    id: number,
    protocol: string,
    protocolName: string,
    browser: string,
    symbol: string,
    chainId: number
}
interface addressSelectType {
    id: number,
    protocolId: number,
    addressTitle: string,
    protocolName: string,
    symbol: string,
    addressName: string,
    userId: number,
    tenantId: string,
    createTime: number,
    updateTime: number,
    label: string | React.ReactNode,
    value: string,
}

interface SearchHistoryItem {
    label: string,
    value: string,
    desc?: string,
    network?: string
}
interface userBalanceType {
    balance: number,
    frozenBalance: number,
    isLock: number,
    coinId: string,
    coinName: string
}
interface coinInfoType {
    balance: number,
    frozenBalance: number,
    isLock: number,
    coinId: string,
    coinName: string,
    iconUrl: string,
    canRecharge: number,
    canTransfer: number,
    canWithdraw: number,
    minWithdrawAmount: number,
    nameDefault: string,
    sort: number,
    status: number,
    unit: string,
    unitScale: number,
    maxWithdrawAmount: number,
    minTopUp: number,
    protocolId: number,
    decimals: number,
    withdrawFee: number,
    minWithdrawFee: number,
    withdraw: number,
    minWithdraw: number,
    maxWithdraw: number,
    minRecharge: number,
    confirms: number
}

const WithdrawMoneyPage = () => {
    const { t } = useTranslation('assets');
    const { isDayMode } = useThemeMode(); // 使用 hook
    const [checkOpen, setCheckOpen] = useState(false);

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

    const [amountNum, setAmountNum] = useState(0)
    // 提现信息
    const [withdrawInfo, setWithdrawInfo] = useState<any>(null)

    const [form] = Form.useForm();
    const router = useRouter()

    // 添加状态来存储用户信息
    const [userInfo, setUserInfo] = useState<any>(null);

    // 添加状态来跟踪是否显示 MEMO
    const [showMemo, setShowMemo] = useState(false);

    const [allowWithdraw, setAllowWithdraw] = useState(false)

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
            const res = await getCoinAll()
            if (res.code === '0') {
                const coinList = res.data.map((item: any) => ({
                    ...item,
                    label: item.coinName,
                    value: item.coinId,
                }))
                setCoinSelect(coinList)
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
        const coinId = form.getFieldValue('tenantId')
        // 判断同币种不重复请求
        if (coinId !== coinIdHistory) {
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
        const selectedCoin = coinSelect.find(coin => coin.coinId === value);
        if (!selectedCoin) return;

        setSearchHistory(prev => {
            // 移除已存在的相同选项
            const filtered = prev.filter(item => item.value !== value);
            // 将新选项添加到开头
            const newHistory = [{
                value: value,
                label: selectedCoin.coinName
            }, ...filtered].slice(0, 4);
            // 保存到localStorage
            localStorage.setItem('coinSearchHistory', JSON.stringify(newHistory));
            return newHistory;
        });
        // 获取币种余额
        const balance = await getUserBalanceData()
        setConinInfo(Object.assign(balance, option))

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
    // 历史币种快捷键
    const setFormCoin = async (coinId: string | number) => {
        // 1. 检查用户权限
        if (userInfo?.realnessStatus !== 1 || userInfo?.securityIntensity < 2) {
            return toast.error(t('withdrawMoney.function'))
        }

        // 3. 判断是否需要重置表单字段（移到数据获取后）
        if (coinId !== coinIdHistory) {
            form.resetFields(['protocolId']);
        }
        if (coinSelect.length === 0) {
            await getCoinAllData();

        }
        // 设置表单值
        form.setFieldValue('tenantId', coinId);
        setCurrent(1) // 下一步

        // 获取选中币种的信息并更新余额
        const selectedCoin = coinSelect.find(coin => coin.coinId === coinId);
        if (selectedCoin) {
            const balance = await getUserBalanceData();
            if (balance) {
                setConinInfo({ ...balance, ...selectedCoin });
            }
        }

    }
    // 链名称(网络名称)
    const getCoinExtList = async () => {
        const tenantId = form.getFieldValue('tenantId')
        if (!tenantId) {
            setCoinExtSelect([])

            return toast.error(t('assetsAccount.selectCoin'))
        }
        // 判断同币种不重复请求
        if (coinIdHistory === tenantId || coinExtLoading) return
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
                setProtocolTypeList(res.data)
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        }

    }
    // 币种对应的协议（网络）
    const getCoinExt = async (tenantId: number) => {
        setCoinExtLoading(true)
        try {
            const res = await getcoinExtList(tenantId)
            if (res.code === '0') {
                const coinExtList = res.data.map((item: any) => {
                    const protocol = protocolTypeList.find(protocol => protocol.id === item.protocolId)
                    return {
                        ...item,
                        label: protocol?.symbol,
                        value: item.protocolId,
                        ...protocol
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
            console.log(Object.assign(coninInfo, option), 1235);
        } else {
            // form.setFieldValue('amount',coninInfo.minWithdrawAmount)
            // setCurrent(1)
            returnStep(2)
        }
        checkStep2Required()
    }

    // 地址
    const getUserAddressList = async () => {
        if (addressSelect.length > 0 || addressLoading) return
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
        form.setFieldValue('addressId', value);
        checkAddressMatch(value);
        checkStep2Required()
    }
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
        setAmountNum(coninInfo.minRecharge || 0)
        form.setFieldValue('amount', coninInfo.minRecharge || 0)
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
            if (filteredValue > coninInfo.minWithdraw) {
                setAllowWithdraw(true)
            } else {
                setAllowWithdraw(false)
            }
        } else {
            setAmountNum(0)
            form.setFieldValue('amount', 0)
            setAllowWithdraw(false)
        }
    }

    const antiFraud = () => {
        if (!allowWithdraw) return toast.error(t('assetsAccount.check'))
        form.validateFields()
            .then(async (values) => {
                console.log(values)
                const params = {
                    coinId: values.tenantId,
                    toAddress: values.addressId,
                    protocolId: values.protocolId,
                    momo: values.momo,
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
                    amountAfter: countNum(amountNum, coninInfo.withdrawFee, coninInfo.minWithdrawFee) || 0,
                    protocolName: coinExtSelect.find(item => item.value === values.protocolId)?.protocolName,
                    coinName: coninInfo.coinName,
                    // countWithdrawFee: nul(amountNum, coninInfo.withdrawFee) > coninInfo.minWithdrawFee ? nul(amountNum, coninInfo.withdrawFee) : coninInfo.minWithdrawFee,
                    countWithdrawFee: withdrawFee(amountNum, coninInfo.withdrawFee, coninInfo.minWithdrawFee) || 0,

                }
                setWithdrawInfo(params)
                setCheckOpen(true)

            })
            .catch(error => {
                console.log(error)
            })
    }


    // 添加过滤函数
    const filterAddressOption = (input: string, option: any) => {
        return (
            option.addressName?.toLowerCase().includes(input.toLowerCase()) ||
            option.addressTitle?.toLowerCase().includes(input.toLowerCase()) ||
            option.protocolName?.toLowerCase().includes(input.toLowerCase())
        );
    };
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

    useEffect(() => {
        getAllProtocolTypeList()
    }, [])

    const steps = [
        {
            title: <p className={`${styles.tip_title}`}>
                {/* 提现币种 */}
                {t('withdrawMoney.withdrawCoin')}
            </p>,
            description: <div className={`${styles.steps_item_content} mt-2`}>
                {current >= 0 && <>
                    <Form.Item name='tenantId' rules={[{ required: true, message: t('withdrawMoney.select') }]}>
                        <Select allowClear
                            placeholder={t('withdrawMoney.select')}
                            options={coinSelect}
                            className={`${styles.select_box} custom-select`}
                            optionRender={(option) => {
                                return (
                                    <div className="flex items-center py-1">
                                        <Image src={`/images/assets/assets_account/icon_money.png`}
                                            alt={option.data.label} width={20} height={20}
                                            className={` mr-2`} />
                                        <span className="text-text-color7">{`${option.data.coinName}(${option.data.nameDefault})`}</span>
                                    </div>
                                );
                            }}
                            dropdownRender={(menu) => (<>
                                {coinSelect.length > 0 && <div className={`font-14 font-w-400 mb-2_5`}>
                                    <p className={`${styles.tip_color2}`}>
                                        {/* 搜索历史 */}
                                        {t('withdrawMoney.searchHistory')}
                                    </p>
                                    {searchHistory.length > 0 ? <div className='mt-2 mb-2_5'>
                                        {searchHistory.map((item) => (
                                            <button
                                                type='button'
                                                key={item.value}
                                                className={`cancel_btn5 ${styles.selsect_btn} mr-2`}
                                                onClick={() => setFormCoin(item.value)}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div> : <p className='mt-2 mb-2_5'>
                                        {/* 暂无 */}
                                        {t('withdrawMoney.noRecord')}
                                    </p>}
                                    <p className={`${styles.tip_color2}`}>
                                        {/* 币种列表 */}
                                        {t('withdrawMoney.coinList')}
                                    </p>
                                </div>}
                                {menu}
                            </>)}
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
                                {item.label}
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
                    {/* <Form.Item name='addressId' >
                        <Select className={`${styles.select_box} custom-select `}
                            // maxLength={25}
                            options={addressSelect}
                            placeholder='选择提现地址'
                            allowClear
                            suffixIcon={<Iconify icon="mdi:map-outline" size={24} className={`${styles.title_color} `} />}
                            optionRender={(option) => {
                                return (
                                    <div className="flex-y  py-1">
                                        <p className={`${styles.title_color} font-14 font-w-400`}>{option.data.addressTitle}</p>
                                        <p className={`${styles.tip_color2} font-14 font-w-400`}>地址：{option.data.label}</p>
                                        <p className={`${styles.tip_color2} font-14 font-w-400`}>网络：{option.data.protocolName}</p>
                                    </div>
                                );
                            }}
                            dropdownRender={(menu) => (<>
                                {menu}
                                <button type='button' className={`default_btn font-16 font-w-500 mt-6 mb-6 ${styles.btn_style2}`}
                                    onClick={() => {
                                        router.push('/assets/assetsAccount/addAddress')
                                    }}
                                >
                                    添加地址
                                </button>
                            </>

                            )}
                            notFoundContent={<NoAddress />}
                            onFocus={getUserAddressList}
                            loading={addressLoading}
                            showSearch
                            filterOption={filterAddressOption}
                        />

                    </Form.Item> */}
                    <Form.Item name='addressId' rules={[{ required: true, message: t('withdrawMoney.selectAddress') }]} >
                        <AutoComplete
                            // options={addressSelect}
                            style={{ height: 50 }}
                            options={addressSelect.map(item => ({
                                ...item,
                                key: item.id,
                                label: (
                                    <div className="flex-y py-1" key={item.id}>
                                        <p className={`${styles.title_color} font-14 font-w-400`}>{item.addressTitle}</p>
                                        <p className={`${styles.tip_color2} font-14 font-w-400`}>
                                            {`${t('withdrawMoney.address')}：${item.addressName}`}
                                        </p>
                                        <p className={`${styles.tip_color2} font-14 font-w-400`}>
                                            {`${t('withdrawMoney.network')}：${item.protocolName || '--'}`}
                                        </p>
                                    </div>
                                ),
                                value: item.addressName
                            }))}
                            onFocus={getUserAddressList}
                            filterOption={filterAddressOptions}
                            notFoundContent={<NoAddress />}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <button
                                        type='button'
                                        className={`default_btn font-16 font-w-500 mt-6 mb-6 ${styles.btn_style2}`}
                                        onClick={() => router.push('/assets/assetsAccount/addAddress')}
                                    >
                                        {t('withdrawMoney.addAddress')}
                                    </button>
                                </>
                            )}
                            onChange={addressChange}
                        >
                            <Input
                                type="text"
                                className={`${styles.input_box3} modal-input2`}
                                placeholder={t('withdrawMoney.inputAddress')}
                                allowClear
                                suffix={<Iconify icon="mdi:map-outline" size={24} className={`${styles.title_color}`} />}
                            />
                        </AutoComplete>
                    </Form.Item>
                    <Form.Item >
                        <Form.Item name='protocolId' rules={[{ required: true, message: t('withdrawMoney.selectNetwork2') }]} noStyle>
                            <Select allowClear
                                placeholder={t('withdrawMoney.selectNetwork2')}
                                options={coinExtSelect}
                                className={`${styles.select_box}  custom-select `}
                                optionRender={(option) => {
                                    return (
                                        <div className="flex-x justify-between align-center py-1 font-14 font-w-400">
                                            <p className={`flex-y `}>
                                                <span className={`${styles.title_color}`}>{option.data.label}</span>
                                                <span className={`${styles.tip_color}`}>{option.data.protocolName}</span>
                                            </p>
                                            <p className={`${styles.tip_color2} `}>
                                                {`${t('withdrawMoney.fee')} ${division(option.data.withdrawFee, 100)} %`}
                                            </p>
                                        </div>
                                    );
                                }}
                                dropdownRender={(menu) => (<>
                                    <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5`}>
                                        <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                                        <span>
                                            {/* 请注意，这里仅展示了Metawave平台所支持的充币网络，如果您使用本平台不支持的网络充币，将可能导致资产损失。 */}
                                            {t('withdrawMoney.networkWarning')}
                                        </span>
                                    </p>
                                    {menu}
                                </>
                                )}
                                notFoundContent={<NoData title={t('withdrawMoney.noRecord')} />}
                                onFocus={getCoinExtList}
                                loading={coinExtLoading}
                                onChange={coinExtChange}
                            />

                        </Form.Item>
                        {showMemo && <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-1 mt-2_5`}>
                            <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                            <span>
                                {/* 提币至其他交易所时需要填写标签，否则提币将失败 */}
                                {t('withdrawMoney.memoWarning')}
                            </span>
                        </p>}
                    </Form.Item>
                    {showMemo && <Form.Item>
                        <Form.Item name='momo' noStyle>
                            <Input className={`${styles.input_box3} modal-input2`}
                                placeholder={t('withdrawMoney.memoPlaceholder')}
                                allowClear
                            />

                        </Form.Item>
                        <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb1 mt-2_5`}>
                            <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                            <span>
                                {/* 请确认收币地址是否要求填写MEMO */}
                                {t('withdrawMoney.memoConfirm')}
                            </span>
                        </p>
                    </Form.Item>}
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
                    <Form.Item name='amount' >
                        <Input className={`${styles.input_box3} modal-input mr-7`}
                            placeholder={t('withdrawMoney.withdrawAmount')}
                            allowClear
                            suffix={<div className='flex-x align-center  font-14 font-w-400'>
                                <p className={`${styles.tip_color2} pr-2`}>
                                    {/* USDT */}
                                    {coninInfo.coinName || '--'}
                                </p><span className={`${styles.tip_color2}`}>|</span>
                                <button className={` theme_color pl-2`} onClick={() => {
                                    if (coninInfo.balance > coninInfo.maxWithdrawAmount) {
                                        form.setFieldValue('amount', coninInfo.maxWithdrawAmount || 0)
                                        setAmountNum(coninInfo.maxWithdrawAmount || 0)
                                    } else {
                                        form.setFieldValue('amount', coninInfo.balance || 0)
                                        setAmountNum(coninInfo.balance || 0)
                                    }
                                }}>{t('withdrawMoney.max')}</button>
                            </div>}
                            onChange={amountChange}
                            value={amountNum}
                        />
                    </Form.Item>
                    <div className={`${styles.card_bgc3} mt-5  font-14 font-w-400`}>
                        <ul className={`${styles.tip_color} ${styles.icon_btn_bottom} w-full mb-5`}>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>{t('withdrawMoney.spotAvailable')}</p>
                                <p>
                                    {/* 50.13USDT */}
                                    {coninInfo.balance || '0'}
                                    {coninInfo.coinName || '--'}
                                </p>
                            </li>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>{t('withdrawMoney.singleLimit')}</p>
                                <p>
                                    {/* 10-10,000USDT */}
                                    {/* {coninInfo.minWithdraw||'0'}-{coninInfo.maxWithdraw||'0'}{coninInfo.coinName||'--'} */}
                                    {coninInfo.minWithdrawAmount || '0'}-{coninInfo.maxWithdrawAmount || '0'}{coninInfo.coinName || '--'}
                                </p>
                            </li>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>{t('withdrawMoney.dayLimit')}</p>
                                <p>50,000 <span>/ 50,000USDT</span></p>
                            </li>
                        </ul>
                        <div className='flex-x justify-between align-center'>
                            <div>
                                <p className={`${styles.tip_color} mb-3`}>{t('withdrawMoney.estimatedArrival')}</p>
                                <p className={`${styles.title_color} mb-3 font-24 font-w-500`}>
                                    {/* 1 USDT */}
                                    {/* {cut(amountNum, coninInfo.withdrawFee ?
                                        nul(amountNum, division(coninInfo.withdrawFee,100)) : coninInfo.minWithdrawFee) || 0} */}
                                    {countNum(amountNum, coninInfo.withdrawFee, coninInfo.minWithdrawFee) || 0}
                                    {coninInfo.coinName || '--'}

                                </p>
                                <p className={`${styles.tip_color} mb-3`}>{t('withdrawMoney.fee')} <span className={`${styles.title_color}`}>
                                    {/* 1 USDT */}

                                    {/* {nul(amountNum, division(coninInfo.withdrawFee,100)) > coninInfo.minWithdrawFee ? nul(amountNum, division(coninInfo.withdrawFee,100)) : coninInfo.minWithdrawFee} */}
                                    {withdrawFee(amountNum, coninInfo.withdrawFee, coninInfo.minWithdrawFee) || 0}
                                    {coninInfo.coinName || '--'}
                                </span></p>
                            </div>
                            {/* default_btn */}
                            <button type='submit' className={`${styles.withdraw_btn} mr-2 ${allowWithdraw ? 'default_btn' : 'disabled_btn'}`}
                                onClick={antiFraud}>
                                {t('withdrawMoney.withdraw')}
                            </button>
                        </div>
                    </div>
                </>}
            </div>,

        },
    ]

    // 添加 useEffect 来加载历史记录
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('coinSearchHistory');
            if (saved) {
                setSearchHistory(JSON.parse(saved));
            }
        }
    }, []); // 空依赖数组表示只在组件挂载时执行一次

    return (<div className={` page-h w-full page-box flex-y align-center`} style={{ paddingBottom: '10vh' }}>
        <div className={`${styles.spot_auth_box}`} >
            <div className='flex justify-between align-center'>
                <Breadcrumb items={[
                    {
                        title: <Link href="/assets/assetsAccount"><span className={`${styles.tip_color}`}>
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
                {!userInfo ? null : (
                    userInfo.realnessStatus !== 1 ? <NoUseCom type='1' /> :
                        userInfo.securityIntensity < 2 ? <NoUseCom type='2' /> : null
                )}
                <div className={` w-full flex-x justify-between ${styles.card_content2}`}>

                    <div className={`${styles.step_box}`}>
                        <ConfigProvider
                            theme={{
                                components: {
                                    Select: {
                                        clearBg: "#ffffff",
                                        selectorBg: 'var(--background7)',
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

                                }
                            }}
                        >
                            <Form
                                form={form}
                                disabled={(userInfo?.realnessStatus !== 1 || userInfo?.securityIntensity < 2)}
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
                    <div className={`${styles.notice_box}`}>
                        <div>
                            <h5 className={`font-w-500 font-16 mb-4`}>
                                {/* 常见问题 */}
                                {t('withdrawMoney.faq')}
                            </h5>
                            <ul className={`font-14 font-w-400 ${styles.tip_color}`}>
                                <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item1')}</li>
                                <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item2')}</li>
                                <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item3')}</li>
                                <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item4')}</li>
                                <li className={`mb-2_5`}>{t('withdrawMoney.faqList.item5')}</li>
                            </ul>
                        </div>
                        <div className=''>
                            <h5 className={`font-w-500 font-16 mb-4`}>
                                {/* 提现须知 */}
                                {t('withdrawMoney.notice')}
                            </h5>
                            <ul className={`font-14 font-w-400 ${styles.tip_color}`}>
                                <li className={`mb-2_5`}>{t('withdrawMoney.noticeList.item1')}</li>
                                <li className={`mb-2_5`}>{t('withdrawMoney.noticeList.item2')}</li>
                                <li className={`mb-2_5`}>{t('withdrawMoney.noticeList.item3')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <TableBox />

            </div>
            <WithdrawMoneyCheck open={checkOpen}
                withdrawInfo={withdrawInfo}
                onCancel={() => setCheckOpen(false)} />
        </div>
    </div>
    );
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'en', ['assets', 'common'])),
        },
    };
};
export default WithdrawMoneyPage;