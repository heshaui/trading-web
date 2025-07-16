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
import { SvgIcon } from "@/components/icon";
import Countdown from "./Countdown";

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null

const termTypeMap: Record<number, string> = {
  [FinancialType.CURRENT]: "common.current",
  [FinancialType.FIXED]: "common.fixed",
};

interface TokenListProps {
  setCurRecord: (record: {
    token: FinancialPageTokenItem;
    curProduct: FinancialPageTokenProductItem;
  }) => void;
  setOpenSubscribeModal: (open: boolean) => void;
  financialConfig: FinancialConfig;
  isLoggedIn: boolean;
}
const TokenList = ({
  setOpenSubscribeModal,
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
  const [formData, setFormData] = useState<{
    coinId: number | null;
    type: string | null;
    term: string | null;
    selectedValue: string | null;
  }>({
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

    console.log("userInfo", userInfo);
    console.log("userInfo.realnessStatus", userInfo.realnessStatus);
    console.log("financialConfig?.isRealname", financialConfig?.isRealname);
    console.log(
      "financialConfig?.isRealname === 1 开启实名认证,并且 user.realnessStatus !== 1 都为未实名,进入实名弹框"
    );
    if (
      // 判断是否需要实名认证 isRealname 为 2 不需要实名 为 1 需要实名   / realnessStatus为2未实名 为1已实名
      financialConfig?.isRealname &&
      financialConfig.isRealname === FunctionEnabledStatusEnum.OPEN &&
      userInfo.realnessStatus !== 1
    ) {
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
          <div className="flex gap-[10px] p-[32px_0_73px_0]">
            <div className="font-w-400 text-[14px] text-[var(--text-color5)] flex gap-[4px]">
              <SvgIcon path="M4 4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H4ZM4 6H20V18H4V6ZM10.25 9.75C10.25 10.2141 10.0656 10.6592 9.73744 10.9874C9.40925 11.3156 8.96413 11.5 8.5 11.5C8.03587 11.5 7.59075 11.3156 7.26256 10.9874C6.93437 10.6592 6.75 10.2141 6.75 9.75C6.75 9.28587 6.93437 8.84075 7.26256 8.51256C7.59075 8.18437 8.03587 8 8.5 8C8.96413 8 9.40925 8.18437 9.73744 8.51256C10.0656 8.84075 10.25 9.28587 10.25 9.75ZM5 14.5C5 13.837 5.26339 13.2011 5.73223 12.7322C6.20107 12.2634 6.83696 12 7.5 12H9.5C9.8283 12 10.1534 12.0647 10.4567 12.1903C10.76 12.3159 11.0356 12.5001 11.2678 12.7322C11.4999 12.9644 11.6841 13.24 11.8097 13.5433C11.9353 13.8466 12 14.1717 12 14.5V15C12 15.2652 11.8946 15.5196 11.7071 15.7071C11.5196 15.8946 11.2652 16 11 16C10.7348 16 10.4804 15.8946 10.2929 15.7071C10.1054 15.5196 10 15.2652 10 15V14.5C10 14.3674 9.94732 14.2402 9.85355 14.1464C9.75979 14.0527 9.63261 14 9.5 14H7.5C7.36739 14 7.24021 14.0527 7.14645 14.1464C7.05268 14.2402 7 14.3674 7 14.5V15C7 15.2652 6.89464 15.5196 6.70711 15.7071C6.51957 15.8946 6.26522 16 6 16C5.73478 16 5.48043 15.8946 5.29289 15.7071C5.10536 15.5196 5 15.2652 5 15V14.5ZM13 11C13 10.7348 13.1054 10.4804 13.2929 10.2929C13.4804 10.1054 13.7348 10 14 10H16C16.2652 10 16.5196 10.1054 16.7071 10.2929C16.8946 10.4804 17 10.7348 17 11C17 11.2652 16.8946 11.5196 16.7071 11.7071C16.5196 11.8946 16.2652 12 16 12H14C13.7348 12 13.4804 11.8946 13.2929 11.7071C13.1054 11.5196 13 11.2652 13 11ZM14 13C13.7348 13 13.4804 13.1054 13.2929 13.2929C13.1054 13.4804 13 13.7348 13 14C13 14.2652 13.1054 14.5196 13.2929 14.7071C13.4804 14.8946 13.7348 15 14 15H18C18.2652 15 18.5196 14.8946 18.7071 14.7071C18.8946 14.5196 19 14.2652 19 14C19 13.7348 18.8946 13.4804 18.7071 13.2929C18.5196 13.1054 18.2652 13 18 13H14Z" />{" "}
              <div>{t("financial.bindIdentity")}</div>
            </div>
            <div
              className="text-[var(--theme-color)] cursor-pointer"
              onClick={() => {
                // 跳转实名认证
                router.push("/userCenter/identity");
                // 关闭弹框
                Modal.destroyAll();
              }}
            >
              <div>{t("financial.goTo")}</div>
            </div>
          </div>
        ),
        footer: null,
      });
    } else {
      setCurRecord({
        token: record,
        curProduct: productRecord,
      });
      setOpenSubscribeModal(true);
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
      width: "25%",
      render: (_: any, record: FinancialPageTokenItem) => (
        <div className="flex items-center gap-[10px]">
          {record.iconUrl ? (
            <Image
              style={{ borderRadius: "50%" }}
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
      width: "25%",
      render: (_: any, record: FinancialPageTokenItem) => (
        <div
          className="flex items-center gap-[10px]"
          style={{ color: "#00C788" }}
        >
          <span>{record.minInterestRate}%</span>~
          <span>{record.maxInterestRate}%</span>
        </div>
      ),
    },
    {
      title: t("common.period"),
      dataIndex: "termType",
      key: "termType",
      width: "25%",
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
      width: "25%",
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

  // 进入页面一开始 获取产品筛选选项 跟 币种筛选选项
  useEffect(() => {
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
    initProductFilterOptions();
    initTokenList();
  }, [t]);

  // 处理路由参数
  useEffect(() => {
    const { coinName } = router.query;
    if (coinName) {
      const coin = coinFilterOptions.find((item) => item.coinName === coinName);
      if (coin) {
        setFormData((prev) => ({ ...prev, coinId: coin.coinId }));
      }
    }
  }, [router.query, coinFilterOptions]);

  // 获取数据
  useEffect(() => {
    fetchData(formData);
  }, [formData]);

  const btnMap = (
    record: FinancialPageTokenItem,
    productRecord: FinancialPageTokenProductItem
  ) => {
    switch (Number(productRecord.status)) {
      //0未发布，1进行中，2待开始，3暂停，4下架，5售罄，6结束
      // 5售罄
      case FinancialPageTokenStatusEnum.SOLD_OUT:
        return (
          <Button disabled type="primary" shape="round">
            {t("common.sellout")}
          </Button>
        );

      // 3暂停
      case FinancialPageTokenStatusEnum.SUSPEND:
        return (
          <Button disabled type="primary" shape="round">
            {t("common.pause")}
          </Button>
        );

      // 6结束
      case FinancialPageTokenStatusEnum.END:
        return (
          <Button disabled type="primary" shape="round">
            {t("common.end")}
          </Button>
        );

      // 1进行中
      case FinancialPageTokenStatusEnum.IN_PROGRESS:
        // 进行中 但是 申购时间 与当前时间对比 小于0 则显示倒计时  否则显示申购
        const curTime = dayjs().valueOf();
        const purchaseStartTime = productRecord.purchaseStartTime;
        const time = purchaseStartTime && purchaseStartTime - curTime;

        return (
          time && (
            <Countdown
              value={time}
              btn={
                <Button
                  type="primary"
                  shape="round"
                  onClick={() => onSubscribe(record, productRecord)}
                >
                  {t("common.subscribe")}
                </Button>
              }
            />
          )
        );
    }
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "transparent",
            headerSplitColor: "transparent",
            borderColor: "transparent",
            rowExpandedBg: "var(--background10)",
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
            value={!formData.coinId ? NULL_PLACEHOLDER : formData.coinId}
            className="w-[188px] h-[40px]"
            onChange={(value) => {
              setFormData({
                ...formData,
                coinId: value === NULL_PLACEHOLDER ? null : Number(value),
              });
              setExpandedRowKeys([]);
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={[
              { value: NULL_PLACEHOLDER, label: t("common.all") },
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
            value={
              !formData.selectedValue
                ? NULL_PLACEHOLDER
                : formData.selectedValue
            }
            className="w-[188px] h-[40px]"
            onChange={(value: any) => {
              console.log(value);
              setFormData({
                ...formData,
                selectedValue: value === NULL_PLACEHOLDER ? null : value,
                type:
                  value === NULL_PLACEHOLDER
                    ? null
                    : value === FinancialType.CURRENT
                    ? value
                    : value?.split("-")[0],
                term:
                  value === NULL_PLACEHOLDER
                    ? null
                    : value === FinancialType.CURRENT
                    ? null
                    : value?.split("-")[1],
              });
              setExpandedRowKeys([]);
            }}
            options={[
              { value: NULL_PLACEHOLDER, label: t("common.all") },
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
                      width: "25%",
                    },
                    {
                      title: t("common.annualRate"),
                      dataIndex: "minAnnualInterestRate",
                      key: "minAnnualInterestRate",
                      width: "25%",
                      render: (
                        text: string,
                        productRecord: FinancialPageTokenProductItem
                      ) => (
                        <div
                          className="flex items-center gap-[10px]"
                          style={{ color: "#00C788" }}
                        >
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
                      width: "25%",
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
                      width: "25%",
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
                            btnMap(record, productRecord)
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
