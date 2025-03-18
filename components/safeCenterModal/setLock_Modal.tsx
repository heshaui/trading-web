import { Modal, ConfigProvider, Form, Input, AutoComplete } from "antd";

import type { ModalProps } from "antd/es/modal/interface";
// import store from "@/store"
// import { useRouter } from 'next/router';
import styles from "./styles/setLock.module.css";
// import Image from 'next/image'
import { Iconify } from "@/components/icon/index";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { encryptData } from "@/utils/encrypt";
import type { AutoCompleteProps } from 'antd';
import { setPassword } from "@/services/safeCenter";
type Props = {
  open: boolean;
  // onOk?: (event: boolean) => void;
  onOk: () => void;
  onCancel: () => void;
  type: string;
};

function LockModal({ open, onCancel, type ,onOk}: Props) {
  // const router = useRouter();
  const [verifyPasswordVisible, setverifyPasswordVisible] = useState(false);

  // 密码校验状态
  const [lengthValid, setLengthValid] = useState(false);
  const [charValid, setCharValid] = useState(false);
  const [showLengthCheck, setShowLengthCheck] = useState(false);
  const [showCharCheck, setShowCharCheck] = useState(false);

  const [form] = Form.useForm();

  const handCancel = () => {
    form.resetFields();
    onCancel()
  };

  const handOk = async () => {
    // 这里可以添加点击验证码弹窗确认按钮后的处理逻辑
    form.validateFields()
      .then(async (values) => {
        // console.log(values);
        try {
          const params = {
            password: values.password,
            checkPassword: values.checkPassword
          }
          const dataEncrypt = await encryptData(params)
          const res = await setPassword(dataEncrypt)
          if (res.code === "0") {
            toast.success(res.message)
            onOk()
            handCancel()
          }
        } catch (error) {
          toast.error(String(error))
        }
      
      });
  };

  // 自定义密码验证规则
  const validatePassword = (_: any, value: string) => {
    if (typeof value === 'string') {
      value = value.trim();
    }
    if (!value) {
      return Promise.reject(new Error("密码不能为空！"));
    }
    // 检查长度是否在 8 - 100 位之间
    const isLengthValid = value.length >= 8 && value.length <= 100;
    if (!isLengthValid) {
      setShowLengthCheck(true);
      setShowCharCheck(false);
      return Promise.reject();
    }

    // 检查是否包含大写字母和数字
    const hasUpperLetter = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const isCharValid = hasUpperLetter && hasNumber;

    if (!isCharValid) {
      setShowLengthCheck(false);
      setShowCharCheck(true);
      return Promise.reject();
    }

    // 所有校验都通过
    setShowLengthCheck(false);
    setShowCharCheck(false);
    return Promise.resolve();
  };
  // 监听密码输入变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 检查长度
    const isLengthValid = value.length >= 8 && value.length <= 100;

    // 检查是否包含大写字母和数字
    const hasUpperLetter = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const isCharValid = hasUpperLetter && hasNumber;

    // 更新状态
    setLengthValid(isLengthValid);
    setCharValid(isCharValid);

    // 显示长度校验，隐藏字符校验
    setShowLengthCheck(true);
    setShowCharCheck(false);

    // 如果长度校验通过，1秒后切换到字符校验
    if (isLengthValid) {
      setTimeout(() => {
        setShowLengthCheck(false);
        setShowCharCheck(true);

        // 如果字符校验也通过，1秒后隐藏
        if (isCharValid) {
          setTimeout(() => {
            setShowCharCheck(false);
          }, 1000);
        }
      }, 1000);
    }
  };
  // 重置状态
  useEffect(() => {
    if (!open) {
      setShowLengthCheck(false);
      setShowCharCheck(false);
      setLengthValid(false);
      setCharValid(false);
      form.resetFields();
    }
  }, [open, form]);
  const ModalFooter: ModalProps["footer"] = () => {

    return (
      <div className="flex-x align-center justify-end" >
        {/* <button
                    type="button"
                    className={`${styles.modal_footerBtn} cancel_btn2 mr-5 font-14 font-w-500`}
                    onClick={handCancel}
                >
                    取消
                </button> */}
        <button
          type="submit"
          className={`${styles.modal_footerBtn} default_btn mt-8 mb-6`}
          onClick={handOk}
        >
          保存
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
            selectorBg: 'var(--background5)',
          }
        },
        token: {
          // colorBgContainerDisabled: '#fff',
          controlHeight: 40,
        }
      }}
    >
      <Modal
        open={open}
        title={<p className={`${styles.title}`} >修改密码</p>}
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
            style={{ width: "100%" }}
          >
            <div className={`font-16 font-w-400 mb-2_5 ${styles.tip_title}`}>新密码</div>
            <Form.Item name="password" rules={[{ validator: validatePassword }]}>
              <Input.Password maxLength={100}
                placeholder="请输入新密码"
                allowClear={true}
                className={`${styles.input_box} modal-input `}
              onChange={handlePasswordChange} 
              />
            </Form.Item>
            <div className={`mt-1`}>
                {showLengthCheck && (
                  <div className={`font-12 font-w-400 ${styles.ruleItem} ${lengthValid ? styles.tip_title : styles.tip_color}`}>
                    <Iconify
                      icon="iconoir:check-circle-solid"
                      size={16}
                      className={`mr-1 ${lengthValid ? styles.tip_title : styles.tip_color}`}
                    />
                    8-100个字符
                  </div>
                )}

                {showCharCheck && (
                  <div className={`font-12 font-w-400 ${styles.ruleItem} ${charValid ? styles.tip_title : styles.tip_color}`}>
                    <Iconify
                      icon="iconoir:check-circle-solid"
                      size={16}
                      className={`mr-1 ${charValid ? styles.tip_title : styles.tip_color}`}
                    />
                    至少一个数字和一个大写字母
                  </div>
                )}
                {/* <div className="font-12 font-w-400">
                     <Iconify icon="iconoir:check-circle-solid" size={16} className="mr-1"/>
                       至少一个大写字母
                  </div> */}
              </div>
            <div className={`font-16 font-w-400 mb-2_5 mt-5 ${styles.tip_title}`}>确认密码</div>
            <Form.Item name="checkPassword"
              rules={[
                { required: true, message: "密码不能为空！" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error("两次输入的密码不匹配!"));
                  },
                }),
              ]}>
              <Input.Password
                allowClear
                placeholder="请确认密码"
                className={`${styles.authcode_input} ${styles.input_box} modal-input`}
                style={{ borderRadius: "8px" }}
                visibilityToggle={{ visible: verifyPasswordVisible, onVisibleChange: setverifyPasswordVisible }}
              />
              {/* <button className='text-color mt-1'>粘贴</button> */}
            </Form.Item>

          </Form>

        </div>
      </Modal>
    </ConfigProvider>
  );
}

export default LockModal;
