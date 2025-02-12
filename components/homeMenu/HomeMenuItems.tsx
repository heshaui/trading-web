import { ConfigProvider, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import styles from '@/styles/components/HomeMenu.module.css';
// import { MenuListItem } from '@/type/types';
import { Props, MenuListItem, IconName } from '@/type/types';

const MenuItem: React.FC<Props> = ({ menuList, haveSubMenu, haveArrow, }) => {
    // 定义一个函数来根据图标名称返回不同的 overlayStyle
    const getOverlayStyle = (icon: IconName | undefined) => {
        switch (icon) {
            case 'download':
                return { top: '80px', width: '150px' };
            case 'bell':
                return { top: '80px', width: '380px' };
            case 'question':
                return { top: '80px', width: '160px' };
            case 'global':
                return { top: '80px', width: '100px' };
            default:
                return { top: '80px', minWidth: '100px', maxWidth: '380px' };
        }
    };
    return (
        <>
            <ConfigProvider
                theme={{
                    components: {
                        Menu: {
                            itemHoverColor: 'red'
                        }
                    },
                    token: {
                        colorPrimaryHover: 'green'
                    },
                }}
            >
                {haveArrow ? (
                    <Space direction="vertical">
                        <Space wrap>
                            <Dropdown
                                menu={{
                                    items: menuList.items,
                                    triggerSubMenuAction: 'click',
                                }}
                                placement="bottomLeft"
                                trigger={['click']}
                                key={menuList.key}
                                overlayStyle={getOverlayStyle(menuList.widthSet)}
                                overlayClassName={styles.buttonHover}
                            >
                                <a onClick={(e) => e.preventDefault()}>
                                    {menuList.title}
                                </a>
                            </Dropdown>
                        </Space>
                    </Space>
                ) : (
                    <Dropdown
                        menu={{
                            items: menuList.items,
                            triggerSubMenuAction: 'click',
                        }}
                        trigger={['click']}
                        key={menuList.key}
                        className={styles.menuList}
                        overlayStyle={{ top: '80px', maxWidth: '364px', minWidth: '300px' }}
                    >
                        <a onClick={(e) => e.preventDefault()}>
                            <Space style={{ columnGap: '3px' }}>
                                {menuList.title}
                                {/* <DownOutlined /> */}
                            </Space>
                        </a>
                    </Dropdown>
                )}

            </ConfigProvider>
        </>
    );
};

export default MenuItem;