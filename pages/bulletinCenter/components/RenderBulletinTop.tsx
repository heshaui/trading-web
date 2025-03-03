import { Checkbox, Col, Input, Row } from 'antd';
import Image from 'next/image';

import styles from '../styles/bulletinCenter.module.css';
import { RenderBulletinTopProps } from '@/type/bulletin_center/bc_types';

const { Search } = Input;

export default function RenderBulletinTop({ showDetail, onBack, onReadAll, onUnreadChange }: RenderBulletinTopProps) {
    if (!showDetail) {
        // 在公告中心主页面时
        return (
            <div className={styles.bulletinTop}>
                <Row align='middle' justify='space-between'>
                    <Col>
                        <Row gutter={16} align='middle'>
                            <Col><h5>通知</h5></Col>
                            <Col><Search placeholder="搜索" allowClear style={{ width: 200 }} /></Col>
                        </Row>
                    </Col>
                    <Col>
                        <Checkbox onChange={(e) => onUnreadChange?.(e.target.checked)}>
                            {/* <span style={{ color: '#FFFFFF' }}>只看未读</span> */}
                            {/* 只看未读 */}
                            <span className={styles.themeText}>只看未读</span>
                        </Checkbox>
                        <span style={{ color: '#FF5F1F', cursor: 'pointer' }} onClick={onReadAll}>全部已读</span>
                    </Col>
                </Row>
            </div>
        );
    } else {
        // 在详情页（包括最新动态、新币上线等）时
        return (
            <div className={styles.bulletinTop}>
                <Image 
                    src="/images/bulletin_center/icon_arrow_left_white.png"
                    alt=""
                    width={24}
                    height={24}
                    style={{ cursor: 'pointer' }}
                    onClick={onBack}  // 添加点击事件
                />
            </div>
        );
    }
}