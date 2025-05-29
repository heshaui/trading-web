export interface WithdrawDataType {
    timestamp: number,
    type: string,
    symbol: string,
    amount: number,
    status: string,
    address: string,
    txHash: string,
    fee: string,
}
export interface RebateDataType {
    timestamp: number,
    type: string,
    symbol: string,
    amount: number,
    status: string,
    address: string,
    txHash: string,
    fee: string,
}
export interface RechargeDataType {
    timestamp: number,
    type: string,
    symbol: string,
    amount: number,
    status: string,
    address: string,
    txHash: string,
    fee: string,
}
export interface coinSelectType {
    coinId: string,
    coinName: string,
    iconUrl: string,
    nameDefault: string,
    value: string,
    label: string,
    sort: number,
}