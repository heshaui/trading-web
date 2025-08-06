import { withAssetsLayout } from "@/components/sidebarLayout/AssetsLayout/userAssetsLayout";
import {
  ConfigProvider,
  Table,
  Input,
  Form,
  Checkbox,
  Flex,
  Button,
  message,
  Skeleton,
  Dropdown,
} from "antd";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import styles from "@/styles/components/Table.module.css";
import { NoData } from "@/components/noData";
import { useEffect, useState } from "react";
import { Iconify, SvgIcon } from "@/components/icon";
import Image from "next/image";
import { ColumnsType } from "antd/es/table";
import { observer } from "mobx-react-lite";
import { ButtonTheme, TableTheme, TokenTheme } from "@/theme/publicThemeConfig";
import { getContractFinancialRecords } from "@/services/contract";
import dayjs from "dayjs";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import appStore from "@/store";
import MaskableAmount from "@/components/MaskableAmount";

interface ContractAccountItem {
  symbol: string; // 币种
  totalAmount: string; // 总金额
  canUseAmount: string; // 可用金额
  isolateMargin: string; // 隔离保证金
  lockAmount: string; // 锁定金额
  unRealizedAmount: string; // 未实现盈亏
  realizedAmount: string; // 已实现盈亏
  totalMargin: string; // 总保证金
  totalMarginRate: string; // 总保证金率
}

const Contract = observer(() => {
  const { t } = useTranslation(["contract"]);
  const [form] = Form.useForm();

  // 表格数据
  const [tableData, setTableData] = useState<ContractAccountItem[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [myAmountLoading, setMyAmountLoading] = useState(false);
  const [showAmount, setShowAmount] = useState(false);

  // 划转弹窗
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  // 当前选中行
  const [record, setRecord] = useState<ContractAccountItem | null>(null);

  // 表格列
  const columns: ColumnsType<ContractAccountItem> = [
    // 币种
    {
      title: t("symbol"),
      dataIndex: "symbol",
      key: "symbol",
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
            <div className="font-[500] text-[14px] text-[var(--text-color5)]">
              {record.symbol}
            </div>
          </Flex>
        );
      },
    },
    //总收益
    {
      title: t("account.totalAssets"),
      dataIndex: "realizedAmount",
      key: "realizedAmount",
      sorter: (a: ContractAccountItem, b: ContractAccountItem) =>
        Number(a.realizedAmount) - Number(b.realizedAmount),
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.realizedAmount}
          </div>
        );
      },
    },
    // 钱包余额
    {
      title: t("account.walletBalance"),
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.totalAmount}
          </div>
        );
      },
    },
    // 可用
    {
      title: t("availableBalance"),
      dataIndex: "canUseAmount",
      key: "available",
      sorter: (a: ContractAccountItem, b: ContractAccountItem) =>
        Number(a.canUseAmount) - Number(b.canUseAmount),
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.canUseAmount}
          </div>
        );
      },
    },
    // 未实现盈亏
    {
      title: t("unrealizedPnl"),
      dataIndex: "unRealizedAmount",
      key: "unRealizedAmount",
      align: "right",
      sorter: (a: ContractAccountItem, b: ContractAccountItem) =>
        Number(a.unRealizedAmount) - Number(b.unRealizedAmount),
      render: (_: any, record: any) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.unRealizedAmount}
          </div>
        );
      },
    },
    // 操作
    {
      title: t("action"),
      dataIndex: "action",
      key: "action",
      align: "right",
      render: (_: any, record: any) => {
        return (
          <div
            className="text-[var(--theme-color)] cursor-pointer"
            onClick={() => {
              setRecord(record);
              setTransferModalOpen(true);
            }}
          >
            {t("account.transfer")}
          </div>
        );
      },
    },
  ];

  // 获取数据
  const fetchData = async () => {
    setTableLoading(true);
    setMyAmountLoading(true);
    try {
      const res = await getContractFinancialRecords({
        onlyAccount: 1,
        uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      });
      if (res.code === "0") {
        setTableData(res.data.accountList);
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
      setMyAmountLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const amountShow = appStore.getBanlanceShow();
    setShowAmount(amountShow);
  }, []);
  return (
    <>
      {/* 基础页面 */}
      <ConfigProvider
        theme={{
          components: {
            Table: TableTheme,
            Button: ButtonTheme,
          },
          token: TokenTheme,
        }}
      >
        <div className="flex flex-col h-full gap-[16px]">
          {/* title */}
          <div className="text-[20px] text-[var(--text-color5)] font-[500]">
            {t("account.title")}
          </div>
          {/* 内容 */}
          <div className="bg-[var(--btncolor7)] rounded-[8px] p-[20px] flex-1">
            {/* 头部数据 */}
            <div className="h-[151px] bg-[var(--background14)] rounded-[8px] flex items-end justify-between p-[30px]">
              {/* 总资产折合  */}
              <Skeleton
                active
                title={true}
                loading={myAmountLoading}
                // loading={true}
                paragraph={{ rows: 2 }}
                className="px-1"
              >
                <div className="flex flex-col">
                  <div className="text-[14px] text-[var(--text-color6)] flex items-center gap-[4px]">
                    {t("account.totalAssetsValue")}
                    <div>
                      {showAmount ? (
                        <EyeOutlined
                          style={{ color: "var(--text-color6)" }}
                          size={18}
                          className="cursor-pointer"
                          onClick={() => {
                            setShowAmount(!showAmount);
                            appStore.setBanlanceShow(!showAmount);
                          }}
                        />
                      ) : (
                        <EyeInvisibleOutlined
                          style={{ color: "var(--text-color6)" }}
                          size={18}
                          className="cursor-pointer"
                          onClick={() => {
                            setShowAmount(!showAmount);
                            appStore.setBanlanceShow(!showAmount);
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="text-[30px] text-[var(--text-color5)] font-[700]">
                    <MaskableAmount
                      show={showAmount}
                      content={
                        <div className="flex gap-[4px] items-center">
                          <div>0.00091761 BTC</div>
                          <Dropdown
                            trigger={["click"]}
                            arrow={true}
                            menu={{
                              items: [
                                { label: "BTC", key: "BTC" },
                                { label: "ETH", key: "ETH" },
                              ],
                            }}
                          >
                            <SvgIcon
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              className="text-[var(--text-color6)] cursor-pointer"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12.707 15.707C12.5194 15.8945 12.2651 15.9998 12 15.9998C11.7348 15.9998 11.4805 15.8945 11.293 15.707L5.63598 10.05C5.54047 9.95776 5.46428 9.84742 5.41188 9.72541C5.35947 9.60341 5.33188 9.47219 5.33073 9.33941C5.32957 9.20663 5.35487 9.07495 5.40516 8.95205C5.45544 8.82916 5.52969 8.7175 5.62358 8.62361C5.71747 8.52972 5.82913 8.45547 5.95202 8.40519C6.07492 8.3549 6.2066 8.3296 6.33938 8.33076C6.47216 8.33191 6.60338 8.3595 6.72538 8.41191C6.84739 8.46431 6.95773 8.5405 7.04998 8.63601L12 13.586L16.95 8.63601C17.1386 8.45385 17.3912 8.35305 17.6534 8.35533C17.9156 8.35761 18.1664 8.46278 18.3518 8.64819C18.5372 8.8336 18.6424 9.08441 18.6447 9.34661C18.6469 9.6088 18.5461 9.86141 18.364 10.05L12.707 15.707Z"
                                fill="currentColor"
                              />
                            </SvgIcon>
                          </Dropdown>
                        </div>
                      }
                    />
                  </div>
                  <div className="text-[14px] text-[var(--text-color6)]">
                    <MaskableAmount
                      show={showAmount}
                      content={<div>≈ 99.41 USD</div>}
                    />
                  </div>
                </div>
              </Skeleton>

              {/* 今日盈亏 */}
              <Skeleton
                active
                title={true}
                loading={myAmountLoading}
                // loading={true}
                paragraph={{ rows: 2 }}
                className="px-1"
              >
                <div className="flex flex-col">
                  <div className="text-[14px] text-[var(--text-color6)]">
                    {t("account.todayProfit")}
                  </div>
                  <div className="text-[32px] text-[var(--text-color5)] font-[700]">
                    <MaskableAmount
                      show={showAmount}
                      content={<div>-0.58 USD</div>}
                    />
                  </div>
                  <div className="text-[14px] text-[var(--text-color6)]">
                    <MaskableAmount
                      show={showAmount}
                      content={<div>-0.58%</div>}
                    />
                  </div>
                </div>
              </Skeleton>

              {/* 盈亏分析 */}
              <Button onClick={() => {}} type="primary" ghost shape="round">
                {t("account.profitAnalysis")}
              </Button>
            </div>
            {/* 底部数据 */}
            <div>
              {/* 筛选 */}
              <Form form={form} className="py-[16px]">
                <Flex align="center" gap={30}>
                  <Form.Item noStyle name="coin">
                    <Input
                      allowClear
                      placeholder={t("account.inputCoin")}
                      className="h-[40px]"
                      style={{ width: "188px" }}
                      prefix={<Iconify icon="garden:search-26" size={20} />}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    name="hideSmallAssets"
                    valuePropName="checked"
                  >
                    <Checkbox onChange={() => {}}>
                      {t("account.hideSmallAssets")}
                    </Checkbox>
                  </Form.Item>
                </Flex>
              </Form>

              {/* 表格 */}
              <Table
                rowKey="id"
                className={styles.table}
                columns={columns}
                showSorterTooltip={false}
                dataSource={tableData}
                pagination={false}
                loading={tableLoading}
                locale={{ emptyText: <NoData height="35vh" /> }}
              />
            </div>
          </div>
        </div>
      </ConfigProvider>
    </>
  );
});

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "contract"])),
    },
  };
};
export default withAssetsLayout(Contract);
