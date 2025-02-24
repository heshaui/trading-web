// import { AudioOutlined } from '@ant-design/icons';
import { Input, Col, Row, Checkbox } from 'antd';
import type { GetProps } from 'antd';

import styles from './styles/bulletinCenter.module.css'

type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

export default function BulletinCenter() {
    return (
        <div className={styles.bulletinContainer}>
            <Row align='middle' justify='space-between'>
                <Col>
                    <Row gutter={16} align='middle'>
                        <Col><h5>通知</h5></Col>
                        <Col><Search placeholder="input search text" allowClear style={{ width: 200 }} /></Col>
                    </Row>
                </Col>
                <Col>
                    <Checkbox>
                        <span>只看未读</span>
                    </Checkbox>
                    <span>全部已读</span>
                </Col>
            </Row>
        </div>
    );
}