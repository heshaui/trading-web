import { Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import styles from "@/styles/components/HomeMenu.module.css";
import { Props, IconName } from "@/type/types";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import Link from "next/link";

const MenuItem = React.memo(({ menuList, haveArrow }: Props) => {
  const router = useRouter();

  // 检查是否有子菜单
  const hasChildren = menuList.items?.some((item) => {
    return item.children && item.children.length > 0;
  });

  // 获取下拉菜单的样式
  const getOverlayStyle = (icon: IconName | undefined) => {
    switch (icon) {
      case "download":
        return { top: "80px", width: "150px" };
      case "bell":
        return { top: "80px", width: "380px" };
      case "question":
        return { top: "80px", width: "160px" };
      case "global":
        return { top: "80px", width: "234px" };
      default:
        return { top: "80px", minWidth: "100px", maxWidth: "380px" };
    }
  };

  // 处理菜单项点击
  const handleMenuClick: MenuProps["onClick"] = useCallback(
    ({ key, keyPath, domEvent }: any) => {
      domEvent?.stopPropagation();
      console.log("key", key);
      console.log("keyPath", keyPath);
      console.log("domEvent", domEvent);
      console.log("menuList", menuList);
      // 查找点击的菜单项
      const findItem = (items: any[], targetKey: string): any => {
        for (const item of items || []) {
          if (item.key === targetKey) {
            return item;
          }
          if (item.children) {
            const found = findItem(item.children, targetKey);
            if (found) return found;
          }
        }
        return null;
      };

      const clickedItem = findItem(menuList.items || [], key);
      console.log("clickedItem", clickedItem);
      if (clickedItem) {
        // 如果有链接，则进行跳转
        if (
          clickedItem.path ||
          clickedItem.linkHref ||
          clickedItem.accessPath
        ) {
          router.push(
            clickedItem.path || clickedItem.linkHref || clickedItem.accessPath
          );
        }
        // 如果有点击处理函数，则执行
        else if (clickedItem.onClick) {
          clickedItem.onClick();
        } else if (menuList.onClick) {
          menuList.onClick();
        }
      }
    },
    [menuList, router]
  );

  // 处理主菜单项点击
  const handleMainMenuClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (menuList.onClick) {
        menuList.onClick();
      } else if (menuList.linkHref) {
        router.push(menuList.linkHref);
      }
    },
    [menuList, router]
  );

  // 处理菜单项渲染，确保每个菜单项都有正确的点击处理
  const processMenuItems = (items: any[] = []) => {
    return items.map((item) => {
      const newItem = { ...item };

      // 如果子项有子菜单，递归处理
      if (newItem.children) {
        newItem.children = processMenuItems(newItem.children);
      }

      if (newItem.type === "group") {
        newItem.className = styles.groupItem;
      }
      // 如果没有设置点击事件，但有路径、链接或访问路径，则添加点击事件
      if (
        !newItem.onClick &&
        (newItem.path || newItem.linkHref || newItem.accessPath)
      ) {
        newItem.onClick = () => {
          if (newItem.path || newItem.linkHref || newItem.accessPath) {
            router.push(newItem.path || newItem.linkHref || newItem.accessPath);
          }
        };
      }

      return newItem;
    });
  };

  const processedItems = processMenuItems(menuList.items);

  return (
    <>
      {/* haveArrow 为 true 时，显示下拉菜单 */}
      {haveArrow ? (
        <Space direction="vertical">
          <Space wrap>
            <Dropdown
              menu={{
                items: processedItems as MenuProps["items"],
                triggerSubMenuAction: "click",
                onClick: handleMenuClick,
              }}
              placement="bottomLeft"
              key={menuList.key}
              overlayStyle={getOverlayStyle(menuList.widthSet)}
              overlayClassName={styles.buttonHover}
            >
              <a onClick={handleMainMenuClick}>
                <span style={{ color: "#000" }}>{menuList.title}</span>
              </a>
            </Dropdown>
          </Space>
        </Space>
      ) : (
        <Dropdown
          menu={{
            items: processedItems as MenuProps["items"],
            triggerSubMenuAction: "click",
            onClick: handleMenuClick,
          }}
          key={menuList.key}
          className={styles.menuList}
          overlayStyle={{ top: "80px", maxWidth: "364px", minWidth: "300px" }}
        >
          <a onClick={handleMainMenuClick}>
            <Space style={{ columnGap: "3px" }}>
              <span style={{ color: "#FFF" }}>{menuList.title}</span>
            </Space>
          </a>
        </Dropdown>
      )}
    </>
  );
});

// 设置组件名称
MenuItem.displayName = "MenuItem";

export default MenuItem;
