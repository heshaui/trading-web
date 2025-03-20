import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// 语言编码到目录名称的映射
const langCodeMapping: Record<string, string> = {
  'zh_CN': 'zh',
  'zh_TW': 'tw',
  'zh_HK': 'tw',
  'en_US': 'en',
  'ja_JP': 'ja',
  'ko_KR': 'ko'
};

// 从外部API获取语言包数据 - 修改为POST请求
async function fetchLangPackageFromAPI() {
  try {
    const baseUrl = 'https://ljx.imsaas.work';
    const headers = {
      'Content-Type': 'application/json',
      'ambit-saas': '2e5bbf22907d4a31992e9641079af195'
    }
    
   
    // 修改为POST请求
    const response = await fetch(`${baseUrl}/ambit-home-web/home-web/v1/open/userLangPackage/userLangPackageDetail`, {
      method: 'POST',
      headers: headers,
      // 如果API需要请求体，可以添加body参数
      body: JSON.stringify({
        // 根据API文档添加所需参数
      })
    });
    
    if (!response.ok) {
      throw new Error(`API响应错误: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('data', data);
    return data;
  } catch (error) {
    console.error('从API获取语言包失败:', error);
    throw error;
  }
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {



    // 直接获取语言数据
    const langData = await getAllLangData();
    
    // 始终返回完整数据
    return res.status(200).json({
      updated: true,
      data: langData
    });
  } catch (error) {
    console.error('获取语言文件出错:', error);
    // 增强错误响应，提供更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return res.status(500).json({ error: '获取语言文件失败', message: errorMessage });
  }
}

// 获取所有语言文件数据 - 修改为从API获取实际文件内容，并保存到本地
async function getAllLangData() {
  try {
    // 首先尝试从API获取语言文件列表
    const apiResponse = await fetchLangPackageFromAPI();
    
    if (apiResponse && apiResponse.code === '0' && Array.isArray(apiResponse.data)) {
      console.log('成功从API获取语言文件列表');
      
      // 创建结果对象
      const result: Record<string, Record<string, any>> = {};
      
      // 处理每个语言文件
      for (const fileInfo of apiResponse.data) {
        const { fileUrl, langEncode, fileName } = fileInfo;
        const namespace = fileName.replace('.json', '');
        
        // 获取实际文件内容
        try {
          const fileResponse = await fetch(fileUrl);
          if (!fileResponse.ok) {
            throw new Error(`获取文件内容失败: ${fileUrl}`);
          }
          
          const fileContent = await fileResponse.json();
          
          // 将语言编码映射到对应的目录名
          const langCode = langCodeMapping[langEncode] || langEncode;
          
          // 初始化语言条目
          if (!result[langCode]) {
            result[langCode] = {};
          }
          
          // 添加命名空间数据
          result[langCode][namespace] = fileContent;
          
          // 保存到本地文件系统
          const localesDir = path.join(process.cwd(), 'public/locales');
          const langDir = path.join(localesDir, langCode);
          
          // 确保语言目录存在
          if (!fs.existsSync(langDir)) {
            fs.mkdirSync(langDir, { recursive: true });
          }
          
          // 写入文件
          const filePath = path.join(langDir, `${namespace}.json`);
          fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2), 'utf8');
          console.log(`已保存语言文件: ${filePath}`);
          
        } catch (fileError) {
          console.error(`无法获取或保存语言文件 ${fileUrl}:`, fileError);
        }
      }
      
      // 如果至少有一个语言文件被成功处理，则返回结果
      if (Object.keys(result).length > 0) {
        return result;
      }
    }
  } catch (error) {
    console.warn('从API获取所有语言数据失败，将从文件加载:', error);
    // API获取失败，继续从文件获取
  }
  
  // 从本地文件获取数据的备用逻辑
  const localesDir = path.join(process.cwd(), 'public/locales');
  const languages = fs.readdirSync(localesDir);
  console.log('languages',languages)
  const result: Record<string, Record<string, any>> = {};
  
  for (const lang of languages) {
    const langPath = path.join(localesDir, lang);
    if (fs.statSync(langPath).isDirectory()) {
      result[lang] = {};
      
      const namespaceFiles = fs.readdirSync(langPath).filter(file => file.endsWith('.json'));
      for (const file of namespaceFiles) {
        const namespace = file.replace('.json', '');
        const filePath = path.join(langPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        result[lang][namespace] = JSON.parse(content);
      }
    }
  }
  
  return result;
} 