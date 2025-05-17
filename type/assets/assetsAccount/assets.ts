export interface DataType {
    balance: number,
    frozenBalance: number,
    releaseBalance: number,
    isLock: number,
    coinId: string,
    coinName: string,
    iconUrl: string,
    nameDefault: string
}
export interface BalanceAllType {
    usdBalance: number|string,
    cnyBalance: number|string,
    usdt: number | string
    withdraw?: number | string,
    usdtWithdraw?: number | string
}