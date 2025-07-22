import {
  financialAccountRedemption,
  FinancialAccountRedemptionShowFixedItem,
  FinancialAccountRedemptionShowItem,
  FinancialType,
  getFinancialAccountRedemptionShow,
  getFinancialAccountRedemptionShowFixed,
  SettlementInterest,
  UserFinancialAccountItem,
} from "@/services/financial";
import {
  Button,
  ConfigProvider,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@/components/icon";
import RedeemConfirmModal, {
  RedeemConfirmModalType,
} from "./RedeemConfirmModal";
import Image from "next/image";
import { financialThemeConfig, useStyle } from "@/theme/financialThemeConfig";
import { getCoinRound } from "@/utils/getUseRate";
interface RedemptionModalProps {
  curProduct: UserFinancialAccountItem | null;
  openRedemption: boolean;
  setOpenRedemption: (open: boolean) => void;
  onRefresh?: () => void;
}

const RedemptionModal = ({
  curProduct,
  openRedemption,
  setOpenRedemption,
  onRefresh,
}: RedemptionModalProps) => {
  const { styles } = useStyle();
  const { t } = useTranslation(["financial"]);
  const [form] = Form.useForm();
  const redeemMoney = Form.useWatch("redeemMoney", form);

  const [loading, setLoading] = useState(false);

  // 当前产品信息
  const [curProductInfo, setCurProductInfo] =
    useState<UserFinancialAccountItem | null>(null);

  // 赎回信息-活期
  const [redeemInfo, setRedeemInfo] =
    useState<FinancialAccountRedemptionShowItem>({
      totalAssets: 0,
      redeemLimit: 0,
    });

  //赎回金额-定期
  const [redeemMoneyFixed, setRedeemMoneyFixed] =
    useState<FinancialAccountRedemptionShowFixedItem>({
      earnInterest: 0,
      redeemMoney: 0,
    });

  // 赎回确认弹窗
  const [redeemConfirmModal, setRedeemConfirmModal] =
    useState<RedeemConfirmModalType>({
      open: false,
      status: null,
    });

  // 提交赎回
  const onSubmit = async () => {
    form.validateFields().then(async (values) => {
      if (!values) return;
      try {
        if (curProductInfo?.type === FinancialType.CURRENT) {
          // 不是数字报错
          if (isNaN(Number(redeemMoney))) {
            return message.error(t("common.pleaseEnterTheRedeemAmount"));
          }

          // 小于0报错
          if (Number(redeemMoney) <= 0) {
            return message.error(t("common.pleaseEnterTheRedeemAmount"));
          }

          // 大于总资产报错
          if (Number(redeemMoney) > Number(redeemInfo.totalAssets)) {
            return message.error(t("common.pleaseEnterTheRedeemAmount"));
          }

          // 大于今日赎回上限报错
          if (Number(redeemMoney) > Number(redeemInfo.redeemLimit)) {
            return message.error(t("common.pleaseEnterTheRedeemAmount"));
          }
        }

        setLoading(true);
        if (!curProductInfo) return;
        const res = await financialAccountRedemption({
          id: curProductInfo?.id,
          projectId: curProductInfo?.projectId,
          coinId: curProductInfo?.coinId,
          redeemMoney:
            curProductInfo?.type === FinancialType.CURRENT
              ? Number(redeemMoney)
              : Number(redeemMoneyFixed.redeemMoney),
        });
        if (res.code === "0") {
          setOpenRedemption(false);
          setRedeemConfirmModal({
            open: true,
            status: "success",
            amount:
              curProductInfo?.type === FinancialType.CURRENT
                ? Number(redeemMoney)
                : Number(redeemMoneyFixed.redeemMoney),
            interest: curProductInfo?.accruedInterest,
            type: curProductInfo?.type,
            unit: curProductInfo?.coinName,
            settlementInterest: curProductInfo?.settlementInterest,
          });
          // 刷新页面数据
          onRefresh?.();
        } else {
          setOpenRedemption(false);
          setRedeemConfirmModal({
            open: true,
            status: "error",
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    });
  };

  // 获取赎回数据
  useEffect(() => {
    // 打开弹窗
    if (curProduct && openRedemption) {
      setCurProductInfo(curProduct);
      // 获取赎回数据
      const fetchRedemptionData = async () => {
        try {
          if (!curProduct) return;
          setLoading(true);
          const params = {
            id: curProduct?.id,
            projectId: curProduct?.projectId,
            coinId: curProduct?.coinId,
          };
          const res =
            curProduct?.type === FinancialType.CURRENT
              ? await getFinancialAccountRedemptionShow(params)
              : await getFinancialAccountRedemptionShowFixed(params);
          if (res.code === "0") {
            if (curProduct?.type === FinancialType.CURRENT) {
              setRedeemInfo(res.data as FinancialAccountRedemptionShowItem);
            } else {
              setRedeemMoneyFixed(
                res.data as FinancialAccountRedemptionShowFixedItem
              );
            }
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchRedemptionData();
    }
    // 关闭弹窗
    if (!openRedemption) {
      form.resetFields();
      setRedeemMoneyFixed({
        earnInterest: 0,
        redeemMoney: 0,
      });
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
          // 最大：1.当前用户申购金额≤今日赎回限制，点击最大， 输入框数量显示用户全部申购金额
          // 2.当前用户申购金额≥今日赎回上限， 点击最大，输入框数量显示今日赎回上限
          if (
            Number(curProductInfo?.purchaseAmount) <=
            Number(redeemInfo.redeemLimit)
          ) {
            form.setFieldValue("redeemMoney", curProductInfo?.purchaseAmount);
          } else {
            form.setFieldValue("redeemMoney", redeemInfo.redeemLimit);
          }
        }}
      >
        {t("common.max")}
      </div>
      <div className="w-[1px] h-[14px] bg-[var(--border-color4)] mx-[6.5px]"></div>
      <div className="text-[14px] text-[var(--text-color5)] font-[400] flex flex-ai-center gap-[10px]">
        {curProductInfo?.iconUrl && (
          <Image
            src={curProductInfo?.iconUrl}
            alt={""}
            width={20}
            height={20}
            className="mr-[4px]"
          />
        )}
        {curProductInfo?.coinName}
      </div>
    </Flex>
  );

  return (
    <ConfigProvider theme={financialThemeConfig}>
      {/* 赎回弹窗 */}
      <Modal
        centered
        width={470}
        classNames={{
          header: styles["my-modal-header"],
          footer: styles["my-modal-footer"],
          content: styles["my-modal-content"],
        }}
        title={
          <div className="text-[16px] text-[var(--text-color5)] font-[500]">
            {t("common.redeem")} {curProductInfo?.coinName}
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
              {t("common.cancel")}
            </Button>
            <Button
              disabled={
                !redeemMoney && curProductInfo?.type === FinancialType.CURRENT
              }
              style={{
                color: "var(--hometext)",
                border: "none",
              }}
              type="primary"
              shape="round"
              size="large"
              className="h-[50px] flex-1"
              onClick={onSubmit}
              loading={loading}
            >
              {t("common.confirm")}
            </Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Form form={form}>
            <div className="px-[20px]">
              {curProductInfo?.type === FinancialType.CURRENT ? (
                // 活期赎回
                <>
                  {/* label */}
                  <div className="text-[14px] text-[var(--text-color5)] font-[400] mt-[30px]">
                    {t("common.redeemAmount")}
                  </div>
                  {/* 输入框 */}
                  <Form.Item
                    noStyle
                    name="redeemMoney"
                    rules={[
                      {
                        required: true,
                        message: t("common.pleaseEnterTheRedeemAmount"),
                      },
                    ]}
                  >
                    <Input
                      autoComplete="off"
                      placeholder={t("common.pleaseEnterTheRedeemAmount")}
                      className="m-[10px_0] w-[100%] h-[50px]"
                      suffix={suffix}
                    />
                  </Form.Item>
                  {/* 显示内容 */}
                  <div>
                    <div className="mb-[4px]">
                      <span className="text-[12px] text-[var(--text-color6)] font-[400] mr-[10px]">
                        {t("common.totalAssets")}
                      </span>
                      <span className="text-[12px] text-[var(--text-color5)] font-[500]">
                        {curProductInfo?.coinName ? (
                          <>
                            {getCoinRound(
                              curProductInfo?.coinName,
                              redeemInfo.totalAssets
                            )}{" "}
                            {curProductInfo?.coinName}
                          </>
                        ) : (
                          <>
                            {redeemInfo.totalAssets || "--"}{" "}
                            {curProductInfo?.coinName}
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-color6)] font-[400] mr-[10px]">
                        {t("common.todayRedeemLimit")}
                      </span>
                      <span className="text-[12px] text-[var(--text-color5)] font-[500]">
                        {redeemInfo.redeemLimit || "-"}{" "}
                        {curProductInfo?.coinName}
                      </span>
                    </div>
                  </div>
                  {/* 提示 */}
                  <div className="rounded-[8px] p-[12px_10px]  text-[12px] font-[500] mt-[10px] text-[#FF8A26] bg-[#FF8A2614]">
                    <div className="flex flex-ai-center gap-[4px]">
                      <SvgIcon
                        width={16}
                        height={16}
                        path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                      />
                      <div>
                        {" "}
                        {t("common.todayRedeemLimit")}：
                        {redeemInfo.redeemLimit || "-"}
                        {curProductInfo?.coinName}，
                        {t("common.pleaseOperateTomorrow")}！
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // 定期赎回
                <>
                  {/* 金额 */}
                  <div className="text-[24px] text-[var(--text-color5)] font-[500] mb-[8px] text-center mt-[28px]">
                    {curProductInfo?.purchaseAmount} {curProductInfo?.coinName}
                  </div>
                  {/* subTitle */}
                  <div className="text-[14px] text-[var(--text-color6)] font-[400] mb-[37px] text-center">
                    {t("common.redeemAmount")}
                  </div>
                  {/* 内容显示 */}
                  <div className="border border-[var(--border-color4)] rounded-[8px] p-[20px] flex flex-column gap-[20px]">
                    {/* 购买金额 */}
                    <div className="flex justify-between">
                      <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                        {t("common.purchaseAmount")}
                      </div>
                      <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                        {curProductInfo?.purchaseAmount}{" "}
                        {curProductInfo?.coinName}
                      </div>
                    </div>
                    {/* 累计收益 */}
                    <div className="flex justify-between">
                      <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                        {curProductInfo?.settlementInterest ===
                        SettlementInterest.DAILY
                          ? t("common.accruedInterest")
                          : t("common.totalInterest")}
                      </div>
                      <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                        {curProductInfo?.coinName ? (
                          <>
                            {getCoinRound(
                              curProductInfo?.coinName,
                              redeemMoneyFixed.earnInterest
                            )}{" "}
                            {curProductInfo?.coinName}
                          </>
                        ) : (
                          <>
                            {redeemMoneyFixed.earnInterest || "--"}
                            {curProductInfo?.coinName}
                          </>
                        )}
                      </div>
                    </div>
                    {/* 赎回金额 */}
                    <div className="flex justify-between">
                      <div className="text-[var(--text-color6)] font-[400] text-[14px]">
                        {t("common.redeemAmount")}
                      </div>
                      <div className="text-[var(--text-color5)] font-[400] text-[14px]">
                        {curProductInfo?.coinName ? (
                          <>
                            {getCoinRound(
                              curProductInfo?.coinName,
                              redeemMoneyFixed.redeemMoney
                            )}{" "}
                            {curProductInfo?.coinName}
                          </>
                        ) : (
                          <>
                            {redeemMoneyFixed.redeemMoney || "--"}{" "}
                            {curProductInfo?.coinName}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 提示 */}
                  <div className="rounded-[8px] p-[10px_16px]  text-[14px] font-[400] mt-[10px] text-[#FF8A26] bg-[#FF8A2614] flex gap-[4px]">
                    <div className="mt-[2px]">
                      <SvgIcon
                        width={16}
                        height={16}
                        path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                      />
                    </div>
                    <div className="flex-1">
                      <div>
                        {curProductInfo?.settlementInterest ===
                        SettlementInterest.DAILY
                          ? t("common.redeemTips1")
                          : t("common.expirationRedeemTips1")}
                      </div>
                      <div>
                        {curProductInfo?.settlementInterest ===
                        SettlementInterest.DAILY
                          ? t("common.redeemTips2")
                          : t("common.expirationRedeemTips2")}
                      </div>
                      <div>
                        {curProductInfo?.settlementInterest ===
                        SettlementInterest.DAILY
                          ? t("common.redeemTips3")
                          : t("common.expirationRedeemTips3")}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* 赎回确认弹窗 */}
      <RedeemConfirmModal
        redeemConfirmModal={redeemConfirmModal}
        setRedeemConfirmModal={setRedeemConfirmModal}
      />
    </ConfigProvider>
  );
};

export default RedemptionModal;
