import List from "@/components/bulletin/List";
import { Checkbox, Input, message } from "antd";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState, useEffect, useCallback } from "react";

import {
  getBulletinMessageLogined,
  getBulletinMessageUnreadIntro,
  getInformUserMessageList,
  readBulletinMessageLogined,
} from "@/services/bulletinCenter";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { SvgIcon } from "@/components/icon";

interface MenuData {
  key: string;
  label: string;
  svg: React.ReactNode;
}

type MenuKey = MenuData["key"];
const Notice = () => {
  const { t } = useTranslation(["notice", "common"]);
  const router = useRouter();
  const { type } = router.query;

  const [menuLoading, setMenuLoading] = useState(false);
  const [activeKey, setActiveKey] = useState<MenuKey>("all");
  const [title, setTitle] = useState<string>("notice.all");
  const [isUnread, setIsUnread] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  // const [unreadCount, setUnreadCount] = useState(0);
  const [unreadInfo, setUnreadInfo] = useState<any>({
    count: 0,
    ids: [],
  });
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
      svg: (
        <SvgIcon width={24} height={24} viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21 3.42599C21 2.48899 19.995 1.86299 19.149 2.32799C18.012 2.95199 14.646 4.76999 12.631 5.57099C10.286 6.50199 8.267 6.85199 5.953 6.95999C4.35 7.03399 3 8.32899 3 9.99999V14C3 15.671 4.35 16.966 5.953 17.04C6.227 17.053 6.496 17.069 6.763 17.089L6.019 20.804C5.96702 21.0642 6.02052 21.3343 6.16774 21.5551C6.31495 21.7758 6.54382 21.929 6.804 21.981C7.06418 22.033 7.33435 21.9795 7.55508 21.8323C7.77581 21.685 7.92902 21.4562 7.981 21.196L8.754 17.328C10.017 17.543 11.269 17.888 12.631 18.429C14.646 19.23 18.011 21.049 19.149 21.672C19.995 22.137 21 21.511 21 20.574V3.42599ZM9 15.342C10.418 15.577 11.833 15.96 13.37 16.571C15.022 17.227 17.456 18.49 19 19.317V4.68299C17.456 5.50999 15.022 6.77299 13.37 7.42899C11.833 8.03899 10.418 8.42299 9 8.65899V15.342ZM7 8.89899C6.685 8.92299 6.368 8.94299 6.046 8.95799C5.443 8.98599 5 9.46199 5 9.99999V14C5 14.538 5.443 15.014 6.046 15.042C6.368 15.057 6.686 15.077 7 15.102V8.89899Z"
            fill="currentColor"
          />
        </SvgIcon>
      ),
      label: "notice.menu.notice",
    },
    {
      key: "account",
      svg: (
        <SvgIcon width={24} height={24} viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 7C6 5.67392 6.52678 4.40215 7.46447 3.46447C8.40215 2.52678 9.67392 2 11 2C12.3261 2 13.5979 2.52678 14.5355 3.46447C15.4732 4.40215 16 5.67392 16 7C16 8.32608 15.4732 9.59785 14.5355 10.5355C13.5979 11.4732 12.3261 12 11 12C9.67392 12 8.40215 11.4732 7.46447 10.5355C6.52678 9.59785 6 8.32608 6 7ZM11 4C10.606 4 10.2159 4.0776 9.85195 4.22836C9.48797 4.37913 9.15726 4.6001 8.87868 4.87868C8.6001 5.15726 8.37913 5.48797 8.22836 5.85195C8.0776 6.21593 8 6.60603 8 7C8 7.39397 8.0776 7.78407 8.22836 8.14805C8.37913 8.51203 8.6001 8.84274 8.87868 9.12132C9.15726 9.3999 9.48797 9.62087 9.85195 9.77164C10.2159 9.9224 10.606 10 11 10C11.7956 10 12.5587 9.68393 13.1213 9.12132C13.6839 8.55871 14 7.79565 14 7C14 6.20435 13.6839 5.44129 13.1213 4.87868C12.5587 4.31607 11.7956 4 11 4ZM11 13C13.396 13 15.575 13.694 17.178 14.672C17.978 15.16 18.662 15.736 19.156 16.362C19.642 16.977 20 17.713 20 18.5C20 19.345 19.589 20.011 18.997 20.486C18.437 20.936 17.698 21.234 16.913 21.442C15.335 21.859 13.229 22 11 22C8.771 22 6.665 21.86 5.087 21.442C4.302 21.234 3.563 20.936 3.003 20.486C2.41 20.01 2 19.345 2 18.5C2 17.713 2.358 16.977 2.844 16.361C3.338 15.736 4.021 15.161 4.822 14.671C6.425 13.695 8.605 13 11 13ZM11 15C8.977 15 7.157 15.59 5.864 16.379C5.217 16.773 4.729 17.201 4.414 17.601C4.09 18.011 4 18.321 4 18.5C4 18.622 4.037 18.751 4.255 18.926C4.504 19.126 4.937 19.333 5.599 19.508C6.917 19.858 8.811 20 11 20C13.19 20 15.083 19.857 16.4 19.508C17.063 19.333 17.496 19.126 17.745 18.926C17.963 18.751 18 18.622 18 18.5C18 18.32 17.91 18.011 17.587 17.601C17.271 17.201 16.783 16.773 16.136 16.379C14.843 15.589 13.023 15 11 15ZM21 13C21.2549 13.0003 21.5 13.0979 21.6854 13.2728C21.8707 13.4478 21.9822 13.687 21.9972 13.9414C22.0121 14.1958 21.9293 14.4464 21.7657 14.6418C21.6021 14.8373 21.3701 14.9629 21.117 14.993L21 15H20C19.7451 14.9997 19.5 14.9021 19.3146 14.7272C19.1293 14.5522 19.0178 14.313 19.0028 14.0586C18.9879 13.8042 19.0707 13.5536 19.2343 13.3582C19.3979 13.1627 19.6299 13.0371 19.883 13.007L20 13H21ZM18 11C18 10.7348 18.1054 10.4804 18.2929 10.2929C18.4804 10.1054 18.7348 10 19 10H21C21.2652 10 21.5196 10.1054 21.7071 10.2929C21.8946 10.4804 22 10.7348 22 11C22 11.2652 21.8946 11.5196 21.7071 11.7071C21.5196 11.8946 21.2652 12 21 12H19C18.7348 12 18.4804 11.8946 18.2929 11.7071C18.1054 11.5196 18 11.2652 18 11ZM18 7C17.7348 7 17.4804 7.10536 17.2929 7.29289C17.1054 7.48043 17 7.73478 17 8C17 8.26522 17.1054 8.51957 17.2929 8.70711C17.4804 8.89464 17.7348 9 18 9H21C21.2652 9 21.5196 8.89464 21.7071 8.70711C21.8946 8.51957 22 8.26522 22 8C22 7.73478 21.8946 7.48043 21.7071 7.29289C21.5196 7.10536 21.2652 7 21 7H18Z"
            fill="currentColor"
          />
        </SvgIcon>
      ),
      label: "notice.menu.account",
    },
    {
      key: "assets",
      svg: (
        <SvgIcon width={24} height={24} viewBox="0 0 24 24">
          <path
            d="M17 13C17 13.3978 16.842 13.7794 16.5607 14.0607C16.2794 14.342 15.8978 14.5 15.5 14.5C15.1022 14.5 14.7206 14.342 14.4393 14.0607C14.158 13.7794 14 13.3978 14 13C14 12.6022 14.158 12.2206 14.4393 11.9393C14.7206 11.658 15.1022 11.5 15.5 11.5C15.8978 11.5 16.2794 11.658 16.5607 11.9393C16.842 12.2206 17 12.6022 17 13Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.813 5.72799L15.813 2.58499C16.1851 2.47864 16.5768 2.46013 16.9573 2.53091C17.3377 2.60169 17.6966 2.75983 18.0055 2.99288C18.3145 3.22593 18.5651 3.52752 18.7377 3.8739C18.9102 4.22028 19 4.60199 19 4.98899V5.99999C19.5304 5.99999 20.0391 6.2107 20.4142 6.58577C20.7893 6.96084 21 7.46955 21 7.99999V18C21 18.5304 20.7893 19.0391 20.4142 19.4142C20.0391 19.7893 19.5304 20 19 20H5C4.46957 20 3.96086 19.7893 3.58579 19.4142C3.21071 19.0391 3 18.5304 3 18V7.99999C3 6.95499 3.835 6.00699 4.813 5.72799ZM16.363 4.50799C16.4373 4.48681 16.5156 4.48315 16.5915 4.4973C16.6675 4.51145 16.7392 4.54302 16.8009 4.58953C16.8626 4.63604 16.9127 4.69623 16.9473 4.76536C16.9818 4.8345 16.9999 4.9107 17 4.98799V5.99999H11.14L16.363 4.50799ZM5 7.99999H19V18H5V7.99999Z"
            fill="currentColor"
          />
        </SvgIcon>
      ),
      label: "notice.menu.assets",
    },
    {
      key: "transaction",
      svg: (
        <SvgIcon width={24} height={24} viewBox="0 0 24 24">
          <path
            d="M2.00003 12.08C1.99403 11.218 2.91003 10.724 3.61803 11.105L3.71303 11.163L6.39103 12.967C7.36303 13.622 6.76803 15.11 5.65703 14.974L5.54003 14.954L4.47703 14.72C5.01733 16.2149 5.99057 17.5149 7.27267 18.4545C8.55477 19.394 10.0876 19.9304 11.6758 19.9953C13.264 20.0602 14.8355 19.6507 16.19 18.8189C17.5445 17.9871 18.6206 16.7708 19.281 15.325C19.3946 15.0896 19.5957 14.908 19.8415 14.8191C20.0872 14.7302 20.358 14.741 20.5958 14.8492C20.8337 14.9574 21.0198 15.1545 21.1142 15.3981C21.2086 15.6418 21.2039 15.9128 21.101 16.153C19.114 20.523 14.205 22.946 9.41403 21.662C7.30026 21.0957 5.43051 19.8518 4.09137 18.1211C2.75223 16.3904 2.01758 14.2683 2.00003 12.08ZM12 6.00001C12.2652 6.00001 12.5196 6.10537 12.7071 6.2929C12.8947 6.48044 13 6.73479 13 7.00001V8.00001H14C14.4643 8.00001 14.9194 8.1293 15.3144 8.37338C15.7093 8.61747 16.0285 8.96671 16.2361 9.38198C16.4437 9.79724 16.5316 10.2621 16.4899 10.7245C16.4482 11.1869 16.2786 11.6286 16 12C16.2786 12.3714 16.4482 12.8131 16.4899 13.2755C16.5316 13.7379 16.4437 14.2028 16.2361 14.618C16.0285 15.0333 15.7093 15.3826 15.3144 15.6266C14.9194 15.8707 14.4643 16 14 16H13V17C13 17.2652 12.8947 17.5196 12.7071 17.7071C12.5196 17.8947 12.2652 18 12 18C11.7348 18 11.4805 17.8947 11.2929 17.7071C11.1054 17.5196 11 17.2652 11 17V16H9.10003C8.80829 16 8.5285 15.8841 8.32221 15.6778C8.11592 15.4715 8.00003 15.1917 8.00003 14.9V9.10001C8.00003 8.80827 8.11592 8.52848 8.32221 8.32219C8.5285 8.1159 8.80829 8.00001 9.10003 8.00001H11V7.00001C11 6.73479 11.1054 6.48044 11.2929 6.2929C11.4805 6.10537 11.7348 6.00001 12 6.00001ZM14 13H10V14H14C14.1326 14 14.2598 13.9473 14.3536 13.8536C14.4474 13.7598 14.5 13.6326 14.5 13.5C14.5 13.3674 14.4474 13.2402 14.3536 13.1465C14.2598 13.0527 14.1326 13 14 13ZM2.90303 7.85201C4.89003 3.48201 9.79903 1.06001 14.59 2.34301C16.7037 2.90913 18.5734 4.15279 19.9126 5.88335C21.2517 7.61392 21.9864 9.73589 22.004 11.924C22.011 12.787 21.094 13.282 20.387 12.9L20.291 12.842L17.613 11.038C16.641 10.383 17.236 8.89501 18.347 9.03101L18.464 9.05101L19.527 9.28501C18.9867 7.79016 18.0135 6.49009 16.7314 5.55056C15.4493 4.61103 13.9164 4.07461 12.3283 4.00971C10.7401 3.9448 9.16856 4.35435 7.81408 5.18613C6.45959 6.01791 5.3835 7.23423 4.72303 8.68001C4.6706 8.80247 4.59424 8.91322 4.49841 9.00576C4.40259 9.0983 4.28925 9.17076 4.16504 9.21889C4.04082 9.26702 3.90825 9.28985 3.77509 9.28603C3.64193 9.28222 3.51088 9.25184 3.38963 9.19667C3.26838 9.14151 3.15937 9.06268 3.069 8.9648C2.97864 8.86693 2.90874 8.75199 2.86341 8.62672C2.81808 8.50146 2.79823 8.36841 2.80504 8.23537C2.81184 8.10233 2.84516 7.97199 2.90303 7.85201ZM14 10H10V11H14C14.1326 11 14.2598 10.9473 14.3536 10.8536C14.4474 10.7598 14.5 10.6326 14.5 10.5C14.5 10.3674 14.4474 10.2402 14.3536 10.1465C14.2598 10.0527 14.1326 10 14 10Z"
            fill="currentColor"
          />
        </SvgIcon>
      ),
      label: "notice.menu.trading",
    },
  ];

  // 获取未读(ids,count)
  const getUnreadCount = async () => {
    try {
      setMenuLoading(true);
      // const res = await getBulletinMessageUnreadCount();
      const { code, data } = await getBulletinMessageUnreadIntro();
      if (code === "0") {
        // setUnreadCount(res.data);
        setUnreadInfo(data);
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
          onlyUnread: isUnread,
        });
        if (res.code === "0") {
          setDataSource({
            list: res.data.list,
            count: res.data.count,
          });
        } else {
          message.error(res.message);
        }
      } catch (error: any) {
        message.error(error?.message || "Failed to get notice list");
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageNo, pagination.pageSize, isUnread]
  );

  // 全部已读
  const readAll = async () => {
    try {
      const { code, message: msg } = await readBulletinMessageLogined({
        ids: unreadInfo.ids,
      });
      if (code === "0") {
        getUnreadCount();
        getNoticeList();
      } else {
        message.error(msg);
      }
    } catch (error: any) {
      // Error handling
      message.error(error?.message || "Failed to read all messages");
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
          onlyUnread: isUnread,
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
        } else {
          message.error(data.message);
        }
      } catch (error: any) {
        // Error handling
        message.error(error?.message || "Failed to get other type");
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageNo, pagination.pageSize, isUnread]
  );

  // 切换类型
  const handleChangeType = (item: MenuData) => {
    setActiveKey(item.key);
    // 切换类型时重置到第一页
    setPagination((prev) => ({ ...prev, pageNo: 1 }));
    setTitle(item.key === "all" ? "notice.all" : item.label);
    // 重置table数据
    setDataSource({
      list: [],
      count: 0,
    });
  };

  // 渲染菜单项
  const renderItem = (item: MenuData) => {
    return (
      <div
        className={`h-[60px] flex items-center p-[18px_20px]
        ${
          activeKey === item.key
            ? "bg-[var(--theme-color)] text-[#FFF]"
            : "text-[#A4A5AC]"
        } 
        cursor-pointer hover:bg-[var(--theme-05)] rounded-[8px] gap-[18px]`}
        key={item.key}
        onClick={() => handleChangeType(item)}
      >
        {item.svg}
        <div className="text-[16px] font-[500]">
          {t(item.label) +
            (item.key === "all" && unreadInfo.count > 0
              ? `  (${unreadInfo.count})`
              : "")}
        </div>
      </div>
    );
  };

  // 只看未读
  const handleUnreadChange = async (e: any) => {
    setIsUnread(e.target.checked);
  };

  // 初始化获取未读(ids,count)
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
  }, [pagination.pageNo, activeKey, isUnread, getNoticeList, getOtherType]);

  // 监听 type 变化
  useEffect(() => {
    if (type) {
      setActiveKey(String(type));
    }
  }, [type]);

  useEffect(() => {
    setIsClient(true); // 标记为客户端渲染
  }, []);

  if (!isClient) return null; // SSR 阶段不渲染

  return (
    <div className="bg-[var(--background17)]  min-h-[calc(100vh-80px)] flex flex-col">
      {/* 顶部 */}
      <div className="px-[120px] py-[15px] flex  justify-between items-center flex-wrap gap-[15px] shadow-[inset_0_-0.5px_0_0_var(--border-color4)]">
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
          <Checkbox
            className="font-[400]"
            onChange={handleUnreadChange}
            checked={isUnread}
          >
            {t("notice.top.unread")}
          </Checkbox>
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
        <div className="min-w-[264px] p-[20px] bg-[var(--background18)] text-[var(--text-color6)] rounded-[8px]">
          {menuData?.map((item) => {
            return renderItem(item);
          })}
        </div>
        <div className="flex-1  bg-[var(--background18)] rounded-[8px] p-[20px]">
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
