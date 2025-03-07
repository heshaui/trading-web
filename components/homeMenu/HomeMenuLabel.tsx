import React from 'react';
import styles from '@/styles/components/HomeMenu.module.css';
import { LabelComponentProps } from '@/type/types';
import { ConfigProvider, Input, Menu } from 'antd';
import { MenuProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';

const LabelComponent: React.FC<LabelComponentProps> = ({
    src="",
    h5Text = '',
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
    // isLanguage = false,
    onInputChange,
    onClickLogout, // 添加 onClick 属性
    nickName,
    level,
    myWords_1,
    myWords_2,
    myWords_3,
    needHover = false,
}) => {
    return (
        <>
            {
                isOtherItem ? (
                    <a
                        className={styles.menuListAOther}
                        style={{ cursor: 'default', color: 'inherit' }}
                    >
                        <div className={styles.otherBox}>
                            <h5>{h5Text}</h5>
                            <div className={styles.imgBox}>
                                {/* <img src={src} /> */}
                                <Image
                                    src={src}
                                    alt=""
                                    width={100}
                                    height={100}
                                />
                            </div>
                        </div>
                    </a>
                ) : (
                    <a
                        className={`${styles.menuListA} ${needHover ? styles.menuListAHover : ''}`}
                        onClick={(e) => {
                            e.preventDefault(); // 阻止默认行为，即点击关闭下拉菜单
                            // onClickLogout && onClickLogout();
                            onClickLogout?.();
                        }}
                    >
                        {
                            isUser ? (
                                // <button className={styles.changeAccountButton}>{h5Text}</button>
                                <div className={styles.myWords}>
                                    <div className={styles.myWords_1}>
                                        <span>{myWords_1}</span>
                                    </div>
                                    <div className={styles.myWords_2}>
                                        <span>{myWords_2}</span>
                                        <span>{myWords_3}</span>
                                    </div>
                                </div>
                            ) : (
                                isUserList ? (
                                    <Menu
                                        mode="inline"
                                        items={items as MenuProps['items']}
                                        style={{ width: '226px', marginLeft: '-10px' }}
                                    />
                                ) : (
                                    isInput ? (
                                        <>
                                            <ConfigProvider
                                                theme={{
                                                    components: {
                                                        Input: {
                                                            activeBorderColor: '#FF5F1F',
                                                            hoverBorderColor: '#FF5F1F'
                                                        },
                                                    },
                                                }}
                                            >
                                                <Input
                                                    style={{ width: 200 }}
                                                    placeholder={h5Text}
                                                    prefix={
                                                        <Image
                                                            src="/images/home_menu/icon_search.png"
                                                            alt=""
                                                            width={16}
                                                            height={16}
                                                        />
                                                    }
                                                    onChange={(e) => {
                                                        if (onInputChange) {
                                                            onInputChange(e.target.value);
                                                        }
                                                    }}
                                                />
                                            </ConfigProvider>
                                        </>
                                    ) : (
                                        <div>
                                            <div className={styles.menuListItem}>
                                                {
                                                    level ? (
                                                        <div className={styles.levelAndIcon}>
                                                            <div className={styles.menuListItemIcon}>
                                                                {/* <img src={src} alt="icon" /> */}
                                                                <Image
                                                                    src={src}
                                                                    alt=""
                                                                    width={28}
                                                                    height={28}
                                                                />
                                                            </div>
                                                            <div className={styles.menuListItemlevel} style={{}}>
                                                                <span style={{ color: '#FFFFFF' }}>{level}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        src ? (
                                                            <div className={`${styles.menuListItemIcon} ${styles.menuListItemIconMargin}`}>
                                                                {/* <img src={src} alt="icon" /> */}
                                                                <Image
                                                                    src={src}
                                                                    alt=""
                                                                    width={28}
                                                                    height={28}
                                                                />
                                                            </div>
                                                        ) : (null)
                                                    )
                                                }
                                                {/* {
                                                    src ? (<div className={styles.menuListItemIcon}>
                                                        <img src={src} alt="icon" />
                                                    </div>) : (null)
                                                } */}
                                                <div className={styles.menuListItemContent}>
                                                    {
                                                        isNew ? (
                                                            <div className={styles.newBox}>
                                                                <h5 style={{ color: isMore ? '#FF5F1F' : '#0C0D0C' }}>{h5Text}</h5>
                                                                <span>NEW</span>
                                                            </div>
                                                        ) : (
                                                            isMore ?
                                                                <Link href='/bulletinCenter'><h5 style={{ color: isMore ? '#FF5F1F' : '#0C0D0C' }}>{h5Text}</h5></Link>
                                                                : <h5 style={{ color: isMore ? '#FF5F1F' : '#0C0D0C' }}>{h5Text}</h5>
                                                        )
                                                    }
                                                    {
                                                        nickName ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span>{nickName}</span>
                                                                <span>{spanText}</span>
                                                            </div>
                                                        ) : (
                                                            spanText ? (<span>{spanText}</span>) : (<></>)
                                                        )
                                                    }

                                                </div>
                                            </div>
                                            {
                                                haveItemChildren ? (
                                                    <div className={styles.menuListItemSItem}>
                                                        <ul className={styles.menuListUl}>
                                                            {ulItems.map((item, index) => (
                                                                <li key={index}>
                                                                    <span className={styles.pointStyle}></span>
                                                                    {item.liContent}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (<></>)
                                            }
                                        </div>
                                    )
                                )
                            )
                        }
                    </a>
                )
            }
        </>
    );
};

export default LabelComponent;