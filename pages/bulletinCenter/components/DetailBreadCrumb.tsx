import { Breadcrumb } from 'antd';
import { detailBreadCrumbProps } from '@/type/bulletin_center/bc_types';

export default function detailBreadCrumb({ items }: detailBreadCrumbProps) {
    return (
        <>
            <Breadcrumb
                items={items}
                style={{ marginTop: 10 }}
            />
        </>
    );
}