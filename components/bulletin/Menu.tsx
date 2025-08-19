interface MenuProps<T> {
  loading?: boolean;
  menuData: T[];
  renderItem: (item: T) => React.ReactNode;
}

const Menu = <T,>({ menuData, renderItem }: MenuProps<T>) => {
  return (
    <div className="p-[20px]">
      {menuData?.map((item: T) => {
        return renderItem(item);
      })}
    </div>
  );
};

export default Menu;
