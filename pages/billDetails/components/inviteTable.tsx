import React from 'react';
import styles from '../styles/billDetails.module.css'
import { Input, Table, Select } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getRecordList } from '@/services/invite';
import { toast } from 'sonner';
import { NoData } from '@/components/noData'
import { getCoinRate} from '@/utils/getUseRate';
import {roundDown} from '@/utils/math'
import appStore from '@/store';
import {RebateDataType} from "@/type/assets/billDetails/table"

type PropsType = {
  tableData: RebateDataType[];
  loading:boolean
}
export default function InvitationRewardTable({ tableData ,loading}: PropsType) {
  const { t } = useTranslation(['assets']);
  const router = useRouter();
  // const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
const coninList=appStore.getCoinList()

  const pageParam = useRef({
    page: 1,
    pageSize: 10,
    total: 0
  })

  const columns: ColumnsType<RebateDataType> = [
    {
      title: t('assetsAccount.time'), //"时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 148,
      align: "left",
      render: (text) => <div>{text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'} </div>,
    },
    {
      title: t('assetsAccount.type'), //"类型",
      dataIndex: "type",
      key: "type",
      align: "center",
      width: 128,
      render: (_text) => <span>{t('assetsAccount.inviteReward')}</span>,
    },
    {
      title: t('assetsAccount.currency'), //"币种",
      dataIndex: "symbol",
      key: "symbol",
      align: "center",
      width: 158,
      render: (_status) => {
        return <span >{_status || '--'}</span>;

      },
    },
    {
      title: t('assetsAccount.number'), //"数量",
      key: "amount",
      dataIndex: "amount",
      width: 148,
      align: "center",
      render: (_text,record) => {
        const coin=coninList.find(item=>item.coinId===record.symbol||item.coinName===record.symbol)
        const text=roundDown(_text,coin?.unitScale||0)
        return <span >{text || '--'}</span>;
      },
    },
    {
      title: t('assetsAccount.status'), //"状态",
      key: "status",
      dataIndex: "status",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{getStatus(_status)|| '--'}</span>;
      },
    },

  ];

  const getStatus = (status: number) => {
    const statusText =Number(status)
    switch (statusText) {
      case 0:
        return t('select.pending') //'待发放';
      case 1:
        return t('select.done') //'已完成'
      default:
        return statusText||'--'
    }
  }
  return (<>

    {/* 邀请奖励 */}
    <div className={`${styles.table_box} w-full `}>
      {/* <div className={`${styles.table_header} w-full my-4 flex align-center`}>
        <Input className={`${styles.input_box} modal-input mr-7`}
          maxLength={25}
          placeholder={t('assetsAccount.currency')}
          allowClear
          prefix={
            <button onClick={() =>searchCurrencyClick()}>
            <Iconify icon="garden:search-26" size={20}
              className={`${styles.title_color} `}
            /></button>}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </div> */}
      <div className={`${styles.table_content} w-full `}>

        <Table
          columns={columns}
          dataSource={tableData}
          size="large"
          scroll={{ x: "max-content" }}
          className={`table-box`}
          // pagination={{
          //   position: ["bottomRight"],
          //   // showSizeChanger: true,
          //   total: pageParam.current.total,
          //   size: "default",
          //   onChange: (page, pageSize) => pageChange(page, pageSize),
          // }}
          pagination={false}
          loading={loading}
          locale={{ emptyText: <NoData textColor='#A4A5AC' height='45vh' /> }}

        />

      </div>
    </div>
  </>
  );
};