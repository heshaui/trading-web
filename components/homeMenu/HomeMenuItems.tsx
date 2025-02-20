import { ConfigProvider, Dropdown, Space, message } from 'antd';
import type { MenuProps } from 'antd';
// import { DownOutlined } from '@ant-design/icons';
import styles from '@/styles/components/HomeMenu.module.css';
// import { MenuListItem } from '@/type/types';
import { Props, MenuListItem, IconName } from '@/type/types';
import Link from 'next/link';
import { useRouter } from 'next/router';

const MenuItem: React.FC<Props> = ({ menuList, haveSubMenu, haveArrow, isCascading=false }) => {
    const hasChildren = menuList.items.some(item => {
        return item.children && item.children.length > 0;
    })
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
                return { top: '80px', width: '234px' };
            default:
                return { top: '80px', minWidth: '100px', maxWidth: '380px' };
        }
    };
    // 点击提示
    const onClick: MenuProps['onClick'] = ({ item }) => {
        // // message.info(`Click on item ${key}`);
        // const item = menuList.find(item => item.key === key);
        // if (item) {
        //     console.log('Item details:', item);
        // }
        console.log('item', (item as any).props);
    };
    // 点击跳转
    const router = useRouter();
    const onClickLink: MenuProps['onClick'] = ({ key }) => {
        if(menuList && menuList.linkHref) {
            router.push(menuList.linkHref);
        }
    };
    return (
        <>
            {haveArrow ? (
                <Space direction="vertical">
                    <Space wrap>
                        <Dropdown
                            menu={{
                                items: menuList.items,
                                triggerSubMenuAction: 'click',
                                onClick
                            }}
                            placement="bottomLeft"
                            trigger={['click']}
                            key={menuList.key}
                            overlayStyle={getOverlayStyle(menuList.widthSet)}
                            overlayClassName={styles.buttonHover}
                        >
                            <a onClick={(e) => {
                                e.preventDefault();
                                menuList.onClick?.(); // 调用点击事件
                            }}>
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
                        onClick: !hasChildren ? onClickLink : undefined
                    }}
                    trigger={['click']}
                    key={menuList.key}
                    className={styles.menuList}
                    overlayStyle={{ top: '80px', maxWidth: '364px', minWidth: '300px' }}
                    // overlayStyle={ isCascading ? { left: '100px', top: '80px', maxWidth: '364px', minWidth: '300px' }: { top: '80px', maxWidth: '364px', minWidth: '300px' } }
                >
                    <a onClick={(e) => {
                        e.preventDefault();
                        menuList.onClick?.(); // 调用点击事件
                    }}>
                        <Space style={{ columnGap: '3px' }}>
                            {menuList.title}
                            {/* <DownOutlined /> */}
                        </Space>
                    </a>
                </Dropdown>
            )}
        </>
    );
};

export default MenuItem;