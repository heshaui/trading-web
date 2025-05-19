import { FormattedLanguage } from "@/type/types";

export interface FooterSetting {
  statu: string;
}

export interface FooterItem {
  bottomName: string;
  accessPath?: string;
  show?: number;
  children?: FooterItem[];
}

export interface FooterProps {
  bottomName: string;
  accessPath?: string;
  show?: number;
  children?: FooterItem[];
}

export interface CustomFooterResponse {
  code: string;
  message: string;
  reqNo: string;
  data: FooterItem[];
}

export interface SocialMediaItem {
  id: number;
  nameText: string;
  imgUrl: string;
  linkUrl: string;
  status: number;
  createTime: number;
  updateTime: number;
  tenantId: string;
}

export interface FooterListProps {
  title: string;
  items: FooterItem[];
}

export interface LanguageDropdownProps {
  languageList: FormattedLanguage[];
  selectedLang: string;
  onLanguageChange: (key: string) => void;
}

export interface DownloadButtonProps {
  onDownloadClick: () => void;
}
