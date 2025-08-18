import React from "react";
import styles from "../../styles/identity.module.css";
import { Iconify } from "@/components/icon";
import Image from "next/image";
import { useRouter } from "next/router";
// import { identityInfoType } from '@/config/apiConfig';
import { getBenefitValue } from "@/utils/encrypt";
import { Skeleton } from "antd";
import { useTranslation } from "next-i18next";
// 按钮配置接口
interface ButtonConfig {
  title: string;
  onok?: () => void;
  onbind?: () => void;
}
interface textType {
  amountLimit: number;
  coin: string;
  time: number;
}
interface levelBenefitType {
  userId: number;
  id: number;
  levelId: number;
  createTime: number;
  updateTime: number;
  tenantId: string;
  status: number;
  value: string;
  benefitId: number;
  benefitName: string;
  benefitValue: string;
  status0?: number;
  value0?: string;
  params0?: string;
  status1?: number;
  value1?: string;
  params1?: string;
  remark?: string;
}
interface infoType {
  id: number;
  userId: number;
  surname: string;
  firstName: string;
  countryId: number;
  cardType: number;
  cardCode: string;
  cardName: string;
  birthday: string;
  currentLanguage: string;
  firstCheckTime: number;
  currentCheckTime: number;
  authStatus: number;
  frontUrl: string;
  backUrl: string;
  selfieUrl: string;
  createTime: number;
  updateTime: number;
  tenantId: string;
  remark?: string;
}
const NoAuthentication: React.FC<{
  identityInfo: infoType;
  levelBenefit: levelBenefitType[];
}> = ({ identityInfo, levelBenefit }) => {
  // console.log(identityInfo, 111);
  const router = useRouter();
  const { t } = useTranslation(["userCenter"]);
  const goReAuth = (authStatus: number) => {
    localStorage.setItem("identity_authStatus", authStatus.toString());
    router.push(
      `/userCenter/identity/${identityInfo.userId}?authStatus=${authStatus}`
    );
  };
  // const getBenefitValue = (text: string) => {
  //     let text1 = JSON.parse(text);
  //     const amount = Number(text1.amountLimit);
  //     let amountRes = '';
  //     if (!isNaN(amount) && amount > 1000) {
  //         // 去掉末尾三个 0 并添加 'K' 后缀
  //         amountRes=(amount / 1000).toString() + 'K';
  //     }else{
  //         amountRes = amount.toString();
  //     }
  //     return `${amountRes} ${text1.coin} ${text1.time}h`

  // }
  const lableShow = (key: string) => {
    if (key === "cyptocurrency_withdrawal") {
      return t("identity.withdrawal");
    } else if (key === "cyptocurrency_recharge") {
      return t("identity.recharge");
    } else {
      return key || "--";
    }
  };
  return (
    <>
      <div className={`${styles.identity_content} flex-1`}>
        {/* 认证状态-未认证 */}
        {identityInfo && identityInfo?.authStatus === 2 && (
          <div className={`${styles.content_header} `}>
            <Image
              src="/images/userCenter/identity/icon_Identity.svg"
              alt="identity"
              width={120}
              height={54}
              className={`${styles.header_icon}`}
            />
            {/* 1.认证内容 */}

            <div className="flex-1 flex-col justify-between ">
              <div className={`font-18 font-w-500 flex align-center`}>
                <p>
                  {/* 标准身份认证 */}
                  {t("identity.standardAuth.title")}
                </p>
                {/* <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="mingcute:safety-certificate-line" className={`${styles.success_icon} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>已认证</span>
                        </div>
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="mingcute:time-line" className={`${styles.warning_color} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>审核中</span>
                        </div>
                        <div className='font-14  ml-2 flex-x align-center'>
                            <Iconify icon="jam:close-circle" className={`${styles.error_icon} mr-1`} size={20} />
                            <span className={`${styles.tip_color} font-14 font-w-500`}>已驳回</span>
                        </div> */}
                <div className="font-14  ml-2 flex-x align-center">
                  <Iconify
                    icon="mingcute:safe-alert-line"
                    className={`${styles.default_icon} mr-1`}
                    size={20}
                  />
                  <span className={`${styles.default_icon} font-14 font-w-500`}>
                    {t("identity.status.unverified")}
                  </span>
                </div>
              </div>
              {/* 认证提示 */}
              <div className={`font-14 font-w-400 mt-1 ${styles.tip_color}`}>
                <Iconify
                  icon="emojione-monotone:small-blue-diamond"
                  className={`${styles.error_icon}`}
                  size={20}
                />
                {/* 仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险 */}
                {t("identity.standardAuth.unverifiedTip")}
              </div>
              {/* 认证提示 */}
              <div className="mt-6">
                <p className={`font-18 font-w-500 flex align-center`}>
                  {/* 身份认证需要提供一下信息： */}
                  {t("identity.standardAuth.requiredInfo")}
                </p>
                <div className={`flex align-center mt-2`}>
                  <div
                    className={`flex-x-cc ${styles.row_3} ${styles.tip_color}`}
                  >
                    {/* <Image
                      src="/images/userCenter/identity/icon_baseInfo.svg"
                      alt=""
                      width={20}
                      height={20}
                      className="mr-1"
                    /> */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: "4px" }}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M13.3333 2C13.687 2 14.0261 2.14048 14.2762 2.39052C14.5262 2.64057 14.6667 2.97971 14.6667 3.33333V12.6667C14.6667 13.0203 14.5262 13.3594 14.2762 13.6095C14.0261 13.8595 13.687 14 13.3333 14H2.66668C2.31305 14 1.97392 13.8595 1.72387 13.6095C1.47382 13.3594 1.33334 13.0203 1.33334 12.6667V3.33333C1.33334 2.97971 1.47382 2.64057 1.72387 2.39052C1.97392 2.14048 2.31305 2 2.66668 2H13.3333ZM13.3333 3.33333H2.66668V12.6667H13.3333V3.33333ZM11.3333 10C11.5033 10.0002 11.6667 10.0653 11.7903 10.1819C11.9138 10.2985 11.9882 10.458 11.9981 10.6276C12.0081 10.7972 11.9529 10.9643 11.8438 11.0946C11.7348 11.2249 11.5801 11.3086 11.4113 11.3287L11.3333 11.3333H4.66668C4.49676 11.3331 4.33332 11.2681 4.20976 11.1514C4.08621 11.0348 4.01185 10.8754 4.0019 10.7057C3.99194 10.5361 4.04713 10.3691 4.15619 10.2388C4.26525 10.1085 4.41995 10.0247 4.58868 10.0047L4.66668 10H11.3333ZM6.66668 4.66667C7.0203 4.66667 7.35944 4.80714 7.60949 5.05719C7.85953 5.30724 8.00001 5.64638 8.00001 6V7.33333C8.00001 7.68696 7.85953 8.02609 7.60949 8.27614C7.35944 8.52619 7.0203 8.66667 6.66668 8.66667H5.33334C4.97972 8.66667 4.64058 8.52619 4.39053 8.27614C4.14049 8.02609 4.00001 7.68696 4.00001 7.33333V6C4.00001 5.64638 4.14049 5.30724 4.39053 5.05719C4.64058 4.80714 4.97972 4.66667 5.33334 4.66667H6.66668ZM11.3333 7.33333C11.5102 7.33333 11.6797 7.40357 11.8047 7.5286C11.9298 7.65362 12 7.82319 12 8C12 8.17681 11.9298 8.34638 11.8047 8.4714C11.6797 8.59643 11.5102 8.66667 11.3333 8.66667H9.33334C9.15653 8.66667 8.98696 8.59643 8.86194 8.4714C8.73692 8.34638 8.66668 8.17681 8.66668 8C8.66668 7.82319 8.73692 7.65362 8.86194 7.5286C8.98696 7.40357 9.15653 7.33333 9.33334 7.33333H11.3333ZM6.66668 6H5.33334V7.33333H6.66668V6ZM11.3333 4.66667C11.5033 4.66686 11.6667 4.73192 11.7903 4.84857C11.9138 4.96521 11.9882 5.12464 11.9981 5.29426C12.0081 5.46389 11.9529 5.63092 11.8438 5.76122C11.7348 5.89152 11.5801 5.97526 11.4113 5.99533L11.3333 6H9.33334C9.16342 5.99981 8.99999 5.93475 8.87643 5.8181C8.75287 5.70146 8.67852 5.54203 8.66856 5.3724C8.6586 5.20278 8.71379 5.03575 8.82285 4.90545C8.93191 4.77514 9.08661 4.6914 9.25534 4.67133L9.33334 4.66667H11.3333Z"
                        fill="var(--text-color6)"
                      />
                    </svg>

                    <span>
                      {/* 基本信息 */}
                      {t("identity.standardAuth.basicInfo")}
                    </span>
                  </div>
                  <div
                    className={`flex-x-cc ${styles.row_3} ${styles.tip_color} ml-5`}
                  >
                    {/* <Image
                      src="/images/userCenter/identity/icon_baseAuth.svg"
                      alt=""
                      width={20}
                      height={20}
                      className="mr-1"
                    /> */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: "4px" }}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.66668 2.66666C2.31305 2.66666 1.97392 2.80713 1.72387 3.05718C1.47382 3.30723 1.33334 3.64637 1.33334 3.99999V12C1.33334 12.3536 1.47382 12.6927 1.72387 12.9428C1.97392 13.1928 2.31305 13.3333 2.66668 13.3333H13.3333C13.687 13.3333 14.0261 13.1928 14.2762 12.9428C14.5262 12.6927 14.6667 12.3536 14.6667 12V3.99999C14.6667 3.64637 14.5262 3.30723 14.2762 3.05718C14.0261 2.80713 13.687 2.66666 13.3333 2.66666H2.66668ZM2.66668 3.99999H13.3333V12H2.66668V3.99999ZM6.83334 6.49999C6.83334 6.80941 6.71043 7.10616 6.49163 7.32495C6.27284 7.54374 5.9761 7.66666 5.66668 7.66666C5.35726 7.66666 5.06051 7.54374 4.84172 7.32495C4.62293 7.10616 4.50001 6.80941 4.50001 6.49999C4.50001 6.19057 4.62293 5.89382 4.84172 5.67503C5.06051 5.45624 5.35726 5.33332 5.66668 5.33332C5.9761 5.33332 6.27284 5.45624 6.49163 5.67503C6.71043 5.89382 6.83334 6.19057 6.83334 6.49999ZM3.33334 9.66666C3.33334 9.22463 3.50894 8.80071 3.8215 8.48815C4.13406 8.17558 4.55798 7.99999 5.00001 7.99999H6.33334C6.55221 7.99999 6.76894 8.0431 6.97115 8.12686C7.17336 8.21062 7.35709 8.33338 7.51185 8.48815C7.66662 8.64291 7.78938 8.82664 7.87314 9.02885C7.9569 9.23106 8.00001 9.44779 8.00001 9.66666V9.99999C8.00001 10.1768 7.92977 10.3464 7.80475 10.4714C7.67972 10.5964 7.51015 10.6667 7.33334 10.6667C7.15653 10.6667 6.98696 10.5964 6.86194 10.4714C6.73691 10.3464 6.66668 10.1768 6.66668 9.99999V9.66666C6.66668 9.57825 6.63156 9.49347 6.56905 9.43095C6.50653 9.36844 6.42175 9.33332 6.33334 9.33332H5.00001C4.9116 9.33332 4.82682 9.36844 4.76431 9.43095C4.7018 9.49347 4.66668 9.57825 4.66668 9.66666V9.99999C4.66668 10.1768 4.59644 10.3464 4.47141 10.4714C4.34639 10.5964 4.17682 10.6667 4.00001 10.6667C3.8232 10.6667 3.65363 10.5964 3.52861 10.4714C3.40358 10.3464 3.33334 10.1768 3.33334 9.99999V9.66666ZM8.66668 7.33332C8.66668 7.15651 8.73691 6.98694 8.86194 6.86192C8.98696 6.73689 9.15653 6.66666 9.33334 6.66666H10.6667C10.8435 6.66666 11.0131 6.73689 11.1381 6.86192C11.2631 6.98694 11.3333 7.15651 11.3333 7.33332C11.3333 7.51013 11.2631 7.6797 11.1381 7.80473C11.0131 7.92975 10.8435 7.99999 10.6667 7.99999H9.33334C9.15653 7.99999 8.98696 7.92975 8.86194 7.80473C8.73691 7.6797 8.66668 7.51013 8.66668 7.33332ZM9.33334 8.66666C9.15653 8.66666 8.98696 8.73689 8.86194 8.86192C8.73691 8.98694 8.66668 9.15651 8.66668 9.33332C8.66668 9.51013 8.73691 9.6797 8.86194 9.80473C8.98696 9.92975 9.15653 9.99999 9.33334 9.99999H12C12.1768 9.99999 12.3464 9.92975 12.4714 9.80473C12.5964 9.6797 12.6667 9.51013 12.6667 9.33332C12.6667 9.15651 12.5964 8.98694 12.4714 8.86192C12.3464 8.73689 12.1768 8.66666 12 8.66666H9.33334Z"
                        fill="var(--text-color6)"
                      />
                    </svg>

                    <span>
                      {/* 身份认证 */}
                      {t("identity.standardAuth.idVerification")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* 按钮 */}
            <div className={`${styles.btn_box} flex-col align-end justify-end`}>
              <button
                type="button"
                className={`${styles.btn_style} default_btn`}
                onClick={() => goReAuth(identityInfo.authStatus)}
              >
                {/* 去认证 */}
                {t("identity.button.goVerify")}
              </button>
              {/* <button type='button' className={`${styles.btn_style} default_btn`}>审核中</button>
            <button type='button' className={`${styles.btn_style} disabled_btn`}>重新认证</button> */}
            </div>
          </div>
        )}

        {/* 认证状态-重新认证 */}
        {identityInfo && identityInfo?.authStatus === 0 && (
          <div className={`${styles.content_header} `}>
            <Image
              src="/images/userCenter/identity/icon_Identity.svg"
              alt="identity"
              width={120}
              height={54}
              className={`${styles.header_icon}`}
            />
            {/* 1.认证内容 */}
            <div className="flex-1 flex-col justify-center">
              {/* 认证状态 */}
              <div className={`font-18 font-w-500 flex align-center`}>
                <p>
                  {/* 标准身份认证 */}
                  {t("identity.standardAuth.title")}
                </p>
                <div className="font-14  ml-2 flex-x align-center">
                  <Iconify
                    icon="jam:close-circle"
                    className={`${styles.error_icon} mr-1`}
                    size={20}
                  />
                  <span className={`${styles.tip_color} font-14 font-w-500`}>
                    {/* 已驳回 */}
                    {t("identity.status.rejected")}
                  </span>
                </div>
              </div>
              {/* 认证提示 */}
              <div
                className={`font-14 font-w-400 mt-3 ${styles.error_icon} flex align-start`}
              >
                {/* <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                        <span>
                        {t('overview.identityAuth.reVerify')}
                        </span>
                         */}
                {/*                         
                        {identityInfo?.remark ? (<>
                            {identityInfo.remark.includes('&')
                                ? identityInfo.remark.split('&').map((item, index) => (<>
                                    <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />
                                    <span key={item} className={`${index > 0 ? 'mt-1' : ''}`}>
                                        {item.trim()}
                                    </span>
                                </>))
                                : identityInfo.remark
                            }
                        </>) : <div className='flex align-center'>
                            <Iconify icon="emojione-monotone:small-blue-diamond" className={`${styles.error_icon}`} size={20} />--
                        </div>} */}
                {!identityInfo?.remark ? (
                  <div className="flex align-center">
                    <Iconify
                      icon="emojione-monotone:small-blue-diamond"
                      className={`${styles.error_icon}`}
                      size={20}
                    />
                    --
                  </div>
                ) : identityInfo.remark.includes("&") ? (
                  <>
                    <Iconify
                      icon="emojione-monotone:small-blue-diamond"
                      className={`${styles.error_icon}`}
                      size={20}
                    />
                    <span>{identityInfo.remark.split("&")[0]}</span>
                  </>
                ) : (
                  <>
                    <Iconify
                      icon="emojione-monotone:small-blue-diamond"
                      className={`${styles.error_icon}`}
                      size={20}
                    />
                    <span>{identityInfo.remark}</span>
                  </>
                )}
              </div>
            </div>
            {/* 按钮 */}
            <div className={`${styles.btn_box} flex-col align-end justify-end`}>
              <button
                type="button"
                className={`${styles.btn_style} default_btn`}
                onClick={() => goReAuth(identityInfo.authStatus)}
              >
                {/* 重新认证 */}
                {t("identity.button.reVerify")}
              </button>
            </div>
          </div>
        )}
        {/* 认证状态-审核中 */}
        {identityInfo && identityInfo?.authStatus === 3 && (
          <div className={`${styles.content_header} `}>
            <Image
              src="/images/userCenter/identity/icon_Identity.svg"
              alt="identity"
              width={120}
              height={54}
              className={`${styles.header_icon}`}
            />
            {/* 1.认证内容 */}
            <div className="flex-1 flex-col justify-center">
              {/* 认证状态 */}
              <div className={`font-18 font-w-500 flex align-center`}>
                <p>
                  {/* 标准身份认证 */}
                  {t("identity.standardAuth.title")}
                </p>
                <div className="font-14  ml-2 flex-x align-center">
                  <Iconify
                    icon="mingcute:time-line"
                    className={`${styles.warning_color} mr-1`}
                    size={20}
                  />
                  <span className={`${styles.tip_color} font-14 font-w-500`}>
                    {/* 审核中 */}
                    {t("identity.status.reviewing")}
                  </span>
                </div>
              </div>
              {/* 认证提示 */}
              <div className={`font-14 font-w-400 mt-3 ${styles.tip_color}`}>
                <Iconify
                  icon="emojione-monotone:small-blue-diamond"
                  className={`${styles.error_icon}`}
                  size={20}
                />
                {/* 仅需3-5分钟，完成标准身份认证保护您免受欺诈和非法风险 */}
                {t("identity.standardAuth.unverifiedTip")}
              </div>
            </div>
            {/* 按钮 */}
            <div className={`${styles.btn_box} flex-col align-end justify-end`}>
              <button
                type="button"
                className={`${styles.btn_style} disabled_btn`}
                onClick={() => goReAuth(identityInfo.authStatus)}
              >
                {/* 审核中 */}
                {t("identity.button.reviewing")}
              </button>
            </div>
          </div>
        )}

        {/* 2.认证权益 */}
        <div className="mt-6">
          <div className={`font-18 font-w-500 flex align-center `}>
            <Image
              src="/images/userCenter/identity/icon_rights.svg"
              alt=""
              width={24}
              height={24}
              className="mr-1"
            />
            <span>
              {/* 认证权益 */}
              {t("identity.benefits.title")}
            </span>
          </div>
          <ul className="mb-2_5">
            <li
              className={`flex align-center justify-between  mt-2_5 font-12 ${styles.rights_header}`}
            >
              <div className="ml-6 ">
                {/* 服务 */}
                {t("identity.benefits.service")}
              </div>
              <div className="flex-x-cc ">
                {/* 尚未认证 */}
                {t("identity.benefits.unverified")}
              </div>
              <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}>
                {/* 完成标准身份认证后 */}
                {t("identity.benefits.afterVerification")}
              </div>
            </li>
            {levelBenefit &&
              levelBenefit.length > 0 &&
              levelBenefit.map((item: levelBenefitType) => (
                <li
                  key={item.id}
                  className={`flex align-center justify-between mt-2_5 font-14 ${styles.rights_content}`}
                >
                  <div className="ml-6 font-w-500">
                    {lableShow(item.benefitValue)}
                  </div>
                  <div className="flex-x-cc font-w-500">
                    {/* {item.value0 ?
                                   ( <span>{(item.value0 && item.params0) ? getBenefitValue(item.value0) : item.value0}</span>) :
                                    item.status0 === 0 ? <Image src="/images/userCenter/identity/fail.svg" alt='' width={20} height={20} className='' /> :
                                        <Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' />
                                } */}
                    {item.status0 === 0 ? (
                      <Image
                        src="/images/userCenter/identity/fail.svg"
                        alt=""
                        width={20}
                        height={20}
                        className=""
                      />
                    ) : item.value0 ? (
                      <span>
                        {item.value0 && item.params0
                          ? getBenefitValue(item.value0)
                          : item.value0}
                      </span>
                    ) : (
                      <Image
                        src="/images/userCenter/identity/success.svg"
                        alt=""
                        width={20}
                        height={20}
                        className=""
                      />
                    )}
                  </div>
                  {/* <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}>50K USDT每日</div> */}
                  <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}>
                    {/* {item.value1 ?
                                    (<span>{(item.value1 && item.params1) ? getBenefitValue(item.value1) : item.value1}</span>) :
                                    item.status1 === 0 ? <Image src="/images/userCenter/identity/fail.svg" alt='' width={20} height={20} className='' /> :
                                        <Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' />
                                } */}
                    {item.status1 === 0 ? (
                      <Image
                        src="/images/userCenter/identity/fail.svg"
                        alt=""
                        width={20}
                        height={20}
                        className=""
                      />
                    ) : item.value1 ? (
                      <span>
                        {item.value1 && item.params1
                          ? getBenefitValue(item.value1)
                          : item.value1}
                      </span>
                    ) : (
                      <Image
                        src="/images/userCenter/identity/success.svg"
                        alt=""
                        width={20}
                        height={20}
                        className=""
                      />
                    )}
                  </div>
                </li>
                // <li className={`flex align-center justify-between mt-2_5 font-14 ${styles.rights_content}`}>
                //     <div className='ml-6 font-w-500'>加密货币充值</div>
                //     <div className='flex-x-cc font-w-500'>
                //         <Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' />
                //     </div>
                //     <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}><Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' /></div>
                // </li>
                // <li className={`flex align-center justify-between mt-2_5 font-14 ${styles.rights_content}`}>
                //     <div className='ml-6 font-w-500'>C2C交易</div>
                //     <div className='flex-x-cc font-w-500'>
                //         <Image src="/images/userCenter/identity/fail.svg" alt='' width={20} height={20} className='' />
                //     </div>
                //     <div className={`mr-6 flex-x-cc font-w-500 ${styles.row_3}`}><Image src="/images/userCenter/identity/success.svg" alt='' width={20} height={20} className='' /></div>
                // </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default NoAuthentication;
