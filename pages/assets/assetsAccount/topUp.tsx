import React from 'react';
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from '../styles/spotAccount.module.css'
import { Input, Steps, Radio, ConfigProvider, Table, Select } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";


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
const AssetsMainPage = () => {
    const [tableData, setTableData] = useState<DataType[]>([
        {
            id: 1,
            userId: 1,
            platformType: 1,
            deviceNo: 'BTC',
            ip: '123.45.67.89',
            address: '123.45.67.89',
            token: 23.3,
            tokenTime: 123,
            createTime: 1234567890,
            updateTime: 1234567890,
            tenantId: '1234567890'
        }, {
            id: 2,
            userId: 1,
            platformType: 1,
            deviceNo: 'POINT',
            ip: '123.45.67.89',
            address: '123.45.67.89',
            token: 1234567890,
            tokenTime: 23.0,
            createTime: 1234567892,
            updateTime: 1234567889,
            tenantId: '1234567890'
        }
    ]);
    const [searchHistory, setSearchHistory] = useState<string[]>(['BTC', 'ETH', 'FIL', 'USDT']);

    // const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);

    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
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
            title: "充值时间",
            dataIndex: "token",
            key: "token",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text || '--'}</span>,
        },
        {
            title: "充值地址",
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
    const steps = [
        {
            title: <p className={`${styles.tip_title} `}>充值币种</p>,
            description: <div className={`${styles.steps_item_content} mt-2`}>
                {current >= 0 && <>
                    <Select allowClear
                        placeholder="请选择币种"
                        options={cardTypeSeelect}
                        className={`${styles.select_box} custom-select`}
                        dropdownRender={(menu) => (<>
                            <div className={` font-14 font-w-400 mb-2_5 `}>
                                <p className={`${styles.tip_color2}`}>搜索历史</p>
                                <div className='mt-2 mb-2_5'>
                                    {searchHistory.map((item) => (
                                        <button key={item} className={`cancel_btn5 ${styles.selsect_btn} mr-2`}>{item}</button>
                                    ))}
                                </div>
                                <p className={`${styles.tip_color2}`}>币种列表</p>
                            </div>
                            {menu}
                        </>
    
                        )}
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
            title: <p className={`${styles.tip_title} `}>网络</p>,
            description: <div className={`${styles.steps_item_content2} mt-2`}>
                {current >= 1 && <Select allowClear
                    placeholder="请选择币种"
                    options={cardTypeSeelect}
                    className={`${styles.select_box} custom-select`}
                    dropdownRender={(menu) => (<>
                        <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5 `}>
                            <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                            <span>请注意，这里仅展示了Metawave平台所支持的充币网络，如果您使用本平台不支持的网络充币，将可能导致资产损失。</span>
                        </p>
                        {menu}
                    </>

                    )}
                />}
            </div>,

        },
        {
            title: <p className={`${styles.tip_title} `}>充值地址</p>,
            description: <div className={`${styles.steps_item_content3} mt-2`}>
                {current >= 2 && <Input className={`${styles.input_box2} modal-input mr-7`}
                    maxLength={25}
                    placeholder='搜索'
                    allowClear
                    prefix={<Iconify icon="garden:search-26" size={20} className={`${styles.title_color} `} />}
                />}
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
    return (<div className={` page-h w-full page-box flex-y align-center`}>
        <div className={`${styles.spot_auth_box}`} >
            <div className='flex justify-between align-center'>
                <h2 className={`font-w-500 font-20`}>现货账户</h2>

            </div>
            <div className={`${styles.card_bgc}  mt-3 `}>
                <div className={` w-full flex-x`}>
                    <div className={`${styles.step_box}`}>
                        <ConfigProvider
                            theme={{
                                components: {
                                    Select: {
                                        clearBg: "#ffffff",
                                        selectorBg: 'var(--background7)',
                                        singleItemHeightLG: 50,
                                        paddingXXS: 10, // 下拉框选项最小内边距
                                        // optionLineHeight:40, // 下拉框选项高度
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
                    <div>

                    </div>
                </div>
                <div className={`${styles.table_box} w-full `}>
                    <div className={`${styles.table_header} w-full my-4 flex align-center`}>
                        <h5 className={`font-w-500 font-18`}>最近充值记录</h5>
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
                        // pagination={{
                        //     position: ["bottomRight"],
                        //     showSizeChanger: true,
                        //     total: total,
                        //     size: "default",
                        //     onChange: (page, pageSize) => pageChange(page, pageSize),
                        // }}
                        // loading={loading}
                        />
                    </ConfigProvider>
                </div>
            </div>
        </div>
    </div>
    );
};

export default AssetsMainPage;