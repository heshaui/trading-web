// 订单类型
export enum Type {
  LIMIT = 1, // 限价单
  MARKET = 2, // 市价单
  POST_ONLY = 3, // PostOnly
  FORCE_LIQUIDATION = 4, // 强制减仓
  POSITION_MERGE = 5, // 仓位合并
}
export const TypeMap = {
  [Type.LIMIT]: "order.common.limit",
  [Type.MARKET]: "order.common.market",
  [Type.POST_ONLY]: "order.common.postOnly",
  [Type.FORCE_LIQUIDATION]: "order.common.forceLiquidation",
  [Type.POSITION_MERGE]: "order.common.positionMerge",
};

export enum SideEnum {
  BUY_OPEN = "BUY_OPEN",
  SELL_OPEN = "SELL_OPEN",
  BUY_CLOSE = "BUY_CLOSE",
  SELL_CLOSE = "SELL_CLOSE",
}

export const SideMap = {
  [SideEnum.BUY_OPEN]: {
    text: "order.common.buy",
    color: "#4CAF50",
  },
  [SideEnum.SELL_OPEN]: {
    text: "order.common.sell",
    color: "#F44336",
  },
  [SideEnum.BUY_CLOSE]: {
    text: "order.common.buyClose",
    color: "#4CAF50",
  },
  [SideEnum.SELL_CLOSE]: {
    text: "order.common.sellClose",
    color: "#F44336",
  },
};

export enum Status {
  PENDING = 0, // 待成交
  NEW_ORDER = 1, // 新订单
  FULLY_FILLED = 2, // 完全成交
  PARTIALLY_FILLED = 3, // 部分成交
  CANCELLED = 4, // 已取消
  CANCELLING = 5, // 待撤销
  ABNORMAL = 6, // 已废弃
  PARTIALLY_FILLED_AND_CANCELLED = 7, // 部分成交已撤销
}

export const StatusMap = {
  [Status.PENDING]: "order.common.pending",
  [Status.NEW_ORDER]: "order.common.newOrder",
  [Status.FULLY_FILLED]: "order.common.fullyFilled",
  [Status.PARTIALLY_FILLED]: "order.common.partiallyFilled",
  [Status.CANCELLED]: "order.common.cancelled",
  [Status.CANCELLING]: "order.common.cancelling",
  [Status.ABNORMAL]: "order.common.abnormal",
  [Status.PARTIALLY_FILLED_AND_CANCELLED]:
    "order.common.partiallyFilledAndCancelled",
};