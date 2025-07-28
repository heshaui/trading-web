import React from "react";
import styles from "@/styles/components/HomeMenu.module.css";
import { TabsItemProps } from "@/type/types";
import Image from "next/image";
const TabsItem: React.FC<TabsItemProps> = ({
  src,
  h5Text,
  spanText,
  incNum,
  normalNum,
  colorSpan,
  needNumber = false,
  isFire = false,
  index,
  haveNumber = false,
  isHover = true,
  isPositive = false,
}) => {
  return (
    <div
      className={`${styles.childrenItemContainer} ${
        isHover ? styles.childrenItemContainerHover : ""
      }`}
    >
      {haveNumber ? (
        <h5 style={{ color: isFire ? "var(--theme-color)" : "#979897" }}>
          {index}
        </h5>
      ) : (
        <></>
      )}
      <div
        className={styles.childrenItemBox}
        id={isHover ? "childrenItemBox" : ""}
      >
        <div className={styles.leftItem}>
          {/* <img src={src} /> */}
          <Image src={src} alt="" width={24} height={24} />
          <span>{h5Text}</span>
          {isFire ? (
            // <img style={{ marginLeft: '4px', width: '18px', height: '18px' }} src={spanText} />
            <Image src={spanText} alt="" width={18} height={18} />
          ) : colorSpan === "blue" ? (
            <span className={styles.blueSpan}>{spanText}</span>
          ) : colorSpan === "orange" ? (
            <span className={styles.orangeSpan}>{spanText}</span>
          ) : (
            <span style={{ marginLeft: "8px" }}>{spanText}</span> // 如果colorSpan不是上述任何一个值，则使用默认样式
          )}
        </div>
        {needNumber ? (
          <div className={styles.rightItem}>
            <span>{incNum}</span>
            <span style={{ color: isPositive ? "#00C788" : "#F73711" }}>
              {normalNum}
            </span>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default TabsItem;
