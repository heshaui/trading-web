import { NoData } from "@/components/noData";
import { withAssetsLayout } from "@/components/sidebarLayout/AssetsLayout/userAssetsLayout";
import {
  Button,
  ConfigProvider,
  Flex,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
} from "antd";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useState } from "react";
import RedemptionModal from "./components/RedemptionModal";
import ConfirmModal from "./components/ConfirmModal";
import styles from "../../../styles/components/Financial.module.css";
import {
  PurchaseEnum,
  FinancialType,
  getUserFinancialAccount,
  UserFinancialAccountItem,
  UserFinancialAccountParams,
  getMyPosition,
} from "@/services/financial";
import { getCoinAll } from "@/services/assets";
import Image from "next/image";
import { ColumnsType } from "antd/es/table";
import MaskableAmount from "@/components/MaskableAmount";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import dayjs from "dayjs";

const TabsItem = ({
  curProduct,
  setCurProduct,
  tableLoading,
  tableData,
  setOpenRedemption,
  setConfirmModal,
}: {
  curProduct: UserFinancialAccountItem | null;
  setCurProduct: (product: UserFinancialAccountItem | null) => void;
  tableLoading: boolean;
  tableData: UserFinancialAccountItem[];
  setOpenRedemption: (open: boolean) => void;
  setConfirmModal: (confirmModal: {
    open: boolean;
    status: "error" | "success" | null;
    amount?: number;
    type?: FinancialType;
    unit?: string;
    endTime?: number;
  }) => void;
}) => {
  // 表格列
  const columns: ColumnsType<UserFinancialAccountItem> = [
    {
      title: "币种",
      dataIndex: "coinName",
      key: "coinName",
      render: (_: any, record: any) => {
        return (
          <Flex gap="8px">
            {record.iconUrl && (
              <Image width={24} height={24} src={record.iconUrl} alt="" />
            )}
            <div>{record.coinName}</div>
          </Flex>
        );
      },
    },
    {
      title: "自动申购",
      dataIndex: "autoPurchase",
      key: "autoPurchase",
      render: (_: any, record: any) => {
        return (
          <Switch
            size="small"
            checked={record.autoPurchase === PurchaseEnum.YES}
          />
        );
      },
    },
    {
      title: "申购金额",
      dataIndex: "purchaseAmount",
      key: "purchaseAmount",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            <div> {record.purchaseAmount} {record.coinName}</div>
            <div>≈${record.usdPurchaseAmount}</div>
          </div>
        );
      },
    },
    {
      title: "年利率",
      dataIndex: "minAnnualInterestRate",
      key: "minAnnualInterestRate",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            {record.type === FinancialType.CURRENT ? `${record.minAnnualInterestRate}%~` : null}
            {record.maxAnnualInterestRate}%
          </div>
        );
      },
    },
    {
      title: "累计收益",
      dataIndex: "accruedInterest",
      key: "accruedInterest",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            <div>{record.accruedInterest} {record.coinName}</div>
            <div>≈${record.usdAccruedInterest}</div>
          </div>
        );
      },
    },
    {
      title:"申购时间",
      dataIndex: "purchaseTime",
      key: "purchaseTime",
      render: (_: any, record: any) => {
        return dayjs(record.purchaseTime).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      align: "right" as const,
      render: (_: any, record: any) => {
        return (
          <Space>
            <div
              className="font-[400] text-[14px] text-[var(--theme-color)] cursor-pointer"
              onClick={() => setConfirmModal({
                open: true,
                status: "success",
                amount: record.purchaseAmount,
                type: record.type,
                unit: record.coinName,
              })}
            >
              再次申购
            </div>
            <div
              className="font-[400] text-[14px] text-[var(--theme-color)] cursor-pointer"
              onClick={() => {
                setCurProduct(record);
                setOpenRedemption(true);
              }}
            >
              赎回
            </div>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      className={styles.table}
      columns={columns}
      dataSource={tableData}
      pagination={false}
      loading={tableLoading}
      locale={{ emptyText: <NoData /> }}
    />
  );
};

const Financial = () => {

  const router = useRouter();

  const [tableLoading, setTableLoading] = useState(false);
  //打开赎回弹窗
  const [openRedemption, setOpenRedemption] = useState(false);
  //打开确认弹窗
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    status: "error" | "success" | null;
    amount?: number;
    type?: FinancialType;
    unit?: string;
    endTime?: number;
  }>({
    open: false,
    status: null,
    amount: undefined,
    type: undefined,
    unit: undefined,
    endTime: undefined,
  });

  // 当前选中的理财产品
  const [curProduct, setCurProduct] = useState<UserFinancialAccountItem | null>(null);

  // 我的持仓
  const [myAmount, setMyAmount] = useState({
    holdings: 0, // 持仓
    totalRevenue: 0, // 总收益
    lastRevenue: 0, // 昨日收益
    accumulateRevenue: 0, // 30日累计收益
  });

  // 表格数据
  const [formData, setFormData] = useState<UserFinancialAccountParams>({
    type: FinancialType.FIXED,
    coinId: null,
  });
  const [tableData, setTableData] = useState<UserFinancialAccountItem[]>([]);

  // 币种列表
  const [coinList, setCoinList] = useState<{ coinName: string; id: string }[]>(
    []
  );

  // 是否显示金额
  const [showAmount, setShowAmount] = useState(false);

  // 切换tabs
  const items = [
    {
      key: String(FinancialType.FIXED),
      label: "定期",
      children: (
        <TabsItem
          setCurProduct={setCurProduct}
          curProduct={curProduct}
          tableLoading={tableLoading}
          tableData={tableData}
          setOpenRedemption={setOpenRedemption}
          setConfirmModal={setConfirmModal}
        />
      ),
    },
    {
      key: String(FinancialType.CURRENT),
      label: "活期",
      children: (
        <TabsItem
          setCurProduct={setCurProduct}
          curProduct={curProduct}
          tableLoading={tableLoading}
          tableData={tableData}
          setOpenRedemption={setOpenRedemption}
          setConfirmModal={setConfirmModal}
        />
      ),
    },
  ];

  // 获取理财产品列表
  const fetchData = async (params: UserFinancialAccountParams) => {
    try {
      setTableLoading(true);
      const res = await getUserFinancialAccount(params);
      if (res.code === "0") {
        setTableData(res.data);
        console.log(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  // 获取币种列表
  const fetchCoinList = async () => {
    try {
      const response = await getCoinAll();
      if (response.code === "0" && Array.isArray(response.data)) {
        setCoinList(
          response.data.map((item: any) => ({
            coinName: item.coinName,
            id: item.coinId,
          }))
        );
      } else {
      }
    } catch (error) {
      console.error("获取币种列表失败:", error);
    }
  };

  // 我的持仓
  const fetchMyPosition = async () => {
    try {
      const res = await getMyPosition();
      if (res.code === "0") {
        setMyAmount(res.data);
      }
    } catch (error) {
      console.error("Failed to load position data:", error);
    }
  };

  useEffect(() => {
    fetchCoinList();
    fetchMyPosition();
  }, []);

  useEffect(() => {
    fetchData(formData);
  }, [formData]);

  return (
    <>
      <RedemptionModal
        curProduct={curProduct}
        openRedemption={openRedemption}
        setOpenRedemption={setOpenRedemption}
        setConfirmModal={setConfirmModal}
      />
      <ConfirmModal confirmModal={confirmModal} setConfirmModal={setConfirmModal} />
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: "transparent",
              headerColor: "var(--text-color6)",
              headerSplitColor: "transparent", // 表头分割线颜色
              rowExpandedBg: "var(--background10)", // 表格行展开背景色
              borderColor: "transparent",
              headerBorderRadius: 0, // 表头圆角
            },
            Tabs: {
              horizontalMargin: "0px",
              inkBarColor: "var(--text-color5)", // 指示条颜色
              itemSelectedColor: "var(--text-color5)", // 选中文本颜色
              itemColor: "var(--text-color6)", // 文本颜色
              itemHoverColor: "var(--text-color5)", // 悬停文本颜色
            },
          },
        }}
      >
        <div>
          {/* title */}
          <div className="text-[20px] text-[var(--text-color5)] font-[500] mb-[16px]">
            理财账户
          </div>
          {/* content */}
          <div className="bg-[var(--btncolor7)] rounded-[8px] p-[20px]">
            {/* 头部 */}
            <div className="h-[274px] bg-[var(--background14)] rounded-[8px] mb-[30px]">
              {/* 顶部 */}
              <div className="p-[30px] flex justify-between items-end">
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400] flex items-center gap-[4px]">
                    <div>总资产</div>
                    <div>
                    {!showAmount ? (
                      <EyeOutlined
                        size={18}
                        className="cursor-pointer"
                        onClick={() => setShowAmount(!showAmount)}
                      />
                    ) : (
                      <EyeInvisibleOutlined
                        size={18}
                        className="cursor-pointer"
                        onClick={() => setShowAmount(!showAmount)}
                      />
                    )}
                  </div>
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    <MaskableAmount show={showAmount} amount={myAmount.holdings} unit="USD" /> 
                  </div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    <MaskableAmount prefix="≈" show={showAmount} amount={myAmount.holdings} unit="CNY" />
                  </div>
                </div>
                <Button type="primary" onClick={() => {
                  router.push("/financial");
                }}>理财产品</Button>
              </div>
              <div className="m-[0px_30px] border-t border-[var(--border-color4)]" />
              {/* 底部 */}
              <div className="flex gap-[229px] p-[30px]">
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    昨日收益（USDT）
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    <MaskableAmount show={showAmount} amount={myAmount.lastRevenue} unit="USD" />
                  </div>
                </div>
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    30日累计收益（USDT）
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    <MaskableAmount show={showAmount} amount={myAmount.accumulateRevenue} unit="USD" />
                  </div>
                </div>
              </div>
            </div>
            {/* 表格 */}
            <Tabs
              className={styles.tabs}
              items={items}
              tabBarStyle={{ padding: "0 20px", height: "72px" }}
              tabBarExtraContent={{
                right: (
                  <Select
                    allowClear
                    className="w-[170px] h-[30px]"
                    value={formData.coinId}
                    onChange={(value) =>
                      setFormData({ ...formData, coinId: value })
                    }
                    options={[
                      { label: "全部", value: null },
                      ...coinList.map((item) => ({
                        label: item.coinName,
                        value: item.id,
                      })),
                    ]}
                  />
                ),
              }}
              onChange={(key) =>
                setFormData({ type: Number(key), coinId: null })
              }
            />
          </div>
        </div>
      </ConfigProvider>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["assets", "common"])),
    },
  };
};
export default withAssetsLayout(Financial);
