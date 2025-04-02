import { makeAutoObservable } from "mobx";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
interface UserInfoType {
    userId: number,
    nickname?: string,
    avatarUrl?: string,
    token: string,
}
class AppStore {
    isDarkMode: boolean = false;
    userToken: string | null = null;
    authcodeState: { state: string | number | null, type: string | number | null } = { state: null, type: null };
    // loginInfo: {
    //     type: string,
    //     email?: string,
    //     phone?: string,
    //     deviceType: string,
    //     password: string,
    //     authCodePhone?: string,
    //     authCodeMail?: string,
    //     authCodeGoogle?: string
    // } = {
    //         type: '',
    //         email: '',
    //         phone: '',
    //         deviceType: '',
    //         password: ''
    //     };
    registerInfo: {
        type: string,
        email?: string,
        phone?: string,
        password: string,
        parentInviteCode?: string,
        countryCode?: string,
        code?: string
    } = {
        type: "",
        email: "",
        phone: "",
        password: "",
        parentInviteCode: "",
        countryCode: "",
        code: ""
        };
    userInfo: UserInfoType = {
        userId: 0,
        nickname: "",
        avatarUrl: "",
        token: ""
    }
    constructor() {
        // 使状态响应式
        makeAutoObservable(this);
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
    }
    setUserToken(token: string ) {
        this.userToken = token;
        localStorage.setItem(LOCAL_STORAGE_KEY.USER_TOKEN, token);
    }
    clearUserToken() {
        this.userToken = null;
        localStorage.removeItem(LOCAL_STORAGE_KEY.USER_TOKEN)
    }

    setAuthcodeState(state: string | number, type: string | number) {
        this.authcodeState = { state, type };
    }

    clearAuthcodeState() {
        this.authcodeState = { state: null, type: null };
    }
    // 更新 loginInfo 
    // updateLoginInfo(newLoginInfo: Partial<typeof this.loginInfo>) {
    //     this.loginInfo = {
    //         ...this.loginInfo,
    //         ...newLoginInfo
    //     };
    // }
    updateRegisterInfo(newRegisterInfo: Partial<typeof this.registerInfo>) {
        this.registerInfo = {
            ...this.registerInfo,
            ...newRegisterInfo
        };
    }
    updateUserInfo(newUserInfo: Partial<typeof this.userInfo>) {
        this.userInfo = {
            ...this.userInfo,
            ...newUserInfo
        };
        localStorage.setItem(LOCAL_STORAGE_KEY.USER_INFO, JSON.stringify(this.userInfo));
    }
    clearUserInfo() {
        this.userInfo = {
            userId: 0,
            nickname: "",
            avatarUrl: "",
            token: ""
        };
        localStorage.removeItem(LOCAL_STORAGE_KEY.USER_INFO);
    }
}

const appStore = new AppStore();
export default appStore;