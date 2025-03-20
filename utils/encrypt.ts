import { encryptWithPublicKey } from "@/utils/jsENcrypy"; //登录加密
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
// 加密手机号的函数
export function encryptPhoneNumber(phoneNumber?: string | null): string {
    if (!phoneNumber) return "-"
    const length = phoneNumber.length;
    if (length < 7) {
        return '*'.repeat(length - 4) + phoneNumber.slice(-4);
    }
    return phoneNumber.slice(0, 3) + '*'.repeat(length - 7) + phoneNumber.slice(-4);
}

// 加密邮箱号的函数
export function encryptEmail(email?: string | null): string {
    if (!email) return "-"
    const [name, domain] = email.split('@');
    const nameLength = name.length;
    if (nameLength <= 4) {
        return '*'.repeat(nameLength - 2) + name.slice(-2) + '@' + domain;
    }
    return name.slice(0, 2) + '*'.repeat(nameLength - 4) + name.slice(-2) + '@' + domain;
}
// 判断字符串是邮箱还是手机号并进行加密的函数
export function encryptString(input: string | null): string {
    if (!input) return "-"
    // 邮箱正则表达式
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // 手机号正则表达式（简单示例，仅匹配 11 位数字）
    const phoneRegex = /^\d{4,15}$/;
    if (emailRegex.test(input)) {
        return encryptEmail(input);
    } else if (phoneRegex.test(input)) {
        return encryptPhoneNumber(input);
    }
    // 如果既不是邮箱也不是手机号，原样返回
    return input;
}
export function encryptIdCard(idCard: string): string {
    // 检查传入的参数是否为有效的字符串
    if (typeof idCard !== 'string' || idCard.length < 5) {
        return idCard;
    }
    // 提取身份证号的前两位
    const start = idCard.slice(0, 2);
    // 提取身份证号的后三位
    const end = idCard.slice(-3);
    // 生成用于替换中间部分的 * 字符串
    const encryptedPart = '*'.repeat(idCard.length - 5);
    // 拼接前两位、* 字符串和后三位
    return start + encryptedPart + end;
}
export const encryptData = async (data: any) => {
        const dataInfo = await encryptWithPublicKey(JSON.stringify(data)) || ""
        const dataEncrypt = {
            data: dataInfo,
            time: dayjs(new Date().getTime()).valueOf(),
            reqNo: uuidv4()
        }
        return await dataEncrypt
}
export const getBenefitValue = (text: string) => {
    let text1 = JSON.parse(text);
    const amount = Number(text1.amountLimit);
    let amountRes = '';
    if (!isNaN(amount) && amount > 1000) {
        // 去掉末尾三个 0 并添加 'K' 后缀
        amountRes = (amount / 1000).toString() + 'K';
    } else {
        amountRes = amount.toString();
    }
    return `${amountRes} ${text1.coin} ${text1.time}h`
}
