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
const SpotMainPage = () => {
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
      render: (_text) => <span>{_text || '--'}</span>,
    },
    {
      title: t('spot.columns.direction'),//"方向",
      key: "direction",
      dataIndex: "direction",
      width: 128,
      align: "center",
      render: (_text) => {
        let text
        if (_text === 0) {
          text = t('spot.trade.buy')
        } else if (_text === 1) {
          text = t('spot.trade.sell')
        } else {
          text = ''
        }
        return <span >{text || '--'}</span>;
      },
    },
    {
      title: t('spot.columns.price'), //"价格",
      key: "price",
      dataIndex: "price",
      width: 128,
      align: "center",
      render: (_status) => {
        return < >{_status ? <div className='flex-x align-center'> 
          {_status}
          <Tooltip title={t('spot.modal.edit')}>
          <button >
            <Iconify icon="mingcute:edit-3-line" className={`${styles.tip_color} mx-1`} size={20} />
          </button>
        </Tooltip>
        </div>
          : '--'}</>;
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
          {_amount ? <div  className='flex-x align-center'>
            {`${_amount}/${record.tradedAmount}`}
            <Tooltip title={t('spot.modal.edit')}>
              <button >
                <Iconify icon="mingcute:edit-3-line" className={`${styles.tip_color} mx-1`} size={20} />
              </button>
            </Tooltip>
            <span className={`${styles.tip_color2}`}>
            { record.tradedAmount?division(_amount, record.tradedAmount):'0%'}
            </span>
            
          </div>
            : '--'
          }
        </div >


      },
    },
    {
      title: t('spot.columns.totalAmount'), //"总额/已成交",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: <span className={`error_icon`}>{t('spot.columns.cancel')}</span> , //"全撤",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <Tooltip title={t('spot.modal.cancel')}>
          <button >
            <Iconify icon="mingcute:delete-2-line" className='error_icon' size={24} />
          </button>
        </Tooltip>;
      },
    },


  ];

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
  const topUpTypeChange = (value: any, options: any) => {
    console.log(value, 123, options);


  }
  const getOrderListData = async () => {
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      type: 0

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
          // checked={hideZero}
          // onChange={hideZeroChange}
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
      {/* </div> */}
    </ConfigProvider>
  </>
  );
};

export default SpotMainPage;