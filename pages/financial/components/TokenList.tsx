import { SearchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import {
  Input,
  Select,
  Space,
  Table,
  Button,
  ConfigProvider,
  Modal,
  Spin,
} from "antd";
import { useState, useEffect, use } from "react";
import styles from "../../../styles/components/Financial.module.css";
import { FinancialConfig } from "../index";
import {
  FinancialPageTokenItem,
  FinancialPageTokenProductItem,
  FinancialPageTokenStatusEnum,
  FinancialType,
  getFinancialPageToken,
  getProductFilterOptions,
  ProductFilterOptionsItem,
  StatusEnum,
} from "@/services/financial";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { NoData } from "@/components/noData";
import { useRouter } from "next/router";
import Image from "next/image";
import { ColumnsType } from "antd/es/table";

const termTypeMap: Record<number, string> = {
  [FinancialType.CURRENT]: "活期",
  [FinancialType.FIXED]: "定期",
};
const TokenList = ({
  setOpenSubscribe,
  financialConfig,
  isLoggedIn,
  setCurRecord,
}: {
  setCurRecord: (record: {
    token: FinancialPageTokenItem;
    curProduct: FinancialPageTokenProductItem;
  }) => void;
  setOpenSubscribe: (open: boolean) => void;
  financialConfig: FinancialConfig;
  isLoggedIn: boolean;
}) => {
  const router = useRouter();

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]); // 展开的行
  const [loading, setLoading] = useState(false); // 加载中
  const [dataSource, setDataSource] = useState<FinancialPageTokenItem[]>([]); // 数据源
  const [formData, setFormData] = useState({
    coinId: null,
    type: null,
    term: null,
    selectedValue: null, // 用于 Select 回显的完整值
  }); // 表单数据

  const [productFilterOptions, setProductFilterOptions] = useState<
    {
      label: string;
      value: string | number | null;
    }[]
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

  const handleExpand = (key: number | undefined) => {
    if (!key) return;
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys(expandedRowKeys.filter((k) => k !== key));
    } else {
      setExpandedRowKeys([...expandedRowKeys, key]);
    }
  };

  const onSubscribe = (
    record: FinancialPageTokenItem,
    productRecord: FinancialPageTokenProductItem
  ) => {
    const userInfo = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO) || "{}"
    );
    if (
      // 判断是否需要实名认证
      financialConfig?.isRealname &&
      financialConfig.isRealname === StatusEnum.CLOSE
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
            您需要完成以下操作后申购
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
              绑定身份认证
            </div>
            <div className="text-[var(--theme-color)] cursor-pointer">前往</div>
          </div>
        ),
        footer: null,
      });
    }
  };

  const more = async () => {
    console.log("more");
  };

  const columns: ColumnsType<FinancialPageTokenItem> = [
    {
      title: "币种",
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
      title: "年利率",
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
      title: "期限（天)",
      dataIndex: "termType",
      key: "termType",
      width: "30%",
      render: (_: any, record: FinancialPageTokenItem) => (
        <div className="flex items-center">
          {record?.termType?.split(",").map((item: string, index: number) => (
            <span key={item}>
              {termTypeMap[Number(item)]}
              {index === 0 && record?.termType?.includes(",") && "/"}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "操作",
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

  const initProductFilterOptions = async () => {
    const res = await getProductFilterOptions();
    if (res.code === "0") {
      const options = res.data.map(
        (item: ProductFilterOptionsItem, index: number) => {
          return {
            label:
              item.type === FinancialType.CURRENT
                ? "活期"
                : `定期 (${item.term}天)`,
            value:item.type === FinancialType.FIXED ? `${item.type}-${item.term}` : item.type,
          };
        }
      );
      setProductFilterOptions(options);
    }
  };

  useEffect(() => {
    initProductFilterOptions();
  }, []);

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
        <Space size={30} className="mb-[14px]">
          {/* 币种筛选 */}
          {/* <Select
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
            options={[{ value: null, label: "全部" }]}
          /> */}
          {/* 类型筛选 */}
          <Select
            value={formData.selectedValue}
            className="w-[188px] h-[40px]"
            onChange={(value: any) => {
              console.log(value);
              setFormData({
                ...formData,
                selectedValue: value,
                type: value === null ? null : (value === FinancialType.CURRENT ? value : value?.split("-")[0]),
                term: value === null ? null : (value === FinancialType.CURRENT ? null : value?.split("-")[1]),
              });
              setExpandedRowKeys([]);
            }}
            options={[
              { value: null, label: "全部" },
              ...productFilterOptions.map((item) => ({
                value: item.value,
                label: item.label,
              })),
            ]}
          />
        </Space>
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
                      title: "年利率",
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
                      title: "期限（天)",
                      dataIndex: "term",
                      key: "term",
                      width: "30%",
                      render: (
                        text: string,
                        productRecord: FinancialPageTokenProductItem
                      ) => (
                        <div className="flex items-center gap-[10px]">
                          {productRecord.type === FinancialType.CURRENT
                            ? "活期"
                            : `定期 (${productRecord.term}天)`}
                        </div>
                      ),
                    },
                    {
                      title: "操作",
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
                              登录
                            </Button>
                          ) : (
                            <>
                              {Number(productRecord.status) ===
                                FinancialPageTokenStatusEnum.IN_PROGRESS && (
                                <Button
                                  onClick={() =>
                                    onSubscribe(record, productRecord)
                                  }
                                  type="primary"
                                  shape="round"
                                >
                                  申购
                                </Button>
                              )}
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
                                  售罄
                                </Button>
                              )}
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
                                  暂停
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
