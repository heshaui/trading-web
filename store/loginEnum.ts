import { getLogin } from "@/services/login";
import { toast } from "sonner";
import { useRouter } from 'next/router';
import store from "@/store"
// import { LoginStateEnum} from "@/pages/login/login/providers/LoginStateProvider";
import { encryptData } from "@/utils/encrypt"; //加密

interface acountType {
    type: string,
    email?: string,
    phone?: string,
    deviceType: string,
    password: string,
    authCodePhone?: string,
    authCodeMail?: string,
    authCodeGoogle?: string
    countryCode?: string
}
    // const {  setLoginState } = useLoginStateContext();
// 登录逻辑
export const loginLogic = async (acountInfo: acountType) => {
    const router = useRouter();
    try {
        let dataInfo = {};
        if (acountInfo.type === 'm') {
            dataInfo = {
                type: acountInfo.type,
                email: acountInfo.email,
                deviceType: acountInfo.deviceType,
                password: acountInfo.password,
                authCodeMail: acountInfo.authCodeMail,
            }

        } else if (acountInfo.type === 'p') {
            dataInfo = {
                type: acountInfo.type,
                phone: acountInfo.phone,
                deviceType: acountInfo.deviceType,
                password: acountInfo.password,
                authCodePhone: acountInfo.authCodePhone,
            }
        }
        const dataEncrypt = await encryptData(dataInfo)
        const res = await getLogin(dataEncrypt)
        if (res.code === "0") {
            toast.success(res.message)
            store.setUserToken(res.data.token)
            router.push('/')
        }
    } catch (error) {
        toast.error(String(error))
    }
}
// export const goLogin = () => {
//     const router = useRouter();
//     // setLoginState(LoginStateEnum.LOGIN)
//     router.push("/login")
// }