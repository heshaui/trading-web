import { Table } from 'antd';
import { TableColumnsType, TableProps, ConfigProvider } from 'antd';
import {
    RightOutlined,
} from '@ant-design/icons';

import TableItem from './TableItem';
import styles from '../../styles/table.module.css';


interface DataType {
    key: React.Key;
    currency: React.ReactNode;
    quantityHeld: number;
    convertedToUSDT: number;
    todayPLUSDT: number;
    availableOrFrozen: number;
    lockPosition: number;
    dailyVariation: number;
    currencyPriceTrend: React.ReactNode;
}

const FundingTable: React.FC = () => {

    const columns: TableColumnsType<DataType> = [
        {
            title: '币种',
            dataIndex: 'currency',
        },
        {
            title: '持有数量',
            dataIndex: 'quantityHeld',
            sorter: {
                compare: (a, b) => a.quantityHeld - b.quantityHeld,
                multiple: 3,
            },
        },
        {
            title: '折合USDT',
            dataIndex: 'convertedToUSDT',
            sorter: {
                compare: (a, b) => a.convertedToUSDT - b.convertedToUSDT,
                multiple: 2,
            },
        },
        {
            title: '今日盈亏USDT',
            dataIndex: 'todayPLUSDT',
            sorter: {
                compare: (a, b) => a.todayPLUSDT - b.todayPLUSDT,
                multiple: 1,
            },
        },
        {
            title: '可用/冻结',
            dataIndex: 'availableOrFrozen',
            sorter: {
                compare: (a, b) => a.availableOrFrozen - b.availableOrFrozen,
                multiple: 1,
            },
        },
        {
            title: '锁仓',
            dataIndex: 'lockPosition',
            sorter: {
                compare: (a, b) => a.availableOrFrozen - b.availableOrFrozen,
                multiple: 1,
            },
        },
        {
            title: '日变化',
            dataIndex: 'dailyVariation',
            sorter: {
                compare: (a, b) => a.dailyVariation - b.dailyVariation,
                multiple: 1,
            },
        },
        {
            title: '持币价格走势',
            dataIndex: 'currencyPriceTrend',
        },
        {
            title: '操作',
            dataIndex: '',
            key: 'x',
            render: () => {
                return (
                    <div className={styles.controlsBox} style={{ display: 'flex', fontSize: '14px' }}>
                        <a className={styles.controls} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '36px',
                            backgroundColor: '#1F40FF',
                            color: '#FFFFFF',
                            width: '80px',
                            height: '32px',
                            fontSize: '14px',
                            marginRight: '11px'
                        }}>
                            划转
                        </a>
                        <a className={styles.controls} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '36px',
                            backgroundColor: '#1F40FF',
                            color: '#FFFFFF',
                            width: '80px',
                            height: '32px',
                            fontSize: '14px'
                        }}>
                            去交易
                            <RightOutlined />
                        </a>
                    </div>
                )
            },
        },
    ];

    const data: DataType[] = [
        {
            key: '1',
            currency: <TableItem currency='USDT' imgSrc='/images/currency_trading/USDT.png' />,
            quantityHeld: 98,
            convertedToUSDT: 60,
            todayPLUSDT: 700,
            availableOrFrozen: 90,
            lockPosition: 0,
            dailyVariation: 1234,
            currencyPriceTrend: <div>changes</div>,
        },
        {
            key: '2',
            currency: <TableItem currency='BTC' imgSrc='/images/currency_trading/BTC.png' />,
            quantityHeld: 108,
            convertedToUSDT: 50,
            todayPLUSDT: 170,
            availableOrFrozen: 90,
            lockPosition: 0,
            dailyVariation: 1234,
            currencyPriceTrend: <div>changes</div>,
        },
        {
            key: '3',
            currency: <TableItem currency='BTC' imgSrc='/images/currency_trading/BTC.png' />,
            quantityHeld: 88,
            convertedToUSDT: 90,
            todayPLUSDT: 970,
            availableOrFrozen: 90,
            lockPosition: 0,
            dailyVariation: 1234,
            currencyPriceTrend: <div>changes</div>,
        },
    ];

    const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        headerColor: '#A4A5AC',
                        rowHoverBg: '#242738',
                        cellFontSize: 12
                    },
                },
                token: {
                    colorBgContainer: '#1A1F39',
                }
            }}
        >
            <Table<DataType>
                columns={columns}
                dataSource={data}
                onChange={onChange}
            />
        </ConfigProvider>
    );
}

export default FundingTable;