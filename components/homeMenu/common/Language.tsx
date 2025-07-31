import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { Col, Dropdown, Popover,ConfigProvider } from "antd";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@/context/NavigationContext";
import { useAuth } from "@/context/AuthContext";
import MenuItemLabel from "../HomeMenuLabel";
import { NoData } from "@/components/noData";
import appStore from "@/store";
import styles from "@/styles/components/HomeMenu.module.css";
import { getNextJsLocale } from "@/utils/filterLang";
import { useLangChange } from "@/hooks/useLangChange";


const LanguageMenu = observer(() => {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const { languageList = [], rateData = [] } = useNavigation() || {};
  const { handleLanguageChange } = useLangChange();
  // 直接从 MobX store 读取，observer 会自动处理响应性
  const { rateKey, lang: langKey } = appStore;
  // 使用全局状态中的语言列表
  const mergedLanguageList = useMemo(
    () => (languageList.length > 0 ? languageList : appStore.languageList),
    [languageList]
  );

  // 处理语言切换
  const languageChange = useCallback(
    async (langCode: string) => {
      handleLanguageChange(langCode);
    },
    [handleLanguageChange]
  );


  // 搜索相关状态
  const [searchLanguageValue, setSearchLanguageValue] = useState<string>("");
  const [searchRateValue, setSearchRateValue] = useState<string>("");
  // 过滤和渲染函数
  const rateSpan = useCallback((item: any) => {
    if (!item) return null;
    return (
      <span
        key={item.key}
        style={{
          fontWeight: rateKey === item.key ? "500" : "400",
          cursor: "pointer",
          width: "100%",
        }}
        className="flex-x align-center h-[44px] hover:bg-[var(--background6)] hover:text-[var(--text-color5)] rounded px-2"
        onClick={() => appStore.setRateKey(item.key as string)}
      >
        {item.span}
      </span>
    );
  }, [rateKey]);
  const filteredRateItems = useMemo(() => {
    if (!Array.isArray(rateData)) return [];
    if (!searchRateValue) {
      return rateData;
    }
    return rateData.filter(
      (item: any) => item?.span?.toString().toLowerCase().includes(searchRateValue.toLowerCase())
    );
  }, [rateData, searchRateValue]);

  const languageSpan = useCallback((item: any) => {
    if (!item) return null;
    return (
      <span
        key={item.key}
        style={{
          fontWeight: langKey === item.key ? "500" : "400",
          cursor: "pointer",
          width: "100%",
        }}
        className="flex-x align-center h-[44px] hover:bg-[var(--background6)] hover:text-[var(--text-color5)] rounded px-2"
        onClick={() => languageChange(item.key as string)}
      >
        {item.span}
      </span>
    );
  }, [languageChange, langKey]);

  const filteredLanguageItems = useMemo(() => {
    if (!Array.isArray(mergedLanguageList)) return [];
    if (!searchLanguageValue) {
      return mergedLanguageList;
    }
    return mergedLanguageList.filter(
      (item: any) => item?.span?.toString().toLowerCase().includes(searchLanguageValue.toLowerCase())
    );
  }, [mergedLanguageList, searchLanguageValue]);

  return <ConfigProvider
  theme={{
    token: {
      paddingSM: 0,
      paddingXS: 0,
    },
  }}
>
  <Popover
    className={`${styles.menuList}`}

    trigger={['click']}
    placement="bottomLeft"
    align={{
      offset: [0, 36], // [水平偏移, 垂直偏移]
    }}
    overlayClassName="headerMenu-Popover"
    overlayStyle={{ 
      minWidth: "300px",
    }}
    content={
      <div className="flex-x">
        <div className="flex-1 border-r border-solid border-[var(--border-color7)] pr-3 py-3">
          <h6 style={{ color: "var(--text-color5)", marginBottom: "8px" }} className="ml-3">
            {t("header.language")}
          </h6>
          <MenuItemLabel
            isInput
            onInputChange={setSearchLanguageValue}
            h5Text={t("header.searchLanguage")}
          />
          <div style={{ maxHeight: "300px", overflowY: "auto" }} className="ml-3">
            {filteredLanguageItems.length > 0 ? (
              filteredLanguageItems.map((item: any, index: number) => 
                languageSpan(item) || <div key={`empty-lang-${index}`} />
              )
            ) : (
              <NoData title={t("header.noLanguageData")} />
            )}
          </div>
        </div>
        <div className="flex-1 py-3 pl-2">
          <h6 style={{ color: "var(--text-color5)", marginBottom: "8px" }} className="ml-3">
            {t("header.rate")}
          </h6>
          <MenuItemLabel
            isInput
            onInputChange={setSearchRateValue}
            h5Text={t("header.searchRate")}
          />
          <div style={{ maxHeight: "300px", overflowY: "auto" }} className="ml-3">
            {filteredRateItems.length > 0 ? (
              filteredRateItems.map((item: any, index: number) => 
                rateSpan(item) || <div key={`empty-rate-${index}`} />
              )
            ) : (
              <NoData title={t("header.noRateData")} />
            )}
          </div>
        </div>
      </div>
    }
  >
    <Col className="mb-1">
      <Image
        src="/images/home_menu/icon_earth_line.png"
        alt="Language"
        width={20}
        height={20}
      />
    </Col>
  </Popover>
  </ConfigProvider>
});

export default LanguageMenu;
