import { encryptWithPublicKey } from "@/utils/jsENcrypy";
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

// 定义单次加密的最大字节长度（根据实际RSA密钥长度调整）
// 例如：2048位RSA密钥可以加密最多245字节
const MAX_ENCRYPT_CHUNK_SIZE = 200; // 保守估计，留出一些余量

/**
 * 将字符串分割成指定大小的块
 * @param str 要分割的字符串
 * @param size 每个块的最大字节大小
 * @returns 分割后的字符串数组
 */
function splitStringIntoChunks(str: string, size: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    let currentSize = 0;
    
    // 遍历字符串中的每个字符
    for (let i = 0; i < str.length; i++) {
        // 获取当前字符的UTF-8编码字节长度
        const char = str[i];
        const charSize = new TextEncoder().encode(char).length;
        
        // 如果添加当前字符会超出块大小，则开始新块
        if (currentSize + charSize > size) {
            chunks.push(currentChunk);
            currentChunk = char;
            currentSize = charSize;
        } else {
            currentChunk += char;
            currentSize += charSize;
        }
    }
    
    // 添加最后一个块
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    
    return chunks;
}

/**
 * 加密数据，支持大数据分段加密
 * @param data 要加密的数据
 * @returns 加密后的数据对象
 */
export const encryptData = async (data: any) => {
    try {
        // 将数据转换为JSON字符串
        const jsonString = JSON.stringify(data);
        
        // 检查数据大小
        const dataBytes = new TextEncoder().encode(jsonString).length;
        
        let encryptedData: string;
        
        if (dataBytes <= MAX_ENCRYPT_CHUNK_SIZE) {
            // 数据大小在限制范围内，直接加密
            encryptedData = await encryptWithPublicKey(jsonString) || "";
        } else {
            // 数据超出大小限制，需要分段加密
            // 1. 分割数据
            const chunks = splitStringIntoChunks(jsonString, MAX_ENCRYPT_CHUNK_SIZE);
            
            // 2. 加密每个分段
            const encryptedChunks = await Promise.all(
                chunks.map(async (chunk) => {
                    const encrypted = await encryptWithPublicKey(chunk) || "";
                    return encrypted;
                })
            );
            
            // 3. 将加密后的分段用冒号拼接成一个字符串
            encryptedData = encryptedChunks.join(':');
        }
        
        // 构建返回对象
        const dataEncrypt = {
            data: encryptedData,
            time: dayjs(new Date().getTime()).valueOf(),
            reqNo: uuidv4(),
        };
        
        return dataEncrypt;
    } catch (error) {
        console.error('Encryption failed:', error);
        return {
            data: "",
            time: dayjs(new Date().getTime()).valueOf(),
            reqNo: uuidv4(),
            error: error instanceof Error ? error.message : 'Unknown encryption error'
        };
    }
};