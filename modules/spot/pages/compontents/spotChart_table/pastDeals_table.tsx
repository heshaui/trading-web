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
import { add, cut, division, lastD } from '@/utils'
import { toast } from 'sonner';
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
const SpotMainPage = () => {
  const { t } = useTranslation(['spot']);
  const [form] = Form.useForm();
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

  const columns: ColumnsType<DataType> = [
    {
      title: t('spot.columns.date'), //"日期",
      dataIndex: "updateTime",
      key: "updateTime",
      width: 158,
      align: "left",
      render: (text, record) => {

        return <div className='flex-row align-start'>
          <Iconify icon={expandedRowKeys.includes(record.id) ? "mingcute:up-fill"
            : "mingcute:down-fill"}
            style={{ color: "var(--text-color4)" }}
            className='mr-2'
            size={16}
          />
          <span>{`${text}`}</span>
        </div>
      },
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
      title: t('spot.columns.direction'), //"方向",
      dataIndex: "direction",
      key: "direction",
      align: "center",
      width: 158,
      render: (_status) => {
        let text
        if (_status === 0) {
          text = t('spot.columns.buy')
        } else if (_status === 1) {
          text = t('spot.columns.sell')
        } else {
          text = ''
        }
        return <span >{text || '--'}</span>;

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
          return <span >--'</span>;
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
      key: "tradedAmount",
      dataIndex: "tradedAmount",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
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
      dataIndex: "deviceNo",
      key: "deviceNo",
      width: 158,
      align: "left",
      render: (text, record) => <div>{`${text}`} </div>,
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
    if (expanded) {
      // 设置展开的行
      setExpandedRowKeys([record.id]);

      // 设置子数据
      if (record.userLoginLogs && record.userLoginLogs.length > 0) {
        setChildDeviceNoData(record.userLoginLogs);
      } else {
        setChildDeviceNoData([]);
      }

      // 如果URL中有deviceId参数，则清除它
      if (router.query.deviceId) {
        const { deviceId, ...restQuery } = router.query;
        router.replace({
          pathname: router.pathname,
          query: restQuery
        }, undefined, { shallow: true });
      }
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
  }
  const topUpTypeChange = (value: any, options: any) => {
    console.log(value, 123, options);


  }
  const getOrderListData = async () => {
    const params = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      type:1

    }
    setLoading(true)
    try {
      const res = await getOrderList(params)
      if (res.code === '0') {
        setInitTableData(res.data.list)
        setTableData(res.data.list)
        setTotal(res.data.total)
      } else {
        toast.error(res.message)
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
          {/* <Segmented options={[
            {
              label: (
                // className={`default_btn ${styles.btn_style}`}
                <div style={{ padding: '2px 4px' }} >
                  <div>限价 | 市价</div>
                </div>
              ),
              value: 'user1',
            },
          ]} 
          className={`custom-segmented2 mt-6`}/> */}
          <button className={`default_btn mt-6 ${styles.btn_style} mr-10`}>限价 | 市价</button>
          {/* <Form
            form={form}
            layout="inline"
            initialValues={{
              type: '',
              direction: '',
              symbol: ''
            }}
          >
            <Form.Item name="time" > */}
          <RangePicker
            className={`${styles.rangePicker_box} custom-range-picker mt-6 mr-6`}
            suffixIcon={<Iconify icon="cuida:calendar-outline"
              className={`${styles.title_color}`} size={20} />}
            placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
          />
          {/* </Form.Item>
          </Form> */}
          <div className={`${styles.table_header_checkbox2}`}>
            <Checkbox
              // checked={hideZero}
              // onChange={hideZeroChange}
              className='mt-7'
            >
              <span className={`${styles.title_color} font-14 font-w-400`}>{t('spot.select.hideOther')}</span>
            </Checkbox>
            <Checkbox
              // checked={hideZero}
              // onChange={hideZeroChange}
              className='mt-7'
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
            // scroll={{ x: "max-content", y: 300 }}
            className={`spot-table-box`}
            loading={loading}
            // pagination={{
            //   position: ["bottomRight"],
            //   showSizeChanger: true,
            //   total: total,
            //   size: "default",
            //   simple:true,
            //   onChange: (page, pageSize) => pageChange(page, pageSize),
            // }}
            // loading={loading}
            locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}
            expandable={{
              expandedRowRender: (record) => {
                // 使用当前展开行的ID来确定是否显示子数据
                const isCurrentExpanded = expandedRowKeys.includes(record.id);

                return (
                  <div key={record.id}>
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
                        rowKey="id"
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
            pagination={false}
            rowKey="id"
          />

        </div>
      </div>
    </ConfigProvider>
  </>
  );
};

export default SpotMainPage;