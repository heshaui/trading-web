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
    status: 'success' | 'processing' | 'failed';
}

const statusMap = {
    success: { text: '成功', color: '#00B42A' },
    processing: { text: '处理中', color: '#FF7D00' },
    failed: { text: '失败', color: '#F53F3F' },
};
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
                params.startTime = dateRange[0].format('YYYY-MM-DD');
                params.endTime = dateRange[1].format('YYYY-MM-DD');
            }
            
            // 添加币种筛选参数
            if (selectedCoin && selectedCoin !== 'all') {
                params.coinCode = selectedCoin;
            }
            
            const response = await records(params);
            if (response.code === '0') {
                setData(response.data.records);
                setPagination(prev => ({ 
                    ...prev,
                    total: response.data.count,
                }));
            } else {
                appStore.showError(response.msg);
            }
        } catch (error) {
            appStore.showError(t('common.error'));
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
                appStore.showError(response.msg || t('common.error'));
            }
        } catch (error) {
            console.error('获取币种列表失败:', error);
            appStore.showError(t('common.error'));
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
            ...newPagination,
        });
    };
    const columns: ColumnsType<TransactionRecord> = [
        {
            title: '交易日期',
            dataIndex: 'tradeDate',
            key: 'tradeDate',
            sorter: (a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime(),
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '交易对',
            dataIndex: 'tradingPair',
            key: 'tradingPair',
        },
        {
            title: '支付',
            dataIndex: 'payment',
            key: 'payment',
            render: (payment) => (
                <span>{payment.amount} {payment.currency}</span>
            ),
        },
        {
            title: '获得',
            dataIndex: 'received',
            key: 'received'
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price'
        },
        {
            title: '结算日期',
            dataIndex: 'settlementDate',
            key: 'settlementDate',
            sorter: (a, b) => new Date(a.settlementDate).getTime() - new Date(b.settlementDate).getTime(),
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status'
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
                            itemLink: 'var(--text-color5)',
                            itemActiveColor: 'var(--primary-color)',
                            itemHoverBg: 'var(--background10)',
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
                            options={coinList.filter(item => item.isTradeConvert !== 0).map(item => ({
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