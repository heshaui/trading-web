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
        type: 'group' | 'item' | 'divider'; // 使 type 可选，并允许更多类型
        children?: MenuListItem['items'];
    }>;
}
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
}
// 定义TabsItem的数据类型
export interface TabsItemData extends LabelComponentProps {
    src: string;
    h5Text: string;
    spanText: string;
    incNum?: string;
    normalNum?: string;
    colorSpan?: string;
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
    }>;
}
export interface TabsItemProps extends TabsItemData {
    colorSpan?: string;
    needNumber?: boolean;
}
export type IconName = 'download' | 'bell' | 'question' | 'global';