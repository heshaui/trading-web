import React, { useState } from "react";
import { Tabs, InputNumber, Tooltip, Popover, Slider, Space } from "antd";

interface CloseItemProps {
  show: boolean;
  onShowChange: (visible: boolean) => void;
  buttonText: string;
  type: "market" | "limit";
}

const CloseItem: React.FC<CloseItemProps> = ({
  show,
  onShowChange,
  buttonText,
  type,
}) => {
  return (
    <div className="flex items-center gap-[4px] flex-wrap text-[12px] font-[500]">
      <Tooltip trigger={["click"]} title="数量:595.29 USDT" open={show}>
        <Popover
          placement="bottom"
          trigger="click"
          open={show}
          onOpenChange={onShowChange}
          content={() => (
            <div className="w-[200px]">
              <Slider
                className="!m-[0px]"
                min={0}
                max={100}
                step={1}
                marks={{
                  0: " ",
                  25: " ",
                  50: " ",
                  75: " ",
                  100: " ",
                }}
              />
            </div>
          )}
        >
          <Space>
            {type === "limit" && (
              <InputNumber
                placeholder="价格"
                onClick={() => onShowChange(true)}
                size="small"
                className="w-[92px]"
              />
            )}
            <InputNumber
              placeholder="数量"
              onClick={() => onShowChange(true)}
              size="small"
              className="w-[92px]"
            />
          </Space>
        </Popover>
      </Tooltip>
      <div className="p-[4px_6px] cursor-pointer bg-[var(--background14)] rounded-[4px]">
        {buttonText}
      </div>
    </div>
  );
};

const QuickClose: React.FC = () => {
  const [showMarket, setShowMarket] = useState(false);
  const [showLimit, setShowLimit] = useState(false);

  const handleMarketPopoverChange = (visible: boolean) => {
    setShowMarket(visible);
  };

  const handleLimitPopoverChange = (visible: boolean) => {
    setShowLimit(visible);
  };

  return (
    <Tabs
      tabBarGutter={10}
      size="small"
      items={[
        {
          label: <div className="text-[12px] font-[500]">市价</div>,
          key: "market",
          children: (
            <CloseItem
              type="market"
              show={showMarket}
              onShowChange={handleMarketPopoverChange}
              buttonText="市价平"
            />
          ),
        },
        {
          label: <div className="text-[12px] font-[500]">限价</div>,
          key: "limit",
          children: (
            <CloseItem
              type="limit"
              show={showLimit}
              onShowChange={handleLimitPopoverChange}
              buttonText="限价平"
            />
          ),
        },
      ]}
    />
  );
};

export default QuickClose;
