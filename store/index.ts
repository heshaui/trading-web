import { makeAutoObservable } from "mobx";

class AppStore {
  isDarkMode: boolean = false;

  constructor() {
    // 使状态响应式
    makeAutoObservable(this);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }
}

const appStore = new AppStore();
export default appStore;