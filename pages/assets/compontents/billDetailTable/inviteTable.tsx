import React from 'react';
import styles from '../../styles/billDetails.module.css'
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

interface DataType {
  createTime: number,
  actualRebateAmount: number,
  actualCoinId: number,
  actualCoinName: string,
  status: number,
  account: string
}
export default function InvitationRewardTable() {
  const { t } = useTranslation(['assets']);
  const [tableData, setTableData] = useState<DataType[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
const coninList=appStore.getCoinList()

  const pageParam = useRef({
    page: 1,
    pageSize: 10,
    total: 0
  })

  const columns: ColumnsType<DataType> = [
    {
      title: t('assetsAccount.time'), //"时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 148,
      align: "left",
      render: (text) => <div>{text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'} </div>,
    },
    {
      title: t('assetsAccount.type'), //"类型",
      dataIndex: "token",
      key: "token",
      align: "center",
      width: 128,
      render: (_text) => <span>{t('assetsAccount.inviteReward')}</span>,
    },
    {
      title: t('assetsAccount.currency'), //"币种",
      dataIndex: "actualCoinName",
      key: "actualCoinName",
      align: "center",
      width: 158,
      render: (_status) => {
        return <span >{_status || '--'}</span>;

      },
    },
    {
      title: t('assetsAccount.number'), //"数量",
      key: "actualRebateAmount",
      dataIndex: "actualRebateAmount",
      width: 148,
      align: "center",
      render: (_text,record) => {
        const coin=coninList.find(item=>item.coinId===record.actualCoinId||item.coinName===record.actualCoinName)
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
        return <span >{_status || '--'}</span>;
      },
    },

  ];

  const pageChange = async (page: number, pageSize: number) => {
    pageParam.current.page = page;
    pageParam.current.pageSize = pageSize;
  }
  const getRecordData = async () => {
    setLoading(true)
    try {
      const res = await getRecordList({
        pageNo: pageParam.current.page,
        pageSize: pageParam.current.pageSize,
        actualCoinName:search||null
      });
      if (res.code === '0') {
        setTableData(res.data.list)
        pageParam.current.total = res.data.count
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error(String(error))
    } finally {
      setLoading(false)
    }
  }
  const searchCurrencyClick = () => {
    getRecordData()
}
  useEffect(() => {
    getRecordData()
  }, [])
  return (<>

    {/* 邀请奖励 */}
    <div className={`${styles.table_box} w-full `}>
      <div className={`${styles.table_header} w-full my-4 flex align-center`}>
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
            total: pageParam.current.total,
            size: "default",
            onChange: (page, pageSize) => pageChange(page, pageSize),
          }}
          loading={loading}
          locale={{ emptyText: <NoData textColor='#A4A5AC' /> }}

        />

      </div>
    </div>
  </>
  );
};