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
import styles from "../../../styles/components/Financial.module.css";
import {
  OpenStatusEnum,
  FinancialType,
  getUserFinancialAccount,
  UserFinancialAccountItem,
  UserFinancialAccountParams,
  FinancialPageTokenItem,
  FinancialPageTokenProductItem,
  getFinancialPageToken,
  financialAccountAutoPurchase,
  getFinancialAccount,
  FinancialAccountItem,
} from "@/services/financial";
import { getCoinAll } from "@/services/assets";
import Image from "next/image";
import { ColumnsType } from "antd/es/table";
import MaskableAmount from "@/components/MaskableAmount";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import SubscribeModal from "@/components/Financial/SubscribeModal";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import appStore from "@/store";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import { getCoinRound } from "@/utils/getUseRate";

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null
interface TabsItemProps {
  current: {
    symbol: string;
    rate: number;
    shortName: string;
  };
  type: FinancialType;
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
  setOpenSubscribeModal?: (open: boolean) => void;
}

const TabsItem = ({
  current,
  type,
  setCurProduct,
  tableLoading,
  tableData,
  setOpenRedemption,
  setCurRecord,
  setOpenSubscribeModal,
}: TabsItemProps) => {
  // 表格列
  const { t } = useTranslation(["financial"]);

  // 定期 币种 自动申购 申购日期 期限(天) 申购金额 年利率 累计收益 赎回日期 操作
  // 活期 币种 自动申购                 申购金额 年利率 累计收益        操作
  const columns: ColumnsType<UserFinancialAccountItem> = [
    // 币种
    {
      title: t("common.token"),
      dataIndex: "coinName",
      key: "coinName",
      render: (_: any, record: any) => {
        return (
          <Flex gap="8px">
            {record.iconUrl && (
              <Image
                width={24}
                height={24}
                src={record.iconUrl}
                alt=""
                style={{ borderRadius: "50%" }}
              />
            )}
            <div>{record.coinName}</div>
          </Flex>
        );
      },
    },

    // 自动申购
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
                record.autoPurchase = checked
                  ? OpenStatusEnum.NO
                  : OpenStatusEnum.YES;
              }
            }}
            size="small"
          />
        );
      },
    },

    // 申购日期 定期显示
    ...(type === FinancialType.FIXED
      ? [
          {
            title: t("common.subscribeDate"),
            dataIndex: "purchaseStartTime",
            key: "purchaseStartTime",
            render: (_: any, record: any) => {
              return record.purchaseStartTime
                ? dayjs(record.purchaseStartTime).format("YYYY-MM-DD HH:mm:ss")
                : "--";
            },
          },
        ]
      : []),

    // 期限(天) 定期显示
    ...(type === FinancialType.FIXED
      ? [
          {
            title: `${t("common.term")}(${t("common.day")})`,
            dataIndex: "term",
            key: "term",
          },
        ]
      : []),

    // 申购金额
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
            <div>
              ≈{current.symbol}{" "}
              {getCoinRound(
                current.shortName,
                new BigNumber(record.usdPurchaseAmount)
                  .times(new BigNumber(current.rate))
                  .toString()
              )}
            </div>
          </div>
        );
      },
    },

    // 年利率
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

    // 累计收益
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
            <div>
              ≈{current.symbol}{" "}
              {getCoinRound(
                current.shortName,
                new BigNumber(record.usdAccruedInterest)
                  .times(new BigNumber(current.rate))
                  .toString()
              )}
            </div>
          </div>
        );
      },
    },

    // 赎回日期 定期显示
    ...(type === FinancialType.FIXED
      ? [
          {
            title: t("common.redeemDate"),
            dataIndex: "purchaseEndTime",
            key: "purchaseEndTime",
            render: (_: any, record: any) => {
              return record.purchaseEndTime
                ? dayjs(record.purchaseEndTime).format("YYYY-MM-DD HH:mm:ss")
                : "--";
            },
          },
        ]
      : []),

    // 操作
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
                      setOpenSubscribeModal?.(true);
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
      rowKey="id"
      className={styles.table}
      columns={columns}
      dataSource={tableData}
      pagination={false}
      loading={tableLoading}
      locale={{ emptyText: <NoData height="35vh" /> }}
    />
  );
};

const Financial = observer(() => {
  const router = useRouter();
  const { t } = useTranslation(["financial"]);
  const rateKey = appStore.getRateKey()?.replace(/\s+/g, "") || "USD"; // 汇率key
  const [current, setCurrent] = useState({
    rate: 1,
    symbol: "$",
    shortName: "USD",
  });
  const rateData = appStore.getRateData();

  // 使用 state 来管理当前激活的标签页，避免 hydration 不匹配
  const [activeKey, setActiveKey] = useState<FinancialType>(
    FinancialType.FIXED
  );

  // 当路由准备就绪时，根据URL参数设置激活的标签页
  useEffect(() => {
    if (router.isReady) {
      const { type } = router.query;
      const newActiveKey =
        type === String(FinancialType.CURRENT)
          ? FinancialType.CURRENT
          : FinancialType.FIXED;

      setActiveKey(newActiveKey);
      setFormData((prev) => ({ ...prev, type: newActiveKey }));
    }
  }, [router.isReady, router.query]);

  const [tableLoading, setTableLoading] = useState(false);
  //打开赎回弹窗
  const [openRedemption, setOpenRedemption] = useState(false);

  // 当前选中的理财产品
  const [curProduct, setCurProduct] = useState<UserFinancialAccountItem | null>(
    null
  );

  // 当前选中的申购产品
  const [curRecord, setCurRecord] = useState<{
    token: FinancialPageTokenItem;
    curProduct: FinancialPageTokenProductItem;
  } | null>(null); // 当前记录

  // 打开申购弹窗
  const [openSubscribeModal, setOpenSubscribeModal] = useState(false);

  // 我的持仓
  const [myAmount, setMyAmount] = useState<FinancialAccountItem>({
    totalAssets: 0, // 总资产
    usdTotalAssets: 0, // usd总资产
    lastRevenue: 0, // 昨日收益
    accumulateRevenue: 0, // 30日累计收益
  });

  // 表单数据
  const [formData, setFormData] = useState<UserFinancialAccountParams>({
    type: FinancialType.FIXED, // 默认为定期，路由准备就绪后会更新
    coinId: null,
  });

  // 表格数据
  const [tableData, setTableData] = useState<UserFinancialAccountItem[]>([]);

  // 币种列表
  const [coinList, setCoinList] = useState<{ coinName: string; id: string }[]>(
    []
  );

  // 是否显示金额
  const [showAmount, setShowAmount] = useState(true);

  // 是否是客户端渲染
  const [isClient, setIsClient] = useState(false);

  // 切换tabs
  const items = [
    {
      key: String(FinancialType.FIXED),
      label: t("common.fixed"),
      children: (
        <TabsItem
          current={current}
          type={FinancialType.FIXED}
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
          current={current}
          type={FinancialType.CURRENT}
          setOpenSubscribeModal={setOpenSubscribeModal}
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
      const res = await getFinancialAccount();
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

  // 获取汇率
  useEffect(() => {
    const currentInfo = rateData.find(
      (item: any) => item.shortName === rateKey
    );
    setCurrent({
      shortName: currentInfo?.shortName || "USD",
      rate: currentInfo?.exchangeRate || 1,
      symbol: currentInfo?.symbol || "$",
    });
  }, [rateKey, rateData]);

  // 获取币种列表 我的持仓
  useEffect(() => {
    fetchCoinList();
    fetchMyPosition();
  }, []);

  // 获取表格数据
  useEffect(() => {
    fetchData(formData);
  }, [formData]);

  // 是否是客户端渲染
  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染

  return (
    <>
      {/* 赎回弹窗 */}
      <RedemptionModal
        curProduct={curProduct}
        openRedemption={openRedemption}
        setOpenRedemption={setOpenRedemption}
        onRefresh={handleRefresh}
      />

      {/* 申购弹窗 */}
      <SubscribeModal
        curRecord={curRecord}
        openSubscribeModal={openSubscribeModal}
        setOpenSubscribeModal={setOpenSubscribeModal}
        onRefresh={handleRefresh}
      />

      {/* 基础页面 */}
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: "transparent", // 表头背景色
              headerColor: "var(--text-color6)", // 表头文本颜色
              headerSplitColor: "transparent", // 表头分割线颜色
              rowExpandedBg: "var(--background10)", // 表格行展开背景色
              borderColor: "transparent", // 表格边框颜色
              headerBorderRadius: 0, // 表头圆角
              // 悬停背景色
              rowHoverBg: "var(--bgc-color)",
            },
            Tabs: {
              horizontalMargin: "0px",
              inkBarColor: "var(--text-color5)", // 指示条颜色
              itemSelectedColor: "var(--text-color5)", // 选中文本颜色
              itemColor: "var(--text-color6)", // 文本颜色
              itemHoverColor: "var(--text-color5)", // 悬停文本颜色
            },
            Switch: {
              colorTextQuaternary: "var(--switch-color)", // 关闭状态背景色
              colorTextTertiary: "var(--switch-color)", // 悬停背景颜色
            },
          },
        }}
      >
        <div className="flex flex-col h-full">
          {/* title */}
          <div className="text-[20px] text-[var(--text-color5)] font-[500] mb-[16px]">
            {t("common.financialAccount")}
          </div>
          {/* content */}
          <div className="bg-[var(--btncolor7)] rounded-[8px] p-[20px] flex-1">
            {/* 头部 */}
            <div className="h-[274px] bg-[var(--background14)] rounded-[8px] mb-[30px]">
              {/* 顶部 */}
              <div className="p-[30px] flex justify-between items-end">
                {/* 左侧 总资产 */}
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400] flex items-center gap-[4px]">
                    <div>{t("common.totalAssets")}</div>
                    <div>
                      {showAmount ? (
                        <EyeOutlined
                          style={{ color: "var(--text-color6)" }}
                          size={18}
                          className="cursor-pointer"
                          onClick={() => setShowAmount(!showAmount)}
                        />
                      ) : (
                        <EyeInvisibleOutlined
                          style={{ color: "var(--text-color6)" }} 
                          size={18}
                          className="cursor-pointer"
                          onClick={() => setShowAmount(!showAmount)}
                        />
                      )}
                    </div>
                  </div>
                  {/* 总资产 totalAssets*/}
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    <MaskableAmount
                      show={showAmount}
                      amount={myAmount.totalAssets}
                      unit="USDT"
                    />
                  </div>
                  {/* 总资产 兑换当前汇率 */}
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    <MaskableAmount
                      prefix="≈"
                      show={showAmount}
                      amount={getCoinRound(
                        current.shortName,
                        new BigNumber(myAmount.usdTotalAssets)
                          .times(new BigNumber(current.rate))
                          .toString()
                      )}
                      unit={current.shortName}
                    />
                  </div>
                </div>
                {/* 跳转理财页面 */}
                <Button
                  type="primary"
                  shape="round"
                  onClick={() => {
                    router.push("/financial");
                  }}
                >
                  {t("common.financialProduct")}
                </Button>
              </div>
              {/* 分割线 */}
              <div className="m-[0px_30px] border-t border-[var(--divider-color)]" />
              {/* 底部 */}
              <div className="flex gap-[229px] p-[30px]">
                {/* 昨日收益  lastRevenue*/}
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    {t("common.yesterdayIncome")}（USDT）
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    <MaskableAmount
                      show={showAmount}
                      amount={myAmount.lastRevenue}
                    />
                  </div>
                </div>
                {/* 三十天收益（USDT）  accumulateRevenue*/}
                <div>
                  <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                    {t("common.thirtyDaysIncome")}（USDT）
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    <MaskableAmount
                      show={showAmount}
                      amount={myAmount.accumulateRevenue}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* 表格 */}
            <Tabs
              className={styles.tabs}
              items={items}
              activeKey={String(activeKey)}
              tabBarStyle={{ padding: "0 20px", height: "72px" }}
              tabBarExtraContent={{
                right: (
                  <Select
                    allowClear
                    className="w-[170px] h-[30px]"
                    value={
                      !formData.coinId ? NULL_PLACEHOLDER : formData.coinId
                    }
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        coinId:
                          value === NULL_PLACEHOLDER ? null : Number(value),
                      })
                    }
                    options={[
                      { label: t("common.all"), value: NULL_PLACEHOLDER },
                      ...coinList.map((item) => ({
                        label: item.coinName,
                        value: item.id,
                      })),
                    ]}
                  />
                ),
              }}
              onChange={(key) => {
                const newType = Number(key);
                setActiveKey(newType);
                setFormData({ type: newType, coinId: null });
              }}
            />
          </div>
        </div>
      </ConfigProvider>
    </>
  );
});

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "assets",
        "common",
        "financial",
      ])),
    },
  };
};
export default withAssetsLayout(Financial);
