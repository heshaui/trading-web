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
    status: '0' | '1' | '2'|'3';
}

const FlashOrderPage = () => {
    const { t } = useTranslation(['flash', 'spot', 'common']);
    const { isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TransactionRecord[]>([]);
    const [coinList, setCoinList] = useState<{coinName: string, coinCode: string}[]>([]);
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
            if (response.code === '0'&& Array.isArray(response.data)) {
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
            render: (text, record) => {
                return dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss');
            },
        },
        {
            title: t('order.table.tradingPair'),
            render:(text,record)=>{
                if(record.sendCoin&&record.receiveCoin){
                    return record.sendCoin+'/'+record.receiveCoin
                }else{
                    return '-'
                }
                
            }

        },
        {
            title: t('order.table.pay'),
            dataIndex: 'sendAmount',
            key: 'sendAmount',
            render: (text, record) => {
                return record.sendAmount + ' ' + record.sendCoin
            }
        },
        {
            title: t('order.table.receive'),
            dataIndex: 'receivedAmount',
            key: 'receivedAmount',
            render: (text, record) => {
                return record.receivedAmount + ' ' + record.receiveCoin
            }
        },
        {
            title: t('order.table.price'),
            dataIndex: 'price', 
            key: 'price',
            render: (text, record) => {
                return  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-1'>
                        <span>1</span>
                        <span>{record.sendCoin}</span>
                        <span>=</span>
                        <span>{record.price}</span>
                        <span>{record.receiveCoin}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <span>{record.price}</span>
                        <span>{record.receiveCoin}</span>
                        <span>=</span>
                        <span>1</span>
                        <span>{record.sendCoin}</span>
                    </div>
                </div>
            }
        },
        {
            title: t('order.table.settlementDate'),
            dataIndex: 'settlementTime',
            key: 'settlementTime',
            render: (text, record) => {
                return dayjs(record.settlementTime).format('YYYY-MM-DD HH:mm:ss');
            },
        },
        {
            title: t('order.table.status'),
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                if(record.status === '0') {
                    return t('order.status.processing')
                } else if(record.status === '3') {
                    return t('order.status.success')
                } else if(record.status === '2') {
                    return t('order.status.failed')
                } else if(record.status === '1') {
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
                            headerBg: 'var(--background10)',
                            headerColor: 'var(--text-color6)',
                            headerSplitColor: 'transparent',
                            rowHoverBg: 'var(--background10)',
                            borderColor: 'transparent',
                            headerBorderRadius: 0,
                            headerSortActiveBg: 'var(--background10)',
                            headerSortHoverBg: 'var(--background10)',
                            bodySortBg: 'transparent',
                            rowExpandedBg: 'transparent',
                            expandIconBg: 'transparent',
                            fixedHeaderSortActiveBg: 'transparent',
                            cellPaddingBlock: 16,
                            cellPaddingInline: 16,
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
                        {t('order.title')}
                    </h2>
                </div>
                
                {/* 实名认证提醒 */}
                {/* {configData?.realNameRequired && !isAuth && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        padding: '15px',
                        margin: '16px 0',
                        width: '100%'
                    }}>
                        <Image src='/images/flash/identy.png' width={80} height={74} alt="" preview={false} />
                        <div style={{ flex: 1, marginLeft: '15px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{t('authNotice.title')}</div>
                            <div style={{ color: '#666', fontSize: '14px' }}>{t('authNotice.description')}</div>
                        </div>
                        <Button type="primary" shape="round" onClick={() => router.push('/userCenter/identity')}>
                            {t('authNotice.button')}
                        </Button>
                    </div>
                )} */}
                
                <div className={`flex items-center gap-4 my-4 ${styles.filterContainer}`}>
                    <Space size={16}>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                            className={styles.datePicker}
                            format="YYYY-MM-DD"
                            allowClear={false}
                            style={{ width: 280 }}
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
                                    showTotal: (total) => t('order.pagination.total', { total }),
                                    pageSizeOptions: ['10', '20', '50', '100'],
                                }}
                                loading={loading}
                                onChange={handleTableChange}
                                scroll={{ x: 'max-content' }}
                                bordered={false}
                                showHeader={true}
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

            </ConfigProvider >
        </div >
    );
};

export default withSpotLayout(FlashOrderPage);


export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale || 'en', ['flash','spot','common'])),
        },
    };
};