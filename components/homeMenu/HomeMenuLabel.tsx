import React from 'react';
import styles from '@/styles/components/HomeMenu.module.css';
import { LabelComponentProps } from '@/utils/types';
import { Menu } from 'antd';

const LabelComponent: React.FC<LabelComponentProps> = ({
    src,
    h5Text,
    spanText,
    isOtherItem = false,
    isMore = false,
    isUser = false,
    isUserList = false,
    items = [],
    isNew = false,
    ulItems = [],
    haveItemChildren = false,
}) => {
    return (
        <>
            {
                isOtherItem ? (
                    <a
                        rel="noopener noreferrer"
                        className={styles.menuListAOther}
                        style={{ cursor: 'default' }}
                    >
                        <div className={styles.otherBox}>
                            <h5>{h5Text}</h5>
                            <div className={styles.imgBox}>
                                <img src={src} />
                            </div>
                        </div>
                    </a>
                ) : (
                    <a
                        rel="noopener noreferrer"
                        className={styles.menuListA}
                    >
                        {
                            isUser ? (
                                <button className={styles.changeAccountButton}>{h5Text}</button>
                            ) : (
                                isUserList ? (
                                    <Menu
                                        mode="inline"
                                        items={items}
                                        style={{ width: '226px', marginLeft: '-10px' }}
                                    />
                                ) : (
                                    <div>
                                        <div className={styles.menuListItem}>
                                            {
                                                src ? (<div className={styles.menuListItemIcon}>
                                                    <img src={src} alt="icon" />
                                                </div>) : (<></>)
                                            }
                                            <div className={styles.menuListItemContent}>
                                                {
                                                    isNew ? (
                                                        <div className={styles.newBox}>
                                                            <h5 style={{ color: isMore ? '#FF5F1F' : '#0C0D0C' }}>{h5Text}</h5>
                                                            <span>NEW</span>
                                                        </div>
                                                    ) : (
                                                        <h5 style={{ color: isMore ? '#FF5F1F' : '#0C0D0C' }}>{h5Text}</h5>
                                                    )
                                                }
                                                {
                                                    spanText ? (<span>{spanText}</span>) : (<></>)
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
                        }
                    </a>
                )
            }
        </>
    );
};

export default LabelComponent;