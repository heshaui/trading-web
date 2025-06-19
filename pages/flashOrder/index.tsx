import React from 'react';
import { withSpotLayout } from '@/components/sidebarLayout/SpotLayout/userSpotLayout';
import { ConfigProvider, Table, Tag, DatePicker, Select, Space } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import appStore from '@/store';
import { useAuth } from '@/context/AuthContext';
import styles from './flash.module.css'
import { records } from '@/services/flash';
import { getCoinAll } from '@/services/assets';
import type { GetStaticProps } from 'next';


interface TransactionRecord {
    id: string;
    tradeDate: string;
    sendCoin: string;
    receiveCoin: string;
    tradingPair: string;
    payment: {
        amount: number;
        currency: string;
    };
    received: {
        amount: number;
        currency: string;
    };
    price: {
        direct: string;
        rate: string;
        reverse: string;
    };
    settlementDate: string;
    status: '0' | '1' | '2'|'3';
}

const FlashOrderPage = () => {
    const { t } = useTranslation(['spot', 'common']);
    const { isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TransactionRecord[]>([]);
    const [coinList, setCoinList] = useState<{coinName: string, coinCode: string}[]>([]);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
    const [selectedCoin, setSelectedCoin] = useState<string>('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const { RangePicker } = DatePicker;

    const router = useRouter();
        
    // 获取列表数据 - 使用useCallback进行优化
    const getList = useCallback(async (page: number, pageSize: number) => {
        setLoading(true);
        try {
            // 构建请求参数
            const params: any = {
                page: page,
                pageSize: pageSize,
            };
            
            // 添加日期筛选参数
            if (dateRange[0] && dateRange[1]) {
                params.startTime = dayjs(dateRange[0]).valueOf();
                params.endTime = dayjs(dateRange[1]).valueOf();
            }
            
            // 添加币种筛选参数
            if (selectedCoin && selectedCoin !== 'all') {
                params.sendCoin = selectedCoin;
            }
            
            const response = await records(params);
            if (response.code === '0') {
                setData(response.data.list);
                setPagination(prev => ({ 
                    ...prev,
                    total: response.data.count,
                }));
            } else {

            }
        } catch (error) {

        } finally {
            setLoading(false);
        }
    }, [dateRange, selectedCoin, t]);

    // 获取币种列表 - 使用useCallback进行优化
    const fetchCoinList = useCallback(async () => {
        try {
            const response = await getCoinAll();
            if (response.code === '0'&& Array.isArray(response.data)) {
                setCoinList(response.data);
            } else {
            }
        } catch (error) {
            console.error('获取币种列表失败:', error);
           
        }
    }, [t]);

    // // 初始化数据和币种列表
    useEffect(() => {

            const { current, pageSize } = pagination;
            getList(current, pageSize);
            fetchCoinList();

    }, []);
    
    // 当筛选条件变化时重置分页并重新获取数据
    // 使用useEffect监听过滤条件的变化
    // useEffect(() => {
    //     // 当日期范围或币种选择变化时
    //     if (isLoggedIn) {
    //         // 重置分页到第1页
    //         setPagination(prev => ({
    //             ...prev,
    //             current: 1
    //         }));
    //         // 重新加载数据，使用新的筛选条件
    //         getList(1, pagination.pageSize);
    //     }
    // }, [dateRange, selectedCoin, isLoggedIn, getList, pagination.pageSize]);

    const handleTableChange: TableProps<TransactionRecord>['onChange'] = (
        newPagination,
        filters,
        sorter,
    ) => {
        setPagination({
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 10,
            total: newPagination.total || 0,
        });
    };
    const columns: ColumnsType<TransactionRecord> = [
        {
            title: '交易日期',
            dataIndex: 'createTime',
            key: 'createTime',
        },
        {
            title: '交易对',
            render:(text,record)=>{
                if(record.sendCoin&&record.receiveCoin){
                    return record.sendCoin+'/'+record.receiveCoin
                }else{
                    return '-'
                }
                
            }

        },
        {
            title: '支付',
            dataIndex: 'sendAmount',
            key: 'sendAmount',
        },
        {
            title: '获得',
            dataIndex: 'receivedAmount',
            key: 'receivedAmount'
        },
        {
            title: '价格',
            dataIndex: 'price', 
            key: 'price'
        },
        {
            title: '结算日期',
            dataIndex: 'settlementTime',
            key: 'settlementTime',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                if(record.status === '0') {
                    return '处理中'
                } else if(record.status === '3') {
                    return '成功'
                } else if(record.status === '2') {
                    return '失败'
                } else if(record.status === '1') {
                    return '处理中'
                }
            },
        },
    ];

    return (
        <div>
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            headerBg: 'var(--background10)',
                            headerColor: 'var(--text-color6)',
                            headerSplitColor: 'var(--border-color4)',
                            rowHoverBg: 'var(--background10)',
                            borderColor: 'var(--border-color4)',
                            headerBorderRadius: 0,
                            headerSortActiveBg: 'var(--background10)',
                            headerSortHoverBg: 'var(--background10)',
                        },
                        Pagination: {
                            itemActiveBg: 'transparent',
                            itemBg: 'transparent',
                            itemActiveBgDisabled: 'transparent',
                            itemInputBg: 'transparent',
                        },
                    },
                }}
            >
                <div className='flex justify-between align-center'>
                    <h2 className={`font-w-500 font-20`}>
                        闪兑订单
                    </h2>
                </div>
                
                <div className={`flex items-center gap-4 my-4 ${styles.filterContainer}`}>
                    <Space size={16}>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                            className={styles.datePicker}
                            format="YYYY-MM-DD"
                            allowClear={true}
                            style={{ width: 280 }}
                        />
                        <Select
                            value={selectedCoin}
                            onChange={(value) => setSelectedCoin(value)}
                            className={styles.coinSelect}
                            style={{ width: 160 }}
                            options={coinList.filter((item:any) => item.isTradeConvert !== 0).map(item => ({
                                    value: item.coinName,
                                    label: item.coinName
                                }))
                            }
                        />
                    </Space>
                </div>

                <div className={`${styles.card_bgc5} radius-2  mt-3 `}>
                    {/* 充值 */}
                    <div className={`${styles.table_box} w-full `}>
                        <div className={`${styles.table_box_inner} `}
                            style={{ minHeight: "75vh" }}>
                            <Table
                                columns={columns}
                                rowKey="id"
                                dataSource={data}
                                pagination={{
                                    ...pagination,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total) => `共 ${total} 条`,
                                    pageSizeOptions: ['10', '20', '50', '100'],
                                }}
                                loading={loading}
                                onChange={handleTableChange}
                                scroll={{ x: 'max-content' }}
                            />
                        </div>
                    </div>
                </div>

            </ConfigProvider >
        </div >
    );
};

export default withSpotLayout(FlashOrderPage);


export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'en', ['spot','common'])),
        },
    };
};