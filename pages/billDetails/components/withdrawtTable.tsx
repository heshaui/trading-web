import React from 'react';
import styles from '../styles/billDetails.module.css'
import { Input, Table, Select } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import dayjs from 'dayjs';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
// import { getRecordList } from '@/services/invite';
import { toast } from 'sonner';
import { NoData } from '@/components/noData'
import { getCoinRate } from '@/utils/getUseRate';
import { roundDown } from '@/utils/math'
import appStore from '@/store';
import { WithdrawDataType } from "@/type/assets/billDetails/table"
import TableCancelModal from '../../assets/components/modal/table_cancel';
import { encryptData } from '@/hooks/user-encrypt'
import {  getCancelWithdraw } from '@/services/assets'


type PropsType = {
  tableData: WithdrawDataType[],
  loading: boolean
  onOk: () => Promise<void>
}
export default function CashOutTable({ tableData, loading, onOk }: PropsType) {
  const { t } = useTranslation(['assets']);
  // const [tableData, setTableData] = useState<DataType[]>([]);
  const router = useRouter();
  const [open, setOpen] = useState(false);
 const [orderId, setOrderId] = useState<string>('');

  const coninList = appStore.getCoinList()

  const pageParam = useRef({
    page: 1,
    pageSize: 10,
    total: 0,
    coinId: null
  })

  const columns: ColumnsType<WithdrawDataType> = [
    {
      title: t('assetsAccount.time'), //"时间",
      dataIndex: "timestamp",
      key: "timestamp",
      // width: 158,
      align: "left",
      render: (text) => <div>{text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'} </div>,
    },
    {
      title: t('assetsAccount.type'), //"类型",
      dataIndex: "billType",
      key: "billType",
      align: "center",
      width: 128,
      render: (_text) => <span>{t('assetsAccount.cashout')}</span>,
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
      width: 128,
      align: "center",
      render: (_text, record) => {
        const coin = coninList.find((item: any) => item.coinName === record.symbol || item.coinId === record.symbol)
        const text = roundDown(_text, coin?.unitScale || 0)
        return <span >{text || '0'}</span>;
      },
    },
    {
      title: t('assetsAccount.fee'), //"手续费",
      key: "fee",
      dataIndex: "fee",
      width: 128,
      align: "center",
      render: (_status, record) => {
        const coin = coninList.find((item: any) => item.coinName === record.symbol || item.coinId === record.symbol)
        return <span >{_status ? roundDown(_status, coin?.unitScale) : '0'}</span>;

      },
    },
    {
      title: t('assetsAccount.address'), //"地址",
      key: "address",
      dataIndex: "address",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: "TxID",
      key: "txHash",
      dataIndex: "txHash",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{_status || '--'}</span>;
      },
    },
    {
      title: t('assetsAccount.status'), //"状态",
      key: "status",
      dataIndex: "status",
      width: 128,
      align: "center",
      render: (_status) => {
        return <span >{getStatus(_status) || '--'}</span>;
      },
    },
    {
      title: t('assetsAccount.operation'), //"操作",
      key: "operation",
      dataIndex: "operation",
      width: 128,
      align: "center",
      render: (_status, record) => {
        return < >{record?.status?.toString() == '1' || record?.status?.toString() == '0' ?
          <button className={`${styles.theme_color}`}
            onClick={() => {
              setOpen(true)
              setOrderId(record.orderId)
            }}
          >{t('assetsAccount.button.cancel')}</button>
          : '--'}
        </>;
      },
    },


  ];
  const getStatus = (status: number) => {
    const statusText = Number(status)
    // 状态: 0-创建, 1-待审核, 2-审核通过, 3-审核拒绝, 4-用户撤销  5 提现完成
    switch (statusText) {
      case 0:
        return t('withdrawTable.create') //'创建';
      case 1:
        return t('withdrawTable.pending') //'待审核'
      case 2:
        return t('withdrawTable.passed') //审核通过
      case 3:
        return t('withdrawTable.rejected') //'审核拒绝'
      case 4:
        return t('withdrawTable.canceled') //'用户撤销'
      case 5:
        return t('withdrawTable.completed') //'提现完成'
      default:
        return statusText || '--'
    }
  }

     // 撤销提现
      const cancelWithdraw = async () => {
          const param = {
              withdrawalId: orderId
          }
          const encrypt = await encryptData(param)
          const res = await getCancelWithdraw(encrypt)
          try {
              if (res.code === '0') {
                  toast.success(res.message || 'success')
                  setOpen(false)
              } else {
                  toast.error(res.message || 'error')
              }
          } catch (error) {
              toast.error(String(error) || 'error')
          } finally {
              await onOk()
              setOpen(false)
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
            <button onClick={() => searchCurrencyClick()}>
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
          className={` table-box`}
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
      <TableCancelModal open={open}
        onCancel={() => setOpen(false)}
        onOk={() => cancelWithdraw()} />
    </div>
  </>
  );
};