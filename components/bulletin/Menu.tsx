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
    <div className="min-w-[264px] min-h-[593px] bg-[var(--background18)] text-[#A4A5AC] rounded-[8px] relative overflow-hidden">
      {loading && (
        <Spin
          spinning={true}
          className="h-full w-full flex items-center justify-center absolute bg-[rgba(0,0,0,0.3)]"
        />
      )}
      <div className="p-[20px]">
        {menuData?.map((item: T) => {
          return renderItem(item);
        })}
      </div>
    </div>
  );
};

export default Menu;
