import { makeAutoObservable, runInAction } from "mobx";
import { LOCAL_STORAGE_KEY } from "@/config/apiConfig";
import { 
    fetchAllCurrencyPairs, 
    fetchUserFavorites, 
    addToFavorites, 
    removeFromFavorites,
    CurrencyPairType 
} from './currencyPairService';
import { getExchangeGroup, getExchangeCoinList, getUserExchangeCoinTypeList } from '@/services/spot';

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
    
    // 添加币对信息列表
    currencyPairs: CurrencyPairType[] = [];
    // 添加当前选中的币对
    currentPair: CurrencyPairType | null = null;
    // 添加原始币对数据
    rawCurrencyData: any[] = [];
    // API加载状态
    isLoadingCurrencyData: boolean = false;

    constructor() {
        // 使状态响应式
        makeAutoObservable(this);
        
        // 从localStorage初始化币对信息
        this.initCurrencyPairsFromStorage();
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
        // 考虑是否需要重置自选状态
        // this.loadFavoriteCoins();
    }

    // 从本地存储初始化币对信息
    initCurrencyPairsFromStorage() {
        try {
            const pairsJson = localStorage.getItem(LOCAL_STORAGE_KEY.CURRENCY_PAIRS);
            const currentPairJson = localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_PAIR);
            
            if (pairsJson) {
                this.currencyPairs = JSON.parse(pairsJson);
            }
            
            if (currentPairJson) {
                this.currentPair = JSON.parse(currentPairJson);
            }
        } catch (error) {
            console.error('Failed to load currency pairs from storage:', error);
        }
    }
    
    // 从API加载币对信息
    async loadCurrencyPairs() {
        try {
            this.isLoadingCurrencyData = true;
            
            // 使用currencyPairService中的方法替代重复代码
            const result = await fetchAllCurrencyPairs(this.userToken);
            
            if (result.success) {
                // 更新原始数据
                this.rawCurrencyData = result.rawData;
                
                // 更新币对列表
                this.setCurrencyPairs(result.data);
                
                // 如果没有当前选中的币对，设置第一个为当前币对
                if (!this.currentPair && result.data.length > 0) {
                    this.setCurrentPair(result.data[0]);
                }
                
                return result.data;
            } else {
                throw result.error;
            }
        } catch (error) {
            runInAction(() => {
                // 可能需要设置错误状态
            });
            console.error('Error loading currency pairs:', error);
            throw error;
        } finally {
            runInAction(() => {
                this.isLoadingCurrencyData = false;
            });
        }
    }
    
    // 设置币对列表
    setCurrencyPairs(pairs: CurrencyPairType[]) {
        this.currencyPairs = pairs;
        localStorage.setItem(LOCAL_STORAGE_KEY.CURRENCY_PAIRS, JSON.stringify(pairs));
    }
    
    // 设置当前选中的币对
    setCurrentPair(pair: CurrencyPairType) {
        this.currentPair = pair;
        localStorage.setItem(LOCAL_STORAGE_KEY.CURRENT_PAIR, JSON.stringify(pair));

    }
    
    // 根据ID查找币对
    getCurrencyPairById(id: string) {
        return this.currencyPairs.find(pair => pair.id === id) || null;
    }
    
    // 根据基础货币筛选币对
    getCurrencyPairsByBase(baseSymbol: string) {
        return this.currencyPairs.filter(pair => pair.baseCurrency === baseSymbol);
    }
    
    // 获取当前选中的币对
    getCurrentPair() {
        return this.currentPair;
    }
    
    // 更新币对信息
    updateCurrencyPair(pairId: string, data: Partial<CurrencyPairType>) {
        const pairIndex = this.currencyPairs.findIndex(pair => pair.id === pairId);
        if (pairIndex > -1) {
            this.currencyPairs[pairIndex] = {
                ...this.currencyPairs[pairIndex],
                ...data
            };
            
            // 如果更新的是当前选中的币对，也更新currentPair
            if (this.currentPair?.id === pairId) {
                this.currentPair = this.currencyPairs[pairIndex];
            }
            
            localStorage.setItem(LOCAL_STORAGE_KEY.CURRENCY_PAIRS, JSON.stringify(this.currencyPairs));
        }
    }
    
  
    
    // 使用计算属性替代方法
    get favoritePairs() {
        return this.currencyPairs.filter(pair => pair.isFavorite);
    }

    // 清除币对信息
    clearCurrencyPairs() {
        this.currencyPairs = [];
        this.currentPair = null;
        this.rawCurrencyData = [];
        localStorage.removeItem(LOCAL_STORAGE_KEY.CURRENCY_PAIRS);
        localStorage.removeItem(LOCAL_STORAGE_KEY.CURRENT_PAIR);
    }

    // 从服务器重新加载自选币对
    async loadFavoriteCoins() {
        if (!this.userToken) return;
        
        try {
            const response = await getUserExchangeCoinTypeList();
            if (response.code === '0') {
                const favoriteCoins = response.data || [];
                
                // 更新现有币对的收藏状态
                const updatedPairs = this.currencyPairs.map(pair => {
                    const isFavorite = favoriteCoins.some((favCoin: any) => 
                        favCoin.coinSymbol === pair.quoteCurrency && 
                        favCoin.baseSymbol === pair.baseCurrency
                    );
                    
                    return {
                        ...pair,
                        isFavorite
                    };
                });
                
                this.setCurrencyPairs(updatedPairs);
                
                // 如果当前选中的币对也发生了变化，更新它
                if (this.currentPair) {
                    const currentPairUpdated = updatedPairs.find(p => p.id === this.currentPair?.id);
                    if (currentPairUpdated) {
                        this.currentPair = currentPairUpdated;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load favorite coins:', error);
        }
    }
}

const appStore = new AppStore();
export default appStore;