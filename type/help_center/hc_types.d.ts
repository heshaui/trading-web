// 帮助中心卡片配置
export interface ConfigurationItem {
    icon: string;
    title: string;
}
// 帮助中心卡片 - 组件props
export interface ConfigurationCardProps {
    configurationList: ConfigurationItem[];
}

export interface HelpCenterItem {
    title: string;
    icon: string;
    buttonWord: string;
}

export interface HelpCenterSectionProps {
    helpCenterList: HelpCenterItem[];
    onButtonClick?: (item: HelpCenterItem) => void;
}