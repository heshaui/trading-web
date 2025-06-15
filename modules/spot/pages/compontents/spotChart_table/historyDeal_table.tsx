import React from 'react';
import styles from '../styles/spotChartCom.module.css'
import { Checkbox, ConfigProvider, Table, Pagination, Form, DatePicker } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NoData } from '@/components/noData'
import { getOrderList, getOrderInfo } from '@/services/spot'
import { add, cut, division, lastD, roundDown, nul } from '@/utils'
import { getRound } from '@/utils/getUseRate'
import { toast } from 'sonner';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { ROUTER_KEY_SPOT } from '@/config/apiConfig'
import type { DatePickerProps } from 'antd';
import type { Dayjs } from 'dayjs';

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
interface DataType {
  id: number,
  tenantId: string,
  buyOrderId: number,
  sellOrderId: number,
  buyerUserId: number,
  sellerUserId: number,
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
  const userInfo = appStore.getUserInfo()
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
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const selectParam = useRef<SelectParamType>({
    startTime: dayjs().subtract(6, 'day').startOf('day').valueOf(),
    endTime: dayjs().endOf('day').valueOf(),
    hideOther: false,
  })
  const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];

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
      render: (_text, record) => {
        const flag = orderDirection(record.takerSide, record.buyerUserId, record.sellerUserId)
        return <button type='button' className={`${flag === 0 ? styles.success_hover : flag === 1 ? styles.error_hover : ''}`}
          onClick={() => {
            router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.symbol}`)
          }}
        >
        {_text ? `${_text.split('_').join('/')}` : '--'}
        <Iconify icon="mingcute:right-line" className={`mx-1 ${flag === 0 ? styles.success_hover : flag === 1 ? styles.error_hover : ''}`} size={20} />
      </button >
      },
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
      render: (_status, record) => {
        const flag = orderDirection(record.takerSide, record.buyerUserId, record.sellerUserId)
        let text
        if (flag === 0) {
          text = t('spot.trade.buy')
          return <span className={`${styles.success_icon}`} >{text || '--'}</span>;
        } else if (flag === 1) {
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
        // const amount = division(_status, record.quantity)
        // const { baseScaleResult } = getRound(record.symbol, amount)
        const { baseScaleResult } = getRound(record.symbol, _status)
        return <span >{_status ? baseScaleResult : '0'}</span>;

      },
    },

    {
      title: t('spot.columns.count'),  //"成交数量",
      key: "quantity",
      dataIndex: "quantity",
      width: 128,
      align: "center",
      render: (_status, record) => {
        const { scaleResult } = getRound(record.symbol, _status)
        return <span >{_status ? scaleResult : '0'}</span>;
      },
    },

    {
      title: t('spot.columns.amount2'), //"成交金额",
      key: "tradePrice",
      dataIndex: "tradePrice",
      width: 128,
      align: "center",
      render: (_status, record) => {
        const amount = nul(_status, record.quantity)
        const { baseScaleResult } = getRound(record.symbol, amount)
        return <span >{_status ? baseScaleResult : '0'}</span>;
      },
    },
    {
      title: t('spot.columns.fee'), //"手续费",
      key: "buyFee",
      dataIndex: "buyFee",
      width: 128,
      align: "center",
      render: (_status, record) => {
        const buyRes = getRound(record.symbol, record.buyFee || 0)
        const sellRes = getRound(record.symbol, record.sellFee || 0)
        const flag = orderDirection(record.takerSide, record.buyerUserId, record.sellerUserId)
        if (flag === 0) {
          return <span >{`${buyRes.baseScaleResult} ${buyRes.coinSymbol}`}</span>;
        } else if (flag === 1) {
          return <span >{`${sellRes.baseScaleResult} ${sellRes.baseSymbol}`}</span>;
        } else {
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
      render: (_status, record) => {
        return maskName(_status, record.buyerUserId, record.sellerUserId)
      },
    },


  ];
  const orderDirection = (takerSide: number, buyerUserId: number, sellerUserId: number) => {
    const userId = userInfo.userId
    if (sellerUserId === userId && buyerUserId === userId) {
      return takerSide
    } else if (sellerUserId === userId) {
      return 1
    } else if (buyerUserId === userId) {
      return 0
    } else {
      return '--'
    }
  }
  const maskName = (takerSide: number, buyerUserId: number, sellerUserId: number) => {
    const userId = userInfo.userId
    if (takerSide === 0) {
      if (userId === buyerUserId) {
        return 'Taker'
      } else {
        return 'Maker'
      }
    } else if (takerSide === 1) {
      if (userId === sellerUserId) {
        return 'Taker'
      } else {
        return 'Maker'
      }
    } else {
      return '--'
    }
  }
  const pageChange = async (page: number, pageSize: number) => {
    const pageData = {
      page: page,
      pageSize: pageSize
    }
    // setPageParam(pageData)
    paramdataRef.current.page = page
    paramdataRef.current.pageSize = pageSize
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
        const newData = res.data?.records.map((item: any) => ({
          ...item,
          symbol: item.symbol.split('_').join('/')
        }))
        setInitTableData(newData);
        setTableData(newData);
        setTotal(res.data?.total);
        paramdataRef.current.total = res.data?.total
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
    let startTime = null;
    let endTime = null;

    if (value) {
      // 开始时间保持不变，转为时间戳
      startTime = dayjs(value[0]).valueOf();

      // 结束时间先格式化为YYYY-MM-DD，然后加上23:59:59
      const endDate = dayjs(value[1]).format('YYYY-MM-DD');
      endTime = dayjs(`${endDate} 23:59:59`).valueOf();
      // endTime = dayjs(value[1]).endOf(value[1]).valueOf();
    }

    selectParam.current.startTime = startTime;
    selectParam.current.endTime = endTime;
    getOrderListData();
  }
  const disabled7DaysDate: DatePickerProps['disabledDate'] = (current, { from, type }) => {
    const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();
    if (from) {
      const minDate = from.add(-7, 'days');
      const maxDate = from.add(7, 'days');

      switch (type) {
        case 'year':
          return current.year() < minDate.year() || current.year() > maxDate.year();

        case 'month':
          return (
            getYearMonth(current) < getYearMonth(minDate) ||
            getYearMonth(current) > getYearMonth(maxDate)
          );

        default:
          return Math.abs(current.diff(from, 'days')) >= 7;
      }
    }

    return false;
  };
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
                allowClear={false}
                className={`${styles.rangePicker_box} custom-range-picker mt-6`}
                suffixIcon={<Iconify icon="cuida:calendar-outline"
                  className={`${styles.title_color}`} size={20} />}
                placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
                onChange={dateChange}
                size='large'
                minDate={dayjs().subtract(6, 'month')}
                maxDate={dayjs().endOf('day')}
                defaultValue={[dayjs().subtract(6, 'day'), dayjs().endOf('day')]}
                disabledDate={disabled7DaysDate}
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
            pagination={paramdataRef.current.total > 10 ? {
              position: ["bottomRight"],
              // showSizeChanger: true,
              total: paramdataRef.current.total,
              size: "default",
              simple: true,
              onChange: (page, pageSize) => pageChange(page, pageSize),
            } : false}
            // pagination={false}
            loading={loading}
            locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
          />
          {/* {paramdataRef.current.total > 10 && <div className='w-full flex-x align-center justify-end mt-3'>
            <Pagination
              // simple
              // position={['bottomRight']}
              className='spot-table-box'
              showSizeChanger
              defaultCurrent={paramdataRef.current.page}
              pageSize={paramdataRef.current.pageSize}
              size='default'
              total={paramdataRef.current.total} onChange={pageChange} />
          </div>} */}
        </div>
      </div>
    </ConfigProvider>
  </>
  );
});

export default SpotMainPage;