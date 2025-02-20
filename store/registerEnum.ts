import { getRegister } from "@/services/login";
import { encryptData } from "@/utils/encrypt"; //加密
import { toast } from "sonner";
import { useRouter } from 'next/router';
// 注册逻辑
export const registerLogic = async (registerInfo: any) => {
    
    try {

        let dataInfo = {};
        if (registerInfo.type === 'm') {
            dataInfo = {
                type: registerInfo.type,
                email: registerInfo.email,
                password: registerInfo.password,
                parentInviteCode: registerInfo.parentInviteCode || "",
                code: registerInfo.code
            };

        } else if (registerInfo.type === 'p') {
            dataInfo = {
                type: registerInfo.type,
                phone: registerInfo.phone,
                password: registerInfo.password,
                parentInviteCode: registerInfo.parentInviteCode || "",
                countryCode: registerInfo.countryCode?.replace("+", ""),
                code: registerInfo.code
            };
        }
        const dataEncrypt = await encryptData(dataInfo)
        const res = await getRegister(dataEncrypt);
        // return res
        if (res.code === '0') {
            toast.success("注册成功")
        } else {
            toast.error(res.message)
        }

    } catch (error) {
        toast.error(String(error))
    }
}

// export const goRegister = () => {
//     const router = useRouter();

//     // setLoginState(LoginStateEnum.LOGIN)
//     router.push("/register")
// }