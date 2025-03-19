// import { Button, Form, Input,Tabs } from "antd";
import { Layout } from 'antd';
// import { type CSSProperties, useState, useRef } from "react";
// import { toast } from "sonner";
// import store from "@/store";
import styles from "../styles/safeCenter.module.css"
import { Iconify } from "@/components/icon/index";
import { Table, ConfigProvider, Empty } from "antd";
// import Link from 'next/link'
import { useRouter } from 'next/router';
import { useState, useEffect } from "react";
import type { ColumnsType } from "antd/es/table";
import { getUserDeviceNoList, delectUserDeviceNo } from "@/services/safeCenter";
import { toast } from "sonner";
import dayjs from 'dayjs';
import DelectModal from "@/components/safeCenterModal/delect_Modal";
import { getFingerprint } from "@/hooks/user-fingerprint";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface DataLogsType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: string,
    tokenTime: string,
    createTime: number,
    updateTime: number,
    tenantId: string,
    fingerprinting: string,
}
interface DataType {
    id: number,
    userId: number,
    platformType: number,
    deviceNo: string,
    ip: string,
    address: string,
    token: string,
    tokenTime: string,
    createTime: number,
    updateTime: number,
    tenantId: string,
    fingerprinting: string,
    userLoginLogs: DataLogsType[]
}
function Equipment() {
    const router = useRouter();
    const [current, setCurrent] = useState(0);
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [deviceNoData, setDeviceNoData] = useState<DataType[]>([]);
    // 修改类型为 DataLogsType[]
    const [childDeviceNoData, setChildDeviceNoData] = useState<DataLogsType[]>([]);
    const [deviceNo, setDeviceNo] = useState<string>('');
    const [fingerprint, setFingerprint] = useState<string>('');
    const [open, setOpen] = useState(false);
    const { userId, deviceId } = router.query;

    // 获取浏览器指纹
    const getFingerprintData = async () => {
        const fp = await getFingerprint();
        setFingerprint(fp);
    };
    const columns: ColumnsType<DataType> = [
        {
            title: "设备管理",
            dataIndex: "deviceNo",
            key: "deviceNo",
            width: 158,
            render: (text, record) => {
                return (<div className='flex-row align-start '>
                    <span>{`${text} (${record.platformType || '--'})`}
                    </span>
                    <Iconify icon={expandedRowKeys.includes(record.id) ? "icon-park-solid:up-one"
                        : "icon-park-solid:down-one"}
                        style={{ color: "#FF5F1F" }}
                        className='ml-2'
                        size={20}
                    />
                    {fingerprint === record.fingerprinting && <p className={`${styles.tip_box} flex-x-cc font-14 font-w-500 ml-2`}>当前设备</p>}
                </div>)
            },
        },
        {
            title: "登录时间",
            dataIndex: "createTime",
            key: "createTime",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>,
        },
        {
            title: "IP地址",
            dataIndex: "ip",
            key: "ip",
            align: "center",
            width: 158,
        },
        {
            title: "登录所在地",
            key: "address",
            dataIndex: "address",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "操作",
            key: "operation",
            dataIndex: "operation",
            width: 150,
            align: "center",
            render: (_status, record) => {
                return <button className={`${styles.error_icon}`} onClick={(e) => { e.stopPropagation(); delectDeviceNo(record.id) }}>删除</button>;
            },
        },
    ];
    const columns2: ColumnsType<DataLogsType> = [
        {
            title: "设备管理",
            dataIndex: "deviceNo11",
            key: "deviceNo11",
            width: 150,
            render: (text, record) => <div></div>,
        },
        {
            title: "登录时间",
            dataIndex: "createTime",
            key: "createTime",
            align: "center",
            width: 128,
            render: (_text) => <span>{_text ? dayjs(_text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>,
        },
        {
            title: "IP地址",
            dataIndex: "ip",
            key: "ip",
            align: "center",
            width: 158,
        },
        {
            title: "登录所在地",
            key: "address",
            dataIndex: "address",
            width: 128,
            align: "center",
            render: (_status) => {
                return <span >{_status || '--'}</span>;
            },
        },
        {
            title: "操作",
            key: "operation",
            dataIndex: "operation",
            width: 150,
            align: "center",
            render: (_status) => {
                return <span ></span>;
            },
        },
    ];
    const delectDeviceNo = async (id: number | string) => {
        setDeviceNo(id.toString())
        setOpen(true)
    }
    const handleOk = async () => {
        try {
            const res = await delectUserDeviceNo({
                id: deviceNo || ''
            });
            if (res.code === '0') {
                toast.success(res.message)
                await getDeviceNoData()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        }
    }
    const getDeviceNoData = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const isuserId = userId ? userId?.toString() : ''
        const res = await getUserDeviceNoList({
            userId: userInfo?.userId || isuserId || ''
        });
        if (res.code === '0') {
            setDeviceNoData(res.data.list)
        }
    }

    // 处理展开/折叠行的函数
    const handleExpand = (expanded: boolean, record: DataType) => {
        if (expanded) {
            // 如果是展开操作，更新URL参数
            router.push({
                pathname: router.pathname,
                query: { ...router.query, deviceId: record.id }
            }, undefined, { shallow: true });
            
            // 设置展开的行
            setExpandedRowKeys([record.id]);
            
            // 直接设置子数据，确保数据正确传递
            if (record.userLoginLogs && record.userLoginLogs.length > 0) {
                setChildDeviceNoData(record.userLoginLogs);
            } else {
                setChildDeviceNoData([]);
            }
        } else {
            // 如果是折叠操作，移除URL参数
            const { deviceId, ...restQuery } = router.query;
            router.push({
                pathname: router.pathname,
                query: restQuery
            }, undefined, { shallow: true });
            
            // 清空展开行
            setExpandedRowKeys([]);
            setChildDeviceNoData([]);
        }
    };
    
    // 当路由参数变化时更新展开状态
    useEffect(() => {
        if (deviceId && deviceNoData.length > 0) {
            // 如果URL中有deviceId参数，则展开对应的行
            const deviceIdKey = Number(deviceId);
            setExpandedRowKeys([deviceIdKey]);
            
            // 查找对应的设备数据并设置子数据
            const targetDevice = deviceNoData.find(item => item.id === deviceIdKey);
            if (targetDevice && targetDevice.userLoginLogs) {
                setChildDeviceNoData(targetDevice.userLoginLogs);
            } else {
                // 如果没有找到数据，清空子数据
                setChildDeviceNoData([]);
            }
        } else {
            // 否则不展开任何行
            setExpandedRowKeys([]);
            setChildDeviceNoData([]);
        }
    }, [deviceId, deviceNoData]);
    
    useEffect(() => {
        getFingerprintData()
        getDeviceNoData()
    }, [])

    return (
        <div className={` page-h w-full page-box flex-y align-center`} >
            <div className={`${styles.identity_auth_box}`} >
                <h2 className={`flex-row justify-between font-18 font-w-500`} >安全设备
                </h2>
                <p className={`${styles.tip_color} font-14 font-w-400 mt-1`}>这些设备已被授权允许登录您的账户</p>
                <div className={`${styles.table_box} mt-3`}>
                    <ConfigProvider
                        theme={{
                            components: {
                                Table: {
                                    headerBg: "var(--background)",
                                    headerColor: "var(--text-color6)",
                                    headerSplitColor: "transparent",
                                    rowExpandedBg: "var(--background10)",
                                    borderColor: "transparent",
                                },
                            },
                        }}
                    >
                        <Table
                            columns={columns}
                            dataSource={deviceNoData}
                            size="large"
                            scroll={{ x: "max-content" }}
                            className={`${styles.table_box} table-box`}
                            expandable={{
                                expandedRowRender: (record) => {
                                    // 使用当前展开行的ID来确定是否显示子数据
                                    const isCurrentExpanded = expandedRowKeys.includes(record.id);
                                    
                                    return (
                                        <div style={{ margin: '16px' }} key={record.id}>
                                            {isCurrentExpanded && record.userLoginLogs && record.userLoginLogs.length > 0 ? (
                                                <Table
                                                    columns={columns2}
                                                    dataSource={record.userLoginLogs}
                                                    size="large"
                                                    scroll={{ x: "max-content" }}
                                                    showHeader={false}
                                                    pagination={false}
                                                    className='table-box2'
                                                    style={{ paddingLeft: 0 }}
                                                    rowKey="id"
                                                />
                                            ) : (
                                                <Empty 
                                                description={<span className={styles.tip_color}>暂无数据</span>}
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                 />
                                            )}
                                        </div>
                                    );
                                },
                                fixed: 'right',
                                expandRowByClick: true,
                                showExpandColumn: false,
                                onExpand: handleExpand,
                                expandedRowKeys: expandedRowKeys
                            }}
                            pagination={false}
                            rowKey="id"
                        />
                    </ConfigProvider>
                </div>
                <DelectModal open={open} onCancel={() => setOpen(false)} onOk={handleOk} />
            </div>
        </div>
    );
}

export default Equipment;