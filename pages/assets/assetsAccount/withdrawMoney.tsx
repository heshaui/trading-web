import React from 'react';
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from '../styles/spotAccount.module.css'
import { Input, Steps, Breadcrumb, ConfigProvider, Table, Select } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useThemeMode } from '@/hooks/useThemeMode';
import Image from 'next/image'
import Link from 'next/link'
import { NoData, NoAddress } from '@/components/noData';
import WithdrawMoneyCheck from '@/components/assetsModal/withdrawMoneyCheck'
import { getWithdrawDepositList } from '@/services/assets'
import { useRouter } from 'next/router'
import NoUseCom from '../compontents/noSM'
interface DataType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: number,
    tokenTime: number,
    createTime: number,
    updateTime: number,
    tenantId: string,
}
const WithdrawMoneyPage = () => {
    const [tableData, setTableData] = useState<DataType[]>([

    ]);
    const { isDayMode } = useThemeMode(); // 使用 hook
    const [checkOpen, setCheckOpen] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>(['BTC', 'ETH', 'FIL', 'USDT']);

    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(2);

    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const [tableLoading, setTableLoading] = useState(false);
    const paramdataRef = useRef(pageParam);

    const columns: ColumnsType<DataType> = [
        {
            title: "币种",
            dataIndex: "deviceNo",
            key: "deviceNo",
            width: 158,
            align: "left",
            render: (text, record) => <div>{`${text}`} </div>,
        },
        {
            title: "提币时间",
            dataIndex: "token",
            key: "token",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text || '--'}</span>,
        },
        {
            title: "提币地址",
            dataIndex: "tokenTime",
            key: "tokenTime",
            align: "center",
            width: 158,
            render: (_status) => {
                return <span >{_status || '--'}</span>;

            },
        },
        {
            title: "TxID",
            key: "createTime",
            dataIndex: "createTime",
            width: 128,
            align: "center",
            render: (_ip) => {
                return <span >{_ip || '--'}</span>;
            },
        },
        {
            title: "确认次数",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "数量",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "状态",
            key: "updateTime",
            dataIndex: "updateTime",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },


    ];
    const cardTypeSeelect: { label: string, value: string }[] = [
        {
            label: '居民身份证',
            value: '1'
        },
        {
            label: '普通护照',
            value: '2'
        },
        {
            label: '港澳通行证',
            value: '3'
        },
        {
            label: '台湾通行证',
            value: '4'
        },
        {
            label: '台湾身份证',
            value: '5'
        },
        {
            label: '外国人永久居住身份证',
            value: '6'
        }
    ]
    const addressTypeSelect: { label: string, value: string, desc: string, network: string }[] = [
        {
            label: '这是一个地址1XXXXXXXXX',
            value: '1',
            desc: '我的地址1',
            network: 'TRX'
        },
        {
            label: '这是一个地址1XXXXXXXXX',
            value: '2',
            desc: '我的地址1',
            network: 'BTC'
        },
    ]
    const networkTypeSelect: { label: string, value: string, desc: string }[] = [
        {
            label: 'TRX',
            value: 'Tron (TRC20)',
            desc: '1 USDT≈$1.00',
        },
        {
            label: 'ETHETH',
            value: 'Ethereum (ERC20)',
            desc: '1 USDT≈$1.00',
        },
    ]
    const router = useRouter()
    const antiFraud = () => {
        setCheckOpen(true)
    }
    const steps = [
        {
            title: <p className={`${styles.tip_title} `}>提现币种</p>,
            description: <div className={`${styles.steps_item_content} mt-2`}>
                {current >= 0 && <>
                    <Select allowClear
                        placeholder="请选择币种"
                        options={cardTypeSeelect}
                        className={`${styles.select_box} custom-select`}
                        optionRender={(option) => {
                            return (
                                <div className="flex items-center py-1">
                                    <Image src={`/images/assets/assets_account/icon_money.png`}
                                        alt={option.data.label} width={20} height={20}
                                        className={` mr-2`} />
                                    <span className="text-text-color7">{option.data.label}</span>
                                </div>
                            );
                        }}
                        dropdownRender={(menu) => (<>
                            {cardTypeSeelect.length > 0 && <div className={` font-14 font-w-400 mb-2_5 `}>
                                <p className={`${styles.tip_color2}`}>搜索历史</p>
                                <div className='mt-2 mb-2_5'>
                                    {searchHistory.map((item) => (
                                        <button key={item} className={`cancel_btn5 ${styles.selsect_btn} mr-2`}>{item}</button>
                                    ))}
                                </div>
                                <p className={`${styles.tip_color2} `}>币种列表</p>

                            </div>}
                            {menu}
                        </>

                        )}
                        notFoundContent={<NoData title="暂无记录" />}

                    />
                    <div className='mt-2_5'>
                        <button className={`${styles.btn_style} cancel_btn5 mr-2`}>
                            USDT
                        </button>
                        <button className={`${styles.btn_style} cancel_btn5 mr-2`}>
                            BTC
                        </button>
                        <button className={`${styles.btn_style} cancel_btn5 mr-2`}>
                            ETH
                        </button>
                        <button className={`${styles.btn_style} cancel_btn5 mr-2`}>
                            FIL
                        </button>
                    </div>

                </>}
            </div>,

        },
        {
            title: <p className={`${styles.tip_title} `}>提现网络</p>,
            description: <div className={`${styles.steps_item_content2} mt-2`}>
                {current >= 1 && <>
                    <Select className={`${styles.select_box} custom-select `}
                        maxLength={25}
                        options={addressTypeSelect}
                        placeholder='选择提现地址'
                        allowClear
                        suffixIcon={<Iconify icon="mdi:map-outline" size={24} className={`${styles.title_color} `} />}
                        optionRender={(option) => {
                            return (
                                <div className="flex-y  py-1">
                                    <p className={`${styles.title_color} font-14 font-w-400`}>{option.data.desc}</p>
                                    <p className={`${styles.tip_color2} font-14 font-w-400`}>地址：{option.data.label}</p>
                                    <p className={`${styles.tip_color2} font-14 font-w-400`}>网络：{option.data.network}</p>
                                </div>
                            );
                        }}
                        dropdownRender={(menu) => (<>
                            {menu}
                            {/* 添加地址 */}
                            <button type='button' className={`default_btn font-16 font-w-500 mt-6 mb-6 ${styles.btn_style2}`}
                            onClick={()=>{
                                router.push('/assets/assetsAccount/addAddress')
                            }}
                            >
                                添加地址
                            </button>
                        </>

                        )}
                        notFoundContent={<NoAddress />}
                    />
                    <Select allowClear
                        placeholder="请选择网络"
                        options={networkTypeSelect}
                        className={`${styles.select_box} ${styles.mt_20} custom-select `}
                        optionRender={(option) => {
                            return (
                                <div className="flex-x justify-between align-center py-1 font-14 font-w-400">
                                    <p className={`flex-y `}>
                                        <span className={`${styles.title_color}`}>{option.data.label}</span>
                                        <span className={`${styles.tip_color}`}>{option.data.value}</span>
                                    </p>
                                    <p className={`${styles.tip_color2} `}>手续费{option.data.desc}</p>
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
                    />
                </>}
            </div>,

        },
        {
            title: <p className={`${styles.tip_title} `}>提现信息</p>,
            description: <div className={`${styles.steps_item_content3} mt-2`}>
                {current >= 2 && <>
                    <Input className={`${styles.input_box3} modal-input mr-7`}
                        maxLength={25}
                        placeholder='20'
                        allowClear
                        suffix={<div className='flex-x align-center  font-14 font-w-400'>
                            <p className={`${styles.tip_color2} pr-2`}>USDT</p><span className={`${styles.tip_color2}`}>|</span>
                            <button className={` theme_color pl-2`}>最大</button>
                        </div>}
                    />
                    <div className={`${styles.card_bgc3} mt-5  font-14 font-w-400`}>
                        <ul className={`${styles.tip_color} ${styles.icon_btn_bottom} w-full mb-5`}>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>现货可用</p>
                                <p>50.13USDT</p>
                            </li>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>单次限额</p>
                                <p>10-10,000USDT</p>
                            </li>
                            <li className={`flex-x justify-between mb-5`}>
                                <p>24H限额</p>
                                <p>50,000 <span>/ 50,000USDT</span></p>
                            </li>
                        </ul>
                        <div className='flex-x justify-between align-center'>
                            <div>
                                <p className={`${styles.tip_color} mb-3`}>实际到账</p>
                                <p className={`${styles.title_color} mb-3 font-24 font-w-500`}>1 USDT</p>
                                <p className={`${styles.tip_color} mb-3`}>手续费 <span className={`${styles.title_color}`}>1 USDT</span></p>
                            </div>
                            {/* default_btn */}
                            <button className={`${styles.withdraw_btn} disabled_btn mr-2`}
                                onClick={antiFraud}>
                                提现
                            </button>
                        </div>
                    </div>
                </>}
            </div>,

        },

    ]
    const pageChange = async (page: number, pageSize: number) => {
        const pageData = {
            page: page,
            pageSize: pageSize
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
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
            setTotal(res.data.total)
        } finally {
            setTableLoading(false)
        }

    }
    useEffect(() => {
        getWithdrawDepositListData()
    }, [])


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
                            <Steps
                                direction="vertical"
                                current={current}
                                labelPlacement="vertical"
                                items={steps}
                                className='custom-steps' />
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