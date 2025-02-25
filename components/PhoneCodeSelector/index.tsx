"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { AutoComplete, Flex, Input, Form } from 'antd';
import { Iconify } from "@/components/icon/index";
import { areaCodeList } from "@/utils/country"; // 地区代码
import { getCountryCode } from "@/services/open";

interface OptionItem {
    label: React.ReactNode;
    value: string | number;
}

interface OptionGroup {
    label: React.ReactNode;
    options: OptionItem[];
}

const PhoneCode: React.FC = () => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [countryCode, setCountryCode] = useState<any[]>([]);

    useEffect(() => {
        setIsFocused(false);
    }, []);

    const Title: React.FC<{ title?: string }> = ({ title }) => (
        <Flex align="center" justify="space-between">
            {title}
        </Flex>
    );

    const renderItem = (country: string, value: number | string) => ({
        value: value,
        label: (
            <Flex align="center" justify="space-between">
                {country}
                <span>{value}</span>
            </Flex>
        ),
    });

    const options = useMemo(() => {
        const sortedAreaCodeList = [...areaCodeList].sort((a, b) =>
            a.enName.localeCompare(b.enName)
        );
        const groupedData: { [key: string]: OptionItem[] } = {};

        sortedAreaCodeList.forEach(item => {
            const firstLetter = item.enName[0].toUpperCase();
            if (!groupedData[firstLetter]) {
                groupedData[firstLetter] = [];
            }
            groupedData[firstLetter].push(renderItem(item.showName, item.value));
        });

        return Object.keys(groupedData).map(letter => ({
            label: <Title title={letter} />,
            options: groupedData[letter],
        }));
    }, [areaCodeList]);

    const handleFocus = async () => {
        setIsFocused(true);
        if (countryCode.length === 0) {
            await getCountryCodeList();
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const getCountryCodeList = async () => {
        try {
            const res = await getCountryCode();
            if (res.code === '0') {
                setCountryCode(res.data);
            }
        } catch (error) {
            console.error("获取国家代码失败", error);
        }
    };

    return (
        <Form.Item name="areaCode" noStyle>
            <AutoComplete
                popupClassName="certain-category-search-dropdown"
                popupMatchSelectWidth={380}
                style={{ width: 150, height: "100%" }}
                options={options} // ✅ 现在 `options` 只计算一次，提高性能
                size="large"
                className="autoComplete-custom"
                onFocus={handleFocus}
                onBlur={handleBlur}
            >
                <Input
                    size="large"
                    placeholder="输入区号"
                    className="custom-input"
                    suffix={
                        <Iconify
                            icon="mingcute:down-fill"
                            size={14}
                            className={`icon-color ${isFocused ? 'icon-rotate' : ''}`}
                        />
                    }
                />
            </AutoComplete>
        </Form.Item>
    );
};

export default PhoneCode;