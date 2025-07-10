import {
  Button,
  ConfigProvider,
  Input,
  Modal,
  Segmented,
  Flex,
  Switch,
  Tabs,
  Divider,
  Spin,
  Form,
  FormInstance,
} from "antd";
import { useEffect, useState, useCallback, useMemo } from "react";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import {
  FinancialPageTokenItem,
  FinancialPageTokenProductItem,
  FinancialPageTokenStatusEnum,
  financialSubscribe,
  FinancialType,
  getEstimateDailyIncome,
  OpenStatusEnum,
} from "@/services/financial";
import { getUserBalance } from "@/services/assets";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { SvgIcon } from "@/components/icon";

const useStyle = createStyles(() => ({
  "my-modal-header": {
    height: "60px !important",
    padding: "0 20px !important",
    borderRadius: "10px 10px 0px 0px",
    background: "#fff",
    boxShadow: "0px -0.5px 0px 0px #dcdcdc inset",
  },
  "my-modal-footer": {
    width: "100%",
    marginTop: "0 !important",
    borderRadius: "0 0 10px 10px !important",
  },
  "my-modal-content": {
    padding: "0 !important",
  },
}));

interface SubscriptionProps {
  form: FormInstance<any>;
  myBalance: any;
  tokenInfo: FinancialPageTokenItem | undefined;
  productInfo: FinancialPageTokenProductItem | undefined;
  setProductInfo: (product: FinancialPageTokenProductItem) => void;
}

// 申购弹窗
const Subscription: React.FC<SubscriptionProps> = ({
  form,
  myBalance,
  tokenInfo,
  productInfo,
  setProductInfo,
}) => {
  const [income, setIncome] = useState<number | string>("-"); //预估每日收益
  const { t } = useTranslation(["financial"]);

  const financialAmount = Form.useWatch("financialAmount", form);
  const projectId = Form.useWatch("projectId", form);

  // 监听 curRecord 变化，更新选中的产品
  useEffect(() => {
    if (productInfo) {
      setIncome("-"); // 重置收益
    }
  }, [productInfo]);

  // 获取预估收益的函数
  const fetchIncome = useCallback(
    async (projectId: string | number, amount: string | number) => {
      if (!projectId || !amount || Number(amount) <= 0) {
        setIncome("-");
        return;
      }

      try {
        // 获取预估收益
        const res = await getEstimateDailyIncome({
          projectId: Number(projectId),
          amount: Number(amount),
        });
        if (res.code === "0") {
          setIncome(res.data);
        }
      } catch (error) {
        console.error("获取预估收益失败:", error);
      }
    },
    []
  );

  // 获取预估收益的函数
  const debounceFetchIncome = useMemo(
    () => debounce(fetchIncome, 500),
    [fetchIncome]
  );

  useEffect(() => {
    return () => debounceFetchIncome.cancel();
  }, [debounceFetchIncome]);

  // 最大金额
  const suffix = (
    <Flex align="center" gap={2}>
      <div
        className="text-[14px] text-[var(--theme-color)] font-[400] cursor-pointer"
        onClick={() => {
          if (!projectId || !productInfo) return;
          // 如果当前可用金额小于最大金额 则设置为 当前可用金额  如果当前可用金额大于最大金额 设置为最大金额
          if (
            Number(myBalance?.balance) < Number(productInfo.maxPurchaseAmount)
          ) {
            form.setFieldValue("financialAmount", myBalance.balance);
            fetchIncome(projectId, myBalance?.balance);
          } else {
            form.setFieldValue(
              "financialAmount",
              productInfo.maxPurchaseAmount
            );
            fetchIncome(projectId, productInfo.maxPurchaseAmount || 0);
          }
        }}
      >
        {t("common.max")}
      </div>
      <Divider type="vertical" />
      <div className="text-[14px] text-[var(--text-color5)] font-[400]">
        {tokenInfo?.coinName}
      </div>
    </Flex>
  );

  return (
    <Form form={form}>
      <Form.Item name="projectId" hidden>
        <Input />
      </Form.Item>
      <div className="p-[0_20px_20px_20px]">
        {/* 选择时间 7天 */}
        <div className="flex flex-ai-center flex-jc-between gap-[17px] mb-[16px]">
          {tokenInfo?.products?.map((item) => (
            <div
              onClick={() => {
                // 状态不是FinancialPageTokenStatusEnum.IN_PROGRESS 无法点击
                if (
                  Number(item.status) !==
                  FinancialPageTokenStatusEnum.IN_PROGRESS
                ) {
                  return;
                }
                form.resetFields();
                setIncome("-");
                setProductInfo(item);
                form.setFieldValue("projectId", item.id);
              }}
              key={item.id}
              style={{
                border:
                  productInfo?.id === item.id
                    ? "1px solid var(--theme-color)"
                    : "1px solid var(--border-color4)",
                cursor:
                  Number(item.status) !==
                  FinancialPageTokenStatusEnum.IN_PROGRESS
                    ? "not-allowed"
                    : "pointer",
              }}
              className={`flex-1 rounded-[10px]  border py-[5px] px-[14px] cursor-pointer bg-[var(--background12)] ${
                productInfo?.id === item.id
                  ? "border-[var(--theme-color)]"
                  : "border-[var(--border-color4)]"
              }`}
            >
              <div>
                {item.type === FinancialType.CURRENT
                  ? t("common.current")
                  : `${item.term} ${t("common.day")}`}
              </div>
              <div className="text-[#00C788]">
                {item.type === FinancialType.FIXED ? (
                  <span>{item.maxAnnualInterestRate}%</span>
                ) : (
                  <>
                    <span>{item.minAnnualInterestRate}%</span>~
                    <span>{item.maxAnnualInterestRate}%</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* 申购数量input */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            {t("common.applyAmount")}
          </div>
          <Form.Item
            name="financialAmount"
            rules={[
              {
                required: true,
                message: t("common.pleaseEnterSubscribeAmount"),
              },
              {
                validator: (_, value) => {
                  // 如果没有输入值，不进行范围校验，让required规则单独处理
                  if (!value || value === "") {
                    return Promise.resolve();
                  }

                  // 如果不是数字 则返回错误
                  if (isNaN(Number(value))) {
                    return Promise.reject(
                      new Error(t("common.pleaseEnterTheNumber"))
                    );
                  }

                  // 输入的金额小于最小金额 则返回错误
                  if (
                    productInfo?.minPurchaseAmount &&
                    Number(value) < Number(productInfo?.minPurchaseAmount)
                  ) {
                    return Promise.reject(
                      new Error(
                        `${t("common.min")} ${productInfo?.minPurchaseAmount} ${
                          tokenInfo?.coinName
                        }`
                      )
                    );
                  }

                  // 输入的金额大于最大金额 则返回错误
                  if (
                    productInfo?.maxPurchaseAmount &&
                    Number(value) > Number(productInfo?.maxPurchaseAmount)
                  ) {
                    return Promise.reject(
                      new Error(
                        `${t("common.max")} ${productInfo?.maxPurchaseAmount} ${
                          tokenInfo?.coinName
                        }`
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder={`${t("common.min")} ${
                productInfo?.minPurchaseAmount
              } ${tokenInfo?.coinName}`}
              className="m-[10px_0] w-[100%] h-[50px]"
              suffix={suffix}
              onChange={(e) => {
                // 如果输入的金额不是数字 则返回错误
                if (isNaN(Number(e.target.value))) {
                  setIncome("-");
                  return;
                }
                // 输入的值小于最小金额
                if (
                  Number(e.target.value) <
                  Number(productInfo?.minPurchaseAmount)
                ) {
                  setIncome("-");
                  return;
                }
                // 输入的值大于最大金额
                if (
                  Number(e.target.value) >
                  Number(productInfo?.maxPurchaseAmount)
                ) {
                  setIncome("-");
                  return;
                }
                // 取消之前的防抖调用，重新开始计算
                debounceFetchIncome.cancel();
                // 重新开始防抖计算
                debounceFetchIncome(projectId, e.target.value);
              }}
            />
          </Form.Item>
          <div className="mb-[2px]">
            <span className="text-[#9E9E9E] font-[400] mr-[10px]">
              {t("common.spotAvailable")}:
            </span>
            {myBalance?.balance} {tokenInfo?.coinName}
          </div>
          <div>
            <span className="text-[#9E9E9E] font-[400] mr-[10px]">
              {t("common.canSubscribe")}:
            </span>
            {/* 如果不是数组 或者 超过最大值 则显示最大值 */}
            {isNaN(Number(financialAmount)) ||
            Number(financialAmount) > Number(productInfo?.maxPurchaseAmount)
              ? Number(productInfo?.maxPurchaseAmount)
              : Number(productInfo?.maxPurchaseAmount) -
                Number(financialAmount)}{" "}
            {tokenInfo?.coinName}
          </div>
        </div>
        {/* 概览 */}
        <div className="flex flex-column gap-[10px] mb-[24px]">
          {/* 标题 */}
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            {t("common.overview")}
          </div>
          {/* 预估收益  定期label:预估总收益  活期label:预估每日收益*/}
          <div className="flex flex-ai-center flex-jc-between">
            <div className="text-[var(--text-color6)] font-[400]">
              {productInfo?.type === FinancialType.CURRENT
                ? t("common.estimatedDailyIncome")
                : t("common.estimatedTotalIncome")}
            </div>
            <div className="text-[var(--theme-color)] font-[400]">
              {income} {tokenInfo?.coinName}
            </div>
          </div>
          {/* 自动申购开关 */}
          <div className="flex flex-ai-center flex-jc-between">
            <div className="text-[var(--text-color6)] font-[400]">
              {t("common.autoSubscribe")}
            </div>
            <Form.Item name="autoPurchase" noStyle>
              <Switch />
            </Form.Item>
          </div>
        </div>
        {/* 奖励规则 定期不显示 活期显示 */}
        {productInfo?.type === FinancialType.CURRENT && (
          <div className="mb-[16px]">
            <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
              {t("common.rewardRules")}
            </div>
            <>
              <div className="flex flex-ai-center flex-jc-between text-[14px] mb-[4px]">
                <div className="text-[var(--text-color6)] font-[400]">
                  {t("common.applyAmount")}0 - {productInfo?.assetBoundary}
                  {tokenInfo?.coinName}
                </div>
                <div className="text-[var(--text-color6)] font-[400]">
                  {t("common.annualInterestRate")}{" "}
                  {productInfo?.minAnnualInterestRate}%
                </div>
              </div>
              <div className="flex flex-ai-center flex-jc-between text-[14px]">
                <div className="text-[var(--text-color6)] font-[400]">
                  {t("common.applyAmount")} &gt; {productInfo?.assetBoundary}
                  {tokenInfo?.coinName}
                </div>
                <div className="text-[var(--text-color6)] font-[400]">
                  {t("common.annualInterestRate")}{" "}
                  {productInfo?.maxAnnualInterestRate}%
                </div>
              </div>
            </>
          </div>
        )}
        {/* 提示 */}
        {productInfo?.isRedemption === OpenStatusEnum.YES ? (
          <div className="rounded-[8px] p-[10px_16px]  text-[14px] font-[500] text-[var(--theme-color)] bg-[var(--bgc-color)] flex flex-ai-center gap-[4px]">
            <SvgIcon width={16} height={16} path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            <div>{t("common.thisProductSupportsEarlyRedemption")}</div>
          </div>
        ) : null}
      </div>
    </Form>
  );
};

// 产品规则
const ProductRule: React.FC<{
  productInfo: FinancialPageTokenProductItem | undefined;
}> = ({ productInfo }) => {
  const { t } = useTranslation(["financial"]);
  const [curSelectProduct, setCurSelectProduct] =
    useState<FinancialPageTokenProductItem | null>(null);

  const [activeKey, setActiveKey] = useState("1"); // 标签页

  // 监听 curRecord 变化，更新选中的产品
  useEffect(() => {
    if (productInfo) {
      setCurSelectProduct(productInfo);
      setActiveKey(productInfo.type === FinancialType.CURRENT ? "1" : "2");
    }
  }, [productInfo]);
  // 定期
  const Regular = () => {
    return (
      <>
        {/* 1.交易规则 */}
        <div className="mb-[16px]">
          {/* label */}
          <div className="flex flex-ai-center flex-jc-between mb-[12px]">
            <div className="text-[14px] text-[var(--text-color5)] font-[400]">
              {t("common.transactionRules")}
            </div>
            <div className="text-[14px] text-[var(--text-color5)] font-[400]">
              {t("common.fixed")}
            </div>
          </div>
          {/* 内容 */}
          <div className="p-[16px_20px] rounded-[10px] border-[#DCDCDC] border-[1px] flex flex-column gap-[20px]">
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.subscribeTime")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒 */}
                {dayjs().format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.startInterest")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒+1天 */}
                {dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.firstInterest")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒+2天 */}
                {dayjs().add(2, "day").format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.lastDue")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {dayjs(curSelectProduct?.purchaseEndTime)
                  .add(1, "day")
                  .format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.nextSubscribe")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {dayjs(curSelectProduct?.purchaseEndTime)
                  .add(1, "day")
                  .format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
          </div>
        </div>
        {/* 2.奖励规则 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            {t("common.rewardRules")}
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            {t("common.rewardRulesTips")}
          </div>
        </div>
        {/* 3.提前赎回 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            {t("common.earlyRedemption")}
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            {t("common.earlyRedemptionTips")}
          </div>
        </div>
        {/* 4.取消申购 */}
        <div>
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            {t("common.cancelSubscribe")}
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            {t("common.cancelSubscribeTips")}
          </div>
        </div>
      </>
    );
  };
  //活期
  const Current = () => {
    return (
      <>
        {/* 1.交易规则 */}
        <div className="mb-[10px]">
          {/* label */}
          <div className="flex flex-ai-center flex-jc-between mb-[12px]">
            <div className="text-[14px] text-[var(--text-color5)] font-[400]">
              {t("common.transactionRules")}
            </div>
            <div className="text-[14px] text-[var(--text-color5)] font-[400]">
              {t("common.current")}
            </div>
          </div>
          {/* 内容 */}
          <div className="p-[16px_20px] rounded-[10px] border-[#DCDCDC] border-[1px] flex flex-column gap-[20px]">
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.subscribeTime")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒 */}
                {dayjs().format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.startInterest")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒+1天 */}
                {dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.firstInterest")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒+2天 */}
                {dayjs().add(2, "day").format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.redeem")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {t("common.immediatelyRedeem")}
              </div>
            </div>
          </div>
        </div>
        {/* 交易规则补充 */}
        <div className="text-[14px] text-[var(--text-color6)] font-[400] mb-[16px]">
          {t("common.currentRewardRules")}
        </div>
        {/* 2.赎回 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            {t("common.redeem")}
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            {t("common.redeemTips")}
          </div>
        </div>
        {/* 3.收益币种 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            {t("common.incomeCurrency")}
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            {t("common.incomeCurrencyTips")}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="p-[0_20px_20px_20px]">
      {/* 活期 定期 */}
      <div className="mb-[20px]">
        <Segmented
          options={[
            { value: "1", label: t("common.current") },
            { value: "2", label: t("common.fixed") },
          ]}
          value={activeKey}
          onChange={(value) => setActiveKey(value)}
        />
      </div>
      {activeKey === "1" ? <Current /> : <Regular />}
    </div>
  );
};

interface SubscribeModalProps {
  curRecord: {
    token: FinancialPageTokenItem;
    curProduct: FinancialPageTokenProductItem;
  } | null;
  openSubscribe: boolean;
  setOpenSubscribe: (open: boolean) => void;
  setConfirmModal: (confirmModal: {
    open: boolean;
    status: "error" | "success" | null;
    type?: FinancialType;
    amount?: number;
    unit?: string;
    endTime?: number;
  }) => void;
  onRefresh?: () => void;
}
// 申购弹窗
const SubscribeModal = ({
  curRecord,
  openSubscribe,
  setOpenSubscribe,
  setConfirmModal,
  onRefresh,
}: SubscribeModalProps) => {
  const { styles } = useStyle();
  const [form] = Form.useForm();
  const { t } = useTranslation(["financial"]);

  const [tabsKey, setTabsKey] = useState("1"); // 标签页
  const [myBalance, setMyBalance] = useState<any>(null); //我的余额
  const [loading, setLoading] = useState(false); //加载中

  const [tokenInfo, setTokenInfo] = useState<FinancialPageTokenItem>(); // 币种信息
  const [productInfo, setProductInfo] =
    useState<FinancialPageTokenProductItem>(); // 当前产品

  // 标签页
  const items = [
    // 申购
    {
      key: "1",
      label: t("common.subscribe"),
      children: (
        <Subscription
          myBalance={myBalance}
          form={form}
          tokenInfo={tokenInfo}
          productInfo={productInfo}
          setProductInfo={setProductInfo}
        />
      ),
    },

    // 产品规则
    {
      key: "2",
      label: t("common.productRules"),
      children: <ProductRule productInfo={productInfo} />,
    },
  ];

  // 提交
  const onSubmit = async () => {
    form.validateFields().then(async (values) => {
      try {
        if (!values) return;
        setLoading(true);
        const formData = form.getFieldsValue();
        const params = {
          projectId: formData.projectId,
          financialAmount: formData.financialAmount,
          autoPurchase: formData.autoPurchase
            ? OpenStatusEnum.YES
            : OpenStatusEnum.NO,
        };
        const res = await financialSubscribe(params);
        if (res.code === "0") {
          console.log(res);
          setOpenSubscribe(false);
          setConfirmModal({
            open: true,
            status: "success",
            type: productInfo?.type,
            amount: formData.financialAmount,
            unit: tokenInfo?.coinName,
            endTime: curRecord?.curProduct.purchaseEndTime,
          });
          // 刷新页面数据
          onRefresh?.();
        } else {
          setConfirmModal({
            open: true,
            status: "error",
          });
        }
      } catch (error) {
        console.log(error);
        setConfirmModal({
          open: true,
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    });
  };

  // 监听 openSubscribe 变化，更新选中的产品
  useEffect(() => {
    if (openSubscribe && curRecord) {
      setTokenInfo(curRecord.token);
      setProductInfo(curRecord.curProduct);
      setTabsKey("1");
      form.setFieldsValue({
        projectId: curRecord?.curProduct.id,
        financialAmount: "",
      });
      // 获取余额
      const fetchBalance = async () => {
        if (!curRecord?.token.coinId) return;
        const res = await getUserBalance(curRecord?.token.coinId);
        if (res.code === "0") {
          setMyBalance(res.data);
        }
      };
      fetchBalance();
    }
  }, [curRecord, openSubscribe, form]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: { cardPadding: "20px" },
          Modal: { titleLineHeight: "60px" },
        },
      }}
    >
      <Modal
        classNames={{
          header: styles["my-modal-header"],
          footer: styles["my-modal-footer"],
          content: styles["my-modal-content"],
        }}
        maskClosable={false}
        open={openSubscribe}
        onCancel={() => setOpenSubscribe(false)}
        title={<div>{tokenInfo?.coinName}</div>}
        closable={{ "aria-label": "Custom Close Button" }}
        footer={
          tabsKey === "1" && (
            <div className="p-[30px_55px] flex justify-around gap-[20px]">
              <Button
                className="bg-[var(--cancel-btn)] text-[var(--cancel-color)] h-[50px] flex-1 border-0"
                onClick={() => setOpenSubscribe(false)}
                shape="round"
                size="large"
                disabled={loading}
              >
                {t("common.cancel")}
              </Button>
              <Button
                loading={loading}
                type="primary"
                shape="round"
                size="large"
                className="h-[50px] flex-1"
                onClick={onSubmit}
              >
                {t("common.subscribe")}
              </Button>
            </div>
          )
        }
      >
        <Spin spinning={loading}>
          <Tabs
            activeKey={tabsKey}
            defaultActiveKey="1"
            tabBarStyle={{ padding: "0 28px" }}
            items={items}
            onChange={(key) => setTabsKey(key)}
          />
        </Spin>
      </Modal>
    </ConfigProvider>
  );
};

export default SubscribeModal;
