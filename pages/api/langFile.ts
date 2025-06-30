// pages/api/locales.js
import type { NextApiRequest, NextApiResponse } from 'next';

// 语言编码到目录名称的映射
type LangCode = 'zh_CN' | 'zh_HK' | 'en_US' | 'ja_JP' | 'ko_KR' | string;

const langCodeMapping: Record<LangCode, string> = {
  'zh_CN': 'zh',
  'zh_HK': 'hk',
  'en_US': 'en',
  'ja_JP': 'ja',
  'ko_KR': 'ko'
};

// 从外部API获取语言包数据 - 使用POST请求
async function fetchLangPackageFromAPI(req:any) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    const langHeader = req.headers['lang'] || 'en_US';
    
    const headers = {
      'Content-Type': 'application/json',
      'lang': Array.isArray(langHeader) ? langHeader[0] : langHeader,
    };
    
    const response = await fetch(`${baseUrl}/ambit-home-web/home-web/v1/open/userLangPackage/userLangPackageDetail`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      throw new Error(`API响应错误: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API返回的语言包数据:', data);
    return data;
  } catch (error) {
    console.error('从API获取语言包失败:', error);
    throw error;
  }
}

export default async function handler(req:any, res:any) {
  try {
    const langData = await getAllLangData(req);
    return res.status(200).json({
      updated: true,
      data: langData
    });
  } catch (error) {
    console.error('获取语言文件出错:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return res.status(500).json({ error: '获取语言文件失败', message: errorMessage });
  }
}

// 定义语言包结构类型
type LangContent = Record<string, any>;
type LangNamespaces = Record<string, LangContent>;
type LangResult = Record<string, LangNamespaces>;

// 定义文件信息类型
type FileInfo = {
  fileUrl: string;
  langEncode?: LangCode;
  fileName: string;
};

type ProcessedFile = {
  langCode: string;
  namespace: string;
  content: LangContent;
};

// 获取所有语言文件数据
async function getAllLangData(req: NextApiRequest) {
  try {
    const apiResponse = await fetchLangPackageFromAPI(req);
    const defaultLangCode = 'en';
    console.log('apiResponse',apiResponse)
    if (apiResponse && apiResponse.code === '0' ) {
      const result: LangResult = { [defaultLangCode]: {} };
      
      const filePromises = apiResponse.data.map(async (fileInfo: FileInfo) => {
        const { fileUrl, langEncode, fileName } = fileInfo;
        const namespace = fileName.replace('.json', '');
        const langCode = langEncode ? (langCodeMapping[langEncode as LangCode] || langEncode) : defaultLangCode;

        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) throw new Error(`获取文件内容失败: ${fileUrl}`);
        const content = await fileResponse.json();

        return { langCode, namespace, content };
      });

      const files = await Promise.all(filePromises) as ProcessedFile[];
      files.forEach(({ langCode, namespace, content }) => {
        if (!result[langCode]) result[langCode] = {};
        result[langCode][namespace] = content;
      });
      console.log('files',files)
      return result;
    }
    
    console.error('API响应格式错误或没有数据:', apiResponse);
    return {};
  } catch (error) {
    console.error('从API获取所有语言数据失败:', error);
    return {};
  }
}