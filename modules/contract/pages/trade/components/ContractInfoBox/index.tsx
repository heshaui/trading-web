import { observer } from 'mobx-react-lite';
import appStore from "@/store";
/**
 * base: 基础币种
 * brokerId: 经纪商ID
 * capitalFrequency: 资本频率
 * capitalStartTime: 资本开始时间
 * coType: 合约类型
 * coinResultVo: 币种结果
 * contractName: 合约名称
 * contractShowType: 合约显示类型
 * contractSide: 合约方向
 * contractType: 合约类型
 * deliveryKind: 交割类型
 * id: 合约ID
 * marginCoin: 保证金币种
 * marginRate: 保证金率
 * maxLever: 最大杠杆
 * minLever: 最小杠杆
 * multiplier: 乘数
 * multiplierCoin: 乘数币种
 * quote: 报价币种
 * settlementFrequency: 结算频率
 * sort: 排序
 * symbol: 合约符号
 */
const ContractInfo = observer(({ style }: { style?: React.CSSProperties }) => {
  // 获取当前合约信息
  const currentContractInfo = appStore.getCurrentContractInfo();
  console.info(currentContractInfo, "0000000000000000000000");
  return (
    <div className="p-[10px_16px] text-[14px] font-[400] bg-[var(--background9)]" style={style} >
      <div className="text-[var(--text-color5)] font-[500] mb-[16px]">
        合约信息
      </div>
      <div className="flex flex-col gap-[10px]">
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">合约代号</div>
          <div className="text-[var(--text-color5)]">{currentContractInfo?.symbol}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">交割日期</div>
          <div className="text-[var(--text-color5)]">永续</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">合约标的</div>
          <div className="text-[var(--text-color5)]">{currentContractInfo?.symbol} 指数</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">保证金币种</div>
          <div className="text-[var(--text-color5)]">{currentContractInfo?.quote}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">合约面值</div>
          <div className="text-[var(--text-color5)]">{currentContractInfo?.multiplier} {currentContractInfo?.multiplierCoin}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">最小价格变动单位</div>
          <div className="text-[var(--text-color5)]">{'--'} {currentContractInfo?.quote}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[var(--text-color6)]">最低维持保证金率</div>
          <div className="text-[var(--text-color5)]">{'--'} %</div>
        </div>
      </div>
    </div>
  );
});

export default ContractInfo;
