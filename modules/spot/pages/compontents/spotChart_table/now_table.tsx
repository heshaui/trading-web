import React from 'react';
import styles from '../styles/spotChartCom.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Form, Segmented, Checkbox, Tooltip } from 'antd';
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
import { add, cut, nul, division, lastD } from '@/utils'
import DelectModal from '@/components/spotModal/Delect_modal';
import { observer } from 'mobx-react-lite';
import appStore from '@/store';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { encryptData } from '@/hooks/user-encrypt'
import {revocationOrder} from '@/services/spot'
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
const SpotMainPage = observer(() => {
  const { t } = useTranslation(['spot']);
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState<DataType[]>([]);
  const [initTableData, setInitTableData] = useState<DataType[]>([]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const paramdataRef = useRef({
    page: 1,
    pageSize: 10,
  });
  const [delectId, setDelectId] = useState<number[]>([]);
  const [delectIdAll, setDelectIdAll] = useState<number[]>([]);
  const [delectModal, setDelectModal] = useState<boolean>(false);
  const currentPair = appStore.getCurrentPair()|| appStore.currencyPairs[0]; // 当前货币对
  // const [hideElse, setHideElse] = useState<boolean>(false);
  const hideElse=useRef(false)

  const columns: ColumnsType<DataType> = [
    {
      title: t('spot.columns.uploadTime'), //"更新时间",
      dataIndex: "updateTime",
      key: "updateTime",
      width: 158,
      align: "left",
      render: (text, record) => <div>{`${text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}`} </div>,
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
      render: (_status) => {
        return <div className='flex-x align-center text-center'>
          <p className='text-center '> {_status||'0'}</p>
          <Tooltip title={t('spot.modal.edit')}>
            <button 
            onClick={()=>{
              toast.error('接口：暂不做')
            }}
            >
              <Iconify icon="mingcute:edit-3-line" className={`${styles.tip_color} mx-1`} size={20} />
            </button>
          </Tooltip>
        </div>
          
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
            {`${_amount}/${record.tradedAmount}`}
            <Tooltip title={t('spot.modal.edit')}>
              <button 
              onClick={()=>{
                toast.error('接口：暂不做')
              }}>
                <Iconify icon="mingcute:edit-3-line" className={`${styles.tip_color} mx-1`} size={20} />
              </button>
            </Tooltip>
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
      title: t('spot.columns.totalAmount'), //"总额/已成交",
      key: "turnover",
      dataIndex: "turnover",
      width: 128,
      align: "center",
      render: (_turnover, record) => {
        const totalAmount = record.amount && record.price ? nul(record.amount, record.price) : '0'
        return <span >{`${totalAmount}/${_turnover ? _turnover : '0'}` || '--'}</span>;
      },
    },
    {
      title: <button className={`error_icon`}
      onClick={()=>{
        setDelectIdAll(tableData.map((item)=>item.id))
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
              setDelectId([record.id])
              // setDelectOneSuccess(true)
              delectOne()
            }}
          >
            <Iconify icon="mingcute:delete-2-line" className='error_icon' size={24} />
          </button>
        </Tooltip>;
      },
    },


  ];
  const delectOne = async () => {
    try {
        const paeam={
            orderId: delectId,
        }
        const encrypt=await encryptData(paeam)
        const res = await revocationOrder(encrypt)
        if(res.code==='0'){
            toast.success(res.message)
            getOrderListData()
        }else{
            toast.error(res.message)
        }
    } catch (error) {
        toast.error(String(error))
    }

};

  const pageChange = async (page: number, pageSize: number) => {
    const pageData = {
      page: page,
      pageSize: pageSize
    }
    // setPageParam(pageData)
    paramdataRef.current = pageData;
  }
  const hideElseChange = (e: CheckboxChangeEvent) => {
    if(loading) return toast.error('loading...')
    hideElse.current = !hideElse.current
    getOrderListData()
  }
  const getOrderListData = async () => {
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      type: 0,
      notStatus: hideElse.current ? `${currentPair?.coinSymbol},${currentPair?.baseSymbol}`:'',
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
        setTotal(res.data.total);
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
          // scroll={{y: true }}
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
        onOk={handleDelectOk}/>
      </div>
      {/* </div> */}
    </ConfigProvider>
  </>
  );
});

export default SpotMainPage;