import React from "react";
// import { withAssetsLayout } from '@/components/sidebarLayout/AssetsLayout/assetsLayout';
import styles from "../styles/spotAccount.module.css";
import { Input, Steps, Breadcrumb, ConfigProvider, Table, Select } from "antd";
import { Iconify } from "@/components/icon";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useState, useEffect, useRef } from "react";
import { useThemeMode } from "@/hooks/useThemeMode";
import Image from "next/image";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { NoData, NoAddress } from "@/components/noData";
import NoUseCom from "../components/noSM";
import RechargeTable from "../components/rechargeTable";
import { ROUTER_KEY_ASSETS } from "@/config/apiConfig";
const TopUpPage = () => {
  const { t } = useTranslation("assets");
  const { isDayMode } = useThemeMode(); // 使用 hook

  const [searchHistory, setSearchHistory] = useState<string[]>([
    "BTC",
    "ETH",
    "FIL",
    "USDT",
  ]);

  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);

  const [showTopUp, setShowTopUp] = useState(false);

  const cardTypeSeelect: { label: string; value: string }[] = [
    {
      label: "居民身份证",
      value: "1",
    },
    {
      label: "普通护照",
      value: "2",
    },
    {
      label: "港澳通行证",
      value: "3",
    },
    {
      label: "台湾通行证",
      value: "4",
    },
    {
      label: "台湾身份证",
      value: "5",
    },
    {
      label: "外国人永久居住身份证",
      value: "6",
    },
  ];
  const steps = [
    {
      title: <p className={`${styles.tip_title} `}>充值币种</p>,
      description: (
        <div className={`${styles.steps_item_content} mt-2`}>
          {current >= 0 && (
            <>
              <Select
                allowClear
                placeholder="请选择币种"
                options={cardTypeSeelect}
                className={`${styles.select_box} custom-select`}
                // optionLabelProp="children"
                optionRender={(option) => {
                  return (
                    <div className="flex items-center py-1">
                      <Image
                        src={`/images/assets/assets_account/icon_money.png`}
                        alt={option.data.label}
                        width={20}
                        height={20}
                        className={` mr-2`}
                      />
                      <span className="text-text-color7">
                        {option.data.label}
                      </span>
                    </div>
                  );
                }}
                dropdownRender={(menu) => (
                  <>
                    <div className={` font-14 font-w-400 mb-2_5 `}>
                      <p className={`${styles.tip_color2}`}>搜索历史</p>
                      <div className="mt-2 mb-2_5">
                        {searchHistory.map((item) => (
                          <button
                            key={item}
                            className={`cancel_btn5 ${styles.selsect_btn} mr-2`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <p className={`${styles.tip_color2}`}>币种列表</p>
                    </div>
                    {menu}
                  </>
                )}
                notFoundContent={<NoData title="暂无记录" />}
              />
              <div className="mt-2_5">
                <button className={`${styles.btn_style} cancel_btn5 mr-2`}>
                  USDT
                </button>
                <button className={`${styles.btn_style} cancel_btn5 mr-2`}>
                  BTC
                </button>
                <button className={`${styles.btn_style} cancel_btn5 mr-2`}>
                  ETH
                </button>
                <button className={`${styles.btn_style} cancel_btn5 mr-2`}>
                  FIL
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      title: <p className={`${styles.tip_title} `}>网络</p>,
      description: (
        <div className={`${styles.steps_item_content2} mt-2`}>
          {current >= 1 && (
            <Select
              allowClear
              placeholder="请选择网络"
              options={cardTypeSeelect}
              className={`${styles.select_box} custom-select`}
              optionRender={(option) => {
                return (
                  <div className="flex items-center py-1">
                    <span className="text-text-color7">
                      {option.data.label}
                    </span>
                  </div>
                );
              }}
              dropdownRender={(menu) => (
                <>
                  <p
                    className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5 `}
                  >
                    <Iconify
                      icon="ep:warning-filled"
                      className="warning_color mr-1"
                      size={16}
                    />
                    <span>
                      请注意，这里仅展示了Metawave平台所支持的充币网络，如果您使用本平台不支持的网络充币，将可能导致资产损失。
                    </span>
                  </p>
                  {menu}
                </>
              )}
              notFoundContent={<NoData title="暂无记录" />}
            />
          )}
        </div>
      ),
    },
    {
      title: <p className={`${styles.tip_title} `}>充值地址</p>,
      description: (
        <div className={`${styles.steps_item_content3} mt-2`}>
          {current >= 2 && (
            <Input
              className={`${styles.input_box2} modal-input mr-7`}
              maxLength={25}
              placeholder="搜索"
              allowClear
              prefix={
                <Iconify
                  icon="garden:search-26"
                  size={20}
                  className={`${styles.title_color} `}
                />
              }
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={` page-h w-full page-box flex-y align-center`}>
      <div className={`${styles.spot_auth_box}`}>
        <div className="flex justify-between align-center">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link href={ROUTER_KEY_ASSETS.SPOT_ACCOUNT}>
                    <span className={`${styles.tip_color}`}>
                      {/* 现货账户 */}
                      {t("assets.assetsAccount")}
                    </span>
                  </Link>
                ),
              },
              {
                title: (
                  <span className={`${styles.title_color}`}>
                    {/* 充值 */}
                    {t("assets.deposit")}
                  </span>
                ),
              },
            ]}
            style={{ fontSize: 14 }}
          />
        </div>
        {!showTopUp ? (
          <div className={`${styles.card_box}  mt-6  `}>
            <div
              className={`${styles.card_bgc2} w-full mb-10 flex-x justify-between align-center`}
            >
              <div className={`flex-x align-center ${styles.card_content}`}>
                <Image
                  src={"/images/assets/assets_account/icon_nosm_2.png"}
                  alt="logo"
                  width={80}
                  height={74}
                  className={`${styles.icon_sm} mr-6`}
                />
                <p className="flex-y">
                  <span className={` font-w-500 font-18`}>
                    {/* 充值功能暂不可用 */}
                    {t("assetsAccount.button.topuptip1")}
                  </span>
                  <span
                    className={`${styles.tip_color} font-w-400 font-14 mt-1`}
                  >
                    {/* 交易所充值功能暂不可用，如有问题请与客服联系！ */}
                    {t("assetsAccount.button.tip4")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${styles.card_box}  mt-6  `}>
            <NoUseCom type="1" />
            <NoUseCom type="2" />
            <div
              className={` w-full flex-x justify-between ${styles.card_content2}`}
            >
              <div className={`${styles.step_box}`}>
                <ConfigProvider
                  theme={{
                    components: {
                      Select: {
                        clearBg: "#ffffff",
                        selectorBg: "var(--background7)",
                        singleItemHeightLG: 50,
                        paddingXXS: 10, // 下拉框选项最小内边距
                        optionHeight: 40, //选项高度
                        optionLineHeight: 2, //选项行高
                      },
                      Steps: {
                        navArrowColor: "var(--text-color6)",
                      },
                    },
                  }}
                >
                  <Steps
                    direction="vertical"
                    current={current}
                    labelPlacement="vertical"
                    items={steps}
                    className="custom-steps"
                  />
                </ConfigProvider>
              </div>
              <div className={`${styles.notice_box}`}>
                <div>
                  <h5 className={`font-w-500 font-16 mb-4`}>常见问题</h5>
                  <ul className={`font-14 font-w-400 ${styles.tip_color}`}>
                    <li className={`mb-2_5`}>如何在IMBIT上充值和提现？</li>
                    <li className={`mb-2_5`}>充值步骤指南</li>
                    <li className={`mb-2_5`}>充值常见问题</li>
                    <li className={`mb-2_5`}>为何我的充值尚未到账</li>
                    <li className={`mb-2_5`}>如何提交充错币找回申请</li>
                  </ul>
                </div>
                <div className="">
                  <h5 className={`font-w-500 font-16 mb-4`}>充值须知</h5>
                  <ul className={`font-14 font-w-400 ${styles.tip_color}`}>
                    <li className={`mb-2_5`}>
                      1.
                      请通过客户端或在线钱包将您需要充值的相应币种数目发送到该地址
                    </li>
                    <li className={`mb-2_5`}>
                      2.
                      发送完成后，系统会自动在此交易获得相应数量，确认后将该笔数字货币充值到您在本站的账户,相应数量的确认需要大约
                      30分钟 到 1 小时间，请耐心等待。
                    </li>
                    <li className={`mb-2_5`}>
                      3. 同一个地址可多次充值，不影响到账
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className={`${styles.table_box} w-full `}>
              <RechargeTable />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["assets", "common"])),
    },
  };
};

export default TopUpPage;
