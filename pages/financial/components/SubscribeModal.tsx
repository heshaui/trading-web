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
import { useEffect, useState, useCallback, useRef } from "react";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import {
  FinancialPageTokenItem,
  FinancialPageTokenProductItem,
  FinancialPageTokenStatusEnum,
  financialSubscribe,
  FinancialType,
  getEstimateDailyIncome,
  PurchaseEnum,
} from "@/services/financial";
import { getUserBalance } from "@/services/assets";

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

const Subscription: React.FC<{
  form: FormInstance<any>;
  myBalance: any;
  tokenInfo: FinancialPageTokenItem | undefined;
  productInfo: FinancialPageTokenProductItem | undefined;
  setProductInfo: (product: FinancialPageTokenProductItem) => void;
}> = ({ form, myBalance, tokenInfo, productInfo, setProductInfo }) => {
  const [income, setIncome] = useState<number | string>("-"); //预估每日收益
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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

  // 监听 financialAmount 变化，添加防抖处理
  useEffect(() => {
    if (productInfo && projectId) {
      // 清除之前的定时器
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // 设置新的定时器，500ms后执行
      debounceTimer.current = setTimeout(() => {
        fetchIncome(projectId, financialAmount);
      }, 500);
    }

    // 清理函数
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [financialAmount, projectId, productInfo, fetchIncome]);

  // 最大金额
  const suffix = (
    <Flex align="center" gap={2}>
      <div
        className="text-[14px] text-[var(--theme-color)] font-[400] cursor-pointer"
        onClick={() => {
          form.setFieldValue(
            "financialAmount",
            productInfo?.maxPurchaseAmount || 0
          );
        }}
      >
        最大
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
                if (Number(item.status) !== FinancialPageTokenStatusEnum.IN_PROGRESS) {
                  return;
                }
                form.resetFields();
                setIncome("-");
                setProductInfo(item);
                form.setFieldValue("projectId", item.id);
                // 立即获取收益，不等待防抖
                const currentAmount = form.getFieldValue("financialAmount");
                if (currentAmount && Number(currentAmount) > 0 && item.id) {
                  fetchIncome(item.id, currentAmount);
                }
              }}
              key={item.id}
              style={{
                border:
                  productInfo?.id === item.id
                    ? "1px solid var(--theme-color)"
                    : "1px solid var(--border-color4)",
                cursor: Number(item.status) !== FinancialPageTokenStatusEnum.IN_PROGRESS ? "not-allowed" : "pointer",
              }}
              className={`flex-1 rounded-[10px]  border py-[5px] px-[14px] cursor-pointer bg-[var(--background12)] ${
                productInfo?.id === item.id
                  ? "border-[var(--theme-color)]"
                  : "border-[var(--border-color4)]"
              }`}
            >
              <div>
                {item.type === FinancialType.CURRENT
                  ? "活期"
                  : `${item.term}天`}
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
            申购数量
          </div>
          <Form.Item
            name="financialAmount"
            rules={[
              {
                required: true,
                message: "请输入申购数量",
              },
              {
                validator: (_, value) => {
                  // 如果没有输入值，不进行范围校验，让required规则单独处理
                  if (!value || value === "") {
                    return Promise.resolve();
                  }

                  if (
                    productInfo?.minPurchaseAmount &&
                    value < productInfo?.minPurchaseAmount
                  ) {
                    return Promise.reject(
                      new Error(
                        `最少 ${productInfo?.minPurchaseAmount} ${tokenInfo?.coinName}`
                      )
                    );
                  }
                  if (
                    productInfo?.maxPurchaseAmount &&
                    value > productInfo?.maxPurchaseAmount
                  ) {
                    return Promise.reject(
                      new Error(
                        `最多 ${productInfo?.maxPurchaseAmount} ${tokenInfo?.coinName}`
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder={`最少 ${productInfo?.minPurchaseAmount} ${tokenInfo?.coinName}`}
              className="m-[10px_0] w-[100%] h-[50px]"
              suffix={suffix}
            />
          </Form.Item>
          <div className="mb-[2px]">
            <span className="text-[#9E9E9E] font-[400] mr-[10px]">
              现货可用:
            </span>
            {myBalance?.balance} {tokenInfo?.coinName}
          </div>
          <div>
            <span className="text-[#9E9E9E] font-[400] mr-[10px]">可申购:</span>
            {(productInfo?.maxPurchaseAmount || 0) -
              (financialAmount || 0)}{" "}
            {tokenInfo?.coinName}
          </div>
        </div>
        {/* 申购数量shownumber */}
        <div className="flex flex-column gap-[10px] mb-[24px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400]">
            概览
          </div>
          <div className="flex flex-ai-center flex-jc-between">
            <div className="text-[var(--text-color6)] font-[400]">
              预估每日收益
            </div>
            <div className="text-[var(--theme-color)] font-[400]">
              {income} {tokenInfo?.coinName}
            </div>
          </div>
          <div className="flex flex-ai-center flex-jc-between">
            <div className="text-[var(--text-color6)] font-[400]">自动申购</div>
            <Form.Item name="autoPurchase" noStyle>
              <Switch />
            </Form.Item>
          </div>
        </div>
        {/* 奖励规则 定期不显示 活期显示 */}
        {productInfo?.type === FinancialType.CURRENT && (
          <div className="mb-[16px]">
            <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
              奖励规则
            </div>
            <>
              <div className="flex flex-ai-center flex-jc-between text-[14px] mb-[4px]">
                <div className="text-[var(--text-color6)] font-[400]">
                  申请数量0 - {productInfo?.assetBoundary}
                  {tokenInfo?.coinName}
                </div>
                <div className="text-[var(--text-color6)] font-[400]">
                  年化利率 {productInfo?.minAnnualInterestRate}%
                </div>
              </div>
              <div className="flex flex-ai-center flex-jc-between text-[14px]">
                <div className="text-[var(--text-color6)] font-[400]">
                  申请数量 &gt; {productInfo?.assetBoundary}
                  {tokenInfo?.coinName}
                </div>
                <div className="text-[var(--text-color6)] font-[400]">
                  年化利率 {productInfo?.maxAnnualInterestRate}%
                </div>
              </div>
            </>
          </div>
        )}
        {/* 提示 */}
        {productInfo?.isRedemption === PurchaseEnum.YES ? (
          <div className="rounded-[8px] p-[10px_16px]  text-[14px] font-[500] text-[var(--theme-color)] bg-[var(--bgc-color)]">
            该产品支持提前赎回，查看规则
          </div>
        ) : null}
      </div>
    </Form>
  );
};

const ProductRule: React.FC<{
  productInfo: FinancialPageTokenProductItem | undefined;
}> = ({ productInfo }) => {
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
              1.交易规则
            </div>
            <div className="text-[14px] text-[var(--text-color5)] font-[400]">
              定期
            </div>
          </div>
          {/* 内容 */}
          <div className="p-[16px_20px] rounded-[10px] border-[#DCDCDC] border-[1px] flex flex-column gap-[20px]">
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                申购时间
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒 */}
                {dayjs().format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                开始计息
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒+1天 */}
                {dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                首次发息
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒+2天 */}
                {dayjs().add(2, "day").format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                最后发息
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {dayjs(curSelectProduct?.purchaseEndTime)
                  .add(1, "day")
                  .format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                下次申购
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
            2.奖励规则
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            您申购的定期产品的年化收益率按照申购成功时年利率计算。
            收益将于申购次日 08:00 (UTC+8)
            开始计算。收益将于开始计算后次日（即申购后两天）的 08:00 (UTC+8)
            开始发放至您的现货账户。 每日收益 = 已申购资产 * 年化收益率 /
            365（精确到小数位，具体位数取决于币种）
          </div>
        </div>
        {/* 3.提前赎回 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            3.提前赎回
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            针对指定定期产品，您可以在到期前随时赎回资产，一经确认，赎回流程将不可逆。如果提前赎回，您将放弃该产品已计息的收益。您用于申购定期产品的本金将于72小时内返还至您的现货钱包。如遇极端市场波动、网络延迟或请求数量过多，赎回可能会延迟。
          </div>
        </div>
        {/* 4.取消申购 */}
        <div>
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            4.取消申购
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            如果您在申购当天取消申购，且在次日07:59 (UTC+8)
            之前确认取消,则可以成功取消申购，您的本金将退还至个人现货账户。在
            07:59 (UTC+8) 之后，则无法取消申购，您将需要遵守提前赎回政策。
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
              1.交易规则
            </div>
            <div className="text-[14px] text-[var(--text-color5)] font-[400]">
              活期
            </div>
          </div>
          {/* 内容 */}
          <div className="p-[16px_20px] rounded-[10px] border-[#DCDCDC] border-[1px] flex flex-column gap-[20px]">
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                申购时间
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒 */}
                {dayjs().format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                开始计息
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒+1天 */}
                {dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                首次发放利息
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                {/* 当前年月日 时分秒+2天 */}
                {dayjs().add(2, "day").format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-ai-center flex-jc-between">
              <div className="text-[14px] text-[var(--text-color6)] font-[400]">
                赎回
              </div>
              <div className="text-[14px] text-[var(--hometext3)] font-[400]">
                立即赎回
              </div>
            </div>
          </div>
        </div>
        {/* 交易规则补充 */}
        <div className="text-[14px] text-[var(--text-color6)] font-[400] mb-[16px]">
          针对活期产品, 我们将提供阶梯年化收益,
          该收益采用阶梯分級结构。该收益于申购隔日08:00（UTC+8）开始计算。在计算后隔日
          (即申购日+两天) 的08:00 (UTC+8) 开始发放至您的现货钱包。
          ​​阶梯年化收益率可能每天变化。
        </div>
        {/* 2.赎回 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            2.赎回
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            一旦赎回操作完成, 活期产品资产将立即返还到您的现货钱包。 请注意,
            每个活期产品都有每日赎回上限, 且赎回上限可能会进行调整。
            若出现大量的赎回请求, 可能会暂时延迟赎回, 并在流动性恢复后完成
            赎回操作。
          </div>
        </div>
        {/* 3.收益币种 */}
        <div className="mb-[16px]">
          <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
            3.收益币种
          </div>
          <div className="text-[14px] text-[var(--text-color6)] font-[400]">
            持仓币种和收益币种并非同一币种，则以质押币种计算利息并且以结息当时的汇率换算收益币种。
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
            { value: "1", label: "活期" },
            { value: "2", label: "定期" },
          ]}
          value={activeKey}
          onChange={(value) => setActiveKey(value)}
        />
      </div>
      {activeKey === "1" ? <Current /> : <Regular />}
    </div>
  );
};

const SubscribeModal = ({
  curRecord,
  openSubscribe,
  setOpenSubscribe,
  setConfirmModal,
}: {
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
}) => {
  const { styles } = useStyle();
  const [form] = Form.useForm();

  const [tabsKey, setTabsKey] = useState("1"); // 标签页
  const [myBalance, setMyBalance] = useState<any>(null); //我的余额
  const [loading, setLoading] = useState(false); //加载中

  const [tokenInfo, setTokenInfo] = useState<FinancialPageTokenItem>(); // 币种信息
  const [productInfo, setProductInfo] = useState<FinancialPageTokenProductItem>(); // 当前产品

  // 标签页
  const items = [
    {
      key: "1",
      label: "申购",
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
    {
      key: "2",
      label: "产品规则",
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
            ? PurchaseEnum.YES
            : PurchaseEnum.NO,
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
                取消
              </Button>
              <Button
                loading={loading}
                type="primary"
                shape="round"
                size="large"
                className="h-[50px] flex-1"
                onClick={onSubmit}
              >
                申购
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
