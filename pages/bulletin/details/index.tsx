import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Menu from "@/components/bulletin/Menu";
import DetailsComponent from "@/components/bulletin/Details";
import { useEffect, useState } from "react";
import {
  getBulletinDetailLogined,
  getBulletinMessageLogined,
  getInformClassMenuList,
} from "@/services/bulletinCenter";
import { useTranslation } from "next-i18next";
import { SvgIcon } from "@/components/icon";
import List from "@/components/bulletin/List";
import { Breadcrumb } from "antd";

interface MenuData {
  id: number; // 公告类型id
  languageCode: string; // 语言代码
  languageContent: string; // 语言内容
  serialNum: number; // 排序号
}
type MenuId = MenuData["id"];

export interface DetailsData {
  announcementId: number;
  content: string;
  createTime: number;
  id: number;
  isAdd: boolean;
  languageCode: string;
  tenantId: string;
  title: string;
  updateTime: number;
}

enum SelectType {
  Details = "Details",
  List = "List",
}
const Details = () => {
  const { t } = useTranslation(["builetinCenter", "common"]);
  const router = useRouter();
  const { id, classMenu } = router.query;


  const [menuLoading, setMenuLoading] = useState(false); // 菜单loading
  const [detailsLoading, setDetailsLoading] = useState(false); // 详情loading
  const [listLoading, setListLoading] = useState(false); // 列表loading

  const [activeKey, setActiveKey] = useState<MenuId>(Number(classMenu)); // 当前选中的菜单id
  const [menuData, setMenuData] = useState<MenuData[]>([]); // 菜单数据
  const [curSelectType, setCurSelectType] = useState<SelectType>(
    SelectType.Details
  ); // 当前选中的类型

  // 公告列表数据
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 5,
  });
  const [dataSource, setDataSource] = useState({
    list: [],
    count: 0,
  });
  // 公告详情数据
  const [detailsData, setDetailsData] = useState<DetailsData>(); // 公告详情数据

  const BreadcrumbItems = [
    { title: "Home" },
    { title: "Application Center" },
    { title: "Application List" },
    { title: "An Application" },
  ];

  // 获取公告类型 (左侧-用于渲染menu)
  const getNoticeType = async () => {
    try {
      setMenuLoading(true);
      const lang = localStorage.getItem("lang") || "en_US";
      const res = await getInformClassMenuList({ languageCode: lang });
      if (res.code === "0") {
        setMenuData(res.data);

      }
    } catch (error) {
      // Error handling
    } finally {
      setMenuLoading(false);
    }
  };

  // 获取公告列表 (右侧-用于渲染list)
  const getNoticeList = async (key?: number) => {
    try {
      setListLoading(true);
      const lang = localStorage.getItem("lang") || "en_US";
      const res = await getBulletinMessageLogined({
        languageCode: lang,
        classMenu: key,
        pageNo: pagination.pageNo,
        pageSize: pagination.pageSize,
      });
      if (res.code === "0") {
        setDataSource({
          list: res.data.list,
          count: res.data.count,
        });

      }
    } catch (error) {
      // Error handling
    } finally {
      setListLoading(false);
    }
  };

  //获取公告详情 (右侧-用于渲染details)
  const getNoticeDetails = async ({
    id,
  }: {
    id: number;
  }) => {
    try {
      const lang = localStorage.getItem("lang") || "en_US";
      setDetailsLoading(true);
      const { data, code } = await getBulletinDetailLogined({
        id,
        languageCode: lang,
      });
      if (code === "0") {

        setDetailsData(data);
        setDetailsLoading(false);
      }
    } catch (error) {
      // Error handling
    } finally {
      setDetailsLoading(false);
    }
  };

  // 点击菜单
  const handleMenuClick = (item: MenuData) => {
    setActiveKey(item.id);
    setCurSelectType(SelectType.List);
    getNoticeList(item.id);
  };

  // 点击list
  const handleListClick = (item: any) => {
    setCurSelectType(SelectType.Details);

    getNoticeDetails({ id: item.id });
  };

  // 渲染菜单项
  const renderItem = (item: MenuData) => {
    return (
      <div
        className={`h-[60px] flex items-center p-[18px_20px]
            ${activeKey === item.id ? "bg-[var(--theme-color)]" : ""} 
            cursor-pointer hover:bg-[var(--theme-05)] rounded-[8px] gap-[18px]`}
        key={item.id}
        onClick={() => handleMenuClick(item)}
      >
        <div
          className={`text-[16px] font-[500] 
              ${activeKey === item.id
              ? "text-[#FFF]"
              : "text-[var(--text-color5)]"
            }`}
        >
          {item.languageContent}
        </div>
      </div>
    );
  };

  useEffect(() => {
    getNoticeType();
  }, []);

  useEffect(() => {
    getNoticeDetails({ id: Number(id) });
  }, [id]);

  return (
    <div className="bg-[var(--background14)]">
      <div className="h-[80px] p-[0px_120px] flex  justify-between items-center shadow-[inset_0_-0.5px_0_0_#DCDCDC]">
        <SvgIcon
          className="w-[24px] h-[24px] text-[var(--text-color5)] cursor-pointer"
          onClick={() => router.back()}
          style={{ color: "var(--text-color5)" }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.36918 13.3007C7.13279 13.0643 7 12.7436 7 12.4093C7 12.0749 7.13279 11.7543 7.36918 11.5178L14.5021 4.38485C14.6185 4.26442 14.7576 4.16836 14.9114 4.10228C15.0653 4.03619 15.2307 4.00141 15.3981 3.99996C15.5656 3.9985 15.7316 4.0304 15.8866 4.0938C16.0415 4.1572 16.1823 4.25083 16.3007 4.36922C16.4191 4.48761 16.5127 4.62839 16.5761 4.78335C16.6395 4.93831 16.6714 5.10435 16.67 5.27177C16.6685 5.4392 16.6337 5.60465 16.5676 5.75849C16.5015 5.91232 16.4055 6.05146 16.2851 6.16777L10.0436 12.4093L16.2851 18.6508C16.5147 18.8886 16.6418 19.2071 16.639 19.5377C16.6361 19.8683 16.5035 20.1845 16.2697 20.4183C16.0359 20.6521 15.7197 20.7847 15.3891 20.7876C15.0585 20.7905 14.7399 20.6634 14.5021 20.4337L7.36918 13.3007Z"
            fill="currentColor"
          />
        </SvgIcon>
      </div>
      <div className="flex justify-center items-center gap-[20px] p-[20px_120px]">
        {/* 左侧菜单 */}
        <Menu
          menuData={menuData}
          renderItem={renderItem}
          loading={menuLoading}
        />
        <div className="flex-1  bg-[#FFF] rounded-[8px] p-[20px] min-h-[593px]">
          {/* 标题 */}
          <div className="text-[20px] font-[500] text-[#333] mb-[10px]">
            <div className="mb-[10px]">公告中心</div>
            {/* 面包屑 */}
            <Breadcrumb items={BreadcrumbItems} className="mb-[10px]" />
          </div>
          {/* 点击左侧类型,获取公告列表, 点击list中的item,获取公告详情 */}
          {curSelectType === SelectType.Details ? (
            <DetailsComponent loading={detailsLoading} detailsData={detailsData} />
          ) : (
            <List
              pagination={pagination}
              dataSource={dataSource}
              handleClick={handleListClick}
              loading={listLoading}
              setPagination={setPagination}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", [
        "builetinCenter",
        "notice",
        "common",
      ])),
    },
  };
};
