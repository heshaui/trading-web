import React from 'react';
import styles from '../styles/spotChartCom.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form, Segmented, Checkbox, Tooltip, notification } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NoData } from '@/components/noData'
import { getOrderList, revocationOrder } from '@/services/spot'
import { toast } from 'sonner';
import { add, cut, nul, division, roundDown } from '@/utils'
import DelectModal from '@/components/spotModal/Delect_modal';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { encryptData } from '@/hooks/user-encrypt'
import ToastModal from '@/components/spotModal/Toast_modal';
import { ROUTER_KEY_SPOT } from '@/config/apiConfig'
// import { useCoinList } from '@/hooks/use-coinList';

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
}
type Props = {
  orderUpdateFlag?: number
}
const SpotMainPage = observer(({ orderUpdateFlag }: Props) => {
  const { t } = useTranslation(['spot']);
  const [form] = Form.useForm();
  // 获取币种列表
  //  const {coinList} = useCoinList();
  const [tableData, setTableData] = useState<DataType[]>([]);
  const [initTableData, setInitTableData] = useState<DataType[]>([]);

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
  const columns: ColumnsType<DataType> = [
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
      render: (_text, record) => <button type='button' className={`${record.status === 1 ? styles.error_icon : record.status?.toString() === '0' ? styles.success_icon : ''}`}
        onClick={() => {
          router.push(`${ROUTER_KEY_SPOT.INDEX}?symbol=${record.symbol}`)
        }}
      >
        {_text || '--'}
        <Iconify icon="mingcute:right-line" className={`${record.status === 1 ? styles.error_icon : record.status?.toString() === '0' ? styles.success_icon : ''} mx-1`} size={20} />
      </button >,
    },
    {
      title: t('spot.columns.direction'),//"方向",
      key: "direction",
      dataIndex: "direction",
      width: 128,
      align: "center",
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
      }
    },
    {
      title: t('spot.columns.price'), //"价格",
      key: "price",
      dataIndex: "price",
      width: 128,
      align: "center",
      render: (_status,record) => {
        const coin = coinList.find((item: any) => item.symbol === record.symbol);
        // type
        return <>{record.type === 1 ? <div className='flex-x-cc'>
          <p className='text-center '> {_status?roundDown(_status,coin?.baseCoinScale):'0'}</p>
          <Tooltip title={t('spot.modal.edit')}>
            <button
              onClick={() => {
                toast.error('接口：暂不做')
              }}
            >
              <Iconify icon="mingcute:edit-3-line" className={`${styles.tip_color} mx-1`} size={20} />
            </button>
          </Tooltip>
        </div>:<p className='text-center '> {t('spot.select.market')}</p>}</>

      },
    },
    {
      title: t('spot.columns.tradedAmount'), //"委托量/已完成",
      key: "amount",
      dataIndex: "amount",
      width: 128,
      align: "center",
      render: (_amount, record) => {
        // amount/tradedAmount
        return < div className='flex-x-cc'>
          {_amount ? <div className='flex-x align-center'>
            {`${roundDown(_amount, 2)}/${roundDown(record.tradedAmount, 2)}`}
            <Tooltip title={t('spot.modal.edit')}>
              <button
                onClick={() => {
                  toast.error('接口：暂不做')
                }}>
                <Iconify icon="mingcute:edit-3-line" className={`${styles.tip_color} mx-1`} size={20} />
              </button>
            </Tooltip>
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
      title: t('spot.columns.totalAmount'), //"总额/已成交",
      key: "turnover",
      dataIndex: "turnover",
      width: 128,
      align: "center",
      render: (_turnover, record) => {
        const coin = coinList.find((item: any) => item.symbol === record.symbol);
        const totalAmount = record.amount && record.price ? roundDown(nul(record.amount, record.price), coin?.baseCoinScale) : '0'
        return <span >{`${totalAmount}/${roundDown(_turnover, coin?.baseCoinScale)}` || '0'}</span>;
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
              toastDataRef.current={
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
          message: '已撤单',
          description: (
            <ul className={`flex-col flex-ai-start flex-1 ${styles.title_color} ml-2`}>
              <li className={` mt-5 font-14 font-w-400 `}>
                币对：{toastDataRef.current?.symbol}
              </li>
              <li className={` mt-3 font-14 font-w-400 `}>
                价格：{toastDataRef.current?.price}&nbsp;{toastDataRef.current?.symbol?.split('/')?.[1] || '--'}
              </li>
              <li className={` mt-3 font-14 font-w-400 `}>
                撤单量：{toastDataRef.current?.amount}&nbsp;{toastDataRef.current?.symbol?.split('/')?.[0] || '--'}
              </li>
            </ul>
          ),
          duration: 3
        })
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
  const handleDelectOk = () => {
    getOrderListData()
  }
  useEffect(() => {
    getOrderListData()
  }, [orderUpdateFlag])
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
        },
        token: {
          colorBgContainer: 'transparent',
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
      </div>
      {/* </div> */}
    </ConfigProvider>
  </>
  );
});

export default SpotMainPage;