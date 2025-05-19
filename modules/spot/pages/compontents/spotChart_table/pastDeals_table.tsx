import React from 'react';
import styles from '../styles/spotChartCom.module.css'
import { Checkbox, ConfigProvider, Table, Form, DatePicker, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NoData } from '@/components/noData'
import { add, cut, division, lastD, nul, roundDown } from '@/utils'
import { getRound } from '@/utils/getUseRate'
import { toast } from 'sonner';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { ROUTER_KEY_SPOT } from '@/config/apiConfig'
// import { useCoinList } from '@/hooks/use-coinList';
import { getOrderList, getOrderInfo } from '@/services/spot'
const { RangePicker } = DatePicker;
interface DataLogsType {
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
  mtime: string
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
  const directionRef = useRef<string>('3');

  // 获取币种列表
  // const {coinList} = useCoinList();
  const coinList = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表
  const userInfo = appStore.getUserInfo()

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
    startTime: dayjs().subtract(6, 'day').startOf('day').valueOf(),
    endTime: dayjs().endOf('day').valueOf(),
    hideOther: false,
    hideCancel: false,
  })
  const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0];

  const directionSelect: MenuProps['items'] = [
    {
      key: '1',
      label: <button className='w-full'
        onClick={() => directionChange('3')}
      >{t('spot.select.all')}</button>,
    },
    {
      key: '2',
      label: <button className='w-full' onClick={() => directionChange('0')}>{t('spot.modal.buy')}</button>,
    },
    {
      key: '3',
      label: <button className='w-full' onClick={() => directionChange('1')}>{t('spot.modal.sell')}</button>,
    }
  ];
  const directionChange = (key: string) => {

    if (key === directionRef.current) return
    if (loading) return toast.error('loading...')
    directionRef.current = key
    getOrderListData()
  }
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
      render: (_text, record) => <button type='button' className={`${record.status === 1 ? styles.error_icon : record.status?.toString() === '0' ? styles.success_icon : ''}`}
        onClick={(e) => {
          e.stopPropagation(); // 阻止事件冒泡，防止触发行展开
          router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.symbol}`)
        }}
      >
        {_text || '--'}
        <Iconify icon="mingcute:right-line" className={`${record.status === 1 ? styles.error_icon : record.status?.toString() === '0' ? styles.success_icon : ''} mx-1`} size={20} />
      </button >,
    },
    {
      title: <>
        <Dropdown menu={{ items: directionSelect }} trigger={['hover']} >
          <div>
            <span className='ml-4'>{directionRef.current === '3' ? t('spot.columns.direction') : directionRef.current === '0' ? t('spot.modal.buy') : directionRef.current === '1' ? t('spot.modal.sell') : '--'}</span>
            <Iconify icon="mingcute:down-line" className={`${styles.tip_color} ml-1`} size={16} />
          </div>
        </Dropdown>
      </>, //"方向"
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
        const averagePrice = record.tradedAmount ? division(record.turnover || 0, record.tradedAmount) : 0
        if (record.status === 0 || record.status === 1 || record.status === 5) {
          const { baseScaleResult } = getRound(record.symbol, averagePrice)
          return <span >{averagePrice ? baseScaleResult : '--'}</span>;
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
      render: (_status, record) => {
        if (record.type === 0) {
          return <span >{t('spot.select.market')}</span>;
        } else if (record.type === 1) {
          const { baseScaleResult } = getRound(record.symbol, _status)
          return <span >{_status ? baseScaleResult : '0'}</span>;
        }
      },
    },
    {
      title: t('spot.columns.tradedAmount'), //'委托量/已完成',  
      key: "amount",
      dataIndex: "amount",
      width: 128,
      align: "center",
      render: (_amount, record) => {
        const amount = getRound(record.symbol, _amount).scaleResult
        const amountDone = getRound(record.symbol, record.tradedAmount).scaleResult
        return < div className='flex-x-cc'>
          {_amount ? <div className='flex-y align-center'>
            {/* <span>{`${roundDown(_amount, 2)}/${roundDown(record.tradedAmount, 2)}`}</span> */}
            <span>{`${amount}/${amountDone}`}</span>
            <span className={`${styles.tip_color2}`}>
              {record.tradedAmount && record.tradedAmount.toString() !== '0' ? `${roundDown(nul(division(record.tradedAmount, _amount), 100), 2)}%` : '0%'}
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
      render: (_status, record) => {
        const { baseScaleResult } = getRound(record.symbol, _status)
        return <span >{_status ? baseScaleResult : '0'}</span>;
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
          // 交易中
          return <span >{t('spot.select.trading') || '--'}</span>;
        } else if (_status === 1) {
          // 完全成交
          return <span >{t('spot.select.completed') || '--'}</span>;
        } else if (_status === 2) {
          // 拒绝
          return <span >{t('spot.select.failed') || '--'}</span>;
        } else if (_status === 3 || _status === 6) {
          // 已撤销
          return <span >{t('spot.select.canceled') || '--'}</span>;
        } else if (_status === 4) {
          // 创建订单
          return <span >{t('spot.select.created') || '--'}</span>;
        } else if (_status === 5) {
          // 部分成交
          return <span >{t('spot.select.partial') || '--'}</span>;
        }
        // else if (_status === 6) {
        //   // 订单已撤销，戳和未撤销
        //   return <span >{t('spot.select.canceled2') || '--'}</span>;
        // }
      },
    },


  ];
  const columns2: ColumnsType<DataLogsType> = [
    {
      title: t('spot.columns.tradeTime'),//成交时间
      dataIndex: "mtime",
      key: "mtime",
      width: 128,
      align: "left",
      render: (text) => <div>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}`} </div>,
    },
    {
      title: t('spot.columns.tradePrice'),//成交价
      dataIndex: "tradePrice",
      key: "tradePrice",
      align: "center",
      width: 128,
      // 判断方向是买还是卖 buyPrice/sellPrice
      render: (_tradePrice, record) => {
        // const flag = record.takerSide
        // if(flag === 0){
        //   return <span>{_buyPrice || '--'}</span>
        // }else if(flag === 1){
        //   return <span>{record.sellPrice || '--'}</span>
        // }else{
        //   return '--'
        // }
        const symbolName = tableData.find((item: any) => item.orderId === expandedRowKeys[0])?.symbol || ''
        const { baseScaleResult } = getRound(symbolName, _tradePrice)
        return <span>{_tradePrice ? baseScaleResult : '--'}</span>
      },
    },
    {
      title: t('spot.columns.tradeCount'),//成交数量
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 158,
      render: (_status) => {
        const symbolName = tableData.find((item: any) => item.orderId === expandedRowKeys[0])?.symbol || ''
        const { scaleResult } = getRound(symbolName, _status)
        return <span >{_status ? scaleResult : '--'}</span>;
      },
    },
    {
      title: t('spot.columns.tradeAmount'),//成交金额
      key: "tradePrice",
      dataIndex: "tradePrice",
      width: 128,
      align: "center",
      render: (_ip, record) => {
        const symbolName = tableData.find((item: any) => item.orderId === expandedRowKeys[0])?.symbol || ''
        const { baseScaleResult } = getRound(symbolName, nul(_ip, record.quantity))
        return <span >{_ip ? baseScaleResult : '--'}</span>;
      },
    },
    {
      title: t('spot.columns.tradeFee'),//手续费
      dataIndex: "buyFee",
      key: "buyFee",
      align: "center",
      width: 158,
      render: (_buyFee, record) => {
        const symbolName = tableData.find((item: any) => item.orderId === expandedRowKeys[0])?.symbol || ''
        const flag =orderDirection(record.takerSide, record.buyerUserId, record.sellerUserId)
        // const price=nul(record.tradePrice,record.quantity)
        if (flag === 0) {
          const { baseScaleResult, baseSymbol,coinSymbol } = getRound(symbolName, _buyFee || 0)
          return <span>{`${baseScaleResult} ${coinSymbol || '--'}`}</span>
        } else if (flag === 1) {
          const { baseScaleResult, baseSymbol } = getRound(symbolName, record.sellFee || 0)
          return <span>{`${baseScaleResult} ${baseSymbol || '--'}`}</span>
        } else {
          return '--'
        }
      },
    },
    {
      title: t('spot.columns.tradeRole'),//角色
      key: "takerSide",
      dataIndex: "takerSide",
      width: 128,
      align: "center",
      render: (_text, record) => {
        return maskName(_text, record.buyerUserId, record.sellerUserId)
      },
    }
  ]
  const orderDirection = (takerSide: number, buyerUserId: number, sellerUserId: number) => {
    const userId = userInfo.userId
    if (sellerUserId === userId && buyerUserId === userId) {
      return takerSide
    }else if(sellerUserId === userId){
      return 1
    }else if(buyerUserId === userId){
      return 0
    }else{
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
  // 处理展开/折叠行的函数 - 展开时清除URL中的deviceId
  const handleExpand = async (expanded: boolean, record: DataType) => {
    if (expanded) {
      setLoading(true);
      try {
        // 这里根据你的接口和参数调整
        const params = {
          page: 1,
          pageSize: 1000,
          orderId: record.orderId,
          //  symbol: `${record.symbol.split('/').join('_')}_${record.groupStatus}`
          symbol: `${record.symbol.split('/').join('_')}`
        };
        // 假设你有 getOrderInfo 这个接口
        const res = await getOrderInfo(params);
        if (res.code === '0') {
          setTableData(prev =>
            prev.map(item =>
              item.orderId === record.orderId
                ? { ...item, userLoginLogs: res.data?.records || [] }
                : item
            )
          );
          setExpandedRowKeys([record.orderId]);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error(String(error));
      } finally {
        setLoading(false);
      }
    } else {
      setExpandedRowKeys([]);
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
      notStatus: selectParam.current.hideCancel ? '3' : null,
      coinSymbol: selectParam.current.hideOther ? `${currentPair?.coinSymbol}` : null,
      baseSymbol: selectParam.current.hideOther ? `${currentPair?.baseSymbol}` : null,
      startTime: selectParam.current.startTime ? dayjs(selectParam.current.startTime).valueOf() : null,
      endTime: selectParam.current.endTime ? dayjs(selectParam.current.endTime).valueOf() : null,
      direction: directionRef.current !== '3' ? directionRef.current : null

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
        token: {
          colorBgContainer: 'transparent',
        }
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
            size='large'
            minDate={dayjs().subtract(6, 'month')}
            maxDate={dayjs().endOf('day')}
            defaultValue={[dayjs().subtract(6, 'day'), dayjs().endOf('day')]}
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
            pagination={total>10?{
              position: ["bottomRight"],
              // showSizeChanger: true,
              total: total,
              size: "default",
              simple: true,
              onChange: (page, pageSize) => pageChange(page, pageSize),
            }:false}
            // pagination={false}
            locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
            expandable={{
              expandedRowRender: (record) => {
                const isCurrentExpanded = expandedRowKeys.includes(record.orderId);
                return (
                  <div key={record.orderId}>
                    {isCurrentExpanded && record.userLoginLogs && record.userLoginLogs.length > 0 ? (
                      <Table
                        columns={columns2}
                        dataSource={record.userLoginLogs}
                        size="large"
                        scroll={{ x: "max-content" }}
                        pagination={false}
                        className={`spot-table-box2 ${styles.rowExpanded_table_box}`}
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