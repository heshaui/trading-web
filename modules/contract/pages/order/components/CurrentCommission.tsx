import { Flex, Form, message, Select, Table } from "antd";
import styles from "@/styles/components/Table.module.css";
import { ColumnsType } from "antd/es/table";
import { SvgIcon } from "@/components/icon";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { NoData } from "@/components/noData";
import { getCurrentOrderList } from "@/services/contract";
import dayjs from "dayjs";
import { useWatch } from "antd/es/form/Form";
import appStore from "@/store";
import {  SideEnum, SideMap, Type, TypeMap } from "./type";

const NULL_PLACEHOLDER = "NULL"; // 定义一个特殊字符串代表 null


interface CurrentCommissionColumns {
  symbol: string; // 合约
  pricePrecision: number; // 价格精度
  side: SideEnum; // 方向
  positionType: number; // 仓位类型
  avgPrice: number; // 平均成交价
  tradeFee: number; // 交易手续费
  type: Type; // 订单类型
  mtime: number; // 时间
  volume: number; // 委托数量
  dealVolume: number; // 成交数量
  price: number; // 委托价格
  contractId: number; // 合约ID
  ctime: number; // 创建时间
  contractName: string; // 合约名称
  id: string; // 订单ID
  open: string; // 开仓方向
  status: number; // 状态
}

// 当前委托
const CurrentCommission = ({ activeKey }: { activeKey: string }) => {
  const { t } = useTranslation(["contract"]);
  const [form] = Form.useForm();
  const publicInfo = appStore.getPublicInfo();

  console.log("publicInfo", publicInfo);
  const type = useWatch("type", form);
  const contractId = useWatch("contractId", form);

  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<{
    orderList: any[];
    count: number;
  }>({
    orderList: [],
    count: 0,
  });
  const [pageParams, setPageParams] = useState({
    page: 1,
    limit: 10,
  });
  // 取消订单
  const cancelOrder = (record: any) => {
    console.log("取消订单", record);
  };

  // 获取列表
  const fetchData = useCallback(async () => {
    // 如果参数未定义则不执行请求
    if (type === undefined || contractId === undefined) {
      return;
    }
    // 如果参数为空字符串则设置为 NULL_PLACEHOLDER
    try {
      setTableLoading(true);
      const paramsType = type === NULL_PLACEHOLDER ? "" : type;
      const paramsContractId =
        contractId === NULL_PLACEHOLDER ? "" : contractId;

      const res = await getCurrentOrderList({
        limit: pageParams.limit,
        page: pageParams.page,
        uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        type: paramsType,
        contractId: paramsContractId,
      });
      if (res.code === "0") {
        setDataSource({
          orderList: res.data.orderList,
          count: res.data.count,
        });
      } else {
        message.error(res.msg);
      }
      console.log("res", res);
    } catch (error) {
      console.log("error", error);
    } finally {
      setTableLoading(false);
    }
  }, [type, contractId, pageParams]);
  // 列表项
  const columns: ColumnsType<CurrentCommissionColumns> = [
    // 合约
    {
      title: t("symbol"),
      dataIndex: "symbol",
      key: "symbol",
      render: (_: any, record: CurrentCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.symbol}
          </div>
        );
      },
    },
    // 时间
    {
      title: t("time"),
      dataIndex: "mtime",
      key: "mtime",
      align: "right",
      render: (_: any, record: CurrentCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {dayjs(record.mtime).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        );
      },
    },
    // 订单类型
    {
      title: t("orderType"),
      dataIndex: "type",
      key: "type",
      align: "right",
      render: (_: any, record: CurrentCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {t(TypeMap[record.type])}
          </div>
        );
      },
    },
    // 方向
    {
      title: t("side"),
      dataIndex: "side",
      key: "side",
      render: (_: any, record: CurrentCommissionColumns) => {
        const side = record.side as SideEnum;
        return (
          <div
            className="text-[14px] font-[500]"
            style={{ color: SideMap[side].color }}
          >
            {t(SideMap[side].text)}
          </div>
        );
      },
    },
    // 委托价格
    {
      title: t("orderPrice"),
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (_: any, record: CurrentCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.price || "--"}
          </div>
        );
      },
    },
    // 委托数量
    {
      title: t("orderAmount"),
      dataIndex: "volume",
      key: "volume",
      align: "right",
      render: (_: any, record: CurrentCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.volume || "--"}
          </div>
        );
      },
    },
    // 成交数量
    {
      title: t("filledAmount"),
      dataIndex: "dealVolume",
      key: "dealVolume",
      align: "right",
      render: (_: any, record: CurrentCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.dealVolume || "--"}
          </div>
        );
      },
    },
    // 成交均价
    {
      title: t("avgPrice"),
      dataIndex: "avgPrice",
      key: "avgPrice",
      align: "right",
      render: (_: any, record: CurrentCommissionColumns) => {
        return (
          <div className="text-[14px] text-[var(--text-color5)] font-[500]">
            {record.avgPrice || "--"}
          </div>
        );
      },
    },
    // 只减仓
    // {
    //   title: t("reduceOnly"),
    //   dataIndex: "positionType",
    //   key: "positionType",
    //   align: "right",
    //   render: (_: any, record: CurrentCommissionColumns) => {
    //     return (
    //       <div className="text-[14px] text-[var(--text-color5)] font-[500]">
    //         {record.positionType || "--"}
    //       </div>
    //     );
    //   },
    // },
    // 止盈止损
    // {
    //   title: t("tpsl"),
    //   dataIndex: "stop",
    //   key: "stop",
    //   align: "right",
    //   render: (_: any, record: CurrentCommissionColumns) => {
    //     return (
    //       <div className="text-[14px] text-[var(--text-color5)] font-[500]">
    //         {record.stop || "--"}
    //       </div>
    //     );
    //   },
    // },
    // 操作
    {
      title: <div className="text-[#FF5F1F]">{t("allCancel")}</div>,
      dataIndex: "operation",
      key: "operation",
      render: (_: any, record: CurrentCommissionColumns) => {
        return (
          <SvgIcon
            width={24}
            height={24}
            className="cursor-pointer text-[#FF5F1F]"
            path="M14.28 2C14.6998 2.00011 15.1088 2.13229 15.4493 2.37781C15.7898 2.62333 16.0444 2.96975 16.177 3.368L16.72 5H20C20.2652 5 20.5196 5.10536 20.7071 5.29289C20.8946 5.48043 21 5.73478 21 6C21 6.26522 20.8946 6.51957 20.7071 6.70711C20.5196 6.89464 20.2652 7 20 7L19.997 7.071L19.13 19.214C19.0759 19.9706 18.7372 20.6786 18.182 21.1956C17.6269 21.7125 16.8965 21.9999 16.138 22H7.862C7.10346 21.9999 6.37311 21.7125 5.81797 21.1956C5.26283 20.6786 4.92411 19.9706 4.87 19.214L4.003 7.07C4.00119 7.04671 4.00019 7.02336 4 7C3.73478 7 3.48043 6.89464 3.29289 6.70711C3.10536 6.51957 3 6.26522 3 6C3 5.73478 3.10536 5.48043 3.29289 5.29289C3.48043 5.10536 3.73478 5 4 5H7.28L7.823 3.368C7.9557 2.96959 8.21043 2.62305 8.5511 2.37752C8.89176 2.13198 9.30107 1.9999 9.721 2H14.28ZM17.997 7H6.003L6.865 19.071C6.88295 19.3232 6.99577 19.5592 7.18076 19.7316C7.36574 19.904 7.60916 19.9999 7.862 20H16.138C16.3908 19.9999 16.6343 19.904 16.8192 19.7316C17.0042 19.5592 17.117 19.3232 17.135 19.071L17.997 7ZM10 10C10.2449 10 10.4813 10.09 10.6644 10.2527C10.8474 10.4155 10.9643 10.6397 10.993 10.883L11 11V16C10.9997 16.2549 10.9021 16.5 10.7272 16.6854C10.5522 16.8707 10.313 16.9822 10.0586 16.9972C9.80416 17.0121 9.55362 16.9293 9.35817 16.7657C9.16271 16.6021 9.0371 16.3701 9.007 16.117L9 16V11C9 10.7348 9.10536 10.4804 9.29289 10.2929C9.48043 10.1054 9.73478 10 10 10ZM14 10C14.2652 10 14.5196 10.1054 14.7071 10.2929C14.8946 10.4804 15 10.7348 15 11V16C15 16.2652 14.8946 16.5196 14.7071 16.7071C14.5196 16.8946 14.2652 17 14 17C13.7348 17 13.4804 16.8946 13.2929 16.7071C13.1054 16.5196 13 16.2652 13 16V11C13 10.7348 13.1054 10.4804 13.2929 10.2929C13.4804 10.1054 13.7348 10 14 10ZM14.28 4H9.72L9.387 5H14.613L14.28 4Z"
            onClick={() => cancelOrder(record)}
          />
        );
      },
    },
  ];

  useEffect(() => {
    // 只有当当前标签页是激活状态时才请求数据
    if (activeKey === "1") {
      fetchData();
    }
  }, [activeKey, fetchData]);

  // 返回
  return (
    <div>
      {/* 筛选 */}
      <Form
        form={form}
        className="p-[24px_20px]  border-t-[1px] border-t-[var(--border-color)] h-[100%]"
      >
        <Flex gap={20}>
          {/* 全部合约 */}
          <Form.Item
            name="contractId"
            noStyle
            // initialValue={NULL_PLACEHOLDER}
            initialValue={publicInfo.contractList[0].id}
          >
            <Select
              // allowClear
              value={!contractId ? NULL_PLACEHOLDER : contractId}
              prefix={t("symbol")}
              className="w-[200px] h-[50px]"
              style={{ textAlign: "end" }}
              options={[
                // {
                //   label: t("all"),
                //   value: NULL_PLACEHOLDER,
                // },
                ...publicInfo.contractList.map((item: any) => ({
                  label: item.contractName,
                  value: item.id,
                })),
              ]}
              onChange={(value) => {
                // 当点击 allowClear 或选择"全部"时，设置为 NULL_PLACEHOLDER
                const newValue =
                  value === NULL_PLACEHOLDER || value === undefined
                    ? NULL_PLACEHOLDER
                    : Number(value);
                form.setFieldsValue({
                  contractId: newValue,
                });
              }}
            />
          </Form.Item>
          {/* 全部类型 */}
          <Form.Item name="type" noStyle initialValue={NULL_PLACEHOLDER}>
            <Select
              allowClear
              value={!type ? NULL_PLACEHOLDER : type}
              prefix={t("type")}
              className="w-[200px] h-[50px]"
              style={{ textAlign: "end" }}
              options={[
                // 全部
                {
                  label: t("all"),
                  value: NULL_PLACEHOLDER,
                },
                // 限价单
                {
                  label: t("order.common.limit"),
                  value: Type.LIMIT,
                },
                // 市价单
                {
                  label: t("order.common.market"),
                  value: Type.MARKET,
                },
                // PostOnly
                // {
                //   label: 'PostOnly',
                //   value: Type.POST_ONLY,
                // },
                // // 强制减仓
                // {
                //   label: t("order.common.forceLiquidation"),
                //   value: Type.FORCE_LIQUIDATION,
                // },
                // // 仓位合并
                // {
                //   label: t("order.common.positionMerge"),
                //   value: Type.POSITION_MERGE,
                // },
              ]}
              onChange={(value) => {
                // 当点击 allowClear 或选择"全部"时，设置为 NULL_PLACEHOLDER
                const newValue =
                  value === NULL_PLACEHOLDER || value === undefined
                    ? NULL_PLACEHOLDER
                    : value;
                form.setFieldsValue({
                  type: newValue,
                });
              }}
            />
          </Form.Item>
        </Flex>
      </Form>

      {/* 表格 */}
      <Table
        scroll={{ x: "max-content" }}
        className={styles.table}
        rowKey="id"
        columns={columns}
        dataSource={dataSource.orderList}
        loading={tableLoading}
        pagination={{
          pageSize: pageParams.limit,
          current: pageParams.page,
          total: dataSource.count,
          onChange: (page, pageSize) => {
            setPageParams({
              page,
              limit: pageSize,
            });
          },
        }}
        locale={{ emptyText: <NoData height="45vh" /> }}
      />
    </div>
  );
};

export default CurrentCommission;
