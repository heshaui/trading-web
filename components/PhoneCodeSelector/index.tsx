import React, { useState, useEffect } from 'react';
// import { UserOutlined } from '@ant-design/icons';
import { AutoComplete, Flex, Input, Form, ConfigProvider } from 'antd';
import { Iconify } from "@/components/icon/index";
// import { areaCodeList } from "@/utils/country"; //地区代码
import { getCountryCode } from "@/services/open";

interface OptionItem {
    label: React.ReactNode;
    value: string | number;
}

interface OptionGroup {
    label: React.ReactNode;
    options: OptionItem[];
}

interface CountryCodeItem {
    areaCode: string;
    countryName: string;
    countryCode: string;
    id: number;
    status: number;
}
// const options = [
//     {
//         label: <Title title="A" />,
//         options: [renderItem('AntDesign', 10000), renderItem('AntDesign UI', 10600)],
//     },
//     {
//         label: <Title title="B" />,
//         options: [renderItem('AntDesign UI FAQ', 60100), renderItem('AntDesign FAQ', 30010)],
//     },
//     {
//         label: <Title title="C" />,
//         options: [renderItem('AntDesign design language', 100000)],
//     },
// ];


const App: React.FC<{ className?: string }> = ({ className }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [countryCodeList, setCountryCodeList] = useState<CountryCodeItem[]>([]);
    const Title: React.FC<Readonly<{ title?: string }>> = (props) => (
        <Flex align="center" justify="space-between">
            {props.title}
            {/* <a href="https://www.google.com/search?q=antd" target="_blank" rel="noopener noreferrer">
          more
        </a> */}
        </Flex>
    );

    const renderItem = (country: string, value: number | string) => ({
        value: value,
        label: (
            <Flex align="center" justify="space-between">
                {country}
                <span>
                    {value}
                </span>
            </Flex>
        ),
    });

    const getoptionsList = () => {
        const sortedAreaCodeList = [...countryCodeList].sort((a, b) => a.countryCode.localeCompare(b.countryCode));
        const groupedData: { [key: string]: OptionItem[] } = {};

        sortedAreaCodeList.forEach(item => {
            const firstLetter = item.countryCode[0].toUpperCase();
            if (!groupedData[firstLetter]) {
                groupedData[firstLetter] = [];
            }
            groupedData[firstLetter].push(renderItem(item.countryName, item.areaCode));
        });

        const options: OptionGroup[] = [];

        Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).forEach(letter => {
            if (groupedData[letter]) {
                options.push({
                    label: <Title title={letter} />,
                    options: groupedData[letter]
                });
            }
        });
        // setOptionsListBefore(options);
        return options;
    };

    const handleFocus = async () => {
        setIsFocused(true);
        if (countryCodeList.length === 0) {
            await getCountryCodeList()
        }
    };
    const handleBlur = async () => {
        setIsFocused(false);


    };

    const getCountryCodeList = async () => {
        try {
            const res = await getCountryCode()
            // console.log(res, 11);
            if (res.code === '0') {
                const data = res.data.map((item: any) => {
                    return {
                        areaCode: "+" + item.areaCode,
                        countryName: item.countryName,
                        countryCode: item.countryCode,
                        id: item.id,
                        status: item.status
                    }
                })
                setCountryCodeList(data)
            }
        } catch (error) {
            console.log(error);

        }
    };

    useEffect(() => {

        getCountryCodeList()
    }, [])
    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: {
                        controlHeightLG: 50,
                        activeBorderColor: '#FF5F1F',
                        hoverBorderColor: '#FF5F1F',
                        activeBg: 'var(--background11)',
                        hoverBg: 'var(--background11)',
                    },
                    Select: {
                        selectorBg: 'var(--background11)',
                    }
                },
                token: {
                    // colorBgContainerDisabled: '#fff',
                }
            }}
        >
            <Form.Item name="areaCode" noStyle>
                <AutoComplete
                    popupClassName="certain-category-search-dropdown"
                    popupMatchSelectWidth={380}
                    style={{ width: 150, height: "100%" ,color:"pink"}}
                    options={getoptionsList()}
                    size="large"
                    className="autoComplete-custom"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                // />
                >
                    <Input
                        size="large"
                        placeholder="input here"
                        className={`modal-input ${className}`}
                        style={{backgroundColor:"var(--background11)",color:" var(--text-color4)"}}
                        suffix={
                            <Iconify icon="mingcute:down-fill" size={14} className={`icon-color ${isFocused ? 'icon-rotate' : ''}`} />
                        }
                    />
                </AutoComplete>
            </Form.Item>
        </ConfigProvider>
    );
};

export default App;