import React, { useState } from "react";
import { Tabs, InputNumber, Tooltip, Popover, Slider, Space } from "antd";
import { Position } from "../hooks";

interface CloseItemProps {
  show: boolean;
  onShowChange: (visible: boolean) => void;
  buttonText: string;
  type: "market" | "limit";
  onQuickClose: (type: "market" | "limit", price?: number, volume?: number) => void;
}

const CloseItem: React.FC<CloseItemProps> = ({
  show,
  onShowChange,
  buttonText,
  type,
  onQuickClose,
}) => {

  const [price, setPrice] = useState<number | undefined>(undefined);
  const [volume, setVolume] = useState<number | undefined>(undefined);


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
                value={price}
                onChange={(value) => setPrice(value ?? undefined)}
              />
            )}
            <InputNumber
              placeholder="数量"
              onClick={() => onShowChange(true)}
              size="small"
              className="w-[92px]"
              value={volume}
              onChange={(value) => setVolume(value ?? undefined)}
            />
          </Space>
        </Popover>
      </Tooltip>
      <div className="p-[4px_6px] cursor-pointer bg-[var(--background14)] rounded-[4px]" onClick={() => onQuickClose(type, price, volume)}>
        {buttonText}
      </div>
    </div>
  );
};

const QuickClose: React.FC<{
  onQuickClose: (type: "market" | "limit", price?: number, volume?: number) => void;
}> = ({ onQuickClose }) => {
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
              onQuickClose={onQuickClose}
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
              onQuickClose={onQuickClose}
            />
          ),
        },
      ]}
    />
  );
};

export default QuickClose;
