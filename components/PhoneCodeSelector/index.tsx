import React, { useState, useEffect, useMemo } from 'react';
import { AutoComplete, Flex, Input, Form, ConfigProvider, Select } from 'antd';
import { Iconify } from "@/components/icon/index";
import { getCountryCode } from "@/services/open";
import { useTranslation } from 'next-i18next';


interface OptionItem {
    label: React.ReactNode;
    value: string | number;
    countryName?: string;
    areaCode?: string;
}

interface CountryCodeItem {
    areaCode: string;
    countryName: string;
    countryCode: string;
    id: number;
    status: number;
}

const PhoneCodeSelect: React.FC<{ className?: string }> = ({ className }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [countryCodeList, setCountryCodeList] = useState<CountryCodeItem[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const { t } = useTranslation(['common']);
    // 按字母分组的选项
    const groupedOptions = useMemo(() => {
        if (!countryCodeList.length) return [];

        // 按国家代码首字母排序
        const sortedList = [...countryCodeList].sort((a, b) => 
            a.countryCode.localeCompare(b.countryCode)
        );

        // 按首字母分组
        const groups: { [key: string]: CountryCodeItem[] } = {};
        
        sortedList.forEach(item => {
            const firstLetter = item.countryCode[0].toUpperCase();
            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }
            groups[firstLetter].push(item);
        });

        // 转换为Select需要的格式
        const result: any[] = [];
        
        // 按字母顺序添加分组
        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i);
            if (groups[letter] && groups[letter].length > 0) {
                // 添加字母标题
                result.push({
                    type: 'group',
                    label: <div className="letter-title">{letter}</div>,
                    key: `group-${letter}`
                });
                
                // 添加该字母下的国家
                groups[letter].forEach(item => {
                    result.push({
                        label: `${item.countryName} ${item.areaCode}`,
                        value: item.areaCode,
                        countryName: item.countryName,
                        areaCode: item.areaCode,
                        countryCode: item.countryCode
                    });
                });
            }
        }
        
        return result;
    }, [countryCodeList]);

    // 过滤选项
    const filteredOptions = useMemo(() => {
        if (!searchValue) return groupedOptions;
        
        const filtered: any[] = [];
        let currentGroup: any = null;
        
        groupedOptions.forEach(option => {
            if (option.type === 'group') {
                currentGroup = option;
                // 暂时不添加组标题，等确认有匹配项再添加
            } else if (
                option.countryName?.toLowerCase().includes(searchValue.toLowerCase()) ||
                option.areaCode?.includes(searchValue)
            ) {
                // 如果还没添加当前组的标题，先添加
                if (currentGroup && !filtered.some(item => item.key === currentGroup.key)) {
                    filtered.push(currentGroup);
                }
                filtered.push(option);
            }
        });
        
        return filtered;
    }, [groupedOptions, searchValue]);

    const handleFocus = () => {
        setIsFocused(true);
        if (countryCodeList.length === 0) {
            getCountryCodeList();
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const getCountryCodeList = async () => {
        try {
            const res = await getCountryCode();
            if (res.code === '0') {
                const data = res.data.map((item: any) => {
                    return {
                        areaCode: "+" + item.areaCode,
                        countryName: item.countryName,
                        countryCode: item.countryCode,
                        id: item.id,
                        status: item.status
                    };
                });
                setCountryCodeList(data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getCountryCodeList();
    }, []);

    const handleSearch = (value: string) => {
        setSearchValue(value);
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: {
                        controlHeightLG: 50,
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        activeBg: 'transparent',
                        hoverBg: 'transparent',
                    },
                    Select: {
                        activeBorderColor: "var(--border-color4)",
                        optionActiveBg: "transparent",
                        selectorBg: "transparent", //选框背景色
                        optionHeight: 40,
                    }
                },
                token: {
                    // colorBgContainerDisabled: '#fff',
                }
            }}
        >
            <Form.Item name="areaCode" noStyle>
                <Select
                    allowClear
                    placeholder="请选择区号"
                    className={`custom-select `}
                    style={{height:"50px",maxWidth:"115px"}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    options={filteredOptions}
                    optionLabelProp="value"
                    dropdownStyle={{ width: '280px' }}  // 设置下拉框宽度
                    optionRender={(option) => {
                        // 如果是分组标题
                        if (option.data.type === 'group') {
                            return (
                                <div className="group-title font-w-500 py-1 sticky top-0 bg-background11 z-10 default_icon">
                                    {option.data.label}
                                </div>
                            );
                        }
                        
                        // 如果是常规选项
                        return (
                            <div className="flex justify-between items-center py-1">
                                <span>{`${option.data.countryName}(${option.data.countryCode})`}</span>
                                <span className="text-text-color7">{option.data.areaCode}</span>
                            </div>
                        );
                    }}
                    dropdownRender={(menu) => (
                        <>
                            <div className="font-14 font-w-400 mb-2_5 px-2 mt-2_5">
                                <Input 
                                    placeholder={t('search')}
                                    value={searchValue}

                                    onChange={(e) => handleSearch(e.target.value)}
                                    prefix={<Iconify icon="eva:search-fill" size={16} />}
                                />
                            </div>
                            <div className="custom-select-dropdown">
                                {menu}
                            </div>
                        </>
                    )}
                    listHeight={320}
                    virtual={true}
                />
            </Form.Item>
        </ConfigProvider>
    );
};
// 添加此导出函数以支持服务端翻译加载
// export const getStaticProps: GetStaticProps = async ({ locale }) => {
// 	return {
// 		props: {
// 			...(await serverSideTranslations(locale || 'en', ['common'])),
// 		},
// 	};
// };
export default PhoneCodeSelect;