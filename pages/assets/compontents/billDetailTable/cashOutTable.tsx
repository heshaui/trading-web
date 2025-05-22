import React from 'react';
import styles from '../../styles/billDetails.module.css'
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
import { getWithdrawDepositList } from '@/services/assets'

interface DataType {
  withdrawalId: string,
  userId: number,
  coinId: number,
  protocolId: number,
  amount: number,
  fee: number,
  realityFee: number,
  toAddress: string,
  fromAddress: string,
  txHash: string,
  status: number,
  createTime: number,
  updateTime: number,
  riskLevel: number,
  riskExplain: string,
  tenantId: string,
  remark: string,
  coinName: string,
  protocolName: string
}
export default function CashOutTable() {
  const { t } = useTranslation(['assets']);
  const [tableData, setTableData] = useState<DataType[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const coninList = appStore.getCoinList()

  const pageParam = useRef({
    page: 1,
    pageSize: 10,
    total: 0,
    coinId: null
  })

  const columns: ColumnsType<DataType> = [
    {
      title: t('assetsAccount.time'), //"时间",
      dataIndex: "createTime",
      key: "createTime",
      // width: 158,
      align: "left",
      render: (text) => <div>{text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'} </div>,
    },
    {
      title: t('assetsAccount.type'), //"类型",
      dataIndex: "token",
      key: "token",
      align: "center",
      width: 128,
      render: (_text) => <span>{t('assetsAccount.cashout')}</span>,
    },
    {
      title: t('assetsAccount.currency'), //"币种",
      dataIndex: "coinName",
      key: "coinName",
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
        const coin = coninList.find((item: any) => item.coinName === record.coinName || item.coinId === record.coinId)
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
        const coin = coninList.find((item: any) => item.coinName === record.coinName || item.coinId === record.coinId)
        return <span >{_status ? roundDown(_status, coin?.unitScale) : '0'}</span>;

      },
    },
    {
      title: t('assetsAccount.address'), //"地址",
      key: "fromAddress",
      dataIndex: "fromAddress",
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
      key: "action",
      dataIndex: "action",
      width: 128,
      align: "center",
      render: (_status) => {
        // return <>
        //   <button className={`${styles.theme_color} mr-3 font-12 font-w-500`}>
        //     提现
        //     {t('assetsAccount.button.withdraw')}
        //   </button>
        //   <button className={`${styles.tip_color2} mr-3 font-12 font-w-500`}>
        //     充值
        //     {t('assetsAccount.button.deposit')}
        //   </button>
        //   <button className={`${styles.theme_color} font-12 font-w-500`}>
        //     交易
        //     {t('assetsAccount.button.trade')}
        //   </button>
        // </>
        return '--'
      },
    },


  ];
  const getStatus = (status: number) => {
    switch (status) {
      case 0:
        return t('withdrawTable.create') //'创建';
      case 1:
        return t('withdrawTable.pending') //'待审核'
      case 2:
        return t('withdrawTable.completed1') //已转出 //'完成'
      case 3:
        return t('withdrawTable.rejected') //'拒绝 '
      case 4:
        return t('withdrawTable.canceled') //'用户撤销'
      default:
        return status||'--'
    }
  }
  const pageChange = async (page: number, pageSize: number) => {
    pageParam.current.page = page;
    pageParam.current.pageSize = pageSize;
  }
  const getRecordData = async () => {
    setLoading(true)
    try {
      const res = await getWithdrawDepositList({
        pageNo: pageParam.current.page,
        pageSize: pageParam.current.pageSize,
        coinId: pageParam.current.coinId
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
    const coinId = search ? coninList.find(item => item.coinName.toLowerCase().includes(search.toLowerCase()))?.coinId : null
    if (!coinId) return toast.error(t('assetsAccount.noFind'))
    pageParam.current.coinId = coinId
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
            <button onClick={() => searchCurrencyClick()}>
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