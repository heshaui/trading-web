import { QRCode } from "antd";

function QrCodeFrom() {
	return (
		<>
			{/* <div className="mb-4 text-2xl font-bold xl:text-3xl">
			</div> */}
			<div className="flex w-full flex-col items-center justify-center mt-5">
				<QRCode value="https://ant.design/" size={300} />
				<p className="my-4 text-sm">验证码</p>
			</div>
		</>
	);
}

export default QrCodeFrom;
