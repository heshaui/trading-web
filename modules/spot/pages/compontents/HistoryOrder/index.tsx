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
import { getOrderList, getExchangeCoinList, getOrderInfo } from '@/services/spot'
import { toast } from 'sonner';
import { division, nul, roundDown } from '@/utils';
import { getRound } from '@/utils/getUseRate'
import { ROUTER_KEY_SPOT } from '@/config/apiConfig'
import { useCoinList } from '@/hooks/use-coinList';
import appStore from '@/store';
import { observer } from 'mobx-react-lite';
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
  baseSymbolCount: number,
  groupStatus: string,
  userLoginLogs: DataLogsType[]
}
interface symbolSelectType {
  label: string,
  value: string,
  baseSymbol: string,
  coinSymbol: string
}
interface SelectParamType {
  startTime: number | string;
  endTime: number | string;
  direction: string;
  type: string;
  symbol: string;
  notStatus: string | number;
}
const SpotMainPage = observer(() => {
  const { t } = useTranslation(['spot']);
  const [form] = Form.useForm();
  // 获取币种列表
  // const {coinList} = useCoinList();
  const coinList = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表
  const userInfo = appStore.getUserInfo()
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
    startTime: dayjs().subtract(6, 'day').startOf('day').valueOf(),
    endTime: dayjs().endOf('day').valueOf(),
    direction: '',
    type: '',
    symbol: '',
    notStatus: ''
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
      width: 148,
      render: (_text, record) => <button type='button'
        //  className={`${record.status === 2 ? styles.error_icon : ''}`}
        onClick={(e) => {
          e.stopPropagation(); // 阻止事件冒泡，防止触发行展开
          router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.symbol}`)
        }}
      >
        {_text || '--'}
        <Iconify icon="mingcute:right-line"
          className={`mx-1`} size={20} />
      </button >,
    },
    {
      title: t('spot.columns.type'), //"类型",
      key: "type",
      dataIndex: "type",
      width: 128,
      align: "center",
      render: (_text) => {
        if (_text === 0) {
          return <span >{t('spot.columns.market')}</span>;
        } else if (_text === 1) {
          return <span  >{t('spot.columns.limit')}</span>;
        } else {
          return <span >--</span>;
        }
      },
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
        const averagePrice = record.tradedAmount ? division(record.turnover || 0, record.tradedAmount) : 0
        if (record.status === 0 || record.status === 1 || record.status === 5) {
          const { baseScaleResult } = getRound(record.symbol, averagePrice);
          return <span>{averagePrice ? baseScaleResult : '--'}</span>;
        } else if (record.type === 0) {
          return <span>{t('spot.select.market')}</span>;
        } else {
          return <span>--</span>;
        }
      },
    },
    {
      title: t('spot.columns.price'), //"价格",
      key: "price",
      dataIndex: "price",
      width: 128,
      align: "center",
      render: (_status: any, record: DataType) => {
        if (record.type === 0) {
          return <span>{t('spot.select.market')}</span>;
        } else if (record.type === 1) {
          const { baseScaleResult } = getRound(record.symbol, _status);
          return <span>{_status ? baseScaleResult : '0'}</span>;
        } else {
          return <span>--</span>;
        }
      },
    },
    {
      title: t('spot.columns.quantity'), //"数量",
      key: "amount",
      dataIndex: "amount",
      width: 128,
      align: "center",
      render: (_status: any, record: DataType) => {
        const { scaleResult } = getRound(record.symbol, _status);
        return <span>{_status ? scaleResult : '0'}</span>;
      },
    },
    {
      title: t('spot.columns.count'), //"成交数量",
      key: "tradedAmount",
      dataIndex: "tradedAmount",
      width: 128,
      align: "center",
      render: (_status: any, record: DataType) => {
        const { scaleResult } = getRound(record.symbol, _status);
        return <span>{_status ? scaleResult : '0'}</span>;
      },
    },
    {
      title: t('spot.columns.amount2'), //"成交金额",
      key: "turnover",
      dataIndex: "turnover",
      width: 128,
      align: "center",
      render: (_status: any, record: DataType) => {
        const { baseScaleResult } = getRound(record.symbol, _status);
        return <span>{_status ? baseScaleResult : '0'}</span>;
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
        } else if (_status === 3||_status === 6) {
          return <span >{t('spot.select.canceled') || '--'}</span>;
        } else if (_status === 4) {
          return <span >{t('spot.select.created') || '--'}</span>;
        } else if (_status === 5) {
          return <span >{t('spot.select.partial') || '--'}</span>;
        }
        // else if (_status === 6) {
        //   return <span >{t('spot.select.canceled2') || '--'}</span>;
        // }
        else {
          return <span >{_status}</span>;
        }
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
        const symbolName = tableData.find((item: any) => item.orderId === expandedRowKeys[0])?.symbol || '';
        const { baseScaleResult } = getRound(symbolName, _tradePrice);
        return <span>{_tradePrice ? baseScaleResult : '--'}</span>;
      },
    },
    {
      title: t('spot.columns.tradeCount'),//成交数量
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 158,
      render: (_status) => {
        const symbolName = tableData.find((item: any) => item.orderId === expandedRowKeys[0])?.symbol || '';
        const { scaleResult } = getRound(symbolName, _status);
        return <span>{_status ? scaleResult : '--'}</span>;
      },
    },
    {
      title: t('spot.columns.tradeAmount'),//成交金额
      key: "tradePrice",
      dataIndex: "tradePrice",
      width: 128,
      align: "center",
      render: (_ip, record) => {
        const symbolName = tableData.find((item: any) => item.orderId === expandedRowKeys[0])?.symbol || '';
        const tradeAmount = _ip ? nul(_ip, record.quantity) : 0;
        const { baseScaleResult } = getRound(symbolName, tradeAmount);
        return <span>{tradeAmount ? baseScaleResult : '--'}</span>;
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
        const flag = record.takerSide
        // const price=nul(record.tradePrice,record.quantity)
        if (flag === 0) {
          const { baseScaleResult, baseSymbol } = getRound(symbolName, _buyFee || 0)
          return <span>{`${baseScaleResult} ${baseSymbol || '--'}`}</span>
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
  const directionSelect: { label: string, value: string | number }[] = [
    {
      label: t('spot.select.all'),
      value: ''
    },
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
      label: t('spot.select.all'),
      value: ''
    },
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
  const handleExpand = async (expanded: boolean, record: DataType) => {
    if (expanded) {
      setLoading(true);
      try {
        // 请求数据
        const params = {
          page: 1,
          pageSize: 1000,
          orderId: record.orderId,
          // symbol: `${record.symbol.split('/').join('_')}_${record.groupStatus}`
          symbol: `${record.symbol.split('/').join('_')}`
        };
        const res = await getOrderInfo(params);
        if (res.code === '0') {
          // 更新当前行的 userLoginLogs
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
      setChildDeviceNoData([]);
    }
  };
  // 时间选择
  const dateChange = async (value: any) => {
    let startTime
    let endTime

    if (value) {
      // 开始时间保持不变，转为时间戳
      startTime = dayjs(value[0]).valueOf();

      // 结束时间先格式化为YYYY-MM-DD，然后加上23:59:59
      const endDate = dayjs(value[1]).format('YYYY-MM-DD');
      endTime = dayjs(`${endDate} 23:59:59`).valueOf();
      // endTime = dayjs(value[1]).endOf(value[1]).valueOf();
    }

    selectParam.current.startTime = startTime || ''
    selectParam.current.endTime = endTime || ''
    await getOrderListData()
  }

  const getOrderListData = async () => {
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      orderType: 1,
      notStatus: selectParam.current.notStatus ? '3' : null,
      coinSymbol: selectParam.current.symbol ? `${selectParam.current.symbol.split('/')[0]}` : null,
      baseSymbol: selectParam.current.symbol ? `${selectParam.current.symbol.split('/')[1]}` : null,
      startTime: selectParam.current.startTime ? dayjs(selectParam.current.startTime).valueOf() : null,
      endTime: selectParam.current.endTime ? dayjs(selectParam.current.endTime).valueOf() : null,
      direction: selectParam.current.direction || selectParam.current.direction?.toString() === '0' ? selectParam.current.direction : null,
      type: selectParam.current.type || selectParam.current.type?.toString() === '0' ? selectParam.current.type : null,

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
      setSymbolSelect(
        [
          {
            label: t('spot.select.all'),
            value: ''
          },
          ...selectData
        ])
    }

  }
  const getOrderInfoData = async (symbol: string, orderId: string, groupStatus: string) => {
    try {
      const params = {
        // baseCoinScale:symbol.split('/')[1],
        // coinScale:symbol.split('/')[0],
        page: 1,
        pageSize: 10,
        // baseCoinScale:'USDT',
        // coinScale:'BTC',
        // symbol:'base_quote_group'
        orderId: orderId,
        symbol: `${symbol.split('/').join('_')}_${groupStatus}`
      }
      const res = await getOrderInfo(params)
      if (res.code === '0') {
      }
    } catch (error) {
      toast.error(String(error))
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
                minDate={dayjs().subtract(6, 'month')}
                maxDate={dayjs().endOf('day')}
                defaultValue={[dayjs().subtract(6, 'day'), dayjs().endOf('day')]}
              />
            </Form.Item>

            <Form.Item name="type" >
              <Select allowClear
                placeholder={t('spot.select.all')}
                options={typeSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.type')}</span>}
                onChange={(value) => {
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
                onChange={(value) => {
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
                onChange={(value) => {
                  selectParam.current.symbol = value
                  getOrderListData()
                }}
              />
            </Form.Item>
            <Form.Item name="hideAllCancel" >
              <Checkbox
                defaultChecked={false}
                className={` mt-8`}
                onChange={(e) => {
                  console.log(e.target.checked, 123456789, 'value');
                  selectParam.current.notStatus = e.target.checked ? '3' : ''
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