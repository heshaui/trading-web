import React from 'react';
import styles from '../styles/spotChartCom.module.css'
import { Dropdown, ConfigProvider, Table, Form, Segmented, Checkbox, Tooltip, notification } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NoData } from '@/components/noData'
import { getOrderList, revocationOrder, updateOrder } from '@/services/spot'
import { toast } from 'sonner';
import { add, cut, nul, division, roundDown } from '@/utils'
import { getRound } from '@/utils/getUseRate'
import DelectModal from '@/components/spotModal/Delect_modal';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { encryptData } from '@/hooks/user-encrypt'
import ToastModal from '@/components/spotModal/Toast_modal';
import { ROUTER_KEY_SPOT } from '@/config/apiConfig'
// import { useCoinList } from '@/hooks/use-coinList';
import type { MenuProps } from 'antd';
import UpdateOrder from '../Modal/updateOrder';
import { NowDataType } from '@/type/spot/table';
// import 

type Props = {
  returnNowOrder: (num: number) => void
}
const SpotMainPage = observer(({ returnNowOrder }: Props) => {
  const { t } = useTranslation(['spot']);
  const [form] = Form.useForm();
  // 获取币种列表
  //  const {coinList} = useCoinList();
  const [tableData, setTableData] = useState<NowDataType[]>([]);
  const [initTableData, setInitTableData] = useState<NowDataType[]>([]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [toastModal, setToastModal] = useState<boolean>(false);
  const paramdataRef = useRef({
    page: 1,
    pageSize: 10,
  });
  const [delectId, setDelectId] = useState<string[]>([]);
  const [delectIdAll, setDelectIdAll] = useState<string[]>([]);
  const [delectModal, setDelectModal] = useState<boolean>(false);
  const [delectLoading, setDelectLoading] = useState<boolean>(false);
  const currentPair = appStore.getCurrentPair() || appStore.currencyPairs[0]; // 当前货币对
  const coinList = appStore.getCurrentPairList() || appStore.currencyPairs; // 货币对列表
  // const [hideElse, setHideElse] = useState<boolean>(false);
  const hideElse = useRef(false)
  const [toastData, setToastData] = useState<any>({})
  const toastDataRef = useRef<any>({})
  const directionRef = useRef<string>('3')
  const [upDataOpen, setUpdateOpen] = useState<boolean>(false)
  // const [orderInfo, setOrderInfo] = useState<NowDataType>({} as NowDataType)
  const orderInfo = useRef<NowDataType>({} as NowDataType)

  const updateOrder = appStore.getUpdateFlag();

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
  const columns: ColumnsType<NowDataType> = [
    {
      title: t('spot.columns.uploadTime'), //"更新时间",
      dataIndex: "updateTime",
      key: "updateTime",
      width: 138,
      align: "left",
      render: (text, record) => <div>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}`} </div>,
    },
    {
      title: t('spot.columns.symbol'), //"交易对",
      dataIndex: "symbol",
      key: "symbol",
      align: "center",
      width: 148,
      render: (_text, record) => <button type='button' className={`${record.direction === 1 ? styles.error_hover : record.direction?.toString() === '0' ? styles.success_hover : ''}`}
        onClick={() => {
          router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.symbol}`)
        }}
      >
        {_text || '--'}
        <Iconify icon="mingcute:right-line" className={`${record.direction === 1 ? styles.error_hover : record.direction?.toString() === '0' ? styles.success_hover : ''} mx-1`} size={20} />
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
      key: "direction",
      dataIndex: "direction",
      width: 128,
      align: "center",
      render: (_status) => {
        let text
        if (_status === 0) {
          text = t('spot.trade.buy')
          return <span className={`${styles.success_icon}`} >{text || '--'}
          </span>;
        } else if (_status === 1) {
          text = t('spot.trade.sell')
          return <span className={`${styles.error_icon}`} >{text || '--'}
          </span>;
        } else {
          return '--'
        }
      }
    },
    {
      title: t('spot.columns.price'), //"价格",
      key: "price",
      dataIndex: "price",
      width: 128,
      align: "center",
      render: (_status, record) => {
        const { baseScaleResult } = getRound(record.symbol, _status)
        return <>{record.type === 1 ? <div className='flex-x-cc'>
          <p className='text-center '> {baseScaleResult}</p>
          {/* <Tooltip title={t('spot.modal.edit')}>
            <button
              onClick={() => {
                upDtaOrder(record)
              }}
            >
              <Iconify icon="mingcute:edit-3-line" className={`${styles.tip_color} mx-1`} size={20} />
            </button>
          </Tooltip> */}
        </div> : <p className='text-center '> {t('spot.select.market')}</p>}</>

      },
    },
    {
      title: t('spot.columns.tradedAmount'), //"委托量/已完成",
      key: "amount",
      dataIndex: "amount",
      width: 128,
      align: "center",
      // render: (_amount, record) => {
      //   const amount = getRound(record.symbol, _amount).scaleResult
      //   const amountDone = getRound(record.symbol, record.tradedAmount).scaleResult
      //   return < div className='flex-x-cc'>
      //     {_amount ? <div className='flex-x align-center'>

      //       {`${amount}/${amountDone}`}
      //       <Tooltip title={t('spot.modal.edit')}>
      //         <button
      //           onClick={() => {
      //             upDtaOrder(record)
      //           }}>
      //           <Iconify icon="mingcute:edit-3-line" className={`${styles.tip_color} mx-1`} size={20} />
      //         </button>
      //       </Tooltip>
      //       &nbsp;&nbsp;
      //       <span className={`${styles.tip_color2}`}>
      //         {record.tradedAmount && record.tradedAmount.toString() !== '0' ? `${roundDown(nul(division(record.tradedAmount, _amount), 100), 2)}%` : '0%'}
      //       </span>

      //     </div>
      //       : '0'
      //     }
      //   </div >
      // },
       render: (_amount, record) => {
              const amount = getRound(record.symbol, _amount).scaleResult
              const amountDone = getRound(record.symbol, record.tradedAmount).scaleResult
              if (record.type === 0 && record.direction === 0) {
      
                if (record.status === 1 || record.status === 5) {
                  return < div className='flex-x-cc'>
                    {_amount ? <div className='flex-y align-center'>
                      <span>{`${amountDone}/${amountDone}`}</span>
                      <span className={`${styles.tip_color2}`}>
                        {record.tradedAmount && record.tradedAmount.toString() !== '0' ? `${roundDown(nul(division(record.tradedAmount, _amount), 100), 2)}%` : '0%'}
                      </span>
                    </div>
                      : '0'}
                  </div >
                } else {
                  return < div className='flex-x-cc'>
                    {_amount ? <div className='flex-y align-center'>
                      <span>{`-/${amountDone}`}</span>
                      <span className={`${styles.tip_color2}`}>
                        {record.tradedAmount && record.tradedAmount.toString() !== '0' ? `${roundDown(nul(division(record.tradedAmount, _amount), 100), 2)}%` : '0%'}
                      </span>
                    </div>
                      : '0'}
                  </div >
                }
                
              } else {
                return < div className='flex-x-cc'>
                  {_amount ? <div className='flex-y align-center'>
                    <span>
                      {`${amount}/${amountDone}`}</span>
                    <span className={`${styles.tip_color2}`}>
                      {record.tradedAmount && record.tradedAmount.toString() !== '0' ? `${roundDown(nul(division(record.tradedAmount, _amount), 100), 2)}%` : '0%'}
                    </span>
                  </div>
                    : '0'}
                </div >
              }

            }
    },
    {
      title: t('spot.columns.totalAmount'), //"总额/已成交",
      key: "turnover",
      dataIndex: "turnover",
      width: 128,
      align: "center",
      render: (_turnover, record) => {
        // const coin = coinList.find((item: any) => item.symbol === record.symbol);
        // const totalAmount = record.amount && record.price ? roundDown(nul(record.amount, record.price), coin?.baseCoinScale) : '0'
        const res = getRound(record.symbol, nul(record.amount, record.price)).baseScaleResult
        const totalAmount = record.amount && record.price ? res : '0'
        const resNum = getRound(record.symbol, _turnover).baseScaleResult
        return <span >{`${totalAmount}/${resNum}` || '0'}</span>;
      },
    },
    {
      title: <button className={`error_icon`}
        onClick={() => {
          setDelectIdAll(tableData.map((item) => item.orderId))
          setDelectModal(true)
        }}
      >{t('spot.columns.cancel')}</button>, //"全撤",
      key: "operation",
      width: 128,
      align: "center",
      render: (_status, record) => {
        return <Tooltip title={t('spot.modal.cancel')} placement="left">
          <button
            onClick={() => {

              // setDelectId([record.orderId])
              // setDelectOneSuccess(true)
              setToastData({
                coinSymbol: record.coinSymbol,
                symbol: record.symbol,
                baseSymbol: record.baseSymbol,
                price: record.price,
                amount: record.amount,
              })
              toastDataRef.current = {
                coinSymbol: record.coinSymbol,
                symbol: record.symbol,
                baseSymbol: record.baseSymbol,
                price: record.price,
                amount: record.amount,
              }
              // setToastModal(true)
              delectOne([record.orderId])
            }}
          >
            <Iconify icon="mingcute:delete-2-line" className='error_icon' size={24} />
          </button>
        </Tooltip>;
      },
    },


  ];
  const upDtaOrder = (info: NowDataType) => {
    // setOrderInfo(info)

    orderInfo.current = info
    setUpdateOpen(true)
  }
  const directionChange = (key: string) => {
    if (key === directionRef.current) return
    if (loading) return toast.error('loading...')
    directionRef.current = key
    getOrderListData()
  }
  const delectOne = async (orderId: string[]) => {
    if (delectLoading) return toast.error('loading...')
    setDelectLoading(true)
    try {
      const paeam = {
        orderId: orderId,
      }
      // console.log(paeam);


      const encrypt = await encryptData(paeam)
      const res = await revocationOrder(encrypt)
      if (res.code === '0') {
        // toast.success(res.message)
        // setToastModal(true)
        notification.success({
          message: t('spot.toastModal.canceled'), //'已撤单',
          description: (
            <ul className={`flex-col flex-ai-start flex-1 ${styles.title_color} ml-2`}>
              <li className={` mt-5 font-14 font-w-400 `}>
                {t('spot.toastModal.pair')}: {toastDataRef.current?.symbol}
              </li>
              <li className={` mt-3 font-14 font-w-400 `}>
                {t('spot.toastModal.price')}: {toastDataRef.current?.price}&nbsp;{toastDataRef.current?.symbol?.split('/')?.[1] || '--'}
              </li>
              <li className={` mt-3 font-14 font-w-400 `}>
                {t('spot.toastModal.cancelAmount')}: {toastDataRef.current?.amount}&nbsp;{toastDataRef.current?.symbol?.split('/')?.[0] || '--'}
              </li>
            </ul>
          ),
          duration: 3
        })
        appStore.updateOrderFlag(3)
        getOrderListData()
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error(String(error))
    } finally {
      setDelectLoading(false)
    }

  };

  const pageChange = async (page: number, pageSize: number) => {
    // const pageData = {
    //   page: page,
    //   pageSize: pageSize
    // }
    // setPageParam(pageData)
    paramdataRef.current = {
      page: page,
      pageSize: pageSize
    };
    getOrderListData()
  }
  const hideElseChange = (e: CheckboxChangeEvent) => {
    if (loading) return toast.error('loading...')
    hideElse.current = !hideElse.current
    getOrderListData()
  }
  const getOrderListData = async () => {
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      orderType: 0,
      coinSymbol: hideElse.current ? `${currentPair?.coinSymbol}` : null,
      baseSymbol: hideElse.current ? `${currentPair?.baseSymbol}` : null,
      direction: directionRef.current !== '3' ? directionRef.current : null
    }
    setLoading(true)
    try {
      const res = await getOrderList(params)
      if (res.code === '0') {
        returnNowOrder(res.data.count)
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
  const handleDelectOk = () => {
    appStore.updateOrderFlag(3)

    getOrderListData()
  }
  const handleUpdateOk = () => {
    appStore.updateOrderFlag(2)
    getOrderListData()
    
  }
  useEffect(() => {
    getOrderListData()

  }, [updateOrder.orderPlace])
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
          Segmented: {
            itemColor: "var(--text-color5)", //未选中颜色
            itemActiveBg: "transparent", //未选中背景色
            itemSelectedBg: "var(--theme-color)", //选中背景色
            itemSelectedColor: "#fff", //选中颜色
            trackBg: "transparent", //轨道背景色
            itemHoverBg: "transparent", //鼠标悬停背景色
            itemHoverColor: "var(--text-color5)",//鼠标悬停颜色
          }
        }
      }}
    >
      {/* 充值 */}
      {/* <div className={`${styles.table_box}`}> */}
      <div className={`${styles.table_header} flex align-center mb-6 flex-wrap`}>
        <div className=' mt-6  ml-6'>
          <Segmented options={[
            {
              label: (
                // className={`default_btn ${styles.btn_style}`}
                <div style={{ padding: '2px 4px' }} >
                  <div>
                    {/* 限价 | 市价 */}
                    {t('spot.select.limit')} | {t('spot.select.market')}
                  </div>
                </div>
              ),
              value: 'user1',
            },
            {
              label: (
                <div style={{ padding: '2px 4px' }} >
                  <div>
                    {/* 止盈止损 */}
                    {t('spot.select.stopLoss')}
                  </div>
                </div>
              ),
              value: 'user2',
            },
          ]}
            className={`custom-segmented2`} />
        </div>
        <div className={`${styles.table_header_checkbox2}  ml-6 mt-6`}>
          <Checkbox
            onChange={hideElseChange}
            checked={hideElse.current}
          >
            <span className={`${styles.title_color} font-14 font-w-400`}>{t('spot.select.hideOther')}</span>
          </Checkbox>
        </div>
      </div>
      <div className={`${styles.table_content} w-full `}>

        <Table
          columns={columns}
          dataSource={tableData}
          size="large"
          // scroll={{ x: 'max-content', y: 300 }}
          scroll={{ x: 'max-content', }}
          className={`spot-table-box spot-pagination`}
          pagination={{
            position: ["bottomRight"],
            // showSizeChanger: true,
            total: total,
            size: "default",
            simple: true,
            onChange: (page, pageSize) => pageChange(page, pageSize),
            hideOnSinglePage: true
          }}
          loading={loading}
          locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
        />
        <DelectModal open={delectModal}
          orderId={delectIdAll}
          onCancel={() => setDelectModal(false)}
          onOk={handleDelectOk} />
        <ToastModal
          type='0'
          open={toastModal}
          toastData={toastData}
          onCancel={() => setToastModal(false)}
        />
        <UpdateOrder
          open={upDataOpen}
          orderInfo={orderInfo.current}
          onCancel={() => setUpdateOpen(false)}
          onOk={handleUpdateOk}
        />
      </div>
      {/* </div> */}
    </ConfigProvider>
  </>
  );
});

export default SpotMainPage;