import React from 'react';
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from '../styles/spotAccount.module.css'
import { Input, Steps, Breadcrumb, ConfigProvider, Table, Select, Form } from 'antd';
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
import { getWithdrawDepositList, getuserAddressList, getCoinAll, getcoinExtList, getUserBalance } from '@/services/assets'
import { toast } from "sonner";
import { cut, nul } from '@/utils'

interface DataType {
    withdrawalId: string,
    userId: number,
    coinId: number,
    protocolId: number,
    amount: number,
    fee: number,
    toAddress: string,
    fromAddress: string,
    txHash: string,
    status: number,
    createTime: number,
    updateTime: number,
    riskLevel: number,
    riskExplain: string,
    tenantId: string
}
interface coinSelectType {
    coinId: string,
    coinName: string,
    iconUrl: string,
    nameDefault: string,
    value: string,
    label: string,
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
    label: string,
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
    const [tableData, setTableData] = useState<DataType[]>([

    ]);
    const { isDayMode } = useThemeMode(); // 使用 hook
    const [checkOpen, setCheckOpen] = useState(false);

    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(2);

    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const [tableLoading, setTableLoading] = useState(false);
    // 币种
    const [coinSelect, setCoinSelect] = useState<coinSelectType[]>([])
    const [coinLoading, setCoinLoading] = useState(false)
    const [coinId, setCoinId] = useState(0)
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

    const paramdataRef = useRef(pageParam);
    const [form] = Form.useForm();
    const router = useRouter()

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
        if (!value) {
            form.resetFields(['protocolId']);
            return;
        }
        // console.log(123, option);

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
        console.log(Object.assign(balance, option), 1234);

    }
    // 币种余额
    const getUserBalanceData = async () => {
        const tenantId = form.getFieldValue('tenantId')
        if (!tenantId) {
            return toast.error('请先选择币种')
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
        if (coinLoading) return;

        try {
            // 如果没有币种列表数据，先获取数据
            if (coinSelect.length === 0) {
                await getCoinAllData();
            }

            // 设置表单值
            form.setFieldValue('tenantId', coinId);

            // 获取选中币种的信息并更新余额
            const selectedCoin = coinSelect.find(coin => coin.coinId === coinId);
            if (selectedCoin) {
                const balance = await getUserBalanceData();
                if (balance) {
                    setConinInfo({ ...balance, ...selectedCoin });
                }
            }
        } catch (error) {
            toast.error('设置币种失败');
        }
    }
    // 链名称(网络名称)
    const getCoinExtList = async () => {
        const tenantId = form.getFieldValue('tenantId')
        if (!tenantId) {
            setCoinExtSelect([])

            return toast.error('请先选择币种')
        }
        // 判断同币种不重复请求
        if (coinId === tenantId || coinExtLoading) return
        setCoinId(tenantId)
        await getCoinExt(tenantId)
    }

    const getCoinExt = async (tenantId: number) => {
        setCoinExtLoading(true)
        try {
            const res = await getcoinExtList(tenantId)
            if (res.code === '0') {
                const coinExtList = res.data.map((item: any) => ({
                    ...item,
                    label: item.coinName,
                    value: item.protocolId,
                }))
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
        }

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
    const amountChange = (e: any) => {
        if (e.target.value) {
            setAmountNum(e.target.value)
        } else {
            setAmountNum(0)
        }
    }
    const handleFormChange = (changedValues: any, allValues: any) => {
        console.log(changedValues, allValues, 1236);
        
    }



    const columns: ColumnsType<DataType> = [
        {
            title: "币种",
            dataIndex: "coinId",
            key: "coinId",
            width: 158,
            align: "left",
            render: (text, record) => <div>{text || '--'} </div>,
        },
        {
            title: "提币时间",
            dataIndex: "createTime",
            key: "createTime",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>,
        },
        {
            title: "数量",
            dataIndex: "amount",
            key: "amount",
            align: "center",
            width: 158,
            render: (_text) => {
                return <span >{_text || '--'}</span>;

            },
        },
        {
            title: "手续费",
            key: "fee",
            dataIndex: "fee",
            width: 128,
            align: "center",
            render: (_text) => {
                return <span >{_text || '--'}</span>;
            },
        },
        {
            title: "地址",
            key: "toAddress",
            dataIndex: "toAddress",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "钱包处理时间",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "TxID",
            key: "txHash",
            dataIndex: "txHash",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "状态",
            key: "status",
            dataIndex: "status",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status ? getStatus(_status) : '--'}</span>;
            },
        },
        {
            title: "操作",
            key: "operation",
            dataIndex: "operation",
            width: 128,
            align: "center",
            render: (_status) => {
                return < >
                    <button className={`${styles.theme_color}`}>撤销</button>
                </>;
            },
        },


    ];

    const getStatus = (status: number) => {
        switch (status) {
            case 0:
                return '创建'
                break
            case 1:
                return '待审核'
                break
            case 2:
                return '完成'
                break
            case 3:
                return '拒绝 '
                break
            case 4:
                return '用户撤销'
                break
        }
    }
    const antiFraud = () => {
        form.validateFields()
            .then(async (values) => {
                console.log(values)
                setCheckOpen(true)

            })
            .catch(error => {
                console.log(error)
            })
    }
    const pageChange = async (page: number, pageSize: number) => {
        const pageData = {
            page: page,
            pageSize: pageSize
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
        await getWithdrawDepositListData()
    }
    const getWithdrawDepositListData = async () => {
        const pageParam = {
            pageNo: paramdataRef.current.page,
            pageSize: paramdataRef.current.pageSize
        }
        setTableLoading(true)
        try {
            const res = await getWithdrawDepositList(pageParam)
            setTableData(res.data.list)
            setTotal(res.data.count)
        } finally {
            setTableLoading(false)
        }

    }
    useEffect(() => {
        getWithdrawDepositListData()
    }, [])




    const steps = [
        {
            title: <p className={`${styles.tip_title} `}>提现币种</p>,
            description: <div className={`${styles.steps_item_content} mt-2`}>
                {current >= 0 && <>
                    <Form.Item name='tenantId' >
                        <Select allowClear
                            placeholder="请选择币种"
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
                                {coinSelect.length > 0 && <div className={` font-14 font-w-400 mb-2_5 `}>
                                    <p className={`${styles.tip_color2}`}>搜索历史</p>
                                    {searchHistory.length > 0 ? <div className='mt-2 mb-2_5'>
                                        {searchHistory.map((item) => (
                                            <button
                                                key={item.value}
                                                className={`cancel_btn5 ${styles.selsect_btn} mr-2`}
                                                onClick={() => form.setFieldValue('tenantId', item.value)}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div> : <p className='mt-2 mb-2_5'>暂无</p>}
                                    <p className={`${styles.tip_color2} `}>币种列表</p>

                                </div>}
                                {menu}
                            </>

                            )}
                            notFoundContent={<NoData title="暂无记录" />}
                            onFocus={getCoinAllList}
                            onChange={coinChange}
                            loading={coinLoading}
                        />
                    </Form.Item>
                    <div className='mt-2_5'>
                        {searchHistory.map((item) => (
                            <button
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
            title: <p className={`${styles.tip_title} `}>提现网络</p>,
            description: <div className={`${styles.steps_item_content2} mt-2`}>
                {current >= 1 && <>
                    <Form.Item name='addressId' >
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
                                {/* 添加地址 */}
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

                        />
                    </Form.Item>
                    <Form.Item name='protocolId' >
                        <Select allowClear
                            placeholder="请选择网络"
                            options={coinExtSelect}
                            className={`${styles.select_box}  custom-select `}
                            optionRender={(option) => {
                                return (
                                    <div className="flex-x justify-between align-center py-1 font-14 font-w-400">
                                        <p className={`flex-y `}>
                                            <span className={`${styles.title_color}`}>{option.data.label}</span>
                                            <span className={`${styles.tip_color}`}>{option.data.value}</span>
                                        </p>
                                        <p className={`${styles.tip_color2} `}>手续费{option.data.withdrawFee}</p>
                                    </div>
                                );
                            }}
                            dropdownRender={(menu) => (<>
                                <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5 `}>
                                    <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                                    <span>请注意，这里仅展示了Metawave平台所支持的充币网络，如果您使用本平台不支持的网络充币，将可能导致资产损失。</span>
                                </p>
                                {menu}
                            </>

                            )}
                            notFoundContent={<NoData title="暂无记录" />}
                            onFocus={getCoinExtList}
                            loading={coinExtLoading}
                            onChange={coinExtChange}

                        />
                    </Form.Item>
                </>}
            </div>,

        },
        {
            title: <p className={`${styles.tip_title} `}>提现信息</p>,
            description: <div className={`${styles.steps_item_content3} mt-2`}>
                {current >= 2 && <>
                    <Form.Item name='amount' >
                        <Input className={`${styles.input_box3} modal-input mr-7`}
                            // maxLength={25}
                            placeholder='提现金额'
                            allowClear
                            suffix={<div className='flex-x align-center  font-14 font-w-400'>
                                <p className={`${styles.tip_color2} pr-2`}>
                                    {/* USDT */}
                                    {coninInfo.coinName || '--'}
                                </p><span className={`${styles.tip_color2}`}>|</span>
                                <button className={` theme_color pl-2`} onClick={()=>{
                                    if(coninInfo.balance>coninInfo.maxWithdrawAmount){
                                        form.setFieldValue('amount',coninInfo.maxWithdrawAmount||0)
                                        setAmountNum(coninInfo.maxWithdrawAmount||0)
                                    }else{
                                        form.setFieldValue('amount',coninInfo.balance||0)
                                        setAmountNum(coninInfo.balance||0)
                                    }
                                }}>最大</button>
                            </div>}
                            onChange={amountChange}
                            value={amountNum}
                        />
                    </Form.Item>
                    <div className={`${styles.card_bgc3} mt-5  font-14 font-w-400`}>
                        <ul className={`${styles.tip_color} ${styles.icon_btn_bottom} w-full mb-5`}>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>现货可用</p>
                                <p>
                                    {/* 50.13USDT */}
                                    {coninInfo.balance || '0'}
                                    {coninInfo.coinName || '--'}
                                </p>
                            </li>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>单次限额</p>
                                <p>
                                    {/* 10-10,000USDT */}
                                    {/* {coninInfo.minWithdraw||'0'}-{coninInfo.maxWithdraw||'0'}{coninInfo.coinName||'--'} */}
                                    {coninInfo.minWithdrawAmount || '0'}-{coninInfo.maxWithdrawAmount || '0'}{coninInfo.coinName || '--'}
                                </p>
                            </li>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>24H限额</p>
                                <p>50,000 <span>/ 50,000USDT</span></p>
                            </li>
                        </ul>
                        <div className='flex-x justify-between align-center'>
                            <div>
                                <p className={`${styles.tip_color} mb-3`}>预估到账</p>
                                <p className={`${styles.title_color} mb-3 font-24 font-w-500`}>
                                    {/* 1 USDT */}
                                    {cut(amountNum , coninInfo.withdrawFee ?
                                        nul(amountNum, coninInfo.withdrawFee) : coninInfo.minWithdrawFee)||0}
                                    {coninInfo.coinName || '--'}

                                </p>
                                <p className={`${styles.tip_color} mb-3`}>手续费 <span className={`${styles.title_color}`}>
                                    {/* 1 USDT */}
                                    {/* {coninInfo.withdrawFee||'0'} {coninInfo.coinName||'--'} */}
                                    {/* {nul(form.getFieldValue('amount'), coninInfo.withdrawFee ? coninInfo.withdrawFee : coninInfo.minWithdrawFee)}{coninInfo.coinName || '--'} */}
                                    {nul(amountNum, coninInfo.withdrawFee) > coninInfo.minWithdrawFee ? nul(amountNum, coninInfo.withdrawFee) : coninInfo.minWithdrawFee}
                                    {coninInfo.coinName || '--'}
                                </span></p>
                            </div>
                            {/* default_btn */}
                            <button type='submit' className={`${styles.withdraw_btn} disabled_btn mr-2`}
                                onClick={antiFraud}>
                                提现
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
                        title: <Link href="/assets/assetsAccount"><span className={`${styles.tip_color}`}>现货账户</span></Link>,
                    },
                    {
                        title: <span className={`${styles.title_color}`}>提现</span>,
                    },
                ]} style={{ fontSize: 14 }} />

            </div>
            <div className={`${styles.card_box}  mt-6  `}>
                <NoUseCom type='1' />
                <NoUseCom type='2' />
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
                                    }

                                }
                            }}
                        >
                            <Form
                                form={form}
                                initialValues={{ amount: '20' }}
                            onValuesChange={handleFormChange}
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
                            <h5 className={`font-w-500 font-16 mb-4`}>常见问题</h5>
                            <ul className={`font-14 font-w-400 ${styles.tip_color}`}>
                                <li className={`mb-2_5`}>如何在IMBIT上充值和提现？</li>
                                <li className={`mb-2_5`}>提现步骤指南</li>
                                <li className={`mb-2_5`}>提现常见问题</li>
                                <li className={`mb-2_5`}>为何我的提现尚未到账</li>
                                <li className={`mb-2_5`}>如何提交充错币找回申请</li>
                            </ul>
                        </div>
                        <div className=''>
                            <h5 className={`font-w-500 font-16 mb-4`}>提现须知</h5>
                            <ul className={`font-14 font-w-400 ${styles.tip_color}`}>
                                <li className={`mb-2_5`}>1. 请通过客户端或在线钱包将您需要提现的相应币种数目发送到该地址</li>
                                <li className={`mb-2_5`}>2. 发送完成后，系统会自动在此交易获得相应数量，确认后将该笔数字货币提现到您在本站的账户,相应数量的确认需要大约 30分钟 到 1 小时间，请耐心等待。</li>
                                <li className={`mb-2_5`}>3. 同一个地址可多次提现，不影响到账</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={`${styles.table_box} w-full `}>
                    <div className={`${styles.table_header} w-full my-4 flex align-center`}>
                        <h5 className={`font-w-500 font-18`}>最近提现记录</h5>
                        {/* <Radio
                        defaultChecked
                    ><span className={`${styles.title_color}`}>隐藏0资产</span></Radio> */}
                    </div>
                    <ConfigProvider
                        theme={{
                            components: {
                                Table: {
                                    // bodySortBg: "pink",
                                    headerBg: "transparent",
                                    headerColor: "var(--text-color6)",
                                    headerSplitColor: "transparent", // 表头分割线颜色
                                    rowExpandedBg: "var(--background10)", // 表格行展开背景色
                                    borderColor: "transparent",
                                    headerBorderRadius: 0, // 表头圆角
                                },
                                Pagination: {
                                    itemActiveBg: "transparent",
                                    itemBg: "transparent",
                                },

                                Select: {
                                    activeBorderColor: "var(--border-color4)",
                                    optionActiveBg: "transparent",
                                    selectorBg: "transparent", //选框背景色
                                }
                            },
                        }}
                    >
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            size="large"
                            scroll={{ x: "max-content", y: 500 }}
                            className={` table-box`}
                            pagination={{
                                position: ["bottomRight"],
                                showSizeChanger: true,
                                total: total,
                                size: "default",
                                onChange: (page, pageSize) => pageChange(page, pageSize),
                            }}
                            loading={tableLoading}
                            locale={{ emptyText: <NoData title="暂无记录" /> }}
                        />
                    </ConfigProvider>
                </div>
            </div>
            <WithdrawMoneyCheck open={checkOpen} onCancel={() => setCheckOpen(false)} onOk={() => setCheckOpen(false)} />

        </div>
    </div>
    );
};

export default WithdrawMoneyPage;