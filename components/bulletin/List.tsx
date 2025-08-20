import { NoData } from "@/components/noData";
import { ConfigProvider, List as AntdList, Spin } from "antd";
import dayjs from "dayjs";

const List = ({
  pagination,
  dataSource,
  handleClick,
  loading,
  setPagination,
}: {
  pagination: { pageNo: number; pageSize: number };
  dataSource: { list: any[]; count: number };
  handleClick: (item: any) => void;
  loading: boolean;
  setPagination: (pagination: { pageNo: number; pageSize: number }) => void;
}) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          List: {
            itemPadding: "20px 0",
          },
        },
        token: {
          colorSplit: "var(--border-color4)",
        },
      }}
    >
      <Spin spinning={loading}>
        <AntdList
          locale={{
            emptyText: <NoData height="35vh" />,
          }}
          pagination={{
            position: "bottom",
            align: "end",
            current: pagination.pageNo || 1,
            pageSize: pagination.pageSize || 5,
            total: dataSource.count || 0,
            showSizeChanger: false, // 同时隐藏切换器（推荐）
            size: "small",
            onChange: (page, pageSize) => {
              setPagination({ pageNo: page, pageSize: pageSize });
            },
          }}
          dataSource={dataSource.list}
          renderItem={(item, index) => (
            <AntdList.Item
              key={index}
              className="cursor-pointer"
              onClick={() => handleClick(item)}
            >
              <AntdList.Item.Meta
                title={
                  <div
                    className={`text-[16px] mb-[10px] font-[500] truncate 
                      ${item.isRead
                        ? "text-[var(--text-color6)]"
                        : "text-[var(--text-color5)]"
                      }
                    `}
                  >
                    {item.title}
                  </div>
                }
                description={
                  <div className="text-[12px] text-[#A4A5AC] truncate">
                    {item?.content
                      ? item.content
                      : dayjs(item.releaseTime).format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                }
              />
            </AntdList.Item>
          )}
        />
      </Spin>
    </ConfigProvider>
  );
};

export default List;
