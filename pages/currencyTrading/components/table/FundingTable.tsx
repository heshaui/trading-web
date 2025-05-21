import { Table, TableColumnsType, TableProps, ConfigProvider, Tag } from 'antd';
import PieChart from '../charts/PieChart';

import { BaseTableData } from '@/type/types';
import styles from '../../styles/table.module.css';

interface FundingTableProps<T extends BaseTableData> {
    columns: TableColumnsType<T>;
    tableData: T[];
    pieData?: { name: string; value: number; fill: string }[];
    exceptTable: boolean;
}

const FundingTable = <T extends BaseTableData>({ columns, tableData, pieData, exceptTable }: FundingTableProps<T>) => {
    const onChange: TableProps<T>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };
    // 处理表格盈亏数据
    
    return (
        <>
            {
                exceptTable ?
                    <>
                        <Tag color="#1F40FF">所有{tableData.length}</Tag>
                        <Tag color="#1F40FF">盈利{ }</Tag>
                        <Tag color="#1F40FF">亏损</Tag>
                    </> : <></>

            }

            <div className={styles.pieChart}>
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
                    <Table<T>
                        columns={columns}
                        dataSource={tableData}
                        onChange={onChange}
                        style={{ flex: '3' }}
                        showSorterTooltip={false}
                    />
                </ConfigProvider>
                {
                    exceptTable ?
                        <div className={styles.pieDiv}>
                            <div className={styles.pieChart}>
                                {/* <PieChart data={pieData} /> */}
                            </div>
                            <ul className={styles.ulPie}>
                                {pieData && pieData.map((item, index) => (
                                    <li key={index}>
                                        <div className={`${styles.colorBox} ${styles[item.fill]}`} style={{ backgroundColor: item.fill }}></div>
                                        <div className={styles.contentBox}>
                                            <span>{item.name}</span>
                                            <p>{item.value}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    : <></>
                }
            </div>
        </>
    );
}

export default FundingTable;