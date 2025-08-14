import {  Spin } from "antd";
import { DetailsData } from "@/pages/bulletin/details/index";
import dayjs from "dayjs";

const Details = ({ loading, detailsData }: { loading?: boolean, detailsData?: DetailsData }) => {
  return (
    <Spin spinning={loading}>

        {/* 文字标题 */}
        <div className="pb-[20px] border-b border-[#DCDCDC]">
          <div className="mb-[10px] truncate text-[var(--text-color5)] text-[16px] font-[500]">
            {detailsData?.title}
          </div>
          <div className="text-[var(--text-color6)] text-[12px]">
            {dayjs(detailsData?.createTime).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        </div>
        {/* 内容 */}
        <div className="py-[20px]">
          <div dangerouslySetInnerHTML={{ __html: detailsData?.content || "" }} />
        </div>
    </Spin>
  );
};

export default Details;
