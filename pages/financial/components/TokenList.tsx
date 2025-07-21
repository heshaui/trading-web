import { DownOutlined, UpOutlined } from "@ant-design/icons";
import {
  Select,
  Space,
  Table,
  Button,
  ConfigProvider,
  Modal,
  Spin,
} from "antd";
import { useState, useEffect } from "react";
import styles from "../../../styles/components/Financial.module.css";
import { FinancialConfig } from "../index";
import {
  CoinFilterOptionsItem,
  FinancialPageTokenItem,
  FinancialPageTokenProductItem,
  FinancialPageTokenStatusEnum,
  FinancialType,
  getCoinFilterOptions,
  getFinancialPageToken,
  getProductFilterOptions,
  ProductFilterOptionsItem,
  FunctionEnabledStatusEnum,
} from "@/services/financial";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { NoData } from "@/components/noData";
import { useRouter } from "next/router";
import Image from "next/image";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const termTypeMap: Record<number, string> = {
  [FinancialType.CURRENT]: "common.current",
  [FinancialType.FIXED]: "common.fixed",
};

interface TokenListProps {
  setCurRecord: (record: {
    token: FinancialPageTokenItem;
    curProduct: FinancialPageTokenProductItem;
  }) => void;
  setOpenSubscribe: (open: boolean) => void;
  financialConfig: FinancialConfig;
  isLoggedIn: boolean;
}
const TokenList = ({
  setOpenSubscribe,
  financialConfig,
  isLoggedIn,
  setCurRecord,
}: TokenListProps) => {
  const router = useRouter();
  const { t } = useTranslation(["financial"]);

  // 展开的行
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  // 加载中
  const [loading, setLoading] = useState(false);

  // 数据源
  const [dataSource, setDataSource] = useState<FinancialPageTokenItem[]>([]);

  // 表单数据
  const [formData, setFormData] = useState({
    coinId: null,
    type: null,
    term: null,
    selectedValue: null, // 用于 Select 回显的完整值
  }); // 表单数据

  // 产品筛选选项
  const [productFilterOptions, setProductFilterOptions] = useState<
    {
      label: string;
      value: string | number | null;
    }[]
  >([]);

  // 币种筛选选项
  const [coinFilterOptions, setCoinFilterOptions] = useState<
    CoinFilterOptionsItem[]
  >([]);

  // 请求当前项目列表
  const fetchData = async (params: any) => {
    try {
      setLoading(true);
      const res = await getFinancialPageToken({
        type: params.type,
        term: params.term,
        coinId: params.coinId,
      });
      if (res.code === "0") {
        setDataSource(res.data);
        console.log(res.data);
      } else {
        setDataSource([]);
      }
      return res;
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 展开行
  const handleExpand = (key: number | undefined) => {
    if (!key) return;
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys(expandedRowKeys.filter((k) => k !== key));
    } else {
      setExpandedRowKeys([...expandedRowKeys, key]);
    }
  };

  // 申购
  const onSubscribe = (
    record: FinancialPageTokenItem,
    productRecord: FinancialPageTokenProductItem
  ) => {
    const userInfo = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || "{}"
    );

    console.log(userInfo);
    if (
      // 判断是否需要实名认证
      financialConfig?.isRealname &&
      financialConfig.isRealname === FunctionEnabledStatusEnum.CLOSE &&
      userInfo.realnessStatus === 2
    ) {
      setCurRecord({
        token: record,
        curProduct: productRecord,
      });
      setOpenSubscribe(true);
    } else {
      console.log(record);
      Modal.confirm({
        className: styles.modal,
        title: (
          <div className="font-w-400 text-[16px] text-[var(--text-color5)]">
            {t("financial.needToCompleteTheFollowingOperations")}
          </div>
        ),
        closable: true,
        icon: null,
        styles: {
          content: {
            backgroundColor: "var(--background12)",
          },
        },
        content: (
          <div className="flex gap-[10px] p-[32px_20px_73px_20px]">
            <div className="font-w-400 text-[14px] text-[var(--text-color5)]">
              {t("financial.bindIdentity")}
            </div>
            <div
              className="text-[var(--theme-color)] cursor-pointer"
              onClick={() => router.push("/user/identity")}
            >
              {t("financial.goTo")}
            </div>
          </div>
        ),
        footer: null,
      });
    }
  };

  // 更多
  const more = async () => {
    console.log("more");
  };

  // 列配置
  const columns: ColumnsType<FinancialPageTokenItem> = [
    {
      title: t("common.token"),
      dataIndex: "coinName",
      key: "coinName",
      width: "30%",
      render: (_: any, record: FinancialPageTokenItem) => (
        <div className="flex items-center gap-[10px]">
          {record.iconUrl ? (
            <Image
              src={record.iconUrl}
              alt={record.coinName || ""}
              width={24}
              height={24}
            />
          ) : null}
          <span>{record.coinName}</span>
        </div>
      ),
    },
    {
      title: t("common.annualRate"),
      dataIndex: "minInterestRate",
      key: "minInterestRate",
      width: "30%",
      render: (_: any, record: FinancialPageTokenItem) => (
        <div className="flex items-center gap-[10px]">
          <span>{record.minInterestRate}%</span>~
          <span>{record.maxInterestRate}%</span>
        </div>
      ),
    },
    {
      title: t("common.period"),
      dataIndex: "termType",
      key: "termType",
      width: "30%",
      render: (_: any, record: FinancialPageTokenItem) => (
        <div className="flex items-center">
          {record?.termType?.split(",").map((item: string, index: number) => (
            <span key={item}>
              {t(termTypeMap[Number(item)])}
              {index === 0 && record?.termType?.includes(",") && "/"}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: t("common.operation"),
      dataIndex: "action",
      key: "action",
      width: "10%",
      align: "right" as const,
      render: (_: any, record: FinancialPageTokenItem) =>
        record.coinId && (
          <Button
            type="text"
            size="small"
            icon={
              expandedRowKeys.includes(record.coinId) ? (
                <UpOutlined />
              ) : (
                <DownOutlined />
              )
            }
            onClick={() => handleExpand(record.coinId)}
          />
        ),
    },
  ];

  // 初始化产品筛选选项
  const initProductFilterOptions = async () => {
    const res = await getProductFilterOptions();
    if (res.code === "0") {
      const options = res.data.map(
        (item: ProductFilterOptionsItem, index: number) => {
          return {
            label:
              item.type === FinancialType.CURRENT
                ? t("common.current")
                : `${t("common.fixed")} (${item.term}${t("common.day")})`,
            value:
              item.type === FinancialType.FIXED
                ? `${item.type}-${item.term}`
                : item.type,
          };
        }
      );
      setProductFilterOptions(options);
    }
  };

  // 初始化币种筛选选项
  const initTokenList = async () => {
    const res = await getCoinFilterOptions();
    if (res.code === "0") {
      setCoinFilterOptions(res.data);
    }
  };

  // 初始化
  useEffect(() => {
    initProductFilterOptions();
    initTokenList();
  }, []);

  // 获取数据
  useEffect(() => {
    fetchData(formData);
  }, [formData]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "transparent",
            headerSplitColor: "transparent",
            borderColor: "transparent",
            rowExpandedBg: "var(--bgc-color)",
            headerColor: "var(--text-color6)",
            fontWeightStrong: 400,
            headerBorderRadius: 0,
          },
        },
      }}
    >
      <div className="p-[30px_120px]">
        {/* 筛选 */}
        <Space size={30} className="mb-[14px]">
          {/* 币种筛选 */}
          <Select
            placeholder={t("common.pleaseEnterTheCoin")}
            allowClear
            showSearch
            value={formData.coinId}
            className="w-[188px] h-[40px]"
            onChange={(value) => {
              setFormData({ ...formData, coinId: value });
              setExpandedRowKeys([]);
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={[
              { value: null, label: t("common.all") },
              ...coinFilterOptions.map((item) => ({
                value: item.coinId,
                label: item.coinName,
              })),
            ]}
          />
          {/* 类型筛选 */}
          <Select
            placeholder={t("common.pleaseEnterTheType")}
            allowClear
            defaultValue={null}
            value={formData.selectedValue}
            className="w-[188px] h-[40px]"
            onChange={(value: any) => {
              console.log(value);
              setFormData({
                ...formData,
                selectedValue: value,
                type:
                  value === null
                    ? null
                    : value === FinancialType.CURRENT
                    ? value
                    : value?.split("-")[0],
                term:
                  value === null
                    ? null
                    : value === FinancialType.CURRENT
                    ? null
                    : value?.split("-")[1],
              });
              setExpandedRowKeys([]);
            }}
            options={[
              { value: null, label: t("common.all") },
              ...productFilterOptions.map((item) => ({
                value: item.value,
                label: item.label,
              })),
            ]}
          />
        </Space>

        {/* 表格 */}
        <Spin spinning={loading}>
          <Table
            className={styles.table}
            bordered={false}
            rowKey="coinId"
            expandable={{
              expandedRowRender: (record: FinancialPageTokenItem) => {
                const dynamicColumns: ColumnsType<FinancialPageTokenProductItem> =
                  [
                    {
                      title: "",
                      dataIndex: "",
                      key: "",
                      width: "30%",
                    },
                    {
                      title: t("common.annualRate"),
                      dataIndex: "minAnnualInterestRate",
                      key: "minAnnualInterestRate",
                      width: "30%",
                      render: (
                        text: string,
                        productRecord: FinancialPageTokenProductItem
                      ) => (
                        <div className="flex items-center gap-[10px]">
                          {productRecord.type === FinancialType.FIXED ? (
                            <span>{productRecord.maxAnnualInterestRate}%</span>
                          ) : (
                            <>
                              <span>
                                {productRecord.minAnnualInterestRate}%
                              </span>
                              ~
                              <span>
                                {productRecord.maxAnnualInterestRate}%
                              </span>
                            </>
                          )}
                        </div>
                      ),
                    },
                    {
                      title: t("common.period"),
                      dataIndex: "term",
                      key: "term",
                      width: "30%",
                      render: (
                        text: string,
                        productRecord: FinancialPageTokenProductItem
                      ) => (
                        <div className="flex items-center gap-[10px]">
                          {productRecord.type === FinancialType.CURRENT
                            ? t("common.current")
                            : `${t("common.fixed")} (${productRecord.term}${t(
                                "common.day"
                              )})`}
                        </div>
                      ),
                    },
                    {
                      title: t("common.operation"),
                      dataIndex: "action",
                      key: "action",
                      width: "10%",
                      align: "right" as const,
                      render: (
                        text: any,
                        productRecord: FinancialPageTokenProductItem
                      ) => (
                        <>
                          {!isLoggedIn ? (
                            <Button
                              onClick={() => router.push("/login")}
                              type="primary"
                              shape="round"
                            >
                              {t("common.login")}
                            </Button>
                          ) : (
                            <>
                              {/* 进行中 可以点击 */}
                              {Number(productRecord.status) ===
                                FinancialPageTokenStatusEnum.IN_PROGRESS && (
                                <Button
                                  onClick={() =>
                                    onSubscribe(record, productRecord)
                                  }
                                  type="primary"
                                  shape="round"
                                >
                                  {t("common.subscribe")}
                                </Button>
                              )}
                              {/* 售罄 无法点击 */}
                              {Number(productRecord.status) ===
                                FinancialPageTokenStatusEnum.SOLD_OUT && (
                                <Button
                                  disabled
                                  type="primary"
                                  shape="round"
                                  style={{
                                    backgroundColor: "var(--theme-05)",
                                  }}
                                >
                                  {t("common.sellout")}
                                </Button>
                              )}
                              {/* 暂停 无法点击 */}
                              {Number(productRecord.status) ===
                                FinancialPageTokenStatusEnum.SUSPEND && (
                                <Button
                                  disabled
                                  type="primary"
                                  shape="round"
                                  style={{
                                    backgroundColor: "var(--theme-05)",
                                  }}
                                >
                                  {t("common.pause")}
                                </Button>
                              )}
                              {/* 项目商户后台发布且未开启，显示当前时间距离开始时间的倒计时。需要按照用户的浏览器时间显示 */}
                              {Number(productRecord.status) ===
                                FinancialPageTokenStatusEnum.WAIT_START && (
                                <Button disabled type="primary" shape="round">
                                  {dayjs(
                                    productRecord.purchaseStartTime
                                  ).format("YYYY-MM-DD HH:mm:ss")}
                                </Button>
                              )}
                            </>
                          )}
                        </>
                      ),
                    },
                  ];

                return (
                  <Table
                    key={record.coinId}
                    showHeader={false}
                    columns={dynamicColumns}
                    dataSource={record.products}
                    rowKey="id"
                    bordered={false}
                    pagination={false}
                  />
                );
              },
              showExpandColumn: false, // 隐藏默认的展开列
              expandedRowKeys, // 展开的行
            }}
            dataSource={dataSource}
            locale={{ emptyText: <NoData /> }}
            columns={columns}
            pagination={false}
            footer={() =>
              dataSource.length > 7 ? (
                <div className="flex justify-center">
                  <Image
                    src="/images/financial/more.svg"
                    className="cursor-pointer m-[20px]"
                    width={24}
                    height={24}
                    alt="more"
                    onClick={more}
                  />
                </div>
              ) : null
            }
          />
        </Spin>
      </div>
    </ConfigProvider>
  );
};

export default TokenList;
