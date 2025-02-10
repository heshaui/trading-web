import React from 'react';
import styles from '@/styles/components/HomeMenu.module.css';
import { HomeMenuChildrenLabelProps } from '@/type/types';
import { Input, Tabs, Menu } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import TabsItem from './TabsItem';

const HomeMenuChildrenLabel: React.FC<HomeMenuChildrenLabelProps> = ({
    isTabs = false,
    isSearch = false,
    tabsItemsData = [],
    tabsItems,
    needNumber,
    isMargin = false,
    onInputChange,
}) => {
    return (
        <>
            <a
                style={{ cursor: 'default' }}
            >
                {
                    isTabs ? (
                        <Tabs defaultActiveKey="1" items={tabsItems} />
                    ) : (
                        <div>
                            {
                                isSearch ? (
                                    <Input
                                        style={{ marginTop: isMargin ? '16px' : '0', marginBottom: '10px' }}
                                        placeholder="搜索"
                                        prefix={<SearchOutlined />}
                                        onChange={onInputChange}
                                    />
                                ) : (<></>)
                            }
                            {/* <Menu
                                // onClick={onClick}
                                style={{
                                    width: 256,
                                }}
                                defaultSelectedKeys={['1']}
                                defaultOpenKeys={['sub1']}
                                mode="inline"
                                items={items}
                            /> */}
                            {tabsItemsData.map((item, index) => (
                                <TabsItem
                                    key={index}
                                    src={item.src}
                                    h5Text={item.h5Text}
                                    spanText={item.spanText}
                                    incNum={item.incNum}
                                    normalNum={item.normalNum}
                                    colorSpan={item.colorSpan}
                                    needNumber={needNumber}
                                    isPositive={item.isPositive}
                                />
                            ))}
                        </div>
                    )
                    // )
                }


            </a>
        </>
    );
};

export default HomeMenuChildrenLabel;