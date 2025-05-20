import React from 'react';
import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/userAssetsLayout';
import styles from '../styles/billDetails.module.css'
import { Input, Radio, ConfigProvider, Table, Select } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import InvitationTable from "../compontents/billDetailTable/inviteTable"
import CashOutTable from "../compontents/billDetailTable/cashOutTable"


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
const AssetsMainPage = () => {
  const { t } = useTranslation(['assets']);
  const [tableData, setTableData] = useState<DataType[]>([
    {
      id: 1,
      userId: 1,
      platformType: 1,
      deviceNo: 'BTC',
      ip: '123.45.67.89',
      address: '123.45.67.89',
      token: 23.3,
      tokenTime: 123,
      createTime: 1234567890,
      updateTime: 1234567890,
      tenantId: '1234567890'
    }, {
      id: 2,
      userId: 1,
      platformType: 1,
      deviceNo: 'POINT',
      ip: '123.45.67.89',
      address: '123.45.67.89',
      token: 1234567890,
      tokenTime: 23.0,
      createTime: 1234567892,
      updateTime: 1234567889,
      tenantId: '1234567890'
    }
  ]);
  const router = useRouter();
  const [paramInfo,sePparamInfo]=useState({
    type:'',
    selsect:''
  });
  const [total, setTotal] = useState(0);
  const [pageParam, setPageParam] = useState({
    page: 1,
    pageSize: 10,
  })
  const paramdataRef = useRef(pageParam);


  const columns: ColumnsType<DataType> = [
    {
      title: t('assetsAccount.time'), //"时间",
      dataIndex: "deviceNo",
      key: "deviceNo",
      width: 158,
      align: "left",
      render: (text, record) => <div>{`${text}`} </div>,
    },
    {
      title: t('assetsAccount.type'), //"类型",
      dataIndex: "token",
      key: "token",
      align: "center",
      width: 128,
      render: (_text) => <span>{_text || '--'}</span>,
    },
    {
      title: t('assetsAccount.currency'), //"币种",
      dataIndex: "tokenTime",
      key: "tokenTime",
      align: "center",
      width: 158,
      render: (_status) => {
        return <span >{_status || '--'}</span>;

      },
    },
    {
      title: t('assetsAccount.number'), //"数量",
      key: "createTime",
      dataIndex: "createTime",
      width: 128,
      align: "center",
      render: (_ip) => {
        return <span >{_ip || '--'}</span>;
      },
    },
    {
      title: t('assetsAccount.address'), //"地址",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: "TxID",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: t('assetsAccount.status'), //"状态",
      key: "updateTime",
      dataIndex: "updateTime",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    // {
    //   title: "操作",
    //   key: "action",
    //   dataIndex: "action",
    //   width: 128,
    //   align: "center",
    //   render: (_status) => {
    //     return <>
    //       <button className={`${styles.theme_color} mr-3 font-12 font-w-500`}>提现</button>
    //       <button className={`${styles.tip_color2} mr-3 font-12 font-w-500`}>充值</button>
    //       <button className={`${styles.theme_color} font-12 font-w-500`}>交易</button>
    //     </>
    //   },
    // },


  ];


  const cardTypeSeelect: { label: string, value: string }[] = [
    {
      label: '居民身份证',
      value: '1'
    },
    {
      label: '普通护照',
      value: '2'
    },
    {
      label: '港澳通行证',
      value: '3'
    },
    {
      label: '台湾通行证',
      value: '4'
    },
    {
      label: '台湾身份证',
      value: '5'
    },
    {
      label: '外国人永久居住身份证',
      value: '6'
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
  const topUpTypeChange=(value:any,options:any)=>{
    console.log(value,123,options);
    

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
            headerBorderRadius:0, // 表头圆角
          },
          Pagination: {
            itemActiveBg: "transparent",
            itemBg: "transparent",
          },

          Select: {
            activeBorderColor: "var(--border-color4)",
            optionActiveBg: "transparent",
            selectorBg: "transparent", //选框背景色
          }
        },
      }}
    >
      <div className='flex justify-between align-center'>
        <h2 className={`font-w-500 font-20`}>
          {t('billDetails.title')}
          </h2>
      </div>
      <div className={`${styles.card_bgc}  mt-3 `}>
        {/* 充值 */}
        {/* <div className={`${styles.table_box} w-full `}>
          <div className={`${styles.table_header} w-full my-4 flex align-center`}>
            <Input className={`${styles.input_box} modal-input mr-7`}
              maxLength={25}
              placeholder={t('assetsAccount.currency')}
              allowClear
              prefix={<Iconify icon="garden:search-26" size={20} className={`${styles.title_color} `} />}
            />
            <Select allowClear
              placeholder={t('assetsAccount.select')}
              options={cardTypeSeelect}
              className={`${styles.select_box} custom-select`}
              onChange={topUpTypeChange}
            />
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
                // showSizeChanger: true,
                total: total,
                size: "default",
                onChange: (page, pageSize) => pageChange(page, pageSize),
              }}
            // loading={loading}
            />

          </div>
        </div> */}
        {/* 提现 */}
        <CashOutTable/>
        {/* 邀请奖励 */}
        <InvitationTable/>
      </div>
    </ConfigProvider>
  </>
  );
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale || 'en', ['assets','common'])),
		},
	};
};
export default withAssetsLayout(AssetsMainPage);