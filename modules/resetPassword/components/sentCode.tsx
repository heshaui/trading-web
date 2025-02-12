// import { Button, Form, Input,Tabs } from "antd";
import { Input, Button, AutoComplete } from 'antd';
import type {  AutoCompleteProps } from 'antd';
import { type CSSProperties, useState, useRef } from "react";
import { useResetStateContext, ResetStateEnum } from "../providers/ResetStateProvider";
import { toast } from "sonner";
import store from "@/store";
import styles from "../style/reset.module.css"
function ResetPassword() {

    const { resetState, setResetState } = useResetStateContext();
    const [authCode, setAuthCode] = useState('');
     const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    // 当状态不为 INPUT 时不渲染组件
    if (resetState !== ResetStateEnum.SENTCODE) return null;



    const goNext = () => {
        setResetState(ResetStateEnum.RESET)
    }
    const goLast=()=>{
        setResetState(ResetStateEnum.INPUT)
    }
 
    return (
        <div className="flex-col" style={{ height: "70vh", width: "100%" }}>
            <div className="mb-2 font-w-500 flex-col" style={{ width: "300px" }}>已发送验证码至
                <span className={`${styles.text_color} font-w-400`}>{12233}</span> 
            </div>
            <div>
                <Input
                    placeholder="请输入"
                    style={{ borderRadius: "8px",height: "50px" }}
                    // value={authCode}
                    allowClear
                    size='large'
                />
                
                <div className='flex mt-10'>
                <Button
                        className='goback-btn mr-4'
                        onClick={() => goLast()}>返回</Button>
                    <button type='button' className={`btn-color ${styles.next_btn} flex-1`} onClick={()=>goNext()}>下一步</button>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
