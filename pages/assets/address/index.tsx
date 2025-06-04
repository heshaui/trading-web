import React from 'react';
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from '../styles/addAddress.module.css'
import { Input, Pagination, Breadcrumb, ConfigProvider, Table, Select } from 'antd';
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
    sort: number,
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
    const [tableData, setTableData] = useState<DataType[]>([]);
    const [selectDelect, setSelectDelect] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const { isDayMode } = useThemeMode(); // 使用 hook

    const [pageParam, setPageParam] = useState({
        page: 1,
        pageSize: 10
    })
    const [tableLoading, setTableLoading] = useState(false);
    const paramdataRef = useRef(pageParam);

    // 添加 useRef 来存储筛选条件
    const filterRef = useRef({
        coinId: '',
        addressName: ''
    });

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
                return <span >{_status ? dayjs(_status).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>;
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
            addressName: filterRef.current.addressName,
            coinId: filterRef.current.coinId
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
                    sort: item.sort,
                })).sort((a: coinSelectType, b: coinSelectType) => {
                    return a.sort - b.sort
                })

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
        const newCoinId = value || '';
        setCoinId(newCoinId);
        filterRef.current.coinId = newCoinId;
        filterTableData();
    }
    // 地址/备注筛选
    const addressChange = (e: any) => {
        const value = e.target.value;
        const newAddressName = value.toString() || '';
        setAddressName(newAddressName);
        filterRef.current.addressName = newAddressName;
        // filterTableData();
    }
    // 筛选函数
    const filterTableData = async () => {
        await getuserAddressListData();
    }
    const filterTableData2 = (coinIdValue: string, addressNameValue: string) => {
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
    // 监听表格数据变化，更新选中状态
    useEffect(() => {
        if (selectedRowKeys.length > 0) {
            // 获取当前表格中存在的选中行
            const validSelectedKeys = selectedRowKeys.filter(key =>
                tableData.some(item => item.id === key)
            );

            // 如果选中的行不在当前表格中，更新选中状态
            if (validSelectedKeys.length !== selectedRowKeys.length) {
                setSelectedRowKeys(validSelectedKeys);
                setDelectInfo(validSelectedKeys as number[]);
                setSelectDelect(validSelectedKeys.length > 0);
            }
        }
    }, [tableData]);

    // 修改 selectRow 函数
    const selectRow = (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
        setSelectedRowKeys(selectedRowKeys);
        setDelectInfo(selectedRowKeys as number[]);
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
                        },
                        Input: {
							controlHeightLG: 50,
							activeBorderColor: 'var(--border-color4)',
							hoverBorderColor: 'var(--border-color4)',
							activeBg: 'transparent',
							hoverBg: 'transparent',
						},
                    },
                }}>
                <div className={`${styles.table_box} w-full `}>
                    <div className={`${styles.table_header} w-full my-4 flex align-center justify-between`}>
                        <div className='flex-x align-center'>
                            <Select allowClear
                                placeholder={t('assetsAccount.addAddress.selectCoin')}
                                options={coinSelect}
                                className={`${styles.select_box} custom-select`}
                                optionRender={(option) => {
                                    return (
                                        <div className="flex items-center py-1">
                                            <Image src={option.data.iconUrl}
                                                alt={'coin'} width={20} height={20}
                                                style={{ borderRadius: '50%', height: '20px', width: '20px' }}
                                                className={` mr-2`} />
                                            {/* <Image src={`/images/assets/assets_account/icon_money.png`}
                                                alt={'coin'} width={20} height={20}
                                                className={` mr-2`} /> */}

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
                            <Input className={`${styles.input_box} modal-input ml-5`}
                                // maxLength={25}
                                placeholder={t('assetsAccount.addAddress.search')}
                                allowClear
                                prefix={<button onClick={onSearch}>
                                    <Iconify icon="garden:search-26" size={20} className={`${styles.tip_color} `} /></button>}
                                onChange={addressChange}
                                onPressEnter={onSearch}
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
                            scroll={{ x: "max-content" }}
                            className={` table-box`}
                            // pagination={{
                            //     position: ["bottomRight"],
                            //     showSizeChanger: true,
                            //     total: total,
                            //     size: "default",
                            //     onChange: (page, pageSize) => pageChange(page, pageSize),
                            // }}
                            pagination={false}
                            loading={tableLoading}
                            locale={{ emptyText: <NoAddress /> }}
                            // rowSelection={{ type: 'checkbox', ...rowSelection }}
                            rowKey="id"
                            rowSelection={{
                                type: 'checkbox',
                                selectedRowKeys,
                                onChange: selectRow
                            }}
                        />
                        {selectDelect && <div className={` w-full flex-x align-center justify-between mt-3`}>
                            <p>
                                {/* 已选中{delectInfo.length}个地址 */}
                                {/* {t('assetsAccount.addAddress.isSelect', { count: delectInfo.length })} */}
                                {t('assetsAccount.addAddress.selected')}{delectInfo.length}{t('assetsAccount.addAddress.selected2')}
                            </p>
                            <button type='button' className={`default_btn font-16 font-w-500 ${styles.delect_btn} flex-x-cc`}
                                onClick={delectAllAddress}>
                                {/* 删除 */}
                                {t('assetsAccount.delete')}
                            </button>
                        </div>}
                        <div className='w-full flex-x align-center justify-end mt-3'>
                            <Pagination
                                // simple
                                // position={['bottomRight']}
                                className='spot-table-box'
                                showSizeChanger
                                defaultCurrent={pageParam.page}
                                pageSize={pageParam.pageSize}
                                size='default'
                                total={total} onChange={pageChange} />
                        </div>

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
            ...(await serverSideTranslations(locale || 'en', ['assets', 'common'])),
        },
    };
};
export default AddAdressPage;