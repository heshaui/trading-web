import {
  Button,
  ConfigProvider,
  Input,
  Modal,
  Segmented,
  Flex,
  Switch,
  Tabs,
  Spin,
  Form,
  FormInstance,
  Popover,
} from "antd";
import { useEffect, useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import {
  FinancialPageTokenItem,
  FinancialPageTokenProductItem,
  FinancialPageTokenStatusEnum,
  financialSubscribe,
  FinancialSubscribeShowItem,
  FinancialType,
  getEstimateDailyIncome,
  getFinancialSubscribeShow,
  OpenStatusEnum,
  SettlementInterestEnum,
} from "@/services/financial";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { SvgIcon } from "@/components/icon";
import SubscribeConfirmModal, {
  SubscribeConfirmModalType,
} from "./SubscribeConfirmModal";
import Image from "next/image";
import { getCurrentTimeZone } from "@/utils/currentTimeZone";
import financialStyles from "@/styles/components/Financial.module.css";
import { financialThemeConfig, useStyle } from "@/theme/financialThemeConfig";
import { getCoinRound } from "@/utils/getUseRate";

interface SubscriptionProps {
  form: FormInstance<any>;
  financialSubscribeShow: FinancialSubscribeShowItem;
  tokenInfo: FinancialPageTokenItem | undefined;
  productInfo: FinancialPageTokenProductItem | undefined;
  setProductInfo: (product: FinancialPageTokenProductItem) => void;
  curRecord: {
    token: FinancialPageTokenItem;
    curProduct: FinancialPageTokenProductItem;
  } | null;
  setTabsKey: (key: string) => void;
  onProductChange: (product: FinancialPageTokenProductItem) => void;
}

// 申购弹窗
const Subscription: React.FC<SubscriptionProps> = ({
  form,
  financialSubscribeShow,
  tokenInfo,
  productInfo,
  setProductInfo,
  curRecord,
  setTabsKey,
  onProductChange,
}) => {
  const [income, setIncome] = useState<number | string>("-"); //预估每日收益
  const { t } = useTranslation(["financial"]);

  // 监听表单字段变化
  const financialAmount = Form.useWatch("financialAmount", form);
  const projectId = Form.useWatch("projectId", form);

  // 监听 curRecord 变化，更新选中的产品
  useEffect(() => {
    if (productInfo) {
      setIncome(() => "-"); // 重置收益
    }
  }, [productInfo]);

  // 获取预估收益的函数
  const fetchIncome = useCallback(
    async (projectId: string | number, amount: string | number) => {
      if (!projectId || !amount || Number(amount) <= 0) {
        setIncome(() => "-");
        return;
      }

      try {
        // 获取预估收益
        const res = await getEstimateDailyIncome({
          projectId: Number(projectId),
          amount: Number(amount),
        });
        if (res.code === "0") {
          setIncome(() => res.data);
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
    <Flex align="center" gap={2} className="flex-ai-center">
      <div
        className="text-[14px] text-[var(--theme-color)] font-[400] cursor-pointer"
        onClick={() => {
          if (!projectId || !productInfo) return;
          // 如果当前可用金额小于最大金额 则设置为 当前可用金额  如果当前可用金额大于最大金额 设置为最大金额
          if (
            Number(financialSubscribeShow.availableAmount) <
            Number(productInfo.maxPurchaseAmount)
          ) {
            form.setFieldValue(
              "financialAmount",
              financialSubscribeShow.availableAmount
            );
            fetchIncome(projectId, financialSubscribeShow.availableAmount);
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
      <div
        style={{
          background: "var(--border-color4)",
          margin: "0 6.5px",
          width: "1px",
          height: "14px",
        }}
      />
      <div className="text-[14px] text-[var(--text-color5)] font-[400] flex flex-ai-center gap-[10px]">
        {tokenInfo?.iconUrl && (
          <Image
            src={tokenInfo?.iconUrl}
            alt={""}
            style={{ borderRadius: "50%" }}
            width={20}
            height={20}
            className="mr-[4px]"
          />
        )}
        {tokenInfo?.coinName}
      </div>
    </Flex>
  );

  // 只在初始化时排序，将当前选中的产品放在第一位，避免点击时位置跳跃
  const sortedData = useMemo(() => {
    if (!tokenInfo?.products) return [];

    // 找到初始选中的产品（来自 curRecord.curProduct）
    const initialSelectedId = curRecord?.curProduct?.id;
    if (!initialSelectedId) return tokenInfo.products;

    const targetItem = tokenInfo.products.find(
      (item) => item.id === initialSelectedId
    );
    const otherItems = tokenInfo.products.filter(
      (item) => item.id !== initialSelectedId
    );

    return targetItem ? [targetItem, ...otherItems] : tokenInfo.products;
  }, [tokenInfo?.products, curRecord?.curProduct?.id]);

  return (
    <Form form={form}>
      <Form.Item name="projectId" hidden>
        <Input />
      </Form.Item>
      <div className="px-[20px]">
        {/* 选择产品 第一个为 productInfo?.id === item.id  */}
        <div className="flex flex-ai-center gap-[17px] my-[16px] flex-wrap">
          {sortedData.map((item) => (
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
                setIncome(() => "-");
                setProductInfo(item);
                form.setFieldValue("projectId", item.id);
                // 调用父组件的产品变更处理函数
                onProductChange(item);
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
              className={`rounded-[10px]  border py-[5px] px-[14px] cursor-pointer bg-[var(--background12)] w-[132px] ${
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
            style={{
              marginBottom: "0px",
            }}
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

                  // 如果不是数字 则返回错误(请输入数字)
                  if (isNaN(Number(value))) {
                    return Promise.reject(
                      new Error(t("common.pleaseEnterTheNumber"))
                    );
                  }

                  // 输入的金额小于最小金额 则返回错误(输入金额小于最小申购金额)
                  if (
                    productInfo?.minPurchaseAmount &&
                    Number(value) < Number(productInfo?.minPurchaseAmount)
                  ) {
                    return Promise.reject(
                      new Error(
                        `${productInfo?.minPurchaseAmount} ${
                          tokenInfo?.coinName
                        } ${t("common.startInvestment")}`
                      )
                    );
                  }

                  // 输入的金额大于最大金额 则返回错误(输入金额大于最大申购金额)
                  if (
                    productInfo?.maxPurchaseAmount &&
                    Number(value) > Number(productInfo?.maxPurchaseAmount)
                  ) {
                    return Promise.reject(
                      new Error(
                        `${t("common.exceedSubscribeAmount")} ${
                          productInfo?.maxPurchaseAmount
                        } ${tokenInfo?.coinName}`
                      )
                    );
                  }

                  // 输入金额大于余额 则返回错误(账户余额不足)
                  if (
                    Number(value) >
                    Number(financialSubscribeShow.availableAmount)
                  ) {
                    return Promise.reject(
                      new Error(t("common.insufficientBalance"))
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              autoComplete="off"
              placeholder={`${t("common.min")} ${
                productInfo?.minPurchaseAmount
              } ${tokenInfo?.coinName}`}
              className="m-[10px_0] w-[100%] h-[50px]"
              suffix={suffix}
              onChange={(e) => {
                // 如果输入的金额不是数字 则返回错误
                if (isNaN(Number(e.target.value))) {
                  setIncome(() => "-");
                  return;
                }
                // 输入的值小于最小金额
                if (
                  Number(e.target.value) <
                  Number(productInfo?.minPurchaseAmount)
                ) {
                  setIncome(() => "-");
                  return;
                }
                // 输入的值大于最大金额
                if (
                  Number(e.target.value) >
                  Number(productInfo?.maxPurchaseAmount)
                ) {
                  setIncome(() => "-");
                  return;
                }
                // 取消之前的防抖调用，重新开始计算
                debounceFetchIncome.cancel();
                // 重新开始防抖计算
                debounceFetchIncome(projectId, e.target.value);
              }}
            />
          </Form.Item>
          {/* 现货可用 */}
          <div className="flex flex-ai-center flex-jc-between">
            <div className="text-[#9E9E9E] font-[400]">
              {t("common.spotAvailable")}
            </div>
            <div className="flex flex-ai-center gap-[4px]">
              <div>
                {tokenInfo?.coinName ? (
                  <>
                    {getCoinRound(
                      tokenInfo?.coinName,
                      financialSubscribeShow.availableAmount
                    )}{" "}
                    {tokenInfo?.coinName}
                  </>
                ) : (
                  <>
                    {financialSubscribeShow.availableAmount}{" "}
                    {tokenInfo?.coinName}
                  </>
                )}
              </div>
              <SvgIcon
                viewBox="0 0 16 16"
                width={16}
                height={16}
                path="M8.00016 1.33334C11.6822 1.33334 14.6668 4.31801 14.6668 8.00001C14.6668 11.682 11.6822 14.6667 8.00016 14.6667C4.31816 14.6667 1.3335 11.682 1.3335 8.00001C1.3335 4.31801 4.31816 1.33334 8.00016 1.33334ZM8.00016 2.66668C6.58567 2.66668 5.22912 3.22858 4.22893 4.22877C3.22873 5.22897 2.66683 6.58552 2.66683 8.00001C2.66683 9.4145 3.22873 10.7711 4.22893 11.7712C5.22912 12.7714 6.58567 13.3333 8.00016 13.3333C9.41465 13.3333 10.7712 12.7714 11.7714 11.7712C12.7716 10.7711 13.3335 9.4145 13.3335 8.00001C13.3335 6.58552 12.7716 5.22897 11.7714 4.22877C10.7712 3.22858 9.41465 2.66668 8.00016 2.66668ZM8.00016 4.66668C8.17697 4.66668 8.34654 4.73691 8.47157 4.86194C8.59659 4.98696 8.66683 5.15653 8.66683 5.33334V7.33334H10.6668C10.8436 7.33334 11.0132 7.40358 11.1382 7.52861C11.2633 7.65363 11.3335 7.8232 11.3335 8.00001C11.3335 8.17682 11.2633 8.34639 11.1382 8.47141C11.0132 8.59644 10.8436 8.66668 10.6668 8.66668H8.66683V10.6667C8.66683 10.8435 8.59659 11.0131 8.47157 11.1381C8.34654 11.2631 8.17697 11.3333 8.00016 11.3333C7.82335 11.3333 7.65378 11.2631 7.52876 11.1381C7.40373 11.0131 7.3335 10.8435 7.3335 10.6667V8.66668H5.3335C5.15668 8.66668 4.98712 8.59644 4.86209 8.47141C4.73707 8.34639 4.66683 8.17682 4.66683 8.00001C4.66683 7.8232 4.73707 7.65363 4.86209 7.52861C4.98712 7.40358 5.15668 7.33334 5.3335 7.33334H7.3335V5.33334C7.3335 5.15653 7.40373 4.98696 7.52876 4.86194C7.65378 4.73691 7.82335 4.66668 8.00016 4.66668Z"
              />
            </div>
          </div>
          {/* 可申购金额 */}
          <div className="flex flex-ai-center flex-jc-between">
            <span className="text-[#9E9E9E] font-[400]">
              {t("common.canSubscribe")}:
            </span>
            <span>
              {financialSubscribeShow.allowPurchaseAmount} {tokenInfo?.coinName}
            </span>
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
            <div className="text-[var(--text-color6)] font-[400] cursor-pointer flex flex-ai-center gap-[4px]">
              <Popover
                color="var(--background12)"
                overlayStyle={{
                  filter: "drop-shadow(0px 5px 30px var(--background))",
                }}
                content={
                  <div className="max-w-[236px] text-[14px] text-[var(--text-color5)] font-[400]">
                    <div className="flex gap-[3px]">
                      <div className="w-[6px] h-[6px] rotate-[-45deg] bg-[var(--theme-color)] flex-shrink-0 mt-[8px]"></div>
                      <div>{t("common.estimatedIncomeTips1")}</div>
                    </div>
                    <div className="flex gap-[3px]">
                      <div className="w-[6px] h-[6px] rotate-[-45deg] bg-[var(--theme-color)] flex-shrink-0 mt-[8px]"></div>
                      <div>{t("common.estimatedIncomeTips2")}</div>
                    </div>
                  </div>
                }
              >
                <div className="border-b border-dashed border-[var(--text-color6)]">
                  {productInfo?.type === FinancialType.CURRENT
                    ? t("common.estimatedDailyIncome")
                    : t("common.estimatedTotalIncome")}
                </div>
              </Popover>
            </div>

            <div className="text-[var(--theme-color)] font-[400]">
              {income} {tokenInfo?.coinName}
            </div>
          </div>
          {/* 自动申购开关 */}
          <div className="flex flex-ai-center flex-jc-between">
            <div className="text-[var(--text-color6)] font-[400] cursor-pointer flex flex-ai-center gap-[4px]">
              <Popover
                overlayStyle={{
                  filter: "drop-shadow(0px 5px 30px var(--background))",
                }}
                color="var(--background12)"
                content={
                  <div className="max-w-[236px] text-[14px] text-[var(--text-color5)] font-[400]">
                    {t("common.autoSubscribeTips")}
                  </div>
                }
              >
                <div className="border-b border-dashed border-[var(--text-color6)]">
                  {t("common.autoSubscribe")}
                </div>
              </Popover>
            </div>
            <Form.Item name="autoPurchase" noStyle>
              <Switch size="small" />
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
                <div className="text-[var(--text-color6)] font-[400] flex flex-ai-center gap-[4px]">
                  <div className="w-[6px] h-[6px] rotate-[-45deg] bg-[var(--theme-color)]"></div>
                  <div>
                    {t("common.applyAmount")}0 - {productInfo?.assetBoundary}
                    {tokenInfo?.coinName}
                  </div>
                </div>
                <div className="text-[var(--text-color6)] font-[400]">
                  {t("common.annualInterestRate")}{" "}
                  {productInfo?.minAnnualInterestRate}%
                </div>
              </div>
              <div className="flex flex-ai-center flex-jc-between text-[14px]">
                <div className="text-[var(--text-color6)] font-[400] flex flex-ai-center gap-[4px]">
                  <div className="w-[6px] h-[6px] rotate-[-45deg] bg-[var(--theme-color)]"></div>
                  <div>
                    {t("common.applyAmount")} &gt; {productInfo?.assetBoundary}
                    {tokenInfo?.coinName}
                  </div>
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
          <div className="rounded-[8px] p-[10px_16px]  text-[14px] font-[500] text-[#FF8A26] bg-[#FF8A2614] flex flex-ai-center gap-[4px]">
            <SvgIcon
              width={16}
              height={16}
              path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
            />
            <div>
              {t("common.thisProductSupportsEarlyRedemption")}{" "}
              <span className="cursor-pointer" onClick={() => setTabsKey("2")}>
                {t("common.viewRules")}
              </span>
            </div>
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
              1.{t("common.transactionRules")}
            </div>
            <div className="text-[14px] text-[var(--text-color5)] font-[400]">
              {`${t("common.fixed")} ${curSelectProduct?.term} ${t(
                "common.day"
              )}`}
            </div>
          </div>
          {/* 内容 */}
          <div className="p-[16px_20px] rounded-[10px] border-[var(--border-color4)] border-[1px] flex flex-column gap-[20px]">
            {/* 按日付息 申购时间 开始计息          首次收益 最后发息 下次申购 */}
            {/* 到本还息 申购时间 开始计息 发息时间                  下次申购 */}

            {/* 申购时间 */}
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.subscribeTime")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {dayjs().format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            {/* 开始计息 购买后1天 当前时区(08):00:00 开始计息 */}
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.startInterest")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {dayjs().add(1, "day").format("YYYY-MM-DD") +
                  " " +
                  `${getCurrentTimeZone()}:00:00`}
              </div>
            </div>
            {
              // 1按日付息，2到期还本利息
              curSelectProduct?.settlementInterest ===
              SettlementInterestEnum.DAILY ? (
                <>
                  {/* 首次收益 购买后2天 当前时区(08):00:00 首次收益 */}
                  <div className="flex flex-ai-center flex-jc-between">
                    <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                      {t("common.firstInterest")}
                    </div>
                    <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                      {dayjs().add(2, "day").format("YYYY-MM-DD") +
                        " " +
                        `${getCurrentTimeZone()}:00:00`}
                    </div>
                  </div>
                  {/* 最后发息 购买后 定期天数 + 1天 当前时区(08):00:00 最后发息 */}
                  <div className="flex flex-ai-center flex-jc-between">
                    <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                      {t("common.lastDue")}
                    </div>
                    <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                      {dayjs()
                        .add(Number(curSelectProduct?.term), "day")
                        .add(1, "day")
                        .format("YYYY-MM-DD") +
                        " " +
                        `${getCurrentTimeZone()}:00:00`}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 发息时间 购买后 定期天数 + 1天 当前时区(08):00:00 发息时间 */}
                  <div className="flex flex-ai-center flex-jc-between">
                    <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                      {t("common.interestTime")}
                    </div>
                    <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                      {dayjs()
                        .add(Number(curSelectProduct?.term), "day")
                        .add(1, "day")
                        .format("YYYY-MM-DD") +
                        " " +
                        `${getCurrentTimeZone()}:00:00`}
                    </div>
                  </div>
                </>
              )
            }
            {/* 下次申购 购买后 定期 当前时区(08):00:00 下次申购 */}
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.nextSubscribe")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {dayjs()
                  .add(Number(curSelectProduct?.term), "day")
                  .add(1, "day")
                  .format("YYYY-MM-DD") +
                  " " +
                  `${getCurrentTimeZone()}:00:00`}
              </div>
            </div>
          </div>
        </div>
        {/* 2.奖励规则 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            2.{t("common.rewardRules")}
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400] whitespace-pre-wrap">
            {t("common.rewardRulesTips")}
          </div>
        </div>
        {/* 3.提前赎回 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            3.{t("common.earlyRedemption")}
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            {t("common.earlyRedemptionTips")}
          </div>
        </div>
        {/* 4.取消申购 */}
        <div>
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            4.{t("common.cancelSubscribe")}
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
              1.{t("common.transactionRules")}
            </div>
            <div className="text-[14px] text-[var(--text-color5)] font-[400]">
              {t("common.current")}
            </div>
          </div>
          {/* 内容 */}
          <div className="p-[16px_20px] rounded-[10px] border-[var(--border-color4)] border-[1px] flex flex-column gap-[20px]">
            {/* 申购时间 */}
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.subscribeTime")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒 */}
                {dayjs().format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            {/* 起息时间 */}
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.startInterest")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒+1天 */}
                {dayjs().add(1, "day").format("YYYY-MM-DD") +
                  " " +
                  `${getCurrentTimeZone()}:00:00`}
              </div>
            </div>
            {/* 首次收益 */}
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                {t("common.firstInterest")}
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒+2天 */}
                {dayjs().add(2, "day").format("YYYY-MM-DD") +
                  " " +
                  `${getCurrentTimeZone()}:00:00`}
              </div>
            </div>
            {/* 赎回 */}
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
            2.{t("common.redeem")}
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            {t("common.redeemTips")}
          </div>
        </div>
        {/* 3.收益币种 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            3.{t("common.incomeCurrency")}
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            {t("common.incomeCurrencyTips")}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="p-[12px_20px_20px_20px]">
      {/* 活期 定期 */}
      <div className="mb-[20px]">
        <Segmented
          className="border-[var(--border-color4)] border-[1px]"
          options={[
            {
              value: "1",
              label: t("common.current"),
              disabled: productInfo?.type !== FinancialType.CURRENT,
            },
            {
              value: "2",
              label: t("common.fixed"),
              disabled: productInfo?.type !== FinancialType.FIXED,
            },
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
  openSubscribeModal: boolean;
  setOpenSubscribeModal: (open: boolean) => void;
  onRefresh?: () => void;
}
// 申购弹窗
const SubscribeModal = ({
  curRecord,
  openSubscribeModal,
  setOpenSubscribeModal,
  onRefresh,
}: SubscribeModalProps) => {
  const { styles } = useStyle();
  const [form] = Form.useForm();
  const { t } = useTranslation(["financial"]);

  const [tabsKey, setTabsKey] = useState("1"); // 标签页
  const [loading, setLoading] = useState(false); //加载中

  // 币种信息
  const [tokenInfo, setTokenInfo] = useState<FinancialPageTokenItem>();

  // 当前产品
  const [productInfo, setProductInfo] =
    useState<FinancialPageTokenProductItem>();

  // 申购确认弹窗
  const [subscribeConfirmModal, setSubscribeConfirmModal] =
    useState<SubscribeConfirmModalType>({
      open: false,
      status: null,
    });

  // 申购展示
  const [financialSubscribeShow, setFinancialSubscribeShow] =
    useState<FinancialSubscribeShowItem>({
      availableAmount: 0, // 可用余额
      allowPurchaseAmount: 0, // 可申购金额
    }); // 申购展示

  // 监听表单字段变化
  const financialAmount = Form.useWatch("financialAmount", form);

  // 获取申购展示
  const getFinancialSubscribeShowInfo = useCallback(
    async (product: FinancialPageTokenProductItem) => {
      setFinancialSubscribeShow({
        availableAmount: 0,
        allowPurchaseAmount: 0,
      });
      const projectId = product.id;
      const coinIdParam = curRecord?.token.coinId;
      const maxPurchaseAmountParam = product.maxPurchaseAmount;

      if (!projectId || !coinIdParam || !maxPurchaseAmountParam) return;

      const params = {
        projectId: Number(projectId),
        coinId: Number(coinIdParam),
        maxPurchaseAmount: Number(maxPurchaseAmountParam),
      };
      const res = await getFinancialSubscribeShow(params);
      if (res.code === "0") {
        setFinancialSubscribeShow(res.data);
      }
    },
    [curRecord?.token.coinId]
  );

  // 标签页
  const items = [
    // 申购
    {
      key: "1",
      label: t("common.subscribe"),
      children: (
        <Subscription
          setTabsKey={setTabsKey}
          financialSubscribeShow={financialSubscribeShow}
          form={form}
          tokenInfo={tokenInfo}
          productInfo={productInfo}
          setProductInfo={setProductInfo}
          curRecord={curRecord}
          onProductChange={getFinancialSubscribeShowInfo}
        />
      ),
    },

    // 产品规则
    {
      key: "2",
      label: t("common.productRules"),
      children: (
        <div className="h-[514px] overflow-y-auto">
          <ProductRule productInfo={productInfo} />
        </div>
      ),
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
          setOpenSubscribeModal(false);
          setSubscribeConfirmModal({
            open: true,
            status: "success",
            type: productInfo?.type,
            amount: formData.financialAmount,
            unit: tokenInfo?.coinName,
            autoSubscribe: formData.autoPurchase,
            fixedDays: curRecord?.curProduct.term,
          });
          // 刷新页面数据
          onRefresh?.();
        } else {
          setSubscribeConfirmModal({
            open: true,
            status: "error",
          });
        }
      } catch (error) {
        console.log(error);
        setSubscribeConfirmModal({
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
    if (openSubscribeModal && curRecord) {
      setTokenInfo(curRecord.token);
      setProductInfo(curRecord.curProduct);
      getFinancialSubscribeShowInfo(curRecord.curProduct);
      setTabsKey("1");
      form.setFieldsValue({
        projectId: curRecord?.curProduct.id,
        financialAmount: "",
      });
    }
  }, [curRecord, openSubscribeModal, form, getFinancialSubscribeShowInfo]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Switch: {
            colorTextQuaternary: "var(--switch-color)", // 关闭状态背景色
            colorTextTertiary: "var(--switch-color)", // 悬停背景颜色
          },
          Tabs: {
            fontSize: 16, // 标签字体大小
            horizontalMargin: "0px",
            inkBarColor: "var(--theme-color)",
            itemActiveColor: "var(--theme-color)",
            itemColor: "var(--text-color6)",
          },
          Modal: { titleLineHeight: "60px", margin: 0 },
          Button: {
            borderColorDisabled: "transparent", // 禁用状态边框颜色
            defaultHoverBg: "var(--cancel-btn)", // 默认按钮悬停背景色
          },
          Segmented: {
            fontSize: 12, // 分段器字体大小
            borderRadius: 50, // 分段器圆角
            borderRadiusSM: 50, // 分段器圆角
            itemSelectedBg: "var(--segmented-item-active-bg2)", // 选中背景色
            trackBg: "var(--background12)", // 轨道背景色
          },
        },
        token: {
          colorSplit: "var(--border-color4)", // 分割线颜色
          colorBgContainerDisabled: "var(--theme-05)", // 禁用状态背景色
        },
      }}
    >
      <Modal
        centered
        classNames={{
          header: styles["my-modal-header"],
          footer: styles["my-modal-footer"],
          content: styles["my-modal-content"],
        }}
        width={470}
        maskClosable={false}
        open={openSubscribeModal}
        // open={true}
        onCancel={() => setOpenSubscribeModal(false)}
        title={
          <div className="flex flex-ai-center gap-[4px]">
            {tokenInfo?.iconUrl && (
              <Image
                src={tokenInfo?.iconUrl}
                alt={""}
                style={{ borderRadius: "50%" }}
                width={18}
                height={18}
              />
            )}
            <div>{tokenInfo?.coinName}</div>
          </div>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        footer={
          tabsKey === "1" && (
            <div className="p-[30px_55px] flex justify-around gap-[20px]">
              <Button
                className="bg-[var(--cancel-btn)] text-[var(--cancel-color)] h-[50px] flex-1 border-0"
                onClick={() => setOpenSubscribeModal(false)}
                shape="round"
                size="large"
                disabled={loading}
              >
                {t("common.cancel")}
              </Button>
              <Button
                disabled={!financialAmount || loading}
                loading={loading}
                type="primary"
                shape="round"
                size="large"
                style={{
                  color: "var(--hometext)",
                  border: "none",
                }}
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
            className={financialStyles.tabs2}
            activeKey={tabsKey}
            defaultActiveKey="1"
            tabBarStyle={{ padding: "0 28px", height: "60px" }}
            items={items}
            onChange={(key) => setTabsKey(key)}
          />
        </Spin>
      </Modal>
      <SubscribeConfirmModal
        subscribeConfirmModal={subscribeConfirmModal}
        setSubscribeConfirmModal={setSubscribeConfirmModal}
      />
    </ConfigProvider>
  );
};

export default SubscribeModal;
