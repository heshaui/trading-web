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
import { add, cut, division, lastD } from '@/utils'
import { getOrderList } from '@/services/spot'
import { toast } from 'sonner';


const { RangePicker } = DatePicker;
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



  const columns: ColumnsType<DataType> = [
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
      },
    },
    {
      title: t('spot.columns.price2'), //"成交价",
      dataIndex: "turnover",
      key: "turnover",
      align: "center",
      width: 158,
      render: (_status, record) => {
        return <span >{_status && record.direction ? division(_status, record.direction) : '0'}</span>;

      },
    },

    {
      title: t('spot.columns.count'),  //"成交数量",
      key: "tradedAmount",
      dataIndex: "tradedAmount",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '0'}</span>;
      },
    },

    {
      title: t('spot.columns.amount2'), //"成交金额",
      key: "turnover",
      dataIndex: "turnover",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: t('spot.columns.fee'), //"手续费",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: t('spot.columns.role'), //"角色",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
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
    getOrderListData()
  }
  const topUpTypeChange = (value: any, options: any) => {
    console.log(value, 123, options);


  }

  const getOrderListData = async () => {
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      orderType: 2,
      // coinSymbol: selectParam.current.hideOther ? `${currentPair?.coinSymbol}`:'',
      // baseSymbol: selectParam.current.hideOther ? `${currentPair?.baseSymbol}`:'',
      // startTime: selectParam.current.startTime?dayjs(selectParam.current.startTime).valueOf():'',
      // endTime: selectParam.current.endTime?dayjs(selectParam.current.endTime).valueOf():'',
    }
    setLoading(true)
    try {
      const res = await getOrderList(params)
      if (res.code === '0') {
        const newData = res.data.list.map((item: any) => ({
          ...item,
          userLoginLogs: []
        }));
        // setInitTableData(newData);
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
              />
            </Form.Item>

            <Form.Item name="type" >
              <Select allowClear
                placeholder={t('spot.select.type')}
                options={directionSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.type')}</span>}
              />
            </Form.Item>
            <Form.Item name="direction" >
              <Select allowClear
                placeholder={t('spot.select.direction')}
                options={directionSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.direction')}</span>}
              />
            </Form.Item>
            <Form.Item name="symbol" >
              <Select allowClear
                placeholder={t('spot.select.symbol')}
                options={symbolSelect}
                className={`${styles.select_box} select-text-right mt-6`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.symbol')}</span>}
              />
            </Form.Item>
            <Form.Item name="hideAllCancel" >
              <Checkbox
                defaultChecked={false}
                className={` mt-8`}
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
            // scroll={{ x: "max-content", y: 300 }}
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
};

export default SpotMainPage;