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
import appStore from "@/store";
import { useAuth } from "@/context/AuthContext";
import { observer } from "mobx-react-lite";
import SubscribeModal from "@/components/Financial/SubscribeModal";

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null

const termTypeMap: Record<number, string> = {
  [FinancialType.CURRENT]: "common.current",
  [FinancialType.FIXED]: "common.fixed",
};

const TokenList = observer(() => {
  const router = useRouter();
  const { t } = useTranslation(["financial"]);
  const financialConfig = appStore.financialConfig;
  const { isLoggedIn } = useAuth();

  // 申购弹窗
  const [openSubscribeModal, setOpenSubscribeModal] = useState(false);

  // 当前记录
  const [curRecord, setCurRecord] = useState<{
    token: FinancialPageTokenItem;
    curProduct: FinancialPageTokenProductItem;
  } | null>(null);

  // 展开的行
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  // 加载中
  const [loading, setLoading] = useState(false);

  const pageSize = 7;

  // 数据源
  const [dataSource, setDataSource] = useState<{
    list: FinancialPageTokenItem[];
    total: number;
    showList: FinancialPageTokenItem[];
  }>({
    showList: [],
    list: [],
    total: 0,
  });

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
        // showList 只截取 7条
        setDataSource({
          list: res.data,
          total: res.data.length,
          showList: res.data.slice(0, pageSize),
        });
        console.log(res.data);
      } else {
        setDataSource({
          list: [],
          total: 0,
          showList: [],
        });
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
    // 每次追加7条进showlist
    setDataSource({
      ...dataSource,
      showList: [
        ...dataSource.showList,
        ...dataSource.list.slice(
          dataSource.showList.length,
          dataSource.showList.length + pageSize
        ),
      ],
    });
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
                <SvgIcon path="M9.41071 6.91083C9.56698 6.75461 9.77891 6.66684 9.99988 6.66684C10.2208 6.66684 10.4328 6.75461 10.589 6.91083L15.3032 11.625C15.3828 11.7019 15.4463 11.7938 15.49 11.8955C15.5336 11.9972 15.5566 12.1065 15.5576 12.2172C15.5585 12.3278 15.5375 12.4375 15.4956 12.54C15.4537 12.6424 15.3918 12.7354 15.3135 12.8137C15.2353 12.8919 15.1423 12.9538 15.0398 12.9957C14.9374 13.0376 14.8277 13.0587 14.717 13.0577C14.6064 13.0567 14.497 13.0338 14.3954 12.9901C14.2937 12.9464 14.2017 12.8829 14.1249 12.8033L9.99988 8.67833L5.87488 12.8033C5.71771 12.9551 5.50721 13.0391 5.28871 13.0372C5.07021 13.0353 4.8612 12.9477 4.70669 12.7932C4.55219 12.6387 4.46455 12.4297 4.46265 12.2112C4.46075 11.9927 4.54474 11.7822 4.69654 11.625L9.41071 6.91083Z" />
              ) : (
                <SvgIcon path="M10.5893 13.0892C10.433 13.2454 10.2211 13.3332 10.0001 13.3332C9.77915 13.3332 9.56723 13.2454 9.41096 13.0892L4.69679 8.375C4.6172 8.29813 4.55371 8.20617 4.51004 8.1045C4.46636 8.00283 4.44338 7.89348 4.44241 7.78284C4.44145 7.67219 4.46254 7.56245 4.50444 7.46004C4.54634 7.35763 4.60822 7.26458 4.68646 7.18634C4.7647 7.10809 4.85775 7.04622 4.96016 7.00432C5.06257 6.96242 5.17231 6.94133 5.28296 6.94229C5.39361 6.94325 5.50296 6.96624 5.60463 7.00992C5.7063 7.05359 5.79825 7.11708 5.87512 7.19667L10.0001 11.3217L14.1251 7.19667C14.2823 7.04487 14.4928 6.96087 14.7113 6.96277C14.9298 6.96467 15.1388 7.05231 15.2933 7.20682C15.4478 7.36133 15.5355 7.57034 15.5374 7.78883C15.5393 8.00733 15.4553 8.21783 15.3035 8.375L10.5893 13.0892Z" />
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
          <Button
            disabled
            type="primary"
            shape="round"
            style={{ borderColor: "transparent", color: "#fff" }}
          >
            {t("common.sellout")}
          </Button>
        );

      // 3暂停
      case FinancialPageTokenStatusEnum.SUSPEND:
        return (
          <Button
            disabled
            type="primary"
            shape="round"
            style={{ borderColor: "transparent", color: "#fff" }}
          >
            {t("common.pause")}
          </Button>
        );

      // 6结束
      case FinancialPageTokenStatusEnum.END:
        return (
          <Button
            disabled
            type="primary"
            shape="round"
            style={{ borderColor: "transparent", color: "#fff" }}
          >
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
                  style={{ borderColor: "transparent", color: "#fff" }}
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
            rowSelectedBg: "transparent",
            rowHoverBg: "var(--bgc-color)", // 悬停背景色
          },
          Select: {
            optionSelectedBg: "var(--background-menu-item)", // 选中背景色
            optionSelectedColor: "var(--text-color5)", // 选中文本颜色
          },
        },
        token: {
          colorBgContainerDisabled: "var(--theme-05)",
        },
      }}
    >
      <div className="py-[30px] max-w-[1200px] mx-auto">
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
                              style={{ borderColor: "transparent" }}
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
            dataSource={dataSource.showList}
            locale={{
              emptyText: (
                <NoData isTimerNoData={true} title={t("common.comingSoon")} />
              ),
            }}
            columns={columns}
            pagination={false}
            footer={() =>
              dataSource.total &&
              dataSource.showList.length < dataSource.total ? (
                <div className="flex justify-center p-[20px]">
                  <SvgIcon
                    className="cursor-pointer text-[#A4A5AC] hover:text-[var(--theme-color)]"
                    onClick={more}
                    fill="var(--theme-color)"
                  >
                    <path
                      fill="currentColor"
                      d="M12.436 18.8946L3.92691 10.8655C3.64236 10.6256 3.27805 10.5015 2.90625 10.5176C2.53444 10.5338 2.18229 10.6891 1.91963 10.9528C1.09054 11.8691 1.48327 12.96 1.96327 13.3964L11.6069 22.3855C12.0869 22.8218 12.8287 22.8218 13.3087 22.3855L22.9087 13.3964C23.3887 12.96 23.7378 12 22.996 11.1273C22.4287 10.4728 21.3378 10.6037 20.9015 11.04L12.436 18.8946Z"
                    />
                    <path
                      fill="currentColor"
                      d="M12.436 9.6436L3.92691 1.61451C3.64236 1.37465 3.27805 1.25049 2.90625 1.26666C2.53444 1.28283 2.18229 1.43813 1.91963 1.70178C1.09054 2.61815 1.48327 3.70905 1.96327 4.14542L11.6069 13.1345C12.0869 13.5709 12.8287 13.5709 13.3087 13.1345L22.9087 4.14542C23.3887 3.70905 23.7378 2.74905 22.996 1.87633C22.4287 1.22178 21.3378 1.35269 20.9015 1.78905L12.436 9.6436Z"
                    />
                  </SvgIcon>
                </div>
              ) : null
            }
          />
        </Spin>
      </div>
      {/* 申购弹窗 */}
      <SubscribeModal
        onRefresh={() => {
          fetchData(formData);
        }}
        curRecord={curRecord}
        openSubscribeModal={openSubscribeModal}
        setOpenSubscribeModal={setOpenSubscribeModal}
      />
    </ConfigProvider>
  );
});

export default TokenList;
