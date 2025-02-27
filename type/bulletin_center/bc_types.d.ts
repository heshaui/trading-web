export interface MessageData {
    title: string; // h6 标签的内容
    time: string; // timeContent 下的 span 内容
    onClick?: () => void;
    content?: string;
    isDetail?: boolean;
    isClickable?: boolean;
}
export interface ExchangeRateParams {
    id: number;
    shortName: string;
    status: number;
}
export interface MessageItemDetailProps {
    message: MessageData;
    onBack: () => void;
    currentDetailLabel: string; // 添加当前选中的菜单标签
}
export interface detailBreadCrumbProps {
    items: {
        title: string;
        onClick?: () => void;
    }[];
}