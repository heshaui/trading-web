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
const { RangePicker } = DatePicker;
interface DataType {
  id: number,
  userId: number,
  platformType: number,
  deviceNo: string,
  ip: string,
  address: string,
  token: number,
  tokenTime: number,
  createTime: number,
  updateTime: number,
  tenantId: string,
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
      render: (text, record) => <div>{`${text}`} </div>,
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
        <div className={`${styles.table_header} w-full mb-4 flex align-center`}>
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
                className={`${styles.rangePicker_box} custom-range-picker mt-4`}
                suffixIcon={<Iconify icon="cuida:calendar-outline"
                  className={`${styles.title_color}`} size={20} />}
                placeholder={[t('spot.select.startTime'), t('spot.select.endTime')]}
              />
            </Form.Item>

            <Form.Item name="type" >
              <Select allowClear
                placeholder={t('spot.select.type')}
                options={directionSelect}
                className={`${styles.select_box} select-text-right mt-4`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.type')}</span>}
              />
            </Form.Item>
            <Form.Item name="direction" >
              <Select allowClear
                placeholder={t('spot.select.direction')}
                options={directionSelect}
                className={`${styles.select_box} select-text-right mt-4`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.direction')}</span>}
              />
            </Form.Item>
            <Form.Item name="symbol" >
              <Select allowClear
                placeholder={t('spot.select.symbol')}
                options={symbolSelect}
                className={`${styles.select_box} select-text-right mt-4`}
                prefix={<span className={`${styles.title_color}`}>{t('spot.columns.symbol')}</span>}
              />
            </Form.Item>
            <Form.Item name="hideAllCancel" >
              <Checkbox
                defaultChecked={false}
                className={` mt-6`}
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
            scroll={{ x: "max-content", y: 300 }}
            className={` table-box`}
            pagination={{
              position: ["bottomRight"],
              showSizeChanger: true,
              total: total,
              size: "default",
              onChange: (page, pageSize) => pageChange(page, pageSize),
            }}
            // loading={loading}
            locale={{ emptyText: <NoData textColor='#A4A5AC'/> }}
          />

        </div>
      </div>
    </ConfigProvider>
  </>
  );
};

export default SpotMainPage;