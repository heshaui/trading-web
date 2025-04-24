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
import { getOrderList,getExchangeCoinList } from '@/services/spot'
import { toast } from 'sonner';
import { division,nul } from '@/utils';


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
interface symbolSelectType {
  label: string,
  value: string,
  baseSymbol: string,
  coinSymbol: string
}
interface SelectParamType {
  startTime: number|string;
  endTime: number|string;
  direction: string;
  type: string;
  symbol: string;
  notStatus:string|number;
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
  const selectParam = useRef<SelectParamType>({
    startTime: '',
    endTime: '',
    direction:'',
    type:'',
    symbol:'',
    notStatus:''
  })
  const [initTableData, setInitTableData] = useState<DataType[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [childDeviceNoData, setChildDeviceNoData] = useState<DataLogsType[]>([]);
  const [loading, setLoading] = useState(false);
  const [symbolSelect, setSymbolSelect] = useState<symbolSelectType[]>([]);



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
            <span>{`${record.tradedAmount}/${_amount}`}</span>
            <span className={`${styles.tip_color2}`}>
              {record.tradedAmount&&record.tradedAmount.toString() !== '0' ? `${nul(division(record.tradedAmount, _amount),100)}%` : '0%'}
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
  const directionSelect: { label: string, value: string | number }[] = [
    // {
    //   label: t('spot.select.all'),
    //   value: ''
    // },
    {
      label: t('spot.modal.buy'),
      value: 0
    },
    {
      label: t('spot.modal.sell'),
      value: 1
    }
  ]
  const typeSelect: { label: string, value: string | number }[] = [
    {
      label: t('spot.select.market'),
      value: 0
    },
    {
      label: t('spot.select.limit'),
      value: 1
    }
  ]

  const pageChange = async (page: number, pageSize: number) => {
    // const pageData = {
    //   page: page,
    //   pageSize: pageSize
    // }
    // setPageParam(pageData)
    paramdataRef.current.page = page
    paramdataRef.current.pageSize = pageSize
    await getOrderListData()
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
  // 时间选择
  const dateChange = async(value: any) => {
   
    const startTime =value? dayjs(value[0]).valueOf():''
    const endTime = value? dayjs(value[1]).valueOf():''
    selectParam.current.startTime = startTime
    selectParam.current.endTime = endTime
    await getOrderListData()
  }

  const getOrderListData = async () => {
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      orderType: 1,
      notStatus:  selectParam.current.notStatus?'3':null,
      coinSymbol: selectParam.current.symbol?`${selectParam.current.symbol.split('/')[0]}`:null,
      baseSymbol: selectParam.current.symbol?`${selectParam.current.symbol.split('/')[1]}`:null,
      startTime: selectParam.current.startTime?dayjs(selectParam.current.startTime).valueOf():null,
      endTime: selectParam.current.endTime?dayjs(selectParam.current.endTime).valueOf():null,
      direction: selectParam.current.direction||selectParam.current.direction?.toString()==='0'?selectParam.current.direction:null,
      type: selectParam.current.type||selectParam.current.type?.toString()==='0'?selectParam.current.type:null,

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
  const getCoinList = async () => {
    const res = await getExchangeCoinList();
    if (res.code === '0') {
      const selectData = res.data.map((item: any) => {
        return {
          label: `${item.coinSymbol}/${item.baseSymbol}`,
          value: `${item.coinSymbol}/${item.baseSymbol}`,
          baseSymbol: item.baseSymbol,
          coinSymbol: item.coinSymbol,
          tenantId: item.tenantId
        }
      })
      setSymbolSelect(selectData)
    }

  }

  useEffect(() => {
    getCoinList()
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
                onChange={dateChange}
              />
            </Form.Item>

            <Form.Item name="type" >
              <Select allowClear
                placeholder={t('spot.select.all')}
                options={typeSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.type')}</span>}
                onChange={(value)=>{
                  selectParam.current.type = value
                  getOrderListData()
                }}
              />
            </Form.Item>
            <Form.Item name="direction" >
              <Select allowClear
                placeholder={t('spot.select.all')}
                options={directionSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.direction')}</span>}
                onChange={(value)=>{
                  selectParam.current.direction = value
                  getOrderListData()
                }}
              />
            </Form.Item>
            <Form.Item name="symbol" >
              <Select allowClear
                placeholder={t('spot.select.all')}
                options={symbolSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.symbol')}</span>}
                onChange={(value)=>{
                  selectParam.current.symbol = value
                  getOrderListData()
                }}
              />
            </Form.Item>
            <Form.Item name="hideAllCancel" >
              <Checkbox
                defaultChecked={false}
                className={` mt-8`}
                onChange={(e)=>{
                  console.log(e.target.checked, 123456789, 'value');
                  selectParam.current.notStatus = e.target.checked?'3':''
                  getOrderListData()
                }}
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
            scroll={{ x: "max-content" }}
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