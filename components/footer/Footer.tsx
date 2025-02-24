import styles from '@/styles/components/Footer.module.css';
import { Button, Dropdown, Space } from 'antd';
import { DownOutlined, GlobalOutlined, DownloadOutlined } from '@ant-design/icons';
import { FooterListProps } from "@/type/types";
import Image from 'next/image';

export default function Footer() {
    const itemsLan = [
        {
            label: '简体中文',
            key: '1',
        },
        {
            label: 'English',
            key: '2',
        },
    ];
    const itemsDownLoad = [
        {
            label: (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <h5>扫码下载APP</h5>
                    {/* <img src="/images/home_menu/QR_code.png" /> */}
                    <Image
                        src="/images/home_menu/QR_code.png"
                        alt=""
                        width={100}  // 必须指定宽度
                        height={100} // 必须指定高度
                    />
                </div>
            ),
            key: '1',
        },
    ];
    const menuProps1 = {
        items: itemsLan,
    };
    const menuProps2 = {
        items: itemsDownLoad,
    };

    const aboutIMBIT = [
        "关于我们",
        "加入我们",
        "客服邮箱",
        "商务合作",
        "上币申请",
        "投诉举报"
    ];

    const products = [
        "现货交易",
        "快速兑换",
        "C2C",
        "M积分",
        "质押算力",
        "存币生息"
    ];

    const helpCenter = [
        "新手指南",
        "常见问题",
        "交易指南",
        "币种资料",
        "平台公告"
    ];

    const legalAndRisk = [
        "免责条款",
        "隐私条款",
        "用户协议",
        "资费说明",
        "反洗钱政策",
        "风险提示"
    ];

    function renderFooterList({ title, items }: FooterListProps) {
        return (
            <div className={styles.footerList}>
                <h5>{title}</h5>
                <ul>
                    {items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        );
    }
    return (
        <div className={styles.footerContainer}>
            <div className={styles.logoAndButton}>
                <div className={styles.logo}>
                    {/* <img src="/home_menu_logo.png" /> */}
                    <Image
                        src="/home_menu_logo.png"
                        alt=""
                        width={126}  // 必须指定宽度
                        height={30} // 必须指定高度
                    />
                </div>
                <p>©2023 - 2024 IMBIT.</p>
                <Dropdown
                    menu={menuProps1}
                    trigger={['click']}
                >
                    <Button>
                        <Space>
                            <Image
                                src="/images/footer/icon_earth_line.png"
                                alt=''
                                width={20}
                                height={20}
                            />
                            简体中文
                            <Image
                                src="/images/footer/icon_down_line.png"
                                alt=''
                                width={20}
                                height={20}
                            />
                        </Space>
                    </Button>
                </Dropdown>
                <div style={{ marginTop: '20px' }}></div>
                <Dropdown
                    menu={menuProps2}
                    trigger={['click']}
                >
                    <Button>
                        <Space>
                            <Image
                                src="/images/footer/icon_download_line.png"
                                alt=''
                                width={20}
                                height={20}
                            />
                            下载 APP
                        </Space>
                    </Button>
                </Dropdown>
            </div>
            <div className={styles.footer}>
                {renderFooterList({ title: "关于IMBIT", items: aboutIMBIT })}
                {renderFooterList({ title: "产品", items: products })}
                {renderFooterList({ title: "帮助中心", items: helpCenter })}
                {renderFooterList({ title: "法律与风险披露", items: legalAndRisk })}
            </div>
        </div>
    )
}