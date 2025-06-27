import React from 'react';
import { withSpotLayout } from '@/components/sidebarLayout/SpotLayout/userSpotLayout';
import { ConfigProvider, Table, Tag, DatePicker, Select, Space, Button, Image } from 'antd';
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
import { NoData } from '@/components/noData';
import type { GetStaticProps } from 'next';
import { Iconify } from "@/components/icon"
import { getRate, getCoinRate, getCoinRound } from '@/utils/getUseRate';


interface TransactionRecord {
    id: string;
    tradeDate: string;
    sendCoin: string;
    receiveCoin: string;
    tradingPair: string;
    sendAmount: number;
    receivedAmount: number;
    price: string;
    createTime: string;
    settlementTime: string;
    status: '0' | '1' | '2' | '3';
}

const FlashOrderPage = () => {
    const { t } = useTranslation(['flash', 'spot', 'common']);
    const { isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TransactionRecord[]>([]);
    const [coinList, setCoinList] = useState<{ coinName: string, coinCode: string }[]>([]);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
        dayjs().subtract(7, 'day'),
        dayjs()
    ]);
    const [selectedCoin, setSelectedCoin] = useState<string>('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [configData, setConfigData] = useState<any>({});
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const { RangePicker } = DatePicker;

    const router = useRouter();

    // 获取列表数据 - 使用useCallback进行优化
    const getList = useCallback(async (page: number, pageSize: number) => {
        setLoading(true);
        try {
            // 构建请求参数
            const params: any = {
                pageNo: page,
                pageSize: pageSize,
            };

            // 添加日期筛选参数
            if (dateRange[0] && dateRange[1]) {
                params.startTime = dayjs(dateRange[0]).startOf('day').valueOf();
                params.endTime = dayjs(dateRange[1]).endOf('day').valueOf();
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
            if (response.code === '0' && Array.isArray(response.data)) {
                setCoinList(response.data);
            } else {
            }
        } catch (error) {
            console.error('获取币种列表失败:', error);

        }
    }, [t]);

    // 获取闪兑配置 - 使用useCallback进行优化
    const fetchFlashConfig = useCallback(async () => {
        try {
            const config = await appStore.loadFlashConfig();
            setConfigData(config);
        } catch (error) {
            console.error('获取闪兑配置失败:', error);
        }
    }, []);

    // // 初始化数据和币种列表
    useEffect(() => {
        const { current, pageSize } = pagination;
        getList(current, pageSize);
        fetchCoinList();
        fetchFlashConfig();

        // 获取用户认证状态
        const userInfo = localStorage.getItem('imbit_userInfo');
        if (userInfo) {
            const parsedInfo = JSON.parse(userInfo);
            setIsAuth(parsedInfo.realnessStatus === 1);
        }
    }, []);

    // 当筛选条件变化时重置分页并重新获取数据
    // 使用useEffect监听过滤条件的变化
    useEffect(() => {
        // 当日期范围或币种选择变化时
        if (isLoggedIn) {
            // 重置分页到第1页
            setPagination(prev => ({
                ...prev,
                current: 1
            }));
            // 重新加载数据，使用新的筛选条件
            getList(1, pagination.pageSize);
        }
    }, [dateRange, selectedCoin, isLoggedIn, getList, pagination.pageSize]);

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
        getList(newPagination.current || 1, newPagination.pageSize || 10);

    };
    const columns: ColumnsType<TransactionRecord> = [
        {
            title: t('order.table.tradeDate'),
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
            render: (text, record) => {
                return dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss');
            },
        },
        {
            title: t('order.table.tradingPair'),
            align: 'center',
            render: (text, record) => {
                if (record.sendCoin && record.receiveCoin) {
                    return record.sendCoin + '/' + record.receiveCoin
                } else {
                    return '-'
                }

            }

        },
        {
            title: t('order.table.pay'),
            dataIndex: 'sendAmount',
            key: 'sendAmount',
            align: 'center',
            render: (text, record) => {
                return record.sendAmount + ' ' + record.sendCoin
            }
        },
        {
            title: t('order.table.receive'),
            dataIndex: 'receivedAmount',
            key: 'receivedAmount',
            align: 'center',
            render: (text, record) => {
                return record.receivedAmount + ' ' + record.receiveCoin
            }
        },
        {
            title: t('order.table.price'),
            dataIndex: 'price',
            key: 'price',
            align: 'center',
            render: (text, record) => {
                return <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-1'>
                        <span>1</span>
                        <span>{record.sendCoin}</span>
                        <span>=</span>
                        <span>{record.price}</span>
                        <span>{record.receiveCoin}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <span>{1}</span>
                        <span>{record.receiveCoin}</span>
                        <span>=</span>
                        <span>{record.price ? getCoinRound(record.sendCoin, 1/Number(record.price)) : '-'}</span>
                        <span>{record.sendCoin}</span>
                    </div>
                </div>
            }
        },
        {
            title: t('order.table.settlementDate'),
            dataIndex: 'settlementTime',
            key: 'settlementTime',  
            align: 'center',
            render: (text, record) => {
                return dayjs(record.settlementTime).format('YYYY-MM-DD HH:mm:ss');
            },
        },
        {
            title: t('order.table.status'),
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (text, record) => {
                if (record.status === '0') {
                    return t('order.status.processing')
                } else if (record.status === '3') {
                    return t('order.status.success')
                } else if (record.status === '2') {
                    return t('order.status.failed')
                } else if (record.status === '1') {
                    return t('order.status.processing')
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
                            headerBg: "transparent",
                        headerColor: "var(--text-color6)",
                        headerSplitColor: "transparent", // 表头分割线颜色
                        rowExpandedBg: "var(--background6)", // 表格行展开背景色
                        borderColor: "transparent",
                        // stickyScrollBarBg:"transparent",
                        headerBorderRadius: 0, // 表头圆角
                        fontSize: 13,
                        },
                        Select: {

                          },
                          DatePicker: {
                            activeBg: "var(--background6)",
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
                <div className='flex justify-between align-center mb-3'>
                    <h2 className={`font-w-500 font-20`}>
                        {t('order.title')}
                    </h2>
                </div>

                <div className='radius-2' style={{ backgroundColor: 'var(--background6)' }}>


                    <div className={`flex items-center gap-4 ${styles.header_box}`} style={{ padding: '25px 20px',backgroundColor: 'var(--background7)',borderTopLeftRadius:'8px',borderTopRightRadius:'8px' }}>
                        <Space size={16} >

                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                                className={styles.datePicker}
                                format="YYYY-MM-DD"
                                allowClear={false}
                                style={{ width: 280,height:'50px' }}
                                suffixIcon={<Iconify icon="cuida:calendar-outline"
                                    className={`${styles.title_color}`} size={20} />}
                                disabledDate={(current) => {
                                    // 禁用6个月之前的日期和未来日期
                                    const sixMonthsAgo = dayjs().subtract(6, 'month').startOf('day');
                                    const today = dayjs().endOf('day');
                                    return current && (current.isBefore(sixMonthsAgo) || current.isAfter(today));
                                }}
                            />
                            <Select
                                value={selectedCoin}
                                onChange={(value) => setSelectedCoin(value)}
                                className={styles.coinSelect}
                                style={{ width: 160 ,height:'50px'}}
                                placeholder={t('all')}
                                options={[
                                    { value: '', label: t('all') },
                                    ...coinList.filter((item: any) => item.isTradeConvert !== 0).map(item => ({
                                        value: item.coinName,
                                        label: item.coinName
                                    }))
                                ]}
                            />
                        </Space>
                    </div>
                                
                    <div className={`${styles.card_bgc5} `} style={{borderBottomLeftRadius:'8px',borderBottomRightRadius:'8px'}}>
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
                                        showSizeChanger: false,
                                        showQuickJumper: false,
                                        pageSizeOptions: ['10', '20', '50', '100'],
                                    }}
                                   
                                    loading={loading}
                                    onChange={handleTableChange}
                                    locale={{
                                        emptyText: (
                                            <NoData
                                                title={t('order.noData.title')}
                                                textColor="#A4A5AC"
                                                height="45vh"
                                                url="/flash"
                                                urlText={t('order.noData.buttonText')}
                                                buttonClick={() => router.push('/flash')}
                                            />
                                        )
                                    }}
                                />
                            </div>
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
            ...(await serverSideTranslations(locale || 'en', ['flash', 'spot', 'common'])),
        },
    };
};