import { makeAutoObservable } from "mobx";

class AppStore {
    isDarkMode: boolean = false;
    userToken: string | null = null;
    authcodeState: { state: string|number | null, type: string|number | null } = { state: null, type: null };

    constructor() {
        // 使状态响应式
        makeAutoObservable(this);
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
    }

    setAuthcodeState(state: string|number, type: string|number) {
        this.authcodeState = { state, type };
    }

    clearAuthcodeState() {
        this.authcodeState = { state: null, type: null };
    }
}

const appStore = new AppStore();
export default appStore;