import { withAssetsLayout } from "@/components/sidebarLayout/AssetsLayout/userAssetsLayout";
import { ConfigProvider, Tabs } from "antd";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import NumberToken from "./numberToken";
import Financial from "./financial";
import styles from "../styles/billDetails.module.css"
const BillDetails = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            horizontalMargin: "0px",
          },
        },
      }}
    >
      <div className="h-[100%]">
        <div className="text-[20px] text-[var(--text-color5)] font-[500] mb-[16px]">
          账单明细
        </div>
        <div className="rounded-[8px] bg-[var(--btncolor7)] h-[100%]">
          <Tabs
            defaultActiveKey="1"
            tabBarStyle={{
              padding: "0px 20px",
              height: "72px",
            }}
            items={[
              {
                key: "1",
                label: "数字货币",
                children: <NumberToken />,
              },
              {
                key: "2",
                label: "理财",
                children: <Financial />,
              },
            ]}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["assets", "common"])),
    },
  };
};
export default withAssetsLayout(BillDetails);
