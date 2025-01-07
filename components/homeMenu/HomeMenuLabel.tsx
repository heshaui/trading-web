import React from 'react';
import styles from '@/styles/components/HomeMenu.module.css';
import { LabelComponentProps } from '@/utils/types';
import { RightOutlined } from '@ant-design/icons';
import { Menu } from 'antd';

const LabelComponent: React.FC<LabelComponentProps> = ({
    src,
    h5Text,
    spanText,
    haveChildren = false,
    isOtherItem = false,
    isMore = false,
    isUser = false,
    isUserList = false,
    items = []
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
                                        style={{width: '226px', marginLeft: '-10px'}}
                                    />
                                ) : (
                                    <div className={styles.menuListItem}>
                                        {
                                            src ? (<div className={styles.menuListItemIcon}>
                                                <img src={src} alt="icon" />
                                            </div>) : (<></>)
                                        }
                                        <div className={styles.menuListItemContent}>
                                            <h5 style={{ color: isMore ? '#FF5F1F' : 'inherit' }}>{h5Text}</h5>
                                            {
                                                spanText ? (<span>{spanText}</span>) : (<></>)
                                            }
                                        </div>
                                    </div>
                                )

                            )
                        }
                        {haveChildren && <RightOutlined style={{ color: "#979897" }} />}
                    </a>
                )
            }
        </>
    );
};

export default LabelComponent;