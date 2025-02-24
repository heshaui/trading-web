
import React from 'react';
import '@/styles/components/home/questions.css'
import { Collapse} from "antd";
import type { CollapseProps } from 'antd';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
export default function Questions() {
const { t } = useTranslation(['home']);
    const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
    const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
        {
            key: '1',
            label: t('questionsTip1'), //'IMBIT都提供哪些产品'
            children: <p>{text}</p>,
            style: panelStyle,
            showArrow:false, //隐藏组件的箭头图标
            extra:<Image src="/images/home/icon-add.png" alt="" width={24} height={24}/>
        },
        {
            key: '2',
            label: t('questionsTip2'),//'如何通过IMBIT平台购买比特币？',
            children: <p>{text}</p>,
            style: panelStyle,
            showArrow:false ,
            extra:<Image src="/images/home/icon-add.png" alt="" width={24} height={24}/>
        },
        {
            key: '3',
            label: t('questionsTip3'),//'美国公民可以使用IMBIT吗？',
            children: <p>{text}</p>,
            style: panelStyle,
            showArrow:false ,
            extra:<Image src="/images/home/icon-add.png" alt="" width={24} height={24}/>

        },
        {
            key: '4',
            label: t('questionsTip4'),//'什么是数字货币？',
            children: <p>{text}</p>,
            style: panelStyle,
            showArrow:false ,
            extra:<Image src="/images/home/icon-add.png" alt="" width={24} height={24}/>

        },
    ];
    const panelStyle: React.CSSProperties = {
        marginBottom: 12,
        background: "var( --btnbgcolor2)",
        borderRadius: "8px",
    };

    return (
        <div className='questionsPage'>
            <div className='questions-main flex-column flex-ai-center flex-jc-center'>
                <h2 className='questions_main-title1'>{t('questionsTitle')}</h2>
                <div className='main-questions-box'>
                    <Collapse
                    className='main-questions'
                        bordered={false}
                        // defaultActiveKey={['1']}
                        // expandIcon={({ isActive }) => <span>  </span>}/
                        style={{ background: "var( --background4)",color: "var(--hometext)" }}
                        // style={{ background: token.colorBgContainer }}
                        items={getItems(panelStyle)}
                        size="large"
                    />

                    {/* <div className='main-questions-list flex flex-ai-center flex-jc-between'>
                        <h3>IMBIT都提供哪些产品</h3>
                        <Image src="/images/home/icon-add.png" alt="" width={24} height={24}/>
                    </div>
                    <div className='main-questions-list flex flex-ai-center flex-jc-between'>
                        <h3>如何通过IMBIT平台购买比特币？</h3>
                        <Image src="/images/home/icon-add.png" alt="" width={24} height={24}/>
                    </div>
                    <div className='main-questions-list flex flex-ai-center flex-jc-between'>
                        <h3>美国公民可以使用IMBIT吗？</h3>
                        <Image src="/images/home/icon-add.png" alt="" width={24} height={24}/>
                    </div>
                    <div className='main-questions-list flex flex-ai-center flex-jc-between'>
                        <h3>什么是数字货币？</h3>
                        <Image src="/images/home/icon-add.png" alt="" width={24} height={24}/>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
