
import React from 'react';
import styles from '../styles/invite.module.css';
import { useThemeMode } from '@/hooks/useThemeMode';
import useCopyToClipboard from '@/hooks/use-copy-to-clipboard';
import type { CSSProperties } from 'react';
import { ConfigProvider, Form, Input } from 'antd';
import { Iconify } from "@/components/icon"
const mainBgcStyle: CSSProperties = {
    // backgroundImage: `url("/images/login/banner.png")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    minHeight: "412px",
    width: "100%"
};
type InviteBannerProps = {
    onReturn: () => void;
}
const InviteBanner = ({onReturn}:InviteBannerProps) => {
    const { isDayMode } = useThemeMode(); // 使用 hook
    const { copyFn } = useCopyToClipboard();
    const [form] = Form.useForm();
    let userInfo={}
    if(typeof window !== 'undefined'){
        userInfo=JSON.parse(localStorage.getItem('userInfo')||'{}')
    }

    return (<>
                <div className={`${styles.header_banner} flex-y-cc`}
                    style={{
                        ...mainBgcStyle,
                        backgroundImage: `url(${isDayMode ? '/images/invite/bg_banner.png'
                            : '/images/invite/bg_banner_night.png'})`
                    }}>
                    <div className={`${styles.main_page} flex-x align-center justify-between`}>
                        <div className={`${styles.main_title} `} >
                            <p className={`${styles.title_color} font-48 font-w-600`}>邀请好友，获得返佣<span className={styles.strong_color}>奖励</span> </p>
                            <p className={`${styles.tip_color} font-28 font-w-400 mt-5`}>和好友一起赚取额外奖励</p>
                        </div>
                        <div className={`${styles.card_bgc} flex-x-cc`}>
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Form: {
                                            itemMarginBottom: 20, // 去除表单项之间的间距
                                        },
                                        Input: {
                                            // color: '#FF5F1F',
                                            activeBorderColor: '#37373A',
                                            hoverBorderColor: '#37373A',
                                            controlHeightLG: 50,
                                            activeBg: 'var(--background5)',
                                            hoverBg: 'var(--background5)',
                                        },
                                    },
                                }}
                            >
                                                    <Form
                        name="nickname"
                        form={form}
                        size="large"
                        style={{ width: "100%" }}
                        initialValues={{inviteCode: '1121313', inviteLink: '1121313' }}
                    >
                        <p className={`font-16 font-w-400 mb-2_5 ${styles.title_color}`}>邀请码</p>
                        <Form.Item name="inviteCode" rules={[{ required: true,message: '请输入邀请码!' }]}>
                            <Input  className={`${styles.input_box} modal-input`}
                            maxLength={25}
                            placeholder='请输入邀请码'
                            disabled={true}
                            suffix={
                                <Iconify icon="icon-park-outline:copy"
                                className='ml-1 cursor-pointer' size={18}
                                // onClick={ ''}
                            />
                            }
                            />
                        </Form.Item>
                        <p className={`font-16 font-w-400 mb-2_5 ${styles.title_color}`}>邀请链接</p>
                        <Form.Item name="inviteLink" rules={[{ required: true,message: '请输入邀请链接!' }]}>
                            <Input  className={`${styles.input_box} modal-input`}
                            maxLength={25}
                            placeholder='请输入邀请链接'
                            disabled={true}
                            suffix={
                                <Iconify icon="icon-park-outline:copy"
                                className='ml-1 cursor-pointer' size={18}
                                // onClick={ ''}
                            />
                            }
                            />
                        </Form.Item>
                        <Form.Item name="inviteLink" rules={[{ required: true,message: '请输入邀请链接!' }]}>
                            <button type='submit' className={`default_btn w-full ${styles.invite_btn}`}
                            onClick={onReturn}
                            >立即邀请</button>
                        </Form.Item>
                    </Form>
                            </ConfigProvider>
                        </div>
                    </div>

                </div>
    </>
    );
};

export default InviteBanner;