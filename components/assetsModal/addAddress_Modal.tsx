import { Modal, ConfigProvider, Form, Input, Button, Select } from "antd";
import type { ModalProps } from "antd/es/modal/interface";
import styles from "./styles/address.module.css";
import { Iconify } from "@/components/icon/index";
import { useState } from "react";

import { toast } from "sonner";
import { encryptData, encryptEmail, encryptPhoneNumber } from "@/utils/encrypt";
import { NoData } from '@/components/noData';
import Image from 'next/image'
import { saveUserAddress, getCoinAll, getcoinExtList } from "@/services/assets";

type Props = {
    open: boolean;
    // onOk?: (event: boolean) => void;
    onOk: () => void;
    onCancel: () => void;
};
interface coinSelectType {
    coinId: string,
    coinName: string,
    iconUrl: string,
    nameDefault: string,
    value: string,
    label: string,
}
interface coinExtSelectType {
    coinId: number,
    coinName: string,
    protocolId: number,
    decimals: number,
    withdrawFee: number,
    minWithdrawFee: number,
    withdraw: number,
    minWithdraw: number,
    maxWithdraw: number,
    minRecharge: number,
    confirms: number,
    value: string,
    label: string,
}

function AddAddressModal({ open, onCancel, onOk, }: Props) {
    // const router = useRouter();
    const [loading, setLoading] = useState(false); // 按钮loading
    const [errOpen, setErrOpen] = useState(false)
    const [coinSelect, setCoinSelect] = useState<coinSelectType[]>([])
    const [coinLoading, setCoinLoading] = useState(false)
    const [coinId, setCoinId] = useState(0)
    const [coinExtLoading, setCoinExtLoading] = useState(false)
    const [coinExtSelect, setCoinExtSelect] = useState<coinExtSelectType[]>([])
    const [form] = Form.useForm();

    const handCancel = () => {
        form.resetFields();
        onCancel()
        // setCoinSelect([])
    };

    const handOk = async () => {
        form.validateFields()
            .then(async (values) => {
                // console.log(values);
                if(loading) return
                const params = {
                    protocolId: values.protocolId  ,
                    addressName: values.address,
                    addressTitle: values.addressName||'用户地址',
                    coinId: values.tenantId,
                }
                setLoading(true)
                try {
                    const res = await saveUserAddress(params)
                    if(res.code==='0'){
                        toast.success('新增成功')
                        onOk()
                        handCancel()
                    }else{
                        toast.error(res.message)
                    }
                } catch (error) {
                    toast.error(String(error))
                } finally {
                    setLoading(false)
                }
            })
        setErrOpen(true)

    };
    const getCoinAllList = async () => {
        if (coinSelect.length > 0||coinLoading) return
        await getCoinAllData()
    }
    // 币种
    const getCoinAllData = async () => {
        setCoinLoading(true)
        try {
            const res = await getCoinAll()
            if (res.code === '0') {
                const coinList = res.data.map((item: any) => ({
                    label: item.coinName,
                    value: item.coinId,
                    coinId: item.coinId,
                    coinName: item.coinName,
                    iconUrl: item.iconUrl,
                    nameDefault: item.nameDefault,
                }))
                setCoinSelect(coinList)
            } else {
                toast.error(res.message)
            }

        } catch (error) {
            toast.error(String(error))
        } finally {
            setCoinLoading(false)
        }
    }
    const getCoinExtList = async () => {
        const tenantId = form.getFieldValue('tenantId')
        if (!tenantId) return toast.error('请先选择币种')
        // 判断同币种不重复请求
        if (coinId === tenantId||coinExtLoading) return
        setCoinId(tenantId)
        await getCoinExt(tenantId)

    }
    // 链名称
    const getCoinExt = async (tenantId: number) => {
        setCoinExtLoading(true)
        try {
            const res = await getcoinExtList(tenantId)
            if (res.code === '0') {
                const coinExtList = res.data.map((item: any) => ({
                    ...item,
                    label: item.coinName,
                    value: item.protocolId,
                }))
                setCoinExtSelect(coinExtList)
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(String(error))
        } finally {
            setCoinExtLoading(false)
        }
    }


    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-col flex-ai-start mt-10 mb-3" >
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    {loading ? <Iconify icon="tabler:loader" size={24} className={`loading`} /> : '确认'}
                </button>
                {/* <Button type="primary" onClick={handOk}
                className={`${styles.modal_footerBtn} default_btn`}
                loading={loading}
                >
                    确认
                </Button> */}
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Form: {
                        itemMarginBottom: 20, // 去除表单项之间的间距
                    },
                    Input: {
                        activeBorderColor: '#FF5F1F',
                        hoverBorderColor: '#FF5F1F',
                        controlHeightLG: 50,
                        activeBg: 'var(--background5)',
                        hoverBg: 'var(--background5)',
                    },
                    Button: {
                        controlHeightLG: 50,
                        defaultActiveBorderColor: '#FF5F1F', //默认按钮激活态边框颜色
                        defaultActiveColor: '#FF5F1F', //默认按钮激活态文本颜色
                        defaultBg: '#FF5F1F', //默认按钮背景颜色
                        defaultHoverBorderColor: '#FF5F1F', //默认按钮悬浮态边框颜色
                        defaultHoverColor: '#FF5F1F', //默认按钮悬浮态文本颜色
                        defaultColor: '#fff', //默认按钮文本颜色
                    },
                    Modal: {
                        contentBg: "var(--background5)",
                        footerBg: "var(--background5)",
                        headerBg: "var(--background5)",
                    },
                    Select: {
                        activeBorderColor: "var(--border-color4)",
                        optionActiveBg: "transparent",
                        selectorBg: "transparent", //选框背景色
                    }
                },
            }}
        >
            <Modal
                open={open}
                title={<p className={`${styles.title}`} >新增地址
                    {/* {type}{acountInfo.type}  */}
                </p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={470}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
            >
                <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
                    {/* t() */}
                    <Form
                        name="nickname"
                        form={form}
                        size="large"
                        style={{ width: '100%' }}
                        
                    >
                        <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>币种</div>

                        <Form.Item name="tenantId" rules={[{ required: true, message: "币种不能为空！" }]}>
                            <Select allowClear
                                placeholder="请选择"
                                options={coinSelect}
                                className={`${styles.select_box} custom-select`}
                                optionRender={(option) => {
                                    return (
                                        <div className="flex items-center py-1">
                                            {/* <Image src={option.data.iconUrl}
                                                alt={'coin'} width={20} height={20}
                                                className={` mr-2`} /> */}
                                            <Image src={`/images/assets/assets_account/icon_money.png`}
                                                alt={'coin'} width={20} height={20}
                                                className={` mr-2`} />

                                            <span className="text-text-color7">{`${option.data.coinName}(${option.data.nameDefault})`}</span>
                                        </div>
                                    );
                                }}
                                // optionLabelProp="children"
                                onFocus={getCoinAllList}
                                loading={coinLoading}
                                notFoundContent={<NoData title="暂无记录" />}

                            />
                        </Form.Item>
                        <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>链名称</div>

                        <Form.Item name="protocolId" rules={[{ required: true, message: "链名称不能为空！" }]}>
                            <Select allowClear
                                placeholder="请选择"
                                options={coinExtSelect}
                                className={`${styles.select_box} custom-select`}
                                optionRender={(option) => {
                                    return (
                                        <div className="flex items-center py-1">
                                            {/* <Image src={`/images/assets/assets_account/icon_money.png`}
                                                alt={'coin'} width={20} height={20}
                                                className={` mr-2`} /> */}
                                            <span className="text-text-color7">{option.data.label}</span>
                                        </div>
                                    );
                                }}
                                dropdownRender={(menu) => (<>
                                    {coinExtSelect.length > 0 && <p className={`${styles.warning_box} font-12 font-w-400 flex align-start mb-2_5 `}>
                                        <Iconify icon="ep:warning-filled" className="warning_color mr-1" size={16} />
                                        <span>请注意，这里仅展示了Metawave平台所支持的充币网络，如果您使用本平台不支持的网络充币，将可能导致资产损失。</span>
                                    </p>}
                                    {menu}
                                </>
                                )}
                                notFoundContent={<NoData title="暂无记录" />}
                                onFocus={getCoinExtList}
                                loading={coinExtLoading}
                            />
                        </Form.Item>


                        <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>提现地址</div>

                        <Form.Item name="address" rules={[{ required: true, message: "提现地址不能为空！" }]}>
                            <Input
                                allowClear
                                placeholder="地址"

                                className={`${styles.input_box} modal-input2`}
                                style={{ borderRadius: "8px" }}
                                // maxLength={6}
                            />
                        </Form.Item>

                        <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>备注</div>
                        <Form.Item name="addressName" >
                            <Input placeholder="备注" allowClear className={`${styles.input_box} modal-input2`}

                                // maxLength={6}
                            />
                        </Form.Item>




                    </Form>
                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default AddAddressModal;
