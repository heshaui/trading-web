import { Modal, ConfigProvider, Form, Input } from "antd";

import type { ModalProps } from "antd/es/modal/interface";
// import { Iconify } from "@/components/icon/index";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/nickname.module.css";
// import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import {updateUserCenter} from '@/services/userCenter'
import { toast } from "sonner";
import { useState } from "react";
// import {encryptData} from '@/utils/encrypt'
import dayjs from "dayjs";
import { useTranslation } from 'next-i18next';
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { encryptData } from '@/hooks/user-encrypt'
import appStore from "@/store";

interface UserCenterData {
    userId: number,
    nickname?: string,
    avatarUrl?: string,
    birthday?: string,
    isNicknameUpdate?:boolean,
    nicknameUpdateTime?: number,
  }
type Props = {
    open: boolean;
    nicknameInfo: UserCenterData;
    // onOk?: (event: boolean) => void;
    onOk: (event: boolean) => void;
    onCancel: () => void;
};

function NicknameModal({ open, onCancel ,nicknameInfo,onOk}: Props) {
    const { t } = useTranslation('common');
    // const router = useRouter();
    const [form] = Form.useForm();
    const [inputValue, setInputValue] = useState(nicknameInfo.nickname || '');
    const handCancel = () => {
        // form.resetFields();
        onCancel()
    };
const kvConfig=appStore.getKvConfigAll()
    const handOk = async () => {
        // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
        form.validateFields()
            .then(async(values) => {
                // console.log(values);
                if(!nicknameInfo?.isNicknameUpdate) return toast.error(t('usersetting.modifyNicknameOnceTip1',{time:kvConfig?.nickname_modify_time || 24}))
                try {
                    const param={
                        // userId:localStorage.getItem(LOCAL_STORAGE_KEY.USER_INFO)||'',
                        nickname:values.nickname
                    }
                    const encrypt=await encryptData(param)
                    const res=await updateUserCenter(encrypt)
                    if(res.code==='0'){
                        onOk(true)
                        handCancel()
                        toast.success(t('usersetting.modifySuccess'))
                    }else{
                        toast.error(res.message)
                    }
                } catch (error) {
                    toast.error(String(error))
                }
            });
    };
      // 过滤输入，只允许数字和字母
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // 只保留数字和字母
        const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
        setInputValue(filteredValue);
        form.setFieldsValue({ nickname: filteredValue });
    };

    const ModalFooter: ModalProps["footer"] = () => {

        return (
            <div className="flex-x align-center justify-end" >
                <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    {/* 取消 */}
                    {t('cancel')}
                </button>
                <button
                    type="submit"
                    className={`${styles.modal_footerBtn} default_btn`}
                    onClick={handOk}
                >
                    {/* 保存 */}
                    {t('save')}
                </button>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Form: {
                        itemMarginBottom: 0, // 去除表单项之间的间距
                    },
                    Input: {
                        // color: '#FF5F1F',
                        activeBorderColor: 'var(--theme-color)',
                        hoverBorderColor: 'var(--theme-color)',
                        controlHeightLG: 50,
                        activeBg:'var(--background5)',
                        hoverBg:'var(--background5)',
                    },
                    Button: {
                        controlHeightLG: 50,
                        defaultActiveBorderColor: 'var(--theme-color)', //默认按钮激活态边框颜色
                        defaultActiveColor: 'var(--theme-color)', //默认按钮激活态文本颜色
                        defaultBg: 'var(--theme-color)', //默认按钮背景颜色
                        defaultHoverBorderColor: 'var(--theme-color)', //默认按钮悬浮态边框颜色
                        defaultHoverColor: 'var(--theme-color)', //默认按钮悬浮态文本颜色
                        defaultColor: '#fff', //默认按钮文本颜色
                    },
                    Modal:{
                        contentBg: "var(--background5)",
                        footerBg: "var(--background5)",
                        headerBg: "var(--background5)",
                    }
                },
                token: {
                    // colorBgContainerDisabled: '#fff',
                }
            }}
        >
            <Modal
                open={open}
                title={<p className={`${styles.title}`} >
                    {/* 修改昵称 */}
                    {t('usersetting.modifyNickname')}
                </p>}
                centered
                onCancel={handCancel}
                footer={ModalFooter}
                width={500}
                className={`modal_box`}
                classNames={{
                    content: styles.modal_content,
                    body: styles.modal_body,
                    footer: styles.modal_footer,
                }}
                maskClosable={false}
            >
                <div className="flex-col flex-ai-center" style={{ width: "100%" }}>
                    {/* t() */}
                    <Form
                        name="nickname"
                        form={form}
                        size="large"
                        style={{ width: "100%" }}
                        initialValues={{ nickname: nicknameInfo.nickname||'' }}
                    >
                        <Form.Item name="nickname" rules={[{ required: true,message: t('usersetting.nicknameRequired') }]}>
                            <Input  className={`${styles.input_box} modal-input`}
                            onChange={handleInputChange}
                            value={inputValue}
                            maxLength={25}/>
                        </Form.Item>
                        {nicknameInfo&&!nicknameInfo?.isNicknameUpdate&& <p className="error_icon font-12 font-w-400 mt-1">

                            {dayjs(Number(nicknameInfo?.nicknameUpdateTime)).format('YYYY-MM-DD HH:mm:ss')}{t('usersetting.modifyNicknameOnce')}
                            </p>}
                        <ul className={`${styles.msg_color} mt-2_5 font-12 font-w-400`}>
                            <li className="flex align-base ">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                {/* 24h内仅可修改1次。 */}
                                {t('usersetting.modifyNicknameOnceTip1', {time:kvConfig?.nickname_modify_time || 24})}
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                {/* 昵称仅支持数字、字母，不得超出25字符。 */}
                                {t('usersetting.modifyNicknameOnceTip2')}
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                {/* 不可使用个人真实姓名及联系方式等，以防泄漏您的隐私。 */}
                                {t('usersetting.modifyNicknameOnceTip3')}
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                {/* 昵称内容必须符合所在国家或地区的法律规定。如有违规，IMBIT有权对其修改或实施对账号禁言、封号等惩罚性措施。 */}
                                {t('usersetting.modifyNicknameOnceTip4')}
                            </li>
                            <li className="flex align-base mt-1">
                                <Iconify icon="emojione-monotone:small-orange-diamond" className="theme_color mr-1"/>
                                {/* 历史昵称可能因为版本关系，存在不符合上述规范的情况，将无法同步至域名url。 */}
                                {t('usersetting.modifyNicknameOnceTip5')}
                            </li>
                        </ul>
                    </Form>

                </div>
            </Modal>
        </ConfigProvider>
    );
}

export default NicknameModal;
