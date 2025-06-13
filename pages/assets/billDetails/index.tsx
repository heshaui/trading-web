import React from 'react';
import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/userAssetsLayout';
import styles from '../styles/billDetails.module.css'
import { Input, Radio, ConfigProvider, Table, Select, Pagination } from 'antd';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import InvitationTable from "../compontents/billDetailTable/inviteTable"
import WithdrawTable from "../compontents/billDetailTable/withdrawtTable"
import RechargeTable from "../compontents/billDetailTable/rechargeTable"
import GiftTable from "../compontents/billDetailTable/giftTable"
import { getCoinAll, getOrderList } from '@/services/assets'
import Image from 'next/image'

import { WithdrawDataType, RebateDataType, RechargeDataType, coinSelectType ,GiftDataType} from "@/type/assets/billDetails/table"

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
  const [coinSelect, setCoinSelect] = useState<coinSelectType[]>([])
  const [giftData, setGiftData] = useState<GiftDataType[]>([]);

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
    {
      label: t('billDetails.gift'), //'赠币',
      value: 'GIFT'
    },
    // {
    //   label: t('billDetails.transfer'), //'转账',
    //   value: 'TRANSFER'
    // }
  ]
  const pageChange = async (page: number, pageSize: number) => {
    paramdataRef.current.page = page;
    paramdataRef.current.pageSize = pageSize;
    getBillDetails()
  }
  const topUpTypeChange = (value: any, options: any) => {
    // console.log(value, 123, options);
    setOrderType(value)
    paramdataRef.current.type = value
    searchChange()
  }
  const coinInputChange = (value: any, options: any) => {
    // setSearch(e.target.value)
    // paramdataRef.current.search = e.target.value

    setSearch(value)
    paramdataRef.current.search = value
    searchChange()
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
        } else if (paramdataRef.current.type === 'GIFT') {
          setGiftData(res.data.list)
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
  const withdrawHandleOk = async () => {
    await getBillDetails()
  }
  const getCoinAllData = async () => {
    try {
      const res = await getCoinAll()
      if (res.code === '0') {
        const coinList = res.data.map((item: any) => ({
          label: item.coinName,
          value: item.coinName,
          coinId: item.coinId,
          coinName: item.coinName,
          iconUrl: item.iconUrl,
          nameDefault: item.nameDefault,
          sort: item.sort,
        })).sort((a: any, b: any) => {
          return a.sort - b.sort
        })

        setCoinSelect(coinList)

      }

    } catch (error) {
    }
  }

  useEffect(() => {
    getCoinAllData()
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
      <div className={`${styles.card_bgc}  mt-3 `}
        style={{
          minHeight: '80vh'
        }}
      >
        <div className={`${styles.table_header} w-full my-4 flex align-center`}>
          <Select
            allowClear
            placeholder={t('billDetails.selectCoin')}
            options={coinSelect}
            className={`${styles.select_box} custom-select mr-3`}
            onChange={coinInputChange}
            optionRender={(option) => {
              if (!option?.data) return null;  // 添加空值检查
              return (<div className='flex-x align-center justify-between'>
                <div className="flex items-center py-1">
                  <Image
                    // src={`/images/assets/assets_account/icon_money.png`}
                    src={option.data.iconUrl}
                    alt={option.data.label}
                    width={20}
                    height={20}
                    className={`mr-2`}
                    style={{ borderRadius: '50%', height: '20px', width: '20px' }}
                  />
                  <span className="text-text-color7">
                    {`${option.data.coinName}(${option.data.nameDefault})`}
                  </span>
                </div>
              </div>
              );
            }}
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
        {orderType === 'WITHDRAW' && <WithdrawTable
          tableData={withdrawData}
          loading={tableLoading}
          onOk={withdrawHandleOk}
        />}
        {/* 邀请奖励-邀请返佣 */}
        {orderType === 'REBATE' && <InvitationTable tableData={rebateData} loading={tableLoading} />}
        {paramdataRef.current.total > 0 && <div className='w-full flex-x align-center justify-end mt-3'>
          <Pagination
            // position={['bottomRight']}
            className='spot-table-box'
            // showSizeChanger
            defaultCurrent={paramdataRef.current.page}
            pageSize={paramdataRef.current.pageSize}
            size='default'
            total={paramdataRef.current.total} onChange={pageChange} />
        </div>}
        {/* 赠币 */}
        {orderType === 'GIFT' && <GiftTable tableData={giftData} loading={tableLoading} />}
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