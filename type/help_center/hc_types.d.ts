// 帮助中心卡片配置
export interface ConfigurationItem {
    icon: string;
    title: string;
}
// 帮助中心卡片 - 组件props
export interface ConfigurationCardProps {
    configurationList: Array<{
        icon: string;
        title: string;
    }>;
}
// 帮助中心
export interface HelpCenterItem {
    title: string;
    icon: string;
    buttonWord: string;
}

// 帮助中心后端配置 - 组件props
export interface HelpCenterSectionProps {
    helpCenterList?: Array<{
        alt: string;
        title: string;
        icon: string;
        buttonWord: string;
    }>;
    onButtonClick?: (item: HelpCenterItem) => void;
}
// 帮助中心搜索 - 组件props
export interface SearchDetailProps {
    searchValue: string;
}