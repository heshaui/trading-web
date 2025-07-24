"use client";
import React from "react";
import styles from "@/styles/components/HomeMenu.module.css";
import { LabelComponentProps } from "@/type/types";
import { Input, Menu } from "antd";
import { MenuProps } from "antd";
import Link from "next/link";
import Image from "next/image";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Iconify } from "@/components/icon";

// 提取子组件以提高可读性
const OtherItem: React.FC<{ src: string; h5Text: string }> = ({ src, h5Text }) => (
  <a className={styles.menuListAOther} style={{ cursor: "default", color: "inherit" }}>
    <div className={styles.otherBox}>
      <h5 style={{ color: "var(--text-color5)" }}>{h5Text}</h5>
      <div className={styles.imgBox}>
        <Image src={src} alt="" width={100} height={100} />
      </div>
    </div>
  </a>
);

const UserContent: React.FC<{ myWords_1?: string; myWords_2?: string; myWords_3?: string }> = ({
  myWords_1,
  myWords_2,
  myWords_3,
}) => (
  <div className={styles.myWords}>
    <div className={styles.myWords_1}>
      <span>{myWords_1}</span>
    </div>
    <div className={styles.myWords_2}>
      <span>{myWords_2}</span>
      <span>{myWords_3}</span>
    </div>
  </div>
);

const UserListContent: React.FC<{ items?: MenuProps["items"] }> = ({ items }) => (
  <div className={`${styles.menuBox} customUserMenu`}>
    <Menu mode="inline" items={items} />
  </div>
);

const InputContent: React.FC<{ h5Text: string; onInputChange?: (value: string) => void }> = ({
  h5Text,
  onInputChange,
}) => (
  <div className={`${styles.inputBox} customInput`}>
    <Input
      style={{ width: 200, height: 40, borderRadius: "8px" }}
      placeholder={h5Text}
      prefix={
        <Image
          src="/images/home_menu/icon_search.png"
          alt=""
          width={16}
          height={16}
        />
      }
      onChange={(e) => onInputChange?.(e.target.value)}
    />
  </div>
);

const MenuIcon: React.FC<{ src?: string; level?: string; icon?: React.ReactNode }> = ({ src, level, icon }) => {
  // 如果有 icon，优先使用 icon
  if (icon) {
    if (level) {
      return (
        <div className={`${styles.levelAndIcon} flex align-center`}>
          <div>
            {icon}
          </div>
        </div>
      );
    }
    
    return (
      <div className={`${styles.menuListItemIcon} ${styles.menuListItemIconMargin}`}>
        {icon}
      </div>
    );
  }
  
  // 如果没有 icon 但有 src，使用原来的逻辑
  if (!src) return null;
  
  if (level) {
    return (
      <div className={`${styles.levelAndIcon} flex align-center`}>
        <div>
          <Image
            src={src}
            alt=""
            width={32}
            height={32}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${styles.menuListItemIcon} ${styles.menuListItemIconMargin}`}>
      <Image src={src} alt="" width={28} height={28} />
    </div>
  );
};

const MenuTitle: React.FC<{ h5Text: string; isMore: boolean; isNew: boolean }> = ({
  h5Text,
  isMore,
  isNew,
}) => {
  const titleStyle = {
    color: isMore ? "var(--theme-color)" : "var(--text-color5)",
  };

  if (isNew) {
    return (
      <div className={styles.newBox}>
        <h5 style={titleStyle}>{h5Text}</h5>
        <span>NEW</span>
      </div>
    );
  }

  if (isMore) {
    return (
      <Link href="/bulletinCenter">
        <h5 style={titleStyle}>{h5Text}</h5>
      </Link>
    );
  }

  return <h5 style={titleStyle}>{h5Text}</h5>;
};

const MenuSubtitle: React.FC<{ spanText?: string; nickName?: string }> = ({ spanText, nickName }) => {
  const { copyFn } = useCopyToClipboard();
  
  if (!spanText) return null;
  
  if (nickName) {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="tip-color font-14">
          {spanText}
          <Iconify
            icon="icon-park-solid:copy"
            className="ml-1 cursor-pointer hover_theme"
            size={18}
            onClick={(e) => {
              e.stopPropagation();
              copyFn(spanText.split("：")[1] || "");
            }}
          />
        </div>
      </div>
    );
  }
  
  return <div className="tip-color font-14">{spanText}</div>;
};

const MenuChildren: React.FC<{ ulItems: Array<{ liContent: string }> }> = ({ ulItems }) => (
  <div className={styles.menuListItemSItem}>
    <ul className={styles.menuListUl}>
      {ulItems.map((item, index) => (
        <li key={index}>
          <span className={styles.pointStyle}>{item.liContent}</span>
        </li>
      ))}
    </ul>
  </div>
);

const LabelComponent: React.FC<LabelComponentProps> = ({
  src = "",
  h5Text = "",
  spanText,
  isOtherItem = false,
  isMore = false,
  isUser = false,
  isUserList = false,
  items = [],
  isNew = false,
  ulItems = [],
  haveItemChildren = false,
  isInput = false,
  icon = null,
  onInputChange,
  onClick,
  nickName,
  level,
  myWords_1,
  myWords_2,
  myWords_3,
  needHover = false,
}) => {
  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  // 渲染主要内容
  const renderMainContent = () => {
    if (isUser) {
      return <UserContent myWords_1={myWords_1} myWords_2={myWords_2} myWords_3={myWords_3} />;
    }
    
    if (isUserList) {
      return <UserListContent items={items as MenuProps["items"]} />;
    }
    
    if (isInput) {
      return <InputContent h5Text={h5Text} onInputChange={onInputChange} />;
    }
    
    return (
      <div>
        <div className={styles.menuListItem}>
          <MenuIcon src={src} level={level} icon={icon} />
          <div className={styles.menuListItemContent}>
            <MenuTitle h5Text={h5Text} isMore={isMore} isNew={isNew} />
            <MenuSubtitle spanText={spanText} nickName={nickName} />
          </div>
        </div>
        {haveItemChildren && <MenuChildren ulItems={ulItems} />}
      </div>
    );
  };

  // 如果是其他项目，直接返回其他项目组件
  if (isOtherItem) {
    return <OtherItem src={src} h5Text={h5Text} />;
  }

  return (
    <a
      className={`${styles.menuListA} ${needHover ? styles.menuListAHover : ""}`}
      onClick={handleClick}
    >
      {renderMainContent()}
    </a>
  );
};

export default LabelComponent;
