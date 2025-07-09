import { NoData } from "@/components/noData";
import { withAssetsLayout } from "@/components/sidebarLayout/AssetsLayout/userAssetsLayout";
import {
  Button,
  ConfigProvider,
  Flex,
  message,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
} from "antd";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useState } from "react";
import RedemptionModal from "../../../components/Financial/RedemptionModal";
import ConfirmModal from "@/components/Financial/ConfirmModal";
import styles from "../../../styles/components/Financial.module.css";
import {
  OpenStatusEnum,
  FinancialType,
  getUserFinancialAccount,
  UserFinancialAccountItem,
  UserFinancialAccountParams,
  getMyPosition,
  FinancialPageTokenItem,
  FinancialPageTokenProductItem,
  getFinancialPageToken,
  financialAccountAutoPurchase,
} from "@/services/financial";
import { getCoinAll } from "@/services/assets";
import Image from "next/image";
import { ColumnsType } from "antd/es/table";
import MaskableAmount from "@/components/MaskableAmount";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import SubscribeModal from "@/components/Financial/SubscribeModal";
import RedeemConfirmModal from "@/components/Financial/RedeemConfirmModal";
import { useTranslation } from "react-i18next";

interface ConfirmModalType {
  open: boolean;
  status: "error" | "success" | null;
  amount?: number;
  interest?: number;
  type?: FinancialType;
  unit?: string;
  endTime?: string | number;
}

interface TabsItemProps {
  setCurProduct: (product: UserFinancialAccountItem | null) => void;
  tableLoading: boolean;
  tableData: UserFinancialAccountItem[];
  setOpenRedemption: (open: boolean) => void;
  setCurRecord?: (
    record: {
      token: FinancialPageTokenItem;
      curProduct: FinancialPageTokenProductItem;
    } | null
  ) => void;
  setOpenSubscribe?: (open: boolean) => void;
}

const TabsItem = ({
  setCurProduct,
  tableLoading,
  tableData,
  setOpenRedemption,
  setCurRecord,
  setOpenSubscribe,
}: TabsItemProps) => {
  // 表格列
  const { t } = useTranslation(["financial"]);
  const columns: ColumnsType<UserFinancialAccountItem> = [
    {
      title: t("common.token"),
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
      title: t("common.autoPurchase"),
      dataIndex: "autoPurchase",
      key: "autoPurchase",
      render: (_: any, record: any) => {
        return (
          <Switch
            defaultChecked={Number(record.autoPurchase) === OpenStatusEnum.YES}
            onChange={async (checked) => {
              const res = await financialAccountAutoPurchase({
                id: record.id,
                autoPurchase: checked ? OpenStatusEnum.YES : OpenStatusEnum.NO,
              });
              if (res.code === "0") {
                message.success("操作成功");
              } else {
                message.error(res.message);
                record.autoPurchase = checked ? OpenStatusEnum.NO : OpenStatusEnum.YES;
              }
            }}
            size="small"
          />
        );
      },
    },
    {
      title: t("common.purchaseAmount"),
      dataIndex: "purchaseAmount",
      key: "purchaseAmount",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            <div>
              {record.purchaseAmount} {record.coinName}
            </div>
            <div>≈${record.usdPurchaseAmount}</div>
          </div>
        );
      },
    },
    {
      title: t("common.annualRate"),
      dataIndex: "minAnnualInterestRate",
      key: "minAnnualInterestRate",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            {record.type === FinancialType.CURRENT
              ? `${record.minAnnualInterestRate}%~`
              : null}
            {record.maxAnnualInterestRate}%
          </div>
        );
      },
    },
    {
      title: t("common.totalIncome"),
      dataIndex: "accruedInterest",
      key: "accruedInterest",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            <div>
              {record.accruedInterest} {record.coinName}
            </div>
            <div>≈${record.usdAccruedInterest}</div>
          </div>
        );
      },
    },
    {
      title: t("common.operation"),
      dataIndex: "action",
      align: "right" as const,
      render: (_: any, record: any) => {
        return (
          <Space>
            {/* 判断是否活期 */}
            {record.type === FinancialType.CURRENT && (
              <div
                className="font-[400] text-[14px] text-[var(--theme-color)] cursor-pointer"
                onClick={async () => {
                  try {
                    const res = await getFinancialPageToken({
                      coinId: record.coinId,
                    });
                    if (res.code === "0") {
                      const curProduct = res.data[0].products?.filter(
                        (item) => item.id === record.projectId
                      )[0];
                      if (curProduct) {
                        setCurRecord?.({
                          token: res.data[0],
                          curProduct,
                        });
                      }
                      setOpenSubscribe?.(true);
                    } else {
                      setCurRecord?.(null);
                    }
                    return res;
                  } catch (error) {
                    console.error("获取数据失败:", error);
                  }
                }}
              >
                {t("common.subscribeAgain")}
              </div>
            )}
            {/* 定期 */}
            {/* 判断是否允许提前赎回 */}
            {record.type === FinancialType.FIXED ? (
              record.isRedemption === OpenStatusEnum.YES ? (
                // 赎回按钮
                <div
                  className="font-[400] text-[14px] text-[var(--theme-color)] cursor-pointer"
                  onClick={() => {
                    setCurProduct(record);
                    setOpenRedemption(true);
                  }}
                >
                  {t("common.redeem")}
                </div>
              ) : (
                // 自动赎回
                <div className="font-[400] text-[14px] text-[var(--text-color6)]">
                  {t("common.autoRedeem")}
                </div>
              )
            ) : null}
            {/* 活期 */}
            {record.type === FinancialType.CURRENT && (
              <div
                className="font-[400] text-[14px] text-[var(--theme-color)] cursor-pointer"
                onClick={() => {
                  setCurProduct(record);
                  setOpenRedemption(true);
                }}
              >
                {t("common.redeem")}
              </div>
            )}
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
  const { t } = useTranslation(["financial"]);

  const { type } = router.query;

  // 根据URL中的type参数确定默认的标签页类型，如果没有type参数则默认为定期
  const getDefaultType = () => {
    if (type === String(FinancialType.CURRENT)) {
      return FinancialType.CURRENT;
    }
    return FinancialType.FIXED; // 默认为定期
  };

  const defaultActiveKey = getDefaultType();

  const [tableLoading, setTableLoading] = useState(false);
  //打开赎回弹窗
  const [openRedemption, setOpenRedemption] = useState(false);
  //打开确认弹窗
  const [confirmModal, setConfirmModal] = useState<ConfirmModalType>({
    open: false,
    status: null,
    amount: undefined,
    type: undefined,
    unit: undefined,
    endTime: undefined,
  });

  const [redeemConfirmModal, setRedeemConfirmModal] =
    useState<ConfirmModalType>({
      open: false,
      status: null,
      amount: undefined,
      interest: undefined,
      type: undefined,
      unit: undefined,
      endTime: undefined,
    });

  // 当前选中的理财产品
  const [curProduct, setCurProduct] = useState<UserFinancialAccountItem | null>(
    null
  );

  const [curRecord, setCurRecord] = useState<{
    token: FinancialPageTokenItem;
    curProduct: FinancialPageTokenProductItem;
  } | null>(null); // 当前记录

  const [openSubscribe, setOpenSubscribe] = useState(false);

  // 我的持仓
  const [myAmount, setMyAmount] = useState({
    holdings: 0, // 持仓
    totalRevenue: 0, // 总收益
    lastRevenue: 0, // 昨日收益
    accumulateRevenue: 0, // 30日累计收益
  });

  // 表格数据
  const [formData, setFormData] = useState<UserFinancialAccountParams>({
    type: defaultActiveKey, // 根据URL参数设置默认类型
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
      label: t("common.fixed"),
      children: (
        <TabsItem
          setCurProduct={setCurProduct}
          tableLoading={tableLoading}
          tableData={tableData}
          setOpenRedemption={setOpenRedemption}
        />
      ),
    },
    {
      key: String(FinancialType.CURRENT),
      label: t("common.current"),
      children: (
        <TabsItem
          setOpenSubscribe={setOpenSubscribe}
          setCurRecord={setCurRecord}
          setCurProduct={setCurProduct}
          tableLoading={tableLoading}
          tableData={tableData}
          setOpenRedemption={setOpenRedemption}
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
      } else {
        setTableData([]);
        message.error(res.message);
      }
    } catch (error) {
      setTableData([]);
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

  // 添加刷新函数
  const handleRefresh = () => {
    fetchData(formData);
    fetchMyPosition();
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
      {/* 赎回弹窗 */}
      <RedemptionModal
        curProduct={curProduct}
        openRedemption={openRedemption}
        setOpenRedemption={setOpenRedemption}
        setRedeemConfirmModal={setRedeemConfirmModal}
        onRefresh={handleRefresh}
      />

      {/* 确认弹窗 */}
      <ConfirmModal
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
      />

      {/* 申购弹窗 */}
      <SubscribeModal
        curRecord={curRecord}
        openSubscribe={openSubscribe}
        setOpenSubscribe={setOpenSubscribe}
        setConfirmModal={setConfirmModal}
        onRefresh={handleRefresh}
      />

      {/* 赎回确认弹窗 */}
      <RedeemConfirmModal
        redeemConfirmModal={redeemConfirmModal}
        setRedeemConfirmModal={setRedeemConfirmModal}
      />

      {/* 基础页面 */}
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
            {t("common.financialAccount")}
          </div>
          {/* content */}
          <div className="bg-[var(--btncolor7)] rounded-[8px] p-[20px]">
            {/* 头部 */}
            <div className="h-[274px] bg-[var(--background14)] rounded-[8px] mb-[30px]">
              {/* 顶部 */}
              <div className="p-[30px] flex justify-between items-end">
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400] flex items-center gap-[4px]">
                    <div>{t("common.totalAssets")}</div>
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
                    <MaskableAmount
                      show={showAmount}
                      amount={myAmount.holdings}
                      unit="USD"
                    />
                  </div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    <MaskableAmount
                      prefix="≈"
                      show={showAmount}
                      amount={myAmount.holdings}
                      unit="CNY"
                    />
                  </div>
                </div>
                <Button
                  type="primary"
                  onClick={() => {
                    router.push("/financial");
                  }}
                >
                  {t("common.financialProduct")}
                </Button>
              </div>
              <div className="m-[0px_30px] border-t border-[var(--border-color4)]" />
              {/* 底部 */}
              <div className="flex gap-[229px] p-[30px]">
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    {t("common.yesterdayIncome")}（USDT）
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    <MaskableAmount
                      show={showAmount}
                      amount={myAmount.lastRevenue}
                      unit="USD"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    {t("common.thirtyDaysIncome")}（USDT）
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    <MaskableAmount
                      show={showAmount}
                      amount={myAmount.accumulateRevenue}
                      unit="USD"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* 表格 */}
            <Tabs
              className={styles.tabs}
              items={items}
              defaultActiveKey={String(defaultActiveKey)}
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
                      { label: t("common.all"), value: null },
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
      ...(await serverSideTranslations(locale || "en", ["assets", "common", "financial"])),
    },
  };
};
export default withAssetsLayout(Financial);
