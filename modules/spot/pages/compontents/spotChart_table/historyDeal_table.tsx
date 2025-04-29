import React from 'react';
import styles from '../styles/spotChartCom.module.css'
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
import { getOrderList,getOrderInfo } from '@/services/spot'
import { add, cut, division, lastD, roundDown,nul } from '@/utils'
import { toast } from 'sonner';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { ROUTER_KEY_SPOT } from '@/config/apiConfig'
// import { useCoinList } from '@/hooks/use-coinList';

const { RangePicker } = DatePicker;
interface DataType1 {
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
interface DataType{
  id: number,
  orderId: number,  
  tenantId: string,
  buyPrice: number,
  sellPrice: number,
  tradePrice: number,
  quantity: number,
  takerSide: number,
  buyFee: number,
  sellFee: number,
  ctime: string,
  mtime: string,
  symbol: string
}
interface SelectParamType {
  startTime: number | null;
  endTime: number | null;
  hideOther: boolean;
}
const SpotMainPage = observer(() => {
  const { t } = useTranslation(['spot']);
  const [form] = Form.useForm();
  // 获取币种列表
  // const { coinList } = useCoinList();
  const coinList = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表

  const [tableData, setTableData] = useState<DataType[]>([]);
  const [initTableData, setInitTableData] = useState<DataType[]>([]);
  const router = useRouter();
  const [paramInfo, sePparamInfo] = useState({
    type: '',
    selsect: ''
  });
  const [total, setTotal] = useState(0);
  const paramdataRef = useRef({
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const selectParam = useRef<SelectParamType>({
    startTime: null,
    endTime: null,
    hideOther: false,
  })
  const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];


  const columns1: ColumnsType<DataType1> = [
    {
      title: t('spot.columns.date'), //"日期",
      dataIndex: "completedTime",
      key: "completedTime",
      width: 200,
      align: "left",
      render: (text) => <div>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}`} </div>,
    },
    {
      title: t('spot.columns.symbol'), //"交易对",
      dataIndex: "symbol",
      key: "symbol",
      align: "center",
      width: 158,
      render: (_text, record) => <button type='button' className={`${record.status === 2 ? styles.error_icon : ''}`}
        onClick={() => {
          router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.symbol}`)
        }}
      >
        {_text || '--'}
        <Iconify icon="mingcute:right-line" className={`${record.status === 2 ? styles.error_icon : ''} mx-1`} size={20} />
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
      },
    },
    {
      title: t('spot.columns.price2'), //"成交价",
      dataIndex: "turnover",
      key: "turnover",
      align: "center",
      width: 158,
      render: (_status, record) => {
        const coin = coinList.find((item: any) => item.symbol === record.symbol);
        return <span >{_status  ? roundDown(_status, coin?.baseCoinScale) : '0'}</span>;

      },
    },

    {
      title: t('spot.columns.count'),  //"成交数量",
      key: "tradedAmount",
      dataIndex: "tradedAmount",
      width: 128,
      align: "center",
      render: (_status, record) => {
        // const coin = coinList.find((item: any) => item.coinName === record.symbol.split('/')[1]);
        const coin = coinList.find((item: any) => item.symbol === record.symbol);
        return <span >{_status ? roundDown(_status, coin?.baseCoinScale) : '0'}</span>;
      },
    },

    {
      title: t('spot.columns.amount2'), //"成交金额",
      key: "turnover",
      dataIndex: "turnover",
      width: 128,
      align: "center",
      render: (_status, record) => {
        // const coin = coinList.find((item: any) => item.coinName === record.symbol.split('/')[1]);
        const coin = coinList.find((item: any) => item.symbol === record.symbol);
        return <span >{_status ? roundDown(_status, coin?.baseCoinScale) : '0'}</span>;
      },
    },
    {
      title: t('spot.columns.fee'), //"手续费",
      key: "buyFee",
      dataIndex: "buyFee",
      width: 128,
      align: "center",
      render: (_status,record) => {
        // const fee=record.direction===0?record.buyFee:record.sellFee
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: t('spot.columns.role'), //"角色",
      key: "tenantId",
      dataIndex: "tenantId",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },


  ];
  const columns: ColumnsType<DataType> = [
    {
      title: t('spot.columns.date'), //"日期",
      dataIndex: "ctime",
      key: "ctime",
      width: 200,
      align: "left",
      render: (text) => <div>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}`} </div>,
    },
    {
      title: t('spot.columns.symbol'), //"交易对",
      dataIndex: "symbol",
      key: "symbol",
      align: "center",
      width: 158,
      render: (_text, record) => <button type='button' className={``}
        onClick={() => {
          router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.symbol}`)
        }}
      >
        {_text?`${_text.split('_').join('/')}` : '--'}
        <Iconify icon="mingcute:right-line" className={`mx-1`} size={20} />
      </button >,
    //   render: (_text, record) => <button type='button' className={`${record.status === 2 ? styles.error_icon : ''}`}
    //   onClick={() => {
    //     router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.symbol}`)
    //   }}
    // >
    //   {_text?`${_text.split('_').join('/')}` : '--'}
    //   <Iconify icon="mingcute:right-line" className={`${record.status === 2 ? styles.error_icon : ''} mx-1`} size={20} />
    // </button >,

    },
    {
      title: t('spot.columns.direction'), //"方向",
      dataIndex: "takerSide",
      key: "takerSide",
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
      },
    },
    {
      title: t('spot.columns.price2'), //"成交价",
      dataIndex: "tradePrice",
      key: "tradePrice",
      align: "center",
      width: 158,
      render: (_status, record) => {
        const coin = coinList.find((item: any) => item.symbol === record.symbol);
        const amount=nul(_status,record.quantity)
        return <span >{amount  ? roundDown(amount, coin?.baseCoinScale) : '0'}</span>;

      },
    },

    {
      title: t('spot.columns.count'),  //"成交数量",
      key: "quantity",
      dataIndex: "quantity",
      width: 128,
      align: "center",
      render: (_status, record) => {
        // const coin = coinList.find((item: any) => item.coinName === record.symbol.split('/')[1]);
        // const coin = coinList.find((item: any) => item.symbol === record.symbol);
        return <span >{_status ? _status : '0'}</span>;
      },
    },

    {
      title: t('spot.columns.amount2'), //"成交金额",
      key: "tradePrice",
      dataIndex: "tradePrice",
      width: 128,
      align: "center",
      render: (_status, record) => {
        // const coin = coinList.find((item: any) => item.coinName === record.symbol.split('/')[1]);
        const coin = coinList.find((item: any) => item.symbol === record.symbol);
        return <span >{_status ? roundDown(_status, coin?.baseCoinScale) : '0'}</span>;
      },
    },
    {
      title: t('spot.columns.fee'), //"手续费",
      key: "buyFee",
      dataIndex: "buyFee",
      width: 128,
      align: "center",
      render: (_status,record) => {
        const coin = coinList.find((item: any) => item.symbol === record.symbol);
        if(record.takerSide===0){
          return <span >{record.buyFee ? roundDown(record.buyFee, coin?.baseCoinScale) : '0'}</span>;
        }else if(record.takerSide===1){
          return <span >{record.sellFee ? roundDown(record.sellFee, coin?.baseCoinScale) : '0'}</span>;
        }else{
          return <span >{'--'}</span>;
        }
      },
    },
    {
      title: t('spot.columns.role'), //"角色",
      key: "takerSide",
      dataIndex: "takerSide",
      width: 128,
      align: "center",
      render: (_status) => {
        if(_status===0){
          return <span >{'Maker'}</span>;
        }else if(_status===1){
          return <span >{'Taker'}</span>;
        }else{
          return <span >{'--'}</span>;
        }
      },
    },


  ];
  const pageChange = async (page: number, pageSize: number) => {
    const pageData = {
      page: page,
      pageSize: pageSize
    }
    // setPageParam(pageData)
    paramdataRef.current = pageData;
    getOrderListData()
  }
  const getOrderListData1 = async () => {
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      orderType: 2,
      coinSymbol: selectParam.current.hideOther ? `${currentPair?.coinSymbol}` : null,
      baseSymbol: selectParam.current.hideOther ? `${currentPair?.baseSymbol}` : null,
      startTime: selectParam.current.startTime ? dayjs(selectParam.current.startTime).valueOf() : null,
      endTime: selectParam.current.endTime ? dayjs(selectParam.current.endTime).valueOf() : null,
    }
    setLoading(true)
    try {
      const res = await getOrderList(params)
      if (res.code === '0') {
        const newData = res.data.list.map((item: any) => ({
          ...item
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
  const getOrderListData = async () => {
    const params = {
      page: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      // orderId: "20250428000193",
      // orderType: 2,
      symbol: `${currentPair.symbol.split('/').join('_')}`,
      // symbol: `${currentPair.symbol.split('/').join('_')}_${currentPair.groupStatus}`,
      // startTime: selectParam.current.startTime ? dayjs(selectParam.current.startTime).valueOf() : null,
      // endTime: selectParam.current.endTime ? dayjs(selectParam.current.endTime).valueOf() : null,
    }
    setLoading(true)
    try {
      const res = await getOrderInfo(params)
      if (res.code === '0') {
        const newData = res.data?.records.map((item:any)=>({
          ...item,
          symbol:item.symbol.split('_').join('/')
        }))
        setInitTableData(newData);
        setTableData(newData);
        setTotal(res.data?.total);
      }
    } catch (error) {
      toast.error(String(error))
    } finally {
      setLoading(false)
    }
  }
    const selectParamChange = (type: string) => {
      if (loading) return toast.error('loading...')
      selectParam.current.hideOther = !selectParam.current.hideOther
      getOrderListData()
    }
    const dateChange = (value: any) => {

      const startTime = value ? dayjs(value[0]).valueOf() : null
      const endTime = value ? dayjs(value[1]).valueOf() : null
      // const startTime =value[0].value()
      // const endTime =  value[1].value()
      selectParam.current.startTime = startTime
      selectParam.current.endTime = endTime
      getOrderListData()
    }
    useEffect(() => {
      getOrderListData()
    }, [currentPair])
    return (<>
      <ConfigProvider
        theme={{
          components: {
            Table: {
              // bodySortBg: "pink",
              headerBg: "transparent",
              headerColor: "var(--text-color4)",
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
          token: {
            colorBgContainer: 'transparent',
          }
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
                  size='large'
                />
              </Form.Item>
              <div className={`${styles.table_header_checkbox3}`}>
                <Form.Item name="hideOther" >
                  <Checkbox
                    // checked={hideZero}
                    // onChange={hideZeroChange}
                    className='mt-7'
                  >
                    <span className={`${styles.title_color} font-14 font-w-400`}>{t('spot.select.hideOther')}</span>
                  </Checkbox>
                </Form.Item>
              </div>
            </Form>
          </div>
          <div className={`${styles.table_content} w-full `}>

            <Table
              columns={columns}
              dataSource={tableData}
              size="large"
              // scroll={{ x: "max-content", y: 300 }}
              scroll={{ x: "max-content" }}
              className={`spot-table-box`}
              pagination={{
                position: ["bottomRight"],
                // showSizeChanger: true,
                total: total,
                size: "default",
                simple: true,
                onChange: (page, pageSize) => pageChange(page, pageSize),
              }}
              loading={loading}
              locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
            />

          </div>
        </div>
      </ConfigProvider>
    </>
    );
  });

export default SpotMainPage;