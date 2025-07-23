import styles from "@/styles/components/HomeMenu.module.css";
import { Dropdown, Space } from "antd";
import MenuItemLabel from "../HomeMenuLabel";
import { useRouter } from "next/router";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useThemeMode } from "@/hooks/useThemeMode"; // 导入 useThemeMode 获取当前主题状态
import { ROUTER_KEY_SPOT } from "@/config/apiConfig";
import appStore from "@/store";
import { FunctionSwitchStatusEnum } from "@/services/financial";

export default function SpotMenuItems() {
  // 路由
  const router = useRouter();
  const configData = appStore.flashConfig;
  const financialConfig = appStore.financialConfig;

  // t - 多语言
  const { t } = useTranslation(["common"]);
  // 获取主题状态
  const { isDayMode } = useThemeMode();

  // 资产 - 2版
  const itemsFunding = [
    // 现货订单
    {
      key: "1",
      label: (
        <MenuItemLabel
          src={
            isDayMode
              ? "/images/home_menu/icon_bill_line.png"
              : "/images/home_menu/icon_bill_line_dark.png"
          }
          h5Text={t("router.spotOrder")} //'现货订单'
          spanText=""
          onClick={() => {
            router.push(ROUTER_KEY_SPOT.SPOT_ORDER);
          }}
        />
      ),
    },
    // 闪兑订单
    ...(configData.flashConvertSwitch
      ? [
          {
            key: "2",
            label: (
              <MenuItemLabel
                src={
                  isDayMode
                    ? "/images/home_menu/icon_flash_line.png"
                    : "/images/home_menu/icon_flash_line_dark.png"
                }
                h5Text={t("flash.order.title")}
                // h5Text={t('router.flashOrder')}  //'闪兑订单'
                spanText=""
                onClick={() => {
                  router.push("/flashOrder");
                }}
              />
            ),
          },
        ]
      : []),
    // 理财订单
    ...(financialConfig.financialSwitch === FunctionSwitchStatusEnum.OPEN
      ? [
          {
            key: "3",
            label: (
              <MenuItemLabel
                src={
                  isDayMode
                    ? "/images/home_menu/icon_bill_line.png"
                    : "/images/home_menu/icon_bill_line_dark.png"
                }
                h5Text={t("router.financialOrder")} //'账单明细'
                spanText=""
                onClick={() => {
                  // router.push(ROUTER_KEY_SPOT.BILL);
                }}
              />
            ),
          },
        ]
      : []),
    // 账单明细
    {
      key: "4",
      label: (
        <MenuItemLabel
          src={
            isDayMode
              ? "/images/home_menu/icon_bill_line.png"
              : "/images/home_menu/icon_bill_line_dark.png"
          }
          h5Text={t("router.bill")} //'账单明细'
          spanText=""
          onClick={() => {
            // router.push(ROUTER_KEY_SPOT.BILL);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <Dropdown
        arrow
        menu={{
          // items,
          items: itemsFunding,
        }}
        trigger={["click"]}
        className={styles.dropDownList}
        overlayStyle={{ top: "80px", minWidth: "180px" }}
      >
        <Space style={{ columnGap: "3px" }}>
          <Image
            onClick={(e) => e.preventDefault()}
            alt=""
            width={20} // 必须指定宽度
            height={20} // 必须指定高度
            src="/images/home_menu/icon_upload_line.png"
            className={styles.iconCursor}
          />
        </Space>
      </Dropdown>
    </>
  );
}
