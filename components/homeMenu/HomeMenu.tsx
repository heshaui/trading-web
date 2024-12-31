import styles from '@/styles/components/HomeMenu.module.css';
import { DownOutlined, SmileOutlined, SearchOutlined, QuestionCircleOutlined, DownloadOutlined, BellOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Space, Input } from 'antd';

export default function HomeMenu() {
    // 是否登录
    let isLogin = false;
    // let content;
    // if (isLogin) {
    //     content = <AdminPanel />;
    // } else {
    //     content = <LoginForm />;
    // }
    const items = [
        {
            key: '1',
            label: (
                <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
                    1st menu item
                </a>
            ),
        },
        {
            key: '2',
            label: (
                <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
                    2nd menu item (disabled)
                </a>
            ),
            icon: <SmileOutlined />,
            disabled: true,
        },
        {
            key: '3',
            label: (
                <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
                    3rd menu item (disabled)
                </a>
            ),
            disabled: true,
        },
        {
            key: '4',
            danger: true,
            label: 'a danger item',
        },
    ];
    const menus = [
        {
            key: '1',
            title: '买币',
        },
        {
            key: '2',
            title: '发现',
        },
        {
            key: '3',
            title: '交易',
        },
        {
            key: '4',
            title: '金融',
        },
        {
            key: '5',
            title: '公链',
        },
        {
            key: '6',
            title: '机构客户',
        },
    ]
    const listItems = menus.map(menuList =>
        // <li key={menu.key}>{menu.title}</li>
        <Dropdown
            menu={{
                items,
            }}
            trigger={['click']}
            key={menuList.key}
            className={styles.menuList}
            overlayStyle={{top: '80px'}}
        >
            <a onClick={(e) => e.preventDefault()}>
                <Space style={{ columnGap: '3px' }}>
                    {menuList.title}
                    <DownOutlined />
                </Space>
            </a>
        </Dropdown>
    );
    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <img src="/home_menu_logo.png" alt="logo" />
            </div>
            <div className={styles.menuContainer}>
                <div className={styles.menuListContainer}>
                    {listItems}
                    <a style={{ marginRight: '20px', cursor: 'pointer' }} onClick={(e) => e.preventDefault()}>新手学院</a>
                    <Dropdown
                        menu={{
                            items,
                        }}
                        trigger={['click']}
                        overlayStyle={{top: '80px'}}
                    >
                        <a style={{cursor: 'pointer'}} onClick={(e) => e.preventDefault()}>
                            <Space style={{ columnGap: '3px' }}>
                                更多
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>
                </div>
                <div className={styles.rightListContainer}>
                    <Input style={{ width: '188px', minWidth: '188px', backgroundColor: '#1C1E1C', color: '#979897', borderColor: '#979897' }} placeholder="搜索币对和其他产品" prefix={<SearchOutlined />} />

                    {/* <Input placeholder="搜索币对和其他产品" prefix={<SearchOutlined />} /> */}
                    {/* <button className={styles.login}>登录</button>
                    <button className={styles.register}>注册</button> */}
                    {
                        isLogin ? (
                            <div className={styles.loginContent}>
                                <Dropdown
                                    menu={{
                                        items,
                                    }}
                                    trigger={['click']}
                                    className={styles.dropDownList}
                                    overlayStyle={{top: '80px'}}
                                >
                                    <a onClick={(e) => e.preventDefault()}>
                                        <Space style={{ columnGap: '3px' }}>
                                            资产管理
                                            <DownOutlined />
                                        </Space>
                                    </a>
                                </Dropdown>
                                <UserOutlined style={{ marginLeft: '12px', fontSize: '16px', cursor: 'pointer' }} />
                            </div>
                        ) : (
                            <div>
                                <button className={styles.login}>登录</button>
                                <button className={styles.register}>注册</button>
                            </div>
                        )
                    }
                    <div style={{ height: '20px', border: '1px solid #676867', marginLeft: '12px' }}></div>
                    <DownloadOutlined style={{ marginLeft: '12px', cursor: 'pointer' }} />
                    <BellOutlined style={{ marginLeft: '12px', cursor: 'pointer' }} />
                    <QuestionCircleOutlined style={{ marginLeft: '12px', cursor: 'pointer' }} />
                    <GlobalOutlined style={{ marginLeft: '12px', cursor: 'pointer' }} />
                </div>
            </div>
        </div>
    );
}