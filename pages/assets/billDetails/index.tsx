import React from 'react';
import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/userAssetsLayout';
import styles from '../styles/billDetails.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Pagination } from 'antd';
import { Iconify } from "@/components/icon"
import type { ColumnsType } from "antd/es/table";
import { toast } from 'sonner';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import InvitationTable from "../compontents/billDetailTable/inviteTable"
import WithdrawTable from "../compontents/billDetailTable/withdrawtTable"
import RechargeTable from "../compontents/billDetailTable/rechargeTable"
import { getOrderList } from '@/services/assets'


import { WithdrawDataType, RebateDataType, RechargeDataType } from "@/type/assets/billDetails/table"

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
  const [tableData, setTableData] = useState<DataType[]>([]);
  const router = useRouter();
  const paramdataRef = useRef({
    page: 1,
    pageSize: 10,
    total: 0,
    type: 'RECHARGE',
    search: ''
  });
  const [rechargeData, setRechargeData] = useState<RechargeDataType[]>([]);
  const [withdrawData, setWithdrawData] = useState<WithdrawDataType[]>([]);
  const [rebateData, setRebateData] = useState<RebateDataType[]>([]);

  const [orderType, setOrderType] = useState('RECHARGE');
  const [search, setSearch] = useState('');

  const [tableLoading, setTableLoading] = useState(false);
  const cardTypeSeelect: { label: string, value: string }[] = [
    {
      label: t('billDetails.recharge'), //'充值',
      value: 'RECHARGE'
    },
    {
      label: t('billDetails.withdraw'), //'提现',
      value: 'WITHDRAW'
    },
    {
      label: t('billDetails.rebate'), //'返佣',
      value: 'REBATE'
    },
    // {
    //   label: t('billDetails.transfer'), //'转账',
    //   value: 'TRANSFER'
    // }
  ]
  const pageChange = async (page: number, pageSize: number) => {
    paramdataRef.current.page = page;
    paramdataRef.current.pageSize = pageSize;
  }
  const topUpTypeChange = (value: any, options: any) => {
    // console.log(value, 123, options);
    setOrderType(value)
    paramdataRef.current.type = value
    searchChange()
  }
  const coinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    paramdataRef.current.search = e.target.value
  }

  const getBillDetails = async () => {
    const pageParam = {
      pageNo: paramdataRef.current.page,
      pageSize: paramdataRef.current.pageSize,
      symbol: paramdataRef.current.search ? paramdataRef.current.search : null,
      billType: paramdataRef.current.type
    }
    setTableLoading(true)
    try {
      const res = await getOrderList(pageParam)
      if (res.code === '0') {
        setTableData(res.data.list)
        paramdataRef.current.total = res.data.count
        if (paramdataRef.current.type === 'RECHARGE') {
          setRechargeData(res.data.list)
        } else if (paramdataRef.current.type === 'WITHDRAW') {
          setWithdrawData(res.data.list)
        } else if (paramdataRef.current.type === 'REBATE') {
          setRebateData(res.data.list)
        }
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error(String(error))
    } finally {
      setTableLoading(false)
    }
  }
  const searchChange = async () => {
    paramdataRef.current.page = 1;
    await getBillDetails()
  }


  useEffect(() => {
    getBillDetails()
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
          }
        },
      }}
    >
      <div className='flex justify-between align-center'>
        <h2 className={`font-w-500 font-20`}>
          {t('billDetails.title')}
        </h2>
      </div>
      <div className={`${styles.card_bgc}  mt-3 h-full`}>
        <div className={`${styles.table_header} w-full my-4 flex align-center`}>
          <Input className={`${styles.input_box} modal-input mr-7`}
            maxLength={25}
            placeholder={t('assetsAccount.currency')}
            allowClear
            prefix={<button type="button" onClick={searchChange}>
              <Iconify icon="garden:search-26" size={20} className={`${styles.title_color} `} />
            </button>}
            onChange={coinInputChange}
            onPressEnter={searchChange}

          />
          <Select allowClear={false}
            placeholder={t('assetsAccount.select')}
            options={cardTypeSeelect}
            className={`${styles.select_box} custom-select`}
            onChange={topUpTypeChange}
            defaultValue={'RECHARGE'}
          />
        </div>
        {/* 充值 */}
        {orderType === 'RECHARGE' && <RechargeTable tableData={rechargeData} loading={tableLoading} />}
        {/* 提现 */}
        {orderType === 'WITHDRAW' && <WithdrawTable tableData={withdrawData} loading={tableLoading} />}
        {/* 邀请奖励-邀请返佣 */}
        {orderType === 'REBATE' && <InvitationTable tableData={rebateData} loading={tableLoading} />}
        <div className='w-full flex-x align-center justify-end mt-3'>
          <Pagination
            // position={['bottomRight']}
            className='spot-table-box'
            // showSizeChanger
            defaultCurrent={paramdataRef.current.page}
            pageSize={paramdataRef.current.pageSize}
            size='default'
            total={paramdataRef.current.total} onChange={pageChange} />
        </div>
      </div>
    </ConfigProvider>
  </>
  );
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['assets', 'common'])),
    },
  };
};
export default withAssetsLayout(AssetsMainPage);