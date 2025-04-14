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
const { RangePicker } = DatePicker;
interface DataLogsType {
  id: number,
  userId: number,
  platformType: number,
  deviceNo: string,
  ip: string,
  address: string,
  token: string,
  tokenTime: string,
  createTime: number,
  updateTime: number,
  tenantId: string,
  fingerprinting: string,
}
interface DataType {
  id: number,
  userId: number,
  platformType: number,
  deviceNo: string,
  ip: string,
  address: string,
  token: string,
  tokenTime: string,
  createTime: number,
  updateTime: number,
  tenantId: string,
  fingerprinting: string,
  userLoginLogs: DataLogsType[]
}
const SpotMainPage = () => {
  const { t } = useTranslation(['spot']);
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState<DataType[]>([
    {
      id: 1,
      userId: 1,
      platformType: 1,
      deviceNo: 'BTC',
      ip: '123.45.67.89',
      address: '123.45.67.89',
      token: '23.3',
      tokenTime: '123',
      createTime: 1234567890,
      updateTime: 1234567890,
      tenantId: '1234567890',
      fingerprinting: '1234567890',
      userLoginLogs: [
        {
          id: 2,
          userId: 2,
          platformType: 1,
          deviceNo: 'BTC111',
          ip: '123.45.67.89',
          address: '123.45.67.89',
          token: '21213.3',
          tokenTime: '123212',
          createTime: 1234567890,
          updateTime: 1234567890,
          tenantId: '1234567890',
          fingerprinting: '1234567890'
        }
      ]
    }, {
      id: 3,
      userId: 3,
      platformType: 1,
      deviceNo: 'BTC2222',
      ip: '123.45.67.89',
      address: '123.45.67.89',
      token: '23.3',
      tokenTime: '123',
      createTime: 1234567890,
      updateTime: 1234567890,
      tenantId: '1234567890',
      fingerprinting: '1234567890',
      userLoginLogs: []
    }
  ]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [childDeviceNoData, setChildDeviceNoData] = useState<DataLogsType[]>([]);
  const router = useRouter();
  const [paramInfo, sePparamInfo] = useState({
    type: '',
    selsect: ''
  });
  const [total, setTotal] = useState(0);
  const [pageParam, setPageParam] = useState({
    page: 1,
    pageSize: 10,
  })
  const paramdataRef = useRef(pageParam);

  const columns: ColumnsType<DataType> = [
    {
      title: t('spot.columns.date'), //"日期",
      dataIndex: "deviceNo",
      key: "deviceNo",
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
      dataIndex: "token",
      key: "token",
      align: "center",
      width: 128,
      render: (_text) => <span>{_text || '--'}</span>,
    },
    {
      title: t('spot.columns.type'), //"类型",
      dataIndex: "tokenTime",
      key: "tokenTime",
      align: "center",
      width: 158,
      render: (_status) => {
        return <span >{_status || '--'}</span>;

      },
    },
    {
      title: t('spot.columns.direction'),//"方向",
      key: "createTime",
      dataIndex: "createTime",
      width: 128,
      align: "center",
      render: (_ip) => {
        return <span >{_ip || '--'}</span>;
      },
    },
    {
      title: t('spot.columns.averagePrice'), //"成交均价",
      dataIndex: "tokenTime",
      key: "tokenTime",
      align: "center",
      width: 158,
      render: (_status) => {
        return <span >{_status || '--'}</span>;

      },
    },
    {
      title: t('spot.columns.price'), //"价格",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: t('spot.columns.count'),  //"成交数量",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: t('spot.columns.quantity'),  //"数量",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: t('spot.columns.amount2'), //"成交金额",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: t('spot.columns.status'), //"状态",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
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