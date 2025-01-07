export interface HomeMenuProps {
    t: (key: string) => string;
}
// export interface MenuListItem {
//     key: string;
//     title: string;
//     // items: Array<{ key: React.Key; label: React.ReactNode }>;
//     items: Array<{
//         key: React.Key;
//         label: React.ReactNode;
//         type: 'group' | 'item' | 'divider'; // 使 type 可选，并允许更多类型
//         children?: MenuListItem['items'];
//     }>;
// }
// export interface Props {
//     menuList: MenuListItem;
//     haveSubMenu: boolean;
// }
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
export interface LabelComponentProps {
    src?: string;
    h5Text?: string;
    spanText?: string;
    haveChildren?: boolean;
    isOtherItem?: boolean;
    isMore?: boolean;
    isUser?: boolean;
    isUserList?: boolean;
    items?: MenuListItem['items'];
}
export type IconName = 'download' | 'bell' | 'question' | 'global';