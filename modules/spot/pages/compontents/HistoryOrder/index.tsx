import React from 'react';
import styles from '../styles/now.module.css'
import { Checkbox, ConfigProvider, Table, Select, Form, DatePicker } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NoData } from '@/components/noData'
import { getOrderList } from '@/services/spot'
import { toast } from 'sonner';
import { division } from '@/utils';


const { RangePicker } = DatePicker;
interface DataLogsType {
  id: number,
  orderId: string,
  amount: number,
  baseSymbol: string,
  canceledTime: number,
  coinSymbol: string,
  completedTime: number,
  direction: number,
  userId: number,
  price: number,
  status: number,
  symbol: string,
  createTime: number,
  updateTime: number,
  tradedAmount: number,
  turnover: number,
  type: number,
  useDiscount: number,
  orderResource: number,
  tenantId: string,
  fee: number,
  baseSymbolCount: number
}
interface DataType {
  id: number,
  orderId: string,
  amount: number,
  baseSymbol: string,
  canceledTime: number,
  coinSymbol: string,
  completedTime: number,
  direction: number,
  userId: number,
  price: number,
  status: number,
  symbol: string,
  createTime: number,
  updateTime: number,
  tradedAmount: number,
  turnover: number,
  type: number,
  useDiscount: number,
  orderResource: number,
  tenantId: string,
  fee: number,
  baseSymbolCount: number
  userLoginLogs: DataLogsType[]
}
const SpotMainPage = () => {
  const { t } = useTranslation(['spot']);
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState<DataType[]>([]);
  const router = useRouter();
  const [paramInfo, sePparamInfo] = useState({
    type: '',
    selsect: ''
  });
  const [total, setTotal] = useState(0);
  // const [pageParam, setPageParam] = useState({
  //   page: 1,
  //   pageSize: 10,
  // })
  const paramdataRef = useRef({
    page: 1,
    pageSize: 10,
  });
  const [initTableData, setInitTableData] = useState<DataType[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [childDeviceNoData, setChildDeviceNoData] = useState<DataLogsType[]>([]);
  const [loading, setLoading] = useState(false);


  const columns: ColumnsType<DataType> = [
    {
      title: t('spot.columns.date'), //"日期",
      dataIndex: "createTime",
      key: "createTime",
      width: 158,
      align: "left",
      render: (text, record) => {

        return <div className='flex-row align-start'>
          <Iconify icon={expandedRowKeys.includes(record.orderId) ? "mingcute:up-fill"
            : "mingcute:down-fill"}
            style={{ color: "var(--text-color4)" }}
            className='mr-2'
            size={16}
          />
          <span>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}`}</span>
        </div>
      },
    },
    {
      title: t('spot.columns.symbol'), //"交易对",
      dataIndex: "symbol",
      key: "symbol",
      align: "center",
      width: 128,
      render: (_text, record) => <span className={`${record.status === 2 ? styles.error_icon : ''}`}>{_text || '--'}</span>,
    },
    {
      title: t('spot.columns.direction'), //"方向",
      dataIndex: "direction",
      key: "direction",
      align: "center",
      width: 158,
      render: (_status) => {
        let text
        if (_status === 0) {
          text = t('spot.trade.buy')
          return <span className={`${styles.success_icon}`} >{text || '--'}</span>;
        } else if (_status === 1) {
          text = t('spot.trade.sell')
          return <span className={`${styles.error_icon}`} >{text || '--'}</span>;
        } else {
          return '--'
        }
        // return <span >{text || '--'}</span>;

      },
    },
    {
      title: t('spot.columns.averagePrice'), //"成交均价",
      dataIndex: "tokenTime",
      key: "tokenTime",
      align: "center",
      width: 158,
      render: (_status, record) => {
        if (record.status === 0 || record.status === 1) {
          return <span >{_status || '--'}</span>;
        } else {
          return <span >--</span>;
        }

      },
    },
    {
      title: t('spot.columns.price'), //"价格",
      key: "price",
      dataIndex: "price",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: t('spot.columns.tradedAmount'), //'委托量/已完成',  
      key: "amount",
      dataIndex: "amount",
      width: 128,
      align: "center",
      render: (_amount, record) => {
        return < div className='flex-x-cc'>
          {_amount ? <div className='flex-y align-center'>
            <span>{`${_amount}/${record.tradedAmount}`}</span>
            <span className={`${styles.tip_color2}`}>
              {record.tradedAmount ? division(_amount, record.tradedAmount) : '0%'}
            </span>

          </div>
            : '0'
          }
        </div >
      },
    },

    {
      title: t('spot.columns.amount2'), //"成交金额",
      key: "turnover",
      dataIndex: "turnover",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '0'}</span>;
      },
    },
    {
      title: t('spot.columns.status'), //"状态",
      key: "status",
      dataIndex: "status",
      width: 128,
      align: "center",
      render: (_status) => {
        if (_status === 0) {
          return <span >{t('spot.select.trading') || '--'}</span>;
        } else if (_status === 1) {
          return <span >{t('spot.select.completed') || '--'}</span>;
        } else if (_status === 2) {
          return <span >{t('spot.select.failed') || '--'}</span>;
        } else if (_status === 3) {
          return <span >{t('spot.select.canceled') || '--'}</span>;
        } else if (_status === 4) {
          return <span >{t('spot.select.created') || '--'}</span>;
        } else if (_status === 5) {
          return <span >{t('spot.select.partial') || '--'}</span>;
        } else if (_status === 6) {
          return <span >{t('spot.select.canceled2') || '--'}</span>;
        }
      },
    },


  ];
  const columns2: ColumnsType<DataLogsType> = [
    {
      title: '成交时间',
      dataIndex: "completedTime",
      key: "completedTime",
      width: 158,
      align: "left",
      render: (text, record) => <div>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}`} </div>,
    },
    {
      title: "成交价",
      dataIndex: "token",
      key: "token",
      align: "center",
      width: 128,
      render: (_text) => <span>{_text || '--'}</span>,
    },
    {
      title: "成交数量",
      dataIndex: "tokenTime",
      key: "tokenTime",
      align: "center",
      width: 158,
      render: (_status) => {
        return <span >{_status || '--'}</span>;

      },
    },
    {
      title: "成交金额",
      key: "createTime",
      dataIndex: "createTime",
      width: 128,
      align: "center",
      render: (_ip) => {
        return <span >{_ip || '--'}</span>;
      },
    },
    {
      title: "手续费",
      dataIndex: "tokenTime",
      key: "tokenTime",
      align: "center",
      width: 158,
      render: (_status) => {
        return <span >{_status || '--'}</span>;

      },
    },
    {
      title: "角色",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    }
  ]
  const directionSelect: { label: string, value: string }[] = [
    {
      label: t('spot.select.all'),
      value: ''
    }
  ]
  const symbolSelect: { label: string, value: string }[] = [
    {
      label: t('spot.select.all'),
      value: ''
    }
  ]
  const pageChange = async (page: number, pageSize: number) => {
    const pageData = {
      page: page,
      pageSize: pageSize
    }
    // setPageParam(pageData)
    paramdataRef.current = pageData;
  }
    // 处理展开/折叠行的函数 - 展开时清除URL中的deviceId
    const handleExpand = (expanded: boolean, record: DataType) => {
      console.log(record.orderId, 12345, expanded);
  
      if (expanded) {
        // 设置展开的行
        setExpandedRowKeys([record.orderId]);
  
        // 设置子数据
        if (record.userLoginLogs && record.userLoginLogs.length > 0) {
          setChildDeviceNoData(record.userLoginLogs);
        } else {
          setChildDeviceNoData([]);
        }
  
        // // 如果URL中有deviceId参数，则清除它
        // if (router.query.deviceId) {
        //   const { deviceId, ...restQuery } = router.query;
        //   router.replace({
        //     pathname: router.pathname,
        //     query: restQuery
        //   }, undefined, { shallow: true });
        // }
      } else {
        // 清空展开行
        setExpandedRowKeys([]);
        setChildDeviceNoData([]);
      }
    };
  const topUpTypeChange = (value: any, options: any) => {
    console.log(value, 123, options);


  }

  const getOrderListData = async () => {
    // const notStatusArr = [];
    // if (selectParam.current.hideOther) {
    //     notStatusArr.push(`${currentPair?.coinSymbol}`, `${currentPair?.baseSymbol}`);
    // }
    // if (selectParam.current.hideCancel) {
    //     notStatusArr.push('3');
    // }
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      orderType: 1,
      // notStatus:  selectParam.current.hideCancel?'3':'',
      // coinSymbol: selectParam.current.hideOther?`${currentPair?.coinSymbol}`:'',
      // baseSymbol: selectParam.current.hideOther?`${currentPair?.baseSymbol}`:'',
      // startTime: selectParam.current.startTime?dayjs(selectParam.current.startTime).valueOf():'',
      // endTime: selectParam.current.endTime?dayjs(selectParam.current.endTime).valueOf():'',

    }
    setLoading(true)
    try {
      const res = await getOrderList(params)
      if (res.code === '0') {
        const newData = res.data.list.map((item: any) => ({
          ...item,
          userLoginLogs: []
        }));
        setInitTableData(newData);
        setTableData(newData);
        setTotal(res.data.count);
      } else {
        toast.error(res.message);
      }

    } catch (error) {
      toast.error(String(error))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getOrderListData()
  }, [])
  return (<>
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
            // stickyScrollBarBg:"transparent",
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
          DatePicker: {
            activeBg: "var(--background7)",
          }
        },
      }}
    >
      {/* 充值 */}
      <div className={`${styles.table_box} w-full `}>
        <div className={`${styles.table_header} w-full mb-6 flex align-center px-6`}>
          <Form
            form={form}
            layout="inline"
            initialValues={{
              type: '',
              direction: '',
              symbol: ''
            }}
          >
            <Form.Item name="time" >
              <RangePicker
                className={`${styles.rangePicker_box} custom-range-picker mt-6`}
                suffixIcon={<Iconify icon="cuida:calendar-outline"
                  className={`${styles.title_color}`} size={20} />}
                placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
              />
            </Form.Item>

            <Form.Item name="type" >
              <Select allowClear
                placeholder={t('spot.select.type')}
                options={directionSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.type')}</span>}
              />
            </Form.Item>
            <Form.Item name="direction" >
              <Select allowClear
                placeholder={t('spot.select.direction')}
                options={directionSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.direction')}</span>}
              />
            </Form.Item>
            <Form.Item name="symbol" >
              <Select allowClear
                placeholder={t('spot.select.symbol')}
                options={symbolSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.symbol')}</span>}
              />
            </Form.Item>
            <Form.Item name="hideAllCancel" >
              <Checkbox
                defaultChecked={false}
                className={` mt-8`}
              >
                <span className={`${styles.title_color} font-14`}>
                {t('spot.select.hideAllCancel')}
                </span>
              </Checkbox>
            </Form.Item>
          </Form>
        </div>
        <div className={`${styles.table_content} w-full `}>

        <Table
            columns={columns}
            dataSource={tableData}
            size="large"
            className={`spot-table-box`}
            loading={loading}
            pagination={{
              position: ["bottomRight"],
              showSizeChanger: false,
              total: total,
              size: "default",
              simple: true,
              onChange: (page, pageSize) => pageChange(page, pageSize),
            }}
            // pagination={false}
            locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
            expandable={{
              expandedRowRender: (record) => {
                // 使用当前展开行的ID来确定是否显示子数据
                const isCurrentExpanded = expandedRowKeys.includes(record.orderId);


                return (
                  <div key={record.orderId}>
                    {isCurrentExpanded && record.userLoginLogs && record.userLoginLogs.length > 0 ? (
                      <Table
                        columns={columns2}
                        dataSource={record.userLoginLogs}
                        size="large"
                        scroll={{ x: "max-content" }}
                        // showHeader={false}
                        pagination={false}
                        className={`spot-table-box2 ${styles.rowExpanded_table_box}`}
                        // style={{ padding: 0 }}
                        rowKey="orderId"
                        locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
                      />
                    ) : (
                      <NoData textColor='#A4A5AC' />
                    )}
                  </div>
                );
              },
              fixed: 'right',
              expandRowByClick: true,
              showExpandColumn: false,
              onExpand: handleExpand,
              expandedRowKeys: expandedRowKeys
            }}
            rowKey="orderId"
          />


        </div>
      </div>
    </ConfigProvider>
  </>
  );
};

export default SpotMainPage;