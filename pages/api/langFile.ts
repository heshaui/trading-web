// pages/api/locales.js
import type { NextApiRequest, NextApiResponse } from 'next';

// 语言编码到目录名称的映射
const langCodeMapping = {
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
      'lang': Array.isArray(langHeader) ? langHeader[0] : langHeader
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

export default async function handler(req, res) {
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

// 获取所有语言文件数据
async function getAllLangData(req) {
  try {
    const apiResponse = await fetchLangPackageFromAPI(req);
    
    if (apiResponse && apiResponse.code === '0' && Array.isArray(apiResponse.data)) {
      console.log('成功从API获取语言文件列表，共', apiResponse.data.length, '个文件');
      
      const defaultLangCode = 'en';
      const result = { [defaultLangCode]: {} };
      
      const filePromises = apiResponse.data.map(async (fileInfo: any) => {
        const { fileUrl, langEncode, fileName } = fileInfo;
        const namespace = fileName.replace('.json', '');
        const langCode = langEncode ? (langCodeMapping[langEncode] || langEncode) : defaultLangCode;

        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) throw new Error(`获取文件内容失败: ${fileUrl}`);
        const content = await fileResponse.json();

        return { langCode, namespace, content };
      });

      const files = await Promise.all(filePromises);
      files.forEach(({ langCode, namespace, content }) => {
        if (!result[langCode]) result[langCode] = {};
        result[langCode][namespace] = content;
      });

      return result;
    }
    
    console.error('API响应格式错误或没有数据:', apiResponse);
    return {};
  } catch (error) {
    console.error('从API获取所有语言数据失败:', error);
    return {};
  }
}