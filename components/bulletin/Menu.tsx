import { useTranslation } from "next-i18next";
import { Spin } from "antd";

interface MenuProps<T> {
  loading?: boolean;
  menuData: T[];
  renderItem: (item: T) => React.ReactNode;
}

const Menu = <T,>({ loading, menuData, renderItem }: MenuProps<T>) => {
  const { t } = useTranslation(["builetinCenter", "common"]);

  return (
    <Spin spinning={loading}>
      <div className="min-w-[264px] min-h-[593px] bg-[#FFF] text-[#A4A5AC] rounded-[8px] p-[20px]">
        {menuData?.map((item: T) => {
          return renderItem(item);
        })}
      </div>
    </Spin>
  );
};

export default Menu;
