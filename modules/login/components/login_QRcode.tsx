import { QRCode } from "antd";
import { useState } from "react";
import { LoginStateEnum, useLoginStateContext, LoginTypeEnum, useLoginTypeContext } from "../providers/LoginStateProvider";
function QrCodeFrom() {
	const { loginState, setLoginState } = useLoginStateContext();
	const { loginType, setLoginType } = useLoginTypeContext();
	const [codeValue, setcodeValue] = useState("https://ant.design/")

	// 当登录类型不为 PHONE 时不渲染组件
	if (loginType !== LoginTypeEnum.QRcode) return null;

	return (
		<>
			{/* <div className="mb-4 text-2xl font-bold xl:text-3xl">
			</div> */}
			<div className="flex w-full flex-col flex-ai-center mt-10">
				<QRCode value={codeValue} size={240} />
				{/* <p className="my-4 text-sm">验证码</p> */}
				<div className="text-center mt-7">
					<p className="tip-color1">请使用IMBIT App首页中的扫码功能</p>
					<p className="tip-color2 mt-3">仅支持1.1.0以上版本</p>
					<p className="mt-10">没有App？扫描上方QRcode下载</p>
				</div>
			</div>
		</>
	);
}

export default QrCodeFrom;
