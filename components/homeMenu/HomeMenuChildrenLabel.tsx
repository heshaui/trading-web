import React from 'react';
// import styles from '@/styles/components/HomeMenu.module.css';
import { HomeMenuChildrenLabelProps } from '@/type/types';
// import { Input, Tabs, Menu, ConfigProvider } from "antd";
import { Input, Tabs, ConfigProvider } from "antd";
// import { SearchOutlined } from '@ant-design/icons';
import TabsItem from './TabsItem';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
const HomeMenuChildrenLabel: React.FC<HomeMenuChildrenLabelProps> = ({
    isTabs = false,
    isSearch = false,
    tabsItemsData = [],
    tabsItems,
    needNumber,
    isMargin = false,
    onInputChange,
}) => {
    const { t } = useTranslation('common');
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

                                    <ConfigProvider
                                        theme={{
                                            components: {
                                                Input: {
                                                    activeBorderColor: 'var(--theme-color)',
                                                    hoverBorderColor: 'var(--theme-color)'
                                                },
                                            },
                                            token: {
                                                // colorTextPlaceholder: '#979897',
                                                fontSize: 12,
                                                colorBorder: '#DCDCDC'
                                            }
                                        }}
                                    >
                                        <Input
                                            style={{ marginTop: isMargin ? '16px' : '0', marginBottom: '10px' }}
                                            placeholder={t('search')}
                                            prefix={
                                                <Image
                                                    src="/images/home_menu/icon_search.png"
                                                    alt=""
                                                    width={16}
                                                    height={16}
                                                />
                                            }
                                            onChange={onInputChange}
                                        />
                                    </ConfigProvider>
                                ) : (<></>)
                            }
                            {
                                tabsItemsData.map((item, index) => (
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
                                ))
                            }
                        </div>
                    )
                    // )
                }


            </a>
        </>
    );
};

export default HomeMenuChildrenLabel;