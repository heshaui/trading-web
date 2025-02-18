import { getLogin } from "@/services/login";

// 登录逻辑
export const loginLogic=async (dataInfo:string)=>{
    const res=await getLogin({data:dataInfo});
    console.log(res);
    
}