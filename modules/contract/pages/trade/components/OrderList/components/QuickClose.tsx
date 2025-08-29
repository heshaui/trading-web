import React, { useState } from "react";
import { Tabs, InputNumber, Tooltip, Popover, Slider, Space } from "antd";
import { Position, QuickCloseParams } from "../hooks";
import { useTranslation } from "react-i18next";

interface CloseItemProps {
  record: Position;
  show: boolean;
  onShowChange: (visible: boolean) => void;
  buttonText: string;
  type: "market" | "limit";
  onQuickClose: (record: Position, params: QuickCloseParams) => void;
}

const CloseItem: React.FC<CloseItemProps> = ({
  record,
  onShowChange,
  buttonText,
  type,
  onQuickClose,
}) => {
  const { t } = useTranslation(["contract"]);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [volume, setVolume] = useState<number | undefined>(undefined);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="flex items-center gap-[4px] flex-wrap text-[12px] font-[500]">
      {type === "limit" && (
        <InputNumber
          placeholder={t("order.positionColumn.price")}
          size="small"
          className="w-[92px]"
          value={price}
          onChange={(value) => setPrice(value ?? undefined)}
          min={0}
        />
      )}
      <Tooltip
        title={`${t("order.positionColumn.quantity")}:${record.canCloseVolume}`}
        open={showTooltip}
      >
        <Popover
          placement="bottom"
          trigger="click"
          open={showPopover}
          onOpenChange={(visible) => {
            setShowPopover(visible);
            setShowTooltip(visible);
          }}
          content={() => (
            <div className="w-[200px]">
              <Slider
                className="!m-[0px]"
                min={0}
                max={record.canCloseVolume}
                step={1}
                marks={{
                  0: " ",
                  25: " ",
                  50: " ",
                  75: " ",
                  100: " ",
                }}
                onChange={(value) => setVolume(value ?? 0)}
              />
            </div>
          )}
        >
          <InputNumber
            placeholder={t("order.positionColumn.quantity")}
            onClick={() => {
              setShowPopover(true);
              setShowTooltip(true);
            }}
            min={0}
            size="small"
            className="w-[92px]"
            value={volume}
            onChange={(value) => setVolume(value ?? undefined)}
          />
        </Popover>
      </Tooltip>
      <div
        className="p-[4px_6px] cursor-pointer bg-[var(--background14)] rounded-[4px]"
        onClick={() => onQuickClose(record, { type, price, volume })}
      >
        {buttonText}
      </div>
    </div>
  );
};

const QuickClose: React.FC<{
  record: Position;
  onQuickClose: (record: Position, params: QuickCloseParams) => void;
}> = ({ record, onQuickClose }) => {
  const [showMarket, setShowMarket] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const { t } = useTranslation(["contract"]);

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
          label: <div className="text-[12px] font-[500]">{t("order.positionColumn.marketTab")}</div>,
          key: "market",
          children: (
            <CloseItem
              record={record}
              type="market"
              show={showMarket}
              onShowChange={handleMarketPopoverChange}
              buttonText={t("order.positionColumn.marketCloseBtn")}
              onQuickClose={onQuickClose}
            />
          ),
        },
        {
          label: <div className="text-[12px] font-[500]">{t("order.positionColumn.limitTab")}</div>,
          key: "limit",
          children: (
            <CloseItem
              record={record}
              type="limit"
              show={showLimit}
              onShowChange={handleLimitPopoverChange}
              buttonText={t("order.positionColumn.limitCloseBtn")}
              onQuickClose={onQuickClose}
            />
          ),
        },
      ]}
    />
  );
};

export default QuickClose;
