import React from 'react';
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from '../styles/addAddress.module.css'
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
import { useRouter } from 'next/router'
import NoUseCom from '../compontents/noSM'
import DelectModal from "@/components/assetsModal/delectAddress_Modal"
import AddAddressModal from "@/components/assetsModal/addAddress_Modal"
import { getuserAddressList, getCoinAll } from '@/services/assets'
import { toast } from "sonner";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
interface DataType {
    id: number,
    protocolId: number,
    addressTitle: string,
    protocolName: string,
    symbol: string,
    addressName: string,
    userId: number,
    tenantId: string,
    createTime: number,
    updateTime: number
    coinName: string,
    coinId: number,
}
interface coinSelectType {
    coinId: string,
    coinName: string,
    iconUrl: string,
    nameDefault: string,
    value: string,
    label: string,
}
const AddAdressPage = () => {
    const { t } = useTranslation('assets');
    const [total, setTotal] = useState(0);
    const [delectOpen, setDelectOpen] = useState(false);
    const [delectInfo, setDelectInfo] = useState<number[]>([]);
    const [addAddressOpen, setAddAddressOpen] = useState(false);
    const [coinSelect, setCoinSelect] = useState<coinSelectType[]>([])
    const [coinLoading, setCoinLoading] = useState(false)

    const [coinId, setCoinId] = useState('')
    const [addressName, setAddressName] = useState('')
    const [inittableData, setInitTableData] = useState<DataType[]>([]);
    const [tableData, setTableData] = useState<DataType[]>([
        // {
        //     id: 1,
        //     userId: 1,
        //     platformType: 1,
        //     deviceNo: '1234567890',
        //     ip: '123.45.67.89',
        //     address: '1234567890',
        //     token: 1,
        //     tokenTime: 1,
        //     createTime: 1,
        //     updateTime: 1,
        //     tenantId: '1234567890',
        // },
        // {
        //     id: 2,
        //     userId: 2,
        //     platformType: 2,
        //     deviceNo: '2234567890',
        //     ip: '203.45.67.89',
        //     address: '2234567890',
        //     token: 2,
        //     tokenTime: 2,
        //     createTime: 2,
        //     updateTime: 2,
        //     tenantId: '2234567890',
        // }

    ]);
    const [selectDelect, setSelectDelect] = useState(false)
    const { isDayMode } = useThemeMode(); // 使用 hook



    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const [tableLoading, setTableLoading] = useState(false);
    const paramdataRef = useRef(pageParam);


    const columns: ColumnsType<DataType> = [
        {
            title: t('assetsAccount.coin'), //"币种",
            dataIndex: "coinName",
            key: "coinName",
            // width: 158,
            align: "left",
            render: (_text) => <div>{_text || '--'} </div>,
        },
        {
            title: t('assetsAccount.protocol'), //"所属网络",
            dataIndex: "protocolName",
            key: "protocolName",
            align: "center",
            // width: 128,
            render: (_text) => <span>{_text || '--'}</span>,
        },
        {
            title: t('assetsAccount.address'), //"地址",
            dataIndex: "addressName",
            key: "addressName",
            align: "center",
            width: 228,
            render: (_status) => {
                return <span >{_status || '--'}</span>;

            },
        },
        {
            title: t('assetsAccount.remark'), //"备注",
            key: "addressTitle",
            dataIndex: "addressTitle",
            // width: 128,
            align: "center",
            render: (_ip) => {
                return <span >{_ip || '--'}</span>;
            },
        },
        {
            title: t('assetsAccount.addTime'), //"添加时间",
            key: "createTime",
            dataIndex: "createTime",
            // width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },

        {
            title: t('assetsAccount.operation'), //"操作",
            key: "operation",
            dataIndex: "operation",
            // width: 128,
            align: "center",
            render: (_status, record) => {
                return <>
                    <button className={`${styles.theme_color} mr-3 font-12 font-w-500`} onClick={() => delectAddress(record.id)}>
                        {t('assetsAccount.delete')}</button>
                </>
            },
        },


    ];
    // 分页
    const pageChange = async (page: number, pageSize: number) => {
        const pageData = {
            page: page,
            pageSize: pageSize,
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
        await getuserAddressListData()
    }
    // 获取地址列表
    const getuserAddressListData = async () => {
        const pageParam = {
            pageNo: paramdataRef.current.page,
            pageSize: paramdataRef.current.pageSize,
            addressName: addressName || "",
            coinId: coinId || ""
        }
        setTableLoading(true)
        try {
            const res = await getuserAddressList(pageParam)
            if (res.code === '0') {
                setInitTableData(res.data.list)
                setTableData(res.data.list)
                setTotal(res.data.count)
            } else {
                toast.error(res.message)
            }
        } finally {
            setTableLoading(false)
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
                    label: item.coinName,
                    value: item.coinId,
                    coinId: item.coinId,
                    coinName: item.coinName,
                    iconUrl: item.iconUrl,
                    nameDefault: item.nameDefault,
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
    const onSearch = async () => {
        const pageData = {
            page: 1,
            pageSize: paramdataRef.current.pageSize,
        }
        setPageParam(pageData)
        paramdataRef.current = pageData;
        await getuserAddressListData()
    }

    // 币种筛选
    const coinChange = (value: string) => {
        if (value) {
            setCoinId(value)
        } else {
            setCoinId('')
        }
        const newCoinId = value || '';

        filterTableData(newCoinId, addressName);

    }
    // 地址/备注筛选
    const addressChange = (e: any) => {
        const value = e.target.value
        if (value) {
            setAddressName(value)
        } else {
            setAddressName('')
        }
        const newAddressName = value.toString() || '';
        filterTableData(coinId, newAddressName);
    }
    // 筛选函数
    const filterTableData = (coinIdValue: string, addressNameValue: string) => {
        // 如果两个筛选条件都为空，则显示所有数据
        if (!coinIdValue && !addressNameValue) {
            setTableData(inittableData);
            return;
        }

        // 筛选数据
        const filteredData = inittableData.filter(item => {
            // 币种筛选条件
            const coinMatch = !coinIdValue || item.coinId.toString() === coinIdValue.toString();

            // 地址/备注筛选条件 - 同时检查多个字段
            const searchValue = addressNameValue.toLowerCase();
            const addressMatch = !addressNameValue ||
                // 检查地址字段
                (item.addressName && item.addressName.toLowerCase().includes(searchValue)) ||
                // 检查备注字段 (createTime)
                // (item.createTime && String(item.createTime).toLowerCase().includes(searchValue)) ||
                // 检查标题字段 (如果存在)
                (item.addressTitle && item.addressTitle.toLowerCase().includes(searchValue));

            // 同时满足两个条件
            return coinMatch && addressMatch;
        });

        setTableData(filteredData);
    }
    const selectRow = (selectedRowKeys: any, selectedRows: any) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        const delectInfo = [...selectedRowKeys];
        setDelectInfo(delectInfo);
        setSelectDelect(selectedRowKeys.length > 0);
    }
    const delectAddress = (id: number) => {
        setDelectOpen(true)
        const delectInfo = [id];
        setDelectInfo(delectInfo)
    }
    const delectAllAddress = () => {
        setDelectOpen(true)
    }
    const initDelect = () => {
        setDelectInfo([])
        setSelectDelect(false)
    }
    const initGetData = async () => {
        setDelectOpen(false)
        await getuserAddressListData()
        initDelect()
    }



    useEffect(() => {
        getuserAddressListData()
    }, [])


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
                        title: <Link href="/assets/assetsAccount/withdrawMoney"><span className={`${styles.tip_color}`}>
                            {/* 提现 */}
                            {t('assets.withdraw')}
                            </span></Link>,
                    },
                    {
                        title: <span className={`${styles.title_color}`}>
                            {/* 地址管理 */}
                            {t('assetsAccount.address')}
                            </span>,
                    },
                ]} style={{ fontSize: 14 }} />

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
                }}>
                <div className={`${styles.table_box} w-full `}>
                    <div className={`${styles.table_header} w-full my-4 flex align-center justify-between`}>
                        <div className='flex-x align-center'>
                            <Select allowClear
                                placeholder="请选择币种"
                                options={coinSelect}
                                className={`${styles.select_box} custom-select`}
                                optionRender={(option) => {
                                    return (
                                        <div className="flex items-center py-1">
                                            {/* <Image src={option.data.iconUrl}
                                                alt={'coin'} width={20} height={20}
                                                className={` mr-2`} /> */}
                                            <Image src={`/images/assets/assets_account/icon_money.png`}
                                                alt={'coin'} width={20} height={20}
                                                className={` mr-2`} />

                                            <span className="text-text-color7">{`${option.data.coinName}(${option.data.nameDefault})`}</span>
                                        </div>
                                    );
                                }}
                                onFocus={getCoinAllList}
                                loading={coinLoading}
                                notFoundContent={<NoData title={t('assetsAccount.nodata')} />}
                                onChange={coinChange}
                            // onSearch={onSearch}
                            />
                            <Input className={`${styles.input_box} modal-input2 ml-5`}
                                // maxLength={25}
                                placeholder={t('assetsAccount.addAddress.search')}
                                allowClear
                                prefix={<Iconify icon="garden:search-26" size={20} className={`${styles.tip_color} `} />}
                                onChange={addressChange}
                            // onPressEnter={onSearch}
                            />
                        </div>
                        <button type='button' className={`default_btn font-16 font-w-500 ${styles.btn_style} flex-x-cc`}
                            onClick={() => setAddAddressOpen(true)}>
                            <Iconify icon="mingcute:add-line" size={20} className={` mr-2`} style={{ color: '#fff' }} />
                            {/* 添加地址 */}
                            {t('assetsAccount.addAddress.add')}
                        </button>
                    </div>
                    <div className={`${styles.table_content} w-full `}>

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
                            locale={{ emptyText: <NoAddress /> }}
                            // rowSelection={{ type: 'checkbox', ...rowSelection }}
                            rowKey="id"
                            rowSelection={{
                                type: 'checkbox',
                                onChange: selectRow
                            }}
                        />
                        {selectDelect && <div className={` w-full flex-x align-center justify-between`}>
                            <p>
                                {/* 已选中{delectInfo.length}个地址 */}
                                {/* {t('assetsAccount.addAddress.isSelect', { count: delectInfo.length })} */}
                                {t('assetsAccount.addAddress.selected')}{delectInfo.length}{t('assetsAccount.addAddress.selected2')}
                                </p>
                            <button type='button' className={`default_btn font-16 font-w-500 ${styles.delect_btn} flex-x-cc`}
                                onClick={delectAllAddress}>
                                {/* 删除 */}
                                {t('assetsAccount.delect')}
                                </button>
                        </div>}

                    </div>
                </div>

            </ConfigProvider>
            <DelectModal open={delectOpen}
                onCancel={() => setDelectOpen(false)}
                onOk={initGetData}
                info={delectInfo} />
            <AddAddressModal open={addAddressOpen}
                onCancel={() => setAddAddressOpen(false)}
                onOk={() => {
                    getuserAddressListData()
                    // setAddAddressOpen(false)
                }}
            />
        </div>
    </div >
    );
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', ['assets','common'])),
		},
	};
};
export default AddAdressPage;