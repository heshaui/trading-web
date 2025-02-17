// 加密手机号的函数
export function encryptPhoneNumber(phoneNumber: string): string {
    console.log(111);
    
    const length = phoneNumber.length;
    if (length < 7) {
        return '*'.repeat(length - 4) + phoneNumber.slice(-4);
    }
    return phoneNumber.slice(0, 3) + '*'.repeat(length - 7) + phoneNumber.slice(-4);
}

// 加密邮箱号的函数
export function encryptEmail(email: string): string {
    console.log(222);

    const [name, domain] = email.split('@');
    const nameLength = name.length;
    if (nameLength <= 4) {
        return '*'.repeat(nameLength - 2) + name.slice(-2) + '@' + domain;
    }
    return name.slice(0, 2) + '*'.repeat(nameLength - 4) + name.slice(-2) + '@' + domain;
}
// 判断字符串是邮箱还是手机号并进行加密的函数
export function encryptString(input: string): string {
    // 邮箱正则表达式
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // 手机号正则表达式（简单示例，仅匹配 11 位数字）
    const phoneRegex = /^\d{11}$/;
    if (emailRegex.test(input)) {
        return encryptEmail(input);
    } else if (phoneRegex.test(input)) {
        return encryptPhoneNumber(input);
    }
    // 如果既不是邮箱也不是手机号，原样返回
    return input;
}