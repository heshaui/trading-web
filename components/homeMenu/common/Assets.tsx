import styles from "@/styles/components/HomeMenu.module.css";
import { Dropdown, Space } from "antd";
import MenuItemLabel from "../HomeMenuLabel";
import { useRouter } from "next/router";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useThemeMode } from "@/hooks/useThemeMode"; // 导入 useThemeMode 获取当前主题状态
import { ROUTER_KEY_ASSETS } from "@/config/apiConfig";
import { FunctionSwitchStatusEnum } from "@/services/financial";
import appStore from "@/store";
export default function AssetsMenuItems() {
  const financialConfig = appStore.financialConfig;
  // 路由
  const router = useRouter();

  // t - 多语言
  const { t } = useTranslation("common");
  // 获取主题状态
  const { isDayMode } = useThemeMode();

  // 资产 - 2版
  const itemsFunding = [
    // 现货账户
    {
      key: "1",
      label: (
        <MenuItemLabel
          src={
            isDayMode
              ? "/images/home_menu/icon_coin_line.png"
              : "/images/home_menu/icon_coin_line_dark.png"
          }
          h5Text={t("router.spotAccount")} //'现货账户'
          spanText=""
          onClick={() => {
            router.push(ROUTER_KEY_ASSETS.SPOT_ACCOUNT);
          }}
        />
      ),
    },
    // 理财账户
    ...(financialConfig.financialSwitch === FunctionSwitchStatusEnum.OPEN
      ? [
          {
            key: "2",
            label: (
              <MenuItemLabel
                src={
                  isDayMode
                    ? "/images/home_menu/icon_coin_line.png"
                    : "/images/home_menu/icon_coin_line_dark.png"
                }
                h5Text={t("router.financialAccount")} //'理财账户'
                spanText=""
                onClick={() => {
                  router.push(ROUTER_KEY_ASSETS.FINANCIAL_ACCOUNT);
                }}
              />
            ),
          },
        ]
      : []),
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
        {/* <a onClick={(e) => e.preventDefault()} className={styles.iconCursor}>
                                                        <Space style={{ columnGap: '3px' }}>
                                                            <img src="/images/home_menu/icon_wallet_line.png" className={styles.iconCursor} />
                                                        </Space>
                                                    </a> */}
        <Space style={{ columnGap: "3px" }}>
          {/* <img onClick={(e) => e.preventDefault()} src="/images/home_menu/icon_wallet_line.png" className={styles.iconCursor} /> */}
          <Image
            onClick={(e) => e.preventDefault()}
            src="/images/home_menu/icon_wallet_line.png"
            className={styles.iconCursor}
            alt=""
            width={20} // 必须指定宽度
            height={20} // 必须指定高度
          />
        </Space>
      </Dropdown>
    </>
  );
}
