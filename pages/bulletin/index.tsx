import Menu from "@/components/bulletin/Menu";
import List from "@/components/bulletin/List";
import { Checkbox, Input, message } from "antd";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

import {
  getBulletinMessageLogined,
  getBulletinMessageUnreadCount,
  getInformUserMessageList,
  readBulletinMessageLogined,
} from "@/services/bulletinCenter";
import router, { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { SearchOutlined } from "@ant-design/icons";
import { SvgIcon } from "@/components/icon";

interface MenuData {
  key: string;
  defaultIcon: string;
  hoverIcon: string;
  label: string;
}

type MenuKey = MenuData["key"];
const Notice = () => {
  const { t } = useTranslation(["notice", "common"]);
  const router = useRouter();
  const { type } = router.query;

  const [menuLoading, setMenuLoading] = useState(false);
  const [activeKey, setActiveKey] = useState<MenuKey>("all");
  const [title, setTitle] = useState<string>("notice.all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  //分页 pageNo, pageSize
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 5,
  });

  const [dataSource, setDataSource] = useState({
    list: [],
    count: 0,
  });

  const menuData: MenuData[] = [
    {
      key: "all",
      defaultIcon: "/images/bulletin_center/icon_horn.png",
      hoverIcon: "/images/bulletin_center/icon_horn_hover.png",
      label: "notice.menu.notice",
    },
    {
      key: "account",
      defaultIcon: "/images/bulletin_center/icon_contacts.png",
      hoverIcon: "/images/bulletin_center/icon_contacts_hover.png",
      label: "notice.menu.account",
    },
    {
      key: "assets",
      defaultIcon: "/images/bulletin_center/icon_assets.png",
      hoverIcon: "/images/bulletin_center/icon_assets_hover.png",
      label: "notice.menu.assets",
    },
    {
      key: "trading",
      defaultIcon: "/images/bulletin_center/icon_Trading.png",
      hoverIcon: "/images/bulletin_center/icon_Trading_hover.png",
      label: "notice.menu.trading",
    },
  ];
  // 获取未读数量
  const getUnreadCount = async () => {
    try {
      setMenuLoading(true);
      const res = await getBulletinMessageUnreadCount();
      if (res.code === "0") {
        setUnreadCount(res.data);
      }
    } catch (error) {
      // Error handling
    } finally {
      setMenuLoading(false);
    }
  };
  // 获取公告列表
  const getNoticeList = useCallback(
    async (key?: number) => {
      try {
        setLoading(true);
        const lang = localStorage.getItem("lang") || "en_US";
        const res = await getBulletinMessageLogined({
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize,
          languageCode: lang,
          classMenu: key,
        });
        if (res.code === "0") {
          setDataSource({
            list: res.data.list,
            count: res.data.count,
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageNo, pagination.pageSize]
  );
  // 批量已读
  const readAll = async () => {
    try {
      const res = await readBulletinMessageLogined();
      if (res.code === "0") {
        getNoticeList();
      } else {
        message.error(res.message);
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  // 点击跳转详情页面
  const handleListClick = (item: any) => {
    if (activeKey === "all") {
      router.push(
        `/bulletin/details?id=${item.id}&classMenu=${item.classMenu}`
      );
    }
  };

  // 其他类型 账户,资产,交易
  const getOtherType = useCallback(
    async (key: string) => {
      try {
        setLoading(true);
        const lang = localStorage.getItem("lang") || "en_US";
        const { code, data } = await getInformUserMessageList({
          bizType: key,
          languageCode: lang,
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize,
        });
        if (code === "0") {
          const list = data.list.map((item: any) => ({
            key: item.id,
            title: item.titleTemplate,
            content: item.contentTemplate,
          }));
          setDataSource({
            list,
            count: data.count,
          });
        }
      } catch (error) {
        // Error handling
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageNo, pagination.pageSize]
  );

  // 切换类型
  const handleChangeType = (item: MenuData) => {
    setActiveKey(item.key);
    // 切换类型时重置到第一页
    setPagination((prev) => ({ ...prev, pageNo: 1 }));
    setTitle(item.key === "all" ? "notice.all" : item.label);
  };
  // 渲染菜单项
  const renderItem = (item: MenuData) => {
    return (
      <div
        className={`h-[60px] flex items-center p-[18px_20px]
        ${activeKey === item.key ? "bg-[var(--theme-color)]" : ""} 
        cursor-pointer hover:bg-[var(--theme-05)] rounded-[8px] gap-[18px]`}
        key={item.key}
        onClick={() => handleChangeType(item)}
      >
        <Image
          src={activeKey === item.key ? item.hoverIcon : item.defaultIcon}
          alt={item.label}
          width={24}
          height={24}
        />
        <div
          className={`text-[16px] font-[500] 
        ${activeKey === item.key ? "text-[#FFF]" : "text-[#A4A5AC]"}
        `}
        >
          {t(item.label) +
            (item.key === "all" && unreadCount > 0 ? `  (${unreadCount})` : "")}
        </div>
      </div>
    );
  };

  // 初始化获取未读数量
  useEffect(() => {
    getUnreadCount();
  }, []);

  // 监听 pageNo 和 activeKey 变化重新请求
  useEffect(() => {
    if (activeKey === "all") {
      getNoticeList();
    } else {
      getOtherType(activeKey);
    }
  }, [pagination.pageNo, activeKey, getNoticeList, getOtherType]);

  useEffect(() => {
    if (type) {
      setActiveKey(String(type));
    }
  }, [type]);
  return (
    <div className="bg-[var(--background17)]  min-h-[calc(100vh-80px)] flex flex-col">
      {/* 顶部 */}
      <div className="h-[80px] p-[0px_120px] flex  justify-between items-center shadow-[inset_0_-0.5px_0_0_var(--border-color4)]">
        <div className="flex gap-[30px] items-center">
          <div className="text-[16px] font-[500] text-[var(--text-color5)] text-nowrap">
            {t("notice.top.notification")}
          </div>
          <Input
            suffix={
              <SvgIcon className="w-[24px] h-[24px] text-[var(--text-color5)] cursor-pointer">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.5 2C9.1446 2.00012 7.80887 2.32436 6.60427 2.94569C5.39966 3.56702 4.3611 4.46742 3.57525 5.57175C2.78939 6.67609 2.27902 7.95235 2.08672 9.29404C1.89442 10.6357 2.02576 12.004 2.46979 13.2846C2.91382 14.5652 3.65766 15.7211 4.63925 16.6557C5.62084 17.5904 6.81171 18.2768 8.11252 18.6576C9.41333 19.0384 10.7864 19.1026 12.117 18.8449C13.4477 18.5872 14.6975 18.015 15.762 17.176L19.414 20.828C19.6026 21.0102 19.8552 21.111 20.1174 21.1087C20.3796 21.1064 20.6304 21.0012 20.8158 20.8158C21.0012 20.6304 21.1064 20.3796 21.1087 20.1174C21.111 19.8552 21.0102 19.6026 20.828 19.414L17.176 15.762C18.164 14.5086 18.7792 13.0024 18.9511 11.4157C19.123 9.82905 18.8448 8.22602 18.1482 6.79009C17.4517 5.35417 16.3649 4.14336 15.0123 3.29623C13.6597 2.44911 12.096 1.99989 10.5 2ZM4.00001 10.5C4.00001 8.77609 4.68483 7.12279 5.90382 5.90381C7.1228 4.68482 8.7761 4 10.5 4C12.2239 4 13.8772 4.68482 15.0962 5.90381C16.3152 7.12279 17 8.77609 17 10.5C17 12.2239 16.3152 13.8772 15.0962 15.0962C13.8772 16.3152 12.2239 17 10.5 17C8.7761 17 7.1228 16.3152 5.90382 15.0962C4.68483 13.8772 4.00001 12.2239 4.00001 10.5Z"
                  fill="currentColor"
                />
              </SvgIcon>
            }
            style={{ width: "300px", height: "50px" }}
            placeholder={t("notice.top.search.placeholder")}
          />
        </div>
        <div className="flex gap-[20px] items-center text-[14px]">
          <Checkbox className="font-[400]">{t("notice.top.unread")}</Checkbox>
          <div
            className="cursor-pointer text-[var(--theme-color)] font-[500] "
            onClick={readAll}
          >
            {t("notice.top.markAllRead")}
          </div>
        </div>
      </div>
      {/* 底部 */}
      <div className="flex justify-center gap-[20px] p-[20px_120px] flex-1">
        <div className="min-w-[264px] min-h-[593px] bg-[var(--background18)] text-[var(--text-color6)] rounded-[8px] relative overflow-hidde border border-[var(--border-color4)]">
          <Menu
            menuData={menuData}
            renderItem={renderItem}
            loading={menuLoading}
          />
        </div>
        <div className="flex-1  bg-[var(--background18)] rounded-[8px] p-[20px] [filter:drop-shadow(0px_1px_1px_var(--border-color4))] border border-[var(--border-color4)]">
          <div className="text-[20px] font-[500] text-[var(--text-color5)]">
            {t(title)}
          </div>
          <List
            pagination={pagination}
            dataSource={dataSource}
            handleClick={handleListClick}
            loading={loading}
            setPagination={setPagination}
          />
        </div>
      </div>
    </div>
  );
};

export default Notice;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["notice", "common"])),
    },
  };
};
