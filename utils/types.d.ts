// HomeMenu
export interface HomeMenuProps {
    t: (key: string) => string;
}
export type MenuListItem = {
    key: string;
    title: string | ReactNode;
    widthSet?: IconName;
    // items: Array<{ key: React.Key; label: React.ReactNode }>;
    items: Array<{
        key: React.Key;
        label: React.ReactNode;
        type: menuType; // 使 type 可选，并允许更多类型
        children?: MenuListItem['items'];
    }>;
}
export type menuType = 'group' | 'item' | 'divider';
export interface MenuItems extends MenuListItem['items'] {};
export type Props = {
    menuList: MenuListItem;
    haveSubMenu?: React.Dispatch<React.SetStateAction<boolean>>;
    haveArrow?: boolean;
}
export type LabelComponentProps = {
    src?: string;
    h5Text?: string;
    spanText?: string;
    haveItemChildren?: boolean;
    isOtherItem?: boolean;
    isMore?: boolean;
    isUser?: boolean;
    isUserList?: boolean;
    items?: MenuListItem['items'];
    isSearch?: boolean;
    isTabs?: boolean;
    tabsItems?: Array<{
        key: string;
        label: React.ReactNode;
        children?: React.ReactNode;
    }>
    isNew?: boolean;
    ulItems?: Array<{
        liContent: string;
    }>;
    isPositive?: boolean;
}
// 定义TabsItem的数据类型
export interface TabsItemData extends LabelComponentProps {
    src: string;
    h5Text: string;
    spanText: string;
    incNum?: string;
    normalNum?: string;
    colorSpan?: string;
    isPositive?: boolean;
    isFire?: boolean;
}
export interface HomeMenuChildrenLabelProps extends LabelComponentProps {
    needNumber?: boolean;
    isMargin?: boolean;
    tabsItemsData?: Array<{
        src: string;
        h5Text: string;
        spanText: string;
        incNum?: string;
        normalNum?: string;
        colorSpan?: string;
        isPositive?: boolean;
    }>;
    onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface TabsItemProps extends TabsItemData {
    needNumber?: boolean;
    isFire?: boolean;
    index?: number;
    haveNumber?: boolean;
    isHover?: boolean;
}
export type IconName = 'download' | 'bell' | 'question' | 'global';

// Footer
export type FooterListProps = {
    title: string;
    items: string[];
};