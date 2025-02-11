// api前缀
export enum api_prefix {
	admin = "/admin-api",
	user = "/user-api",
	open = "/api",
}
// api模块
export enum MODULE_NAME {
	OPEN = "open", //配置
	USER = "user", //用户相关模块
	ADMIN = "admin", //用户后台相关模块
	BUSINESS = "business", //业务模块
	VERIFICATION_STATISTICS = "verification_statistics", //验证记录统计模块
	VERIFICATION_RECORD = "verification_record", //验证记录统计模块
	USER_VERSION = "user_version", //用户版本模块
	VALID = "valid", //验证码
}

// 常见邮箱后缀
export const emailSuffixes = [
	'gmail.com',
	'yahoo.com',
	'hotmail.com',
	'outlook.com',
	'163.com',
	'qq.com',
	'sina.com',
	// 企业相关
	'ibm.com',
	'microsoft.com',
	'apple.com',
	
	'mail.ru', // 俄罗斯常用
	'yandex.com', // 俄罗斯
	'live.com', // 微软旗下，使用量较outlook、hotmail少
	'icloud.com', // 苹果用户用于iCloud邮件服务
	'gmx.com', // 欧洲部分地区使用
	'web.de', // 德国及部分欧洲地区
	't-online.de', // 德国
	'free.fr', // 法国免费邮箱常用后缀
	'laposte.net', // 法国邮政旗下邮箱后缀
	'virgilio.it', // 意大利
	'bol.com.br', // 巴西部分用户使用
	'uol.com.br', // 巴西
	'bigpond.com', // 澳大利亚电信旗下，部分澳大利亚用户使用
	'sfr.fr', // 法国电信旗下，部分法国用户使用
	'orange.fr', // 法国电信旗下，部分法国用户使用
	'ntt.net', // 日本电信旗下，部分日本用户使用
	'docomo.ne.jp', // 日本通信运营商旗下，部分日本用户使用
	'belnet.be', // 比利时教育和科研网络相关邮箱后缀
	'gmail.de', // 德国地区使用的谷歌邮箱后缀变体
	'gmail.fr', // 法国地区使用的谷歌邮箱后缀变体
	'yahoo.co.jp', // 日本雅虎邮箱后缀
	'yahoo.co.uk', // 英国雅虎邮箱后缀
	'outlook.de', // 德国地区使用的Outlook邮箱后缀变体
	'outlook.fr', // 法国地区使用的Outlook邮箱后缀变体
	'hotmail.de', // 德国地区使用的Hotmail邮箱后缀变体
	'hotmail.fr' // 法国地区使用的Hotmail邮箱后缀变体
];

export const areaCodeOptionList = [
	{
		value: "1",
		label: "+1",
		desc: ""
	},
	{
		value: "81",
		label: "+81",
	},
	{
		value: "82",
		label: "+82",
	},
	{
		value: "86",
		label: "+86",
	},
	{
		value: "44",
		label: "+44",
	},
	{
		value: "33",
		label: "+33",
	},
	{
		value: "49",
		label: "+49",
	},
	{
		value: "7",
		label: "+7",
	},
	{
		value: "91",
		label: "+91",
	},
	{
		value: "61",
		label: "+61",
	},
	{
		value: "55",
		label: "+55",
	},
	{
		value: "39",
		label: "+39",
	},
	{
		value: "34",
		label: "+34",
	},
	{
		value: "30",
		label: "+30",
	},
	{
		value: "31",
		label: "+31",
	},
	{
		value: "32",
		label: "+32",
	},
	{
		value: "351",
		label: "+351",
	},
	{
		value: "352",
		label: "+352",
	},
	{
		value: "353",
		label: "+353",
	},
	{
		value: "354",
		label: "+354",
	},
	{
		value: "355",
		label: "+355",
	},
	{
		value: "356",
		label: "+356",
	},
	{
		value: "357",
		label: "+357",
	},
	{
		value: "358",
		label: "+358",
	},
	{
		value: "359",
		label: "+359",
	},
	{
		value: "36",
		label: "+36",
	},
	{
		value: "370",
		label: "+370",
	},
	{
		value: "371",
		label: "+371",
	},
	{
		value: "372",
		label: "+372",
	},
	{
		value: "373",
		label: "373",
	},
	{
		value: "374",
		label: "+374",
	},
	{
		value: "375",
		label: "+375",
	},
	{
		value: "376",
		label: "+376",
	},
	{
		value: "377",
		label: "+377",
	},
	{
		value: "378",
		label: "+378",
	},
	{
		value: "379",
		label: "+379",
	},
	{
		value: "380",
		label: "+380",
	},
	{
		value: "381",
		label: "+381",
	},
	{
		value: "382",
		label: "+382",
	},
	{
		value: "383",
		label: "+383",
	},
	{
		value: "385",
		label: "+385",
	},
	{
		value: "386",
		label: "+386",
	},
	{
		value: "387",
		label: "+387",
	},
	{
		value: "389",
		label: "+389",
	},
	{
		value: "40",
		label: "+40",
	},
	{
		value: "41",
		label: "+41",
	},
	{
		value: "420",
		label: "+420",
	},
	{
		value: "421",
		label: "+421",
	},
	{
		value: "423",
		label: "+423",
	},
	{
		value: "43",
		label: "+43",
	},
	{
		value: "44",
		label: "+44",
	},
	{
		value: "45",
		label: "+45",
	},
	{
		value: "46",
		label: "+46",
	},
	{
		value: "47",
		label: "+47",
	},
	{
		value: "48",
		label: "+48",
	},
	{
		value: "49",
		label: "+49",
	},
	{
		value: "500",
		label: "+500",
	},
	{
		value: "501",
		label: "+501",
	},
	{
		value: "502",
		label: "+502",
	},
	{
		value: "503",
		label: "+503",
	},
	{
		value: "504",
		label: "+504",
	},
	{
		value: "505",
		label: "+505",
	},
	{
		value: "506",
		label: "+506",
	},
	{
		value: "507",
		label: "+507",
	},
	{
		value: "508",
		label: "+508",
	},
	{
		value: "509",
		label: "+509",
	},
	{
		value: "51",
		label: "+51",
	},
	{
		value: "52",
		label: "+52",
	},
	{
		value: "53",
		label: "+53",
	},
	{
		value: "54",
		label: "+54",
	},
	{
		value: "55",
		label: "+55",
	},
	{
		value: "56",
		label: "+56",
	},
	{
		value: "57",
		label: "+57",
	},
	{
		value: "58",
		label: "+58",
	},
	{
		value: "590",
		label: "+590",
	},
	{
		value: "591",
		label: "+591",
	},
	{
		value: "592",
		label: "+592",
	},
	{
		value: "593",
		label: "+593",
	},
	{
		value: "594",
		label: "+594",
	},
	{
		value: "595",
		label: "+595",
	},
	{
		value: "596",
		label: "+596",
	},
	{
		value: "597",
		label: "+597",
	},
	{
		value: "598",
		label: "+598",
	},
	{
		value: "599",
		label: "+599",
	},
	{
		value: "60",
		label: "+60",
	},
	{
		value: "61",
		label: "+61",
	},
	{
		value: "62",
		label: "+62",
	},
	{
		value: "63",
		label: "+63",
	},
	{
		value: "64",
		label: "+64",
	},
	{
		value: "65",
		label: "+65",
	},
	{
		value: "66",
		label: "+66",
	},
	{
		value: "670",
		label: "+670",
	},
	{
		value: "672",
		label: "+672",
	},
	{
		value: "673",
		label: "+673",
	},
	{
		value: "674",
		label: "+674",
	},
	{
		value: "675",
		label: "+675",
	},
	{
		value: "676",
		label: "+676",
	},
	{
		value: "677",
		label: "+677",
	},
	{
		value: "678",
		label: "+678",
	},
	{
		value: "679",
		label: "+679",
	},
	{
		value: "680",
		label: "+680",
	},
	{
		value: "681",
		label: "+681",
	},
	{
		value: "682",
		label: "+682",
	},
	{
		value: "683",
		label: "+683",
	},
	{
		value: "685",
		label: "+685",
	},
	{
		value: "686",
		label: "+686",
	},
	{
		value: "687",
		label: "+687",
	},
	{
		value: "688",
		label: "+688",
	},
	{
		value: "689",
		label: "+689",
	},
	{
		value: "690",
		label: "+690",
	},
	{
		value: "691",
		label: "+691",
	},
	{
		value: "692",
		label: "+692",
	},
	{
		value: "7",
		label: "+7",
	},
	{
		value: "8",
		label: "+8",
	},
	// {
	// 	value: "81",
	// 	label: "+81",
	// },
	// {
	// 	value: "82",
	// 	label: "+82",
	// },
	{
		value: "84",
		label: "+84",
	},
	{
		value: "850",
		label: "+850",
	},
	{
		value: "852",
		label: "+852",
	},
	{
		value: "853",
		label: "+853",
	},
	{
		value: "855",
		label: "+855",
	},
	{
		value: "856",
		label: "+856",
	},
	// {
	// 	value: "86",
	// 	label: "+86",
	// },
	{
		value: "880",
		label: "+880",
	},
	{
		value: "886",
		label: "+886",
	},
	{
		value: "90",
		label: "+90",
	},
	{
		value: "91",
		label: "+91",
	},
	{
		value: "92",
		label: "+92",
	},
	{
		value: "93",
		label: "+93",
	},
	{
		value: "94",
		label: "+94",
	},
	{
		value: "95",
		label: "+95",
	},
	{
		value: "960",
		label: "+960",
	},
	{
		value: "961",
		label: "+961",
	},
	{
		value: "962",
		label: "+962",
	},
	{
		value: "963",
		label: "+963",
	},
	{
		value: "964",
		label: "+964",
	},
	{
		value: "965",
		label: "+965",
	},
	{
		value: "966",
		label: "+966",
	},
	{
		value: "967",
		label: "+967",
	},
	{
		value: "968",
		label: "+968",
	},
	{
		value: "970",
		label: "+970",
	},
	{
		value: "971",
		label: "+971",
	},
	{
		value: "972",
		label: "+972",
	},
	{
		value: "973",
		label: "+973",
	},
	{
		value: "974",
		label: "+974",
	},
	{
		value: "975",
		label: "+975",
	},
	{
		value: "976",
		label: "+976",
	},
	{
		value: "977",
		label: "+977",
	},
	{
		value: "98",
		label: "+98",
	},
	{
		value: "992",
		label: "+992",
	},
	{
		value: "993",
		label: "+993",
	},
	{
		value: "994",
		label: "+994",
	},
	{
		value: "995",
		label: "+995",
	},
	{
		value: "996",
		label: "+996",
	},
	{
		value: "998",
		label: "+998",
	},
];
