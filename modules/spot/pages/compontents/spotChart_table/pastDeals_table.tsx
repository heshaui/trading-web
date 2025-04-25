import React from 'react';
import styles from '../styles/spotChartCom.module.css'
import { Checkbox, ConfigProvider, Table, Select, Form, DatePicker, Segmented } from 'antd';
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
import { add, cut, division, lastD ,nul,roundDown} from '@/utils'
import { toast } from 'sonner';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { ROUTER_KEY_SPOT } from '@/config/apiConfig'
import { useCoinList } from '@/hooks/use-coinList';

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
interface SelectParamType {
  startTime: number | null;
  endTime: number | null;
  hideOther: boolean;
  hideCancel: boolean;
}
const SpotMainPage = observer(() => {
  const { t } = useTranslation(['spot']);
  const [form] = Form.useForm();
      // 获取币种列表
      const {coinList} = useCoinList();
  const [tableData, setTableData] = useState<DataType[]>([]);
  const [initTableData, setInitTableData] = useState<DataType[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [childDeviceNoData, setChildDeviceNoData] = useState<DataLogsType[]>([]);
  const router = useRouter();

  const [total, setTotal] = useState(0);
  const [pageParam, setPageParam] = useState({
    page: 1,
    pageSize: 10,
  })
  const [loading, setLoading] = useState(false);
  const paramdataRef = useRef(pageParam);
  const selectParam = useRef<SelectParamType>({
    startTime: null,
    endTime: null,
    hideOther: false,
    hideCancel: false,
  })
  const currentPair = appStore.getCurrentPair()|| appStore.currencyPairs[0];
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
      width: 148,
      render: (_text, record) => <button type='button' className={`${record.status === 1 ? styles.error_icon :record.status?.toString() === '0' ?styles.success_icon:''}`}
      onClick={(e)=>{
        e.stopPropagation(); // 阻止事件冒泡，防止触发行展开
        router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.symbol}`)
      }}
      >
        {_text || '--'}
        <Iconify icon="mingcute:right-line" className={`${record.status === 1 ? styles.error_icon : record.status?.toString() === '0' ? styles.success_icon : ''} mx-1`} size={20} />
      </button >,
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
            <span>{`${roundDown(_amount,2)}/${roundDown(record.tradedAmount,2)}`}</span>
            <span className={`${styles.tip_color2}`}>
              {record.tradedAmount&&record.tradedAmount.toString() !== '0' ? `${roundDown(nul(division(record.tradedAmount, _amount),100),2)}%` : '0%'}
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
      render: (_status,record) => {
        const coin = coinList.find((item: any) => item.coinName === record.symbol.split('/')[1]);
        return <span >{_status?roundDown(_status,coin?.unitScale) :'0'}</span>;
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


  ];

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
  const pageChange = async (page: number, pageSize: number) => {
    const pageData = {
      page: page,
      pageSize: pageSize
    }
    setPageParam(pageData)
    paramdataRef.current = pageData;
    getOrderListData()
  }
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
      notStatus:  selectParam.current.hideCancel?'3':null,
      coinSymbol: selectParam.current.hideOther?`${currentPair?.coinSymbol}`:null,
      baseSymbol: selectParam.current.hideOther?`${currentPair?.baseSymbol}`:null,
      startTime: selectParam.current.startTime?dayjs(selectParam.current.startTime).valueOf():null,
      endTime: selectParam.current.endTime?dayjs(selectParam.current.endTime).valueOf():null,

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
  const selectParamChange = (type: string) => {
    if (loading) return toast.error('loading...')
    if (type === '1') {
      selectParam.current.hideOther = !selectParam.current.hideOther
    } else if (type === '2') {
      selectParam.current.hideCancel = !selectParam.current.hideCancel

    }
    getOrderListData()
  }
  const dateChange = (value: any) => {
   
    const startTime =value? dayjs(value[0]).valueOf():null
    const endTime = value? dayjs(value[1]).valueOf():null
    // const startTime =value[0].value()
    // const endTime =  value[1].value()
    selectParam.current.startTime = startTime
    selectParam.current.endTime = endTime
    getOrderListData()
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
            headerColor: "var(--text-color4)",
            headerSplitColor: "transparent", // 表头分割线颜色
            // rowExpandedBg: "var(--background10)", // 表格行展开背景色
            rowExpandedBg: "transparent", // 表格行展开背景色
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
          DatePicker: {
            activeBg: "var(--background7)",
          },
          Segmented: {
            itemColor: "var(--text-color5)", //未选中颜色
            itemActiveBg: "transparent", //未选中背景色
            itemSelectedBg: "var(--theme-color)", //选中背景色
            itemSelectedColor: "#fff", //选中颜色
            trackBg: "transparent", //轨道背景色
            itemHoverBg: "transparent", //鼠标悬停背景色
            itemHoverColor: "var(--text-color5)",//鼠标悬停颜色
          }
        },
      }}
    >
      {/* 充值 */}
      <div className={`${styles.table_box} w-full `}>
        <div className={`${styles.table_header2} w-full mb-6 flex align-center px-6 flex-wrap`}>
          <button className={`default_btn mt-6 ${styles.btn_style} mr-10`}>限价 | 市价</button>
          <RangePicker
            className={`${styles.rangePicker_box} custom-range-picker mt-6 mr-6`}
            suffixIcon={<Iconify icon="cuida:calendar-outline"
              className={`${styles.title_color}`} size={20} />}
            placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
            onChange={dateChange}
          />
          <div className={`${styles.table_header_checkbox2}`}>
            <Checkbox
              className='mt-7'
              onChange={(e) => {

                selectParamChange('1')

              }}
              checked={selectParam.current.hideOther}
            >
              <span className={`${styles.title_color} font-14 font-w-400`}>{t('spot.select.hideOther')}</span>
            </Checkbox>
            <Checkbox
              className='mt-7'
              onChange={(e) => {
                selectParamChange('2')
              }}
              checked={selectParam.current.hideCancel}
            >
              <span className={`${styles.title_color} font-14 font-w-400`}>{t('spot.select.hideCancel')}</span>
            </Checkbox>
          </div>
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
              // showSizeChanger: true,
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
});

export default SpotMainPage;