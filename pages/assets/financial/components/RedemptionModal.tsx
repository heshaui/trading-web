import {
  financialAccountRedemption,
  FinancialAccountRedemptionShowItem,
  FinancialType,
  getFinancialAccountRedemptionShow,
  UserFinancialAccountItem,
} from "@/services/financial";
import {
  Button,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Spin,
} from "antd";
import { createStyles } from "antd-style";
import { useEffect, useState } from "react";

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

const RedemptionModal = ({
  curProduct,
  openRedemption,
  setOpenRedemption,
  setConfirmModal,
}: {
  curProduct: UserFinancialAccountItem | null;
  openRedemption: boolean;
  setOpenRedemption: (open: boolean) => void;
  setConfirmModal: (confirmModal: {
    open: boolean;
    status: "error" | "success" | null;
    amount?: number;
    type?: FinancialType;
    unit?: string;
    endTime?: number;
  }) => void;
}) => {
  const { styles } = useStyle();

  const [form] = Form.useForm();
  const redeemMoney = Form.useWatch("redeemMoney", form);

  const [loading, setLoading] = useState(false);

  const [curProductInfo, setCurProductInfo] =
    useState<UserFinancialAccountItem | null>(null);
  const [redeemInfo, setRedeemInfo] =
    useState<FinancialAccountRedemptionShowItem>({
      totalAssets: 0,
      redeemLimit: 0,
    });

  const onSubmit = async () => {
    form.validateFields().then(async (values) => {
      if (!values) setLoading(true);
      try {
        setLoading(true);
        console.log(curProductInfo);
        if (!curProductInfo) return;
        const valuer = form.getFieldsValue();
        const res = await financialAccountRedemption({
          id: curProductInfo?.id,
          projectId: curProductInfo?.projectId,
          coinId: curProductInfo?.coinId,
          redeemMoney: redeemMoney,
        });
        if (res.code === "0") {
          setOpenRedemption(false);
          setConfirmModal({
            open: true,
            status: "success",
            amount: redeemMoney,
            type: curProductInfo?.type,
            unit: curProductInfo?.coinName,
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    if (curProduct && openRedemption) {
      setCurProductInfo(curProduct);
      // 获取赎回数据
      const fetchRedemptionData = async () => {
        try {
          if (!curProduct) return;
          const res = await getFinancialAccountRedemptionShow({
            id: curProduct?.id,
            projectId: curProduct?.projectId,
            coinId: curProduct?.coinId,
          });
          if (res.code === "0") {
            console.log(res.data);
            setRedeemInfo(res.data);
          }
        } catch (error) {}
      };
      fetchRedemptionData();
    }
    if (!openRedemption) {
      form.resetFields();
      setCurProductInfo(null);
      setRedeemInfo({
        totalAssets: 0,
        redeemLimit: 0,
      });
    }
  }, [curProduct, openRedemption, form]); // 移除 redeemMoney 依赖项

  // 最大按钮
  const suffix = (
    <Flex align="center" gap={2}>
      <div
        className="text-[14px] text-[var(--theme-color)] font-[400] cursor-pointer"
        onClick={() => {
          form.setFieldValue("redeemMoney", redeemInfo.redeemLimit);
        }}
      >
        最大
      </div>
      <Divider type="vertical" />
      <div className="text-[14px] text-[var(--text-color5)] font-[400]">
        {curProductInfo?.coinName}
      </div>
    </Flex>
  );

  return (
    <ConfigProvider
      theme={{
        components: {
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
        title={
          <div className="text-[16px] text-[var(--text-color5)] font-[500]">
            赎回{curProductInfo?.coinName}
          </div>
        }
        open={openRedemption}
        onCancel={() => setOpenRedemption(false)}
        footer={
          <div className="p-[30px_55px] flex justify-around gap-[20px]">
            <Button
              className="bg-[var(--cancel-btn)] text-[var(--cancel-color)] h-[50px] flex-1 border-0"
              onClick={() => setOpenRedemption(false)}
              shape="round"
              size="large"
            >
              取消
            </Button>
            <Button
              type="primary"
              shape="round"
              size="large"
              className="h-[50px] flex-1"
              onClick={onSubmit}
              loading={loading}
            >
              确认
            </Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Form form={form}>
            <div className="p-[30px_20px_10px_20px]">
              {true ? (
                <>
                  {/* label */}
                  <div className="text-[14px] text-[var(--text-color5)] font-[400] mb-[10px]">
                    赎回金额
                  </div>
                  {/* 输入框 */}
                  <Form.Item
                    name="redeemMoney"
                    rules={[
                      { required: true, message: "请输入赎回金额" },
                      {
                        validator: (_, value) => {
                          // 如果没有输入值，不进行范围校验，让required规则单独处理
                          if (!value || value === "") {
                            return Promise.resolve();
                          }

                          // 只能输入数字
                          if (isNaN(Number(value))) {
                            return Promise.reject(new Error("请输入数字"));
                          }

                          // 不能小于0
                          if (value <= 0) {
                            return Promise.reject(
                              new Error("赎回金额不能小于0")
                            );
                          }

                          // 不能大于赎回上限
                          if (
                            redeemInfo.redeemLimit &&
                            Number(value) > Number(redeemInfo.redeemLimit)
                          ) {
                            return Promise.reject(
                              new Error(
                                `最多 ${redeemInfo.redeemLimit} ${curProductInfo?.coinName}`
                              )
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      placeholder="请输入"
                      className="m-[10px_0] w-[100%] h-[50px]"
                      suffix={suffix}
                    />
                  </Form.Item>
                  {/* 显示内容 */}
                  <div>
                    <div className="mb-[4px]">
                      <span className="text-[12px] text-[var(--text-color6)] font-[400] mr-[10px]">
                        今日资产
                      </span>
                      <span className="text-[12px] text-[var(--text-color5)] font-[500]">
                        {redeemInfo.totalAssets || "--"}{" "}
                        {curProductInfo?.coinName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-color6)] font-[400] mr-[10px]">
                        今日赎回上限
                      </span>
                      <span className="text-[12px] text-[var(--text-color5)] font-[500]">
                        {redeemInfo.redeemLimit || "-"}{" "}
                        {curProductInfo?.coinName}
                      </span>
                    </div>
                  </div>
                  {/* 提示 */}
                  <div className="rounded-[8px] p-[12px_10px]  text-[12px] font-[500] mt-[10px] text-[var(--theme-color)] bg-[var(--bgc-color)]">
                    <div>
                      今日赎回金额上限：{redeemInfo.redeemLimit || "-"}
                      {curProductInfo?.coinName}，请于明日重新操作！
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 金额 */}
                  <div className="text-[24px] text-[var(--text-color5)] font-[500] mb-[8px] text-center">
                    5 USDT
                  </div>
                  {/* subTitle */}
                  <div className="text-[14px] text-[var(--text-color6)] font-[400] mb-[37px] text-center">
                    赎回数量
                  </div>
                  {/* 内容显示 */}
                  <div className="border border-[var(--border-color4)] rounded-[8px] p-[20px] flex flex-column gap-[20px]">
                    <div className="flex justify-between">
                      <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                        申购金额
                      </div>
                      <div className="text-[#0C0D0C] font-[400] text-[14px]">
                        5 {curProductInfo?.coinName}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-[#676867] font-[400] text-[14px]">
                        已获得利息
                      </div>
                      <div className="text-[#0C0D0C] font-[400] text-[14px]">
                        0.12 {curProductInfo?.coinName}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-[#676867] font-[400] text-[14px]">
                        赎回金额
                      </div>
                      <div className="text-[#0C0D0C] font-[400] text-[14px]">
                        4.88 {curProductInfo?.coinName}
                      </div>
                    </div>
                  </div>
                  {/* 提示 */}
                  <div className="rounded-[8px] p-[10px_16px]  text-[14px] font-[500] mt-[10px] text-[var(--theme-color)] bg-[var(--bgc-color)]">
                    <div>1.提前赎回将失去已获得利息。</div>
                    <div>2.所有资产将在72小时内退回至您的现货账户。</div>
                  </div>
                </>
              )}
            </div>
          </Form>
        </Spin>
      </Modal>
    </ConfigProvider>
  );
};

export default RedemptionModal;
