import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
// import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined } from '@ant-design/icons';
import { Iconify } from "@/components/icon/index";
import styles from './styles/setLock.module.css';
import { encryptData } from '@/utils/encrypt';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
  // onOk?: (event: boolean) => void;
  onOk?: () => void;
  onCancel: () => void;
  type: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ 
  visible, 
  onClose,
  onSuccess,
  open, onCancel, type
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  // 密码校验状态
  const [lengthValid, setLengthValid] = useState(false);
  const [charValid, setCharValid] = useState(false);
  const [showLengthCheck, setShowLengthCheck] = useState(false);
  const [showCharCheck, setShowCharCheck] = useState(false);
  
  // 监听密码输入变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 检查长度
    const isLengthValid = value.length >= 8 && value.length <= 100;
    setLengthValid(isLengthValid);
    setShowLengthCheck(true);
    
    // 如果长度校验通过，1秒后隐藏并显示下一个校验
    if (isLengthValid) {
      setTimeout(() => {
        setShowLengthCheck(false);
        setShowCharCheck(true);
        
        // 检查是否包含字母和数字
        const hasLetter = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        setCharValid(hasLetter && hasNumber);
        
        // 如果字符校验通过，1秒后隐藏
        if (hasLetter && hasNumber) {
          setTimeout(() => {
            setShowCharCheck(false);
          }, 1000);
        }
      }, 1000);
    } else {
      // 如果长度校验不通过，隐藏字符校验
      setShowCharCheck(false);
    }
  };

  // 自定义密码验证规则
  const validatePassword = (_: any, value: string) => {
    if (typeof value === 'string') {
      value = value.trim();
    }
    if (!value) {
        setShowLengthCheck(false);
        setShowCharCheck(false);
        setLengthValid(false);
        setCharValid(false);
      return Promise.reject(new Error("密码不能为空！"));
    }
    // // 检查长度是否在 8 - 100 位之间
    // if (value.length < 8 || value.length > 100) {
    //   return Promise.reject(new Error(""));
    // }
    // // 检查是否包含大写字母和数字
    // const hasUpperLetter = /[A-Z]/.test(value);
    // const hasNumber = /\d/.test(value);
    
    // if (!hasUpperLetter || !hasNumber) {
    //   return Promise.reject(new Error(""));
    // }

    return Promise.resolve();
  };

  // 确认密码验证
  const validateConfirmPassword = (_: any, value: string) => {
    const password = form.getFieldValue('newPassword');
    if (value !== password) {
      setPasswordsMatch(false);
      return Promise.reject(new Error("2次密码不一致"));
    }
    setPasswordsMatch(true);
    return Promise.resolve();
  };

  // 重置状态
  useEffect(() => {
    if (!visible) {
      setShowLengthCheck(false);
      setShowCharCheck(false);
      setLengthValid(false);
      setCharValid(false);
      setPasswordsMatch(true);
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      
      const values = form.getFieldsValue();
      // 加密密码数据
      const encryptedPassword = encryptData(values.newPassword);
      
      // 调用API修改密码

    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="修改密码"
      open={open}
      onCancel={onClose}
      footer={null}
      width={400}
      maskClosable={false}
      closeIcon={<span className={styles.closeIcon}>×</span>}
      className={styles.passwordModal}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className={styles.formTitle}>新密码</div>
        <Form.Item
          name="newPassword"
          rules={[{ validator: validatePassword }]}
        >
          <Input.Password
            placeholder="密码"
            allowClear
            className={styles.passwordInput}
            onChange={handlePasswordChange}
          />
        </Form.Item>
        
        {/* 动态密码规则检查 */}
        <div >
          {showLengthCheck && (
            <div className={`font-12 font-w-400 ${styles.ruleItem} ${lengthValid ? styles.validRule : ''}`}>
              <Iconify 
                icon="iconoir:check-circle-solid" 
                size={16} 
                className={`mr-1 ${lengthValid ? styles.validIcon : ''}`} 
              />
              8-100个字符
            </div>
          )}
          
          {showCharCheck && (
            <div className={`font-12 font-w-400 ${styles.ruleItem} ${charValid ? styles.validRule : ''}`}>
              <Iconify 
                icon="iconoir:check-circle-solid" 
                size={16} 
                className={`mr-1 ${charValid ? styles.validIcon : ''}`} 
              />
              至少一个数字和一个大写字母
            </div>
          )}
        </div>

        <div className={styles.formTitle}>确认密码</div>
        <Form.Item
          name="confirmPassword"
          rules={[{ validator: validateConfirmPassword }]}
          validateStatus={passwordsMatch ? '' : 'error'}
          help={passwordsMatch ? '' : '2次密码不一致'}
        >
          <Input.Password
            allowClear
            placeholder="密码"
            className={styles.passwordInput}
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className={styles.confirmButton}
            block
          >
            确认
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;