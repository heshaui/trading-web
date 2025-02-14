import React from 'react';
import styles from '@/styles/components/HomeMenu.module.css';
import { LabelComponentProps } from '@/type/types';
import { Col, ConfigProvider, Input, Menu, Row } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

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
    isInput = false,
    isLanguage = false,
    onInputChange,
}) => {
    return (
        <>
            {
                isOtherItem ? (
                    <a
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
                                                    prefix={<SearchOutlined />}
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
                            )
                        }
                    </a>
                )
            }
        </>
    );
};

export default LabelComponent;