import React, { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { AutoComplete, Flex, Input, Form } from 'antd';
import { Iconify } from "@/components/icon/index";
import { areaCodeList } from "@/utils/country"; //地区代码

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

interface OptionItem {
    label: React.ReactNode;
    value: string | number;
}

interface OptionGroup {
    label: React.ReactNode;
    options: OptionItem[];
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
const getoptionsList = () => {
    const sortedAreaCodeList = [...areaCodeList].sort((a, b) => a.enName.localeCompare(b.enName));
    const groupedData: { [key: string]: OptionItem[] } = {};

    sortedAreaCodeList.forEach(item => {
        const firstLetter = item.enName[0].toUpperCase();
        if (!groupedData[firstLetter]) {
            groupedData[firstLetter] = [];
        }
        groupedData[firstLetter].push(renderItem(item.showName, item.value));
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

const App: React.FC = () => {
    const [isFocused, setIsFocused] = useState(false);
    // const [optionsListBefore, setOptionsListBefore]=useState<OptionGroup[]>([])
    // const [optionsList, setOptionsList]=useState<OptionGroup[]>([])



    const handleFocus = () => {
        setIsFocused(true);
    };
    const handleBlur = () => {
        setIsFocused(false);
    };

    return (
        <Form.Item name="areaCode" noStyle>
            <AutoComplete
                popupClassName="certain-category-search-dropdown"
                popupMatchSelectWidth={380}
                style={{ width: 150 }}
                options={getoptionsList()}
                size="large"
                className="autoComplete-input"
                onFocus={handleFocus}
                onBlur={handleBlur}
            >
                <Input
                    size="large"
                    placeholder="input here"
                    className='mail-input'
                    suffix={
                        <Iconify icon="mingcute:down-fill" size={14} className={`icon-color ${isFocused ? 'icon-rotate' : ''}`} />
                    }
                />
            </AutoComplete>
        </Form.Item>
    );
};

export default App;