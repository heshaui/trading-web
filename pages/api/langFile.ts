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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 第一步：获取语言文件列表
    const baseUrl = 'http://ljx.imbit.work/ambit-home-web';
    const listUrl = `${baseUrl}/home-web/v1/open/userLangPackage/userLangPackageDetail`;
    
    const listResponse = await fetch(listUrl, {
      method: 'POST',
      headers: {
        'ambit-saas': '2e5bbf22907d4a31992e9641079af195', 
        'Content-Type': 'application/json'
      },
    });
    
    if (!listResponse.ok) {
      throw new Error(`获取语言文件列表失败! 状态: ${listResponse.status}`);
    }
    
    const listData = await listResponse.json();
    console.log('语言文件列表:', listData);
    
    // 如果没有文件信息，直接返回
    if (!listData.data || listData.data.length === 0) {
      return res.status(200).json({
        code: "1",
        message: "未找到语言文件信息",
        data: null
      });
    }
    
    // 第二步：获取所有语言文件并保存
    const publicDir = path.join(process.cwd(), 'public');
    const savedFiles = [];
    const savedContents: Record<string, any> = {};
    
    // 处理每个语言文件
    for (const langFile of listData.data) {
      const fileUrl = langFile.fileUrl;
      const langCode = langFile.langEncode;
      const fileName = langFile.fileName; // 使用原始文件名
      
      console.log(`准备获取语言文件内容: ${langCode} - ${fileUrl}`);
      
      try {
        // 获取文件内容
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
          console.error(`获取语言文件 ${langCode} 内容失败! 状态: ${fileResponse.status}`);
          continue; // 跳过这个文件，继续处理其他文件
        }
        
        const fileContent = await fileResponse.json();
        console.log(`语言文件 ${langCode} 内容获取成功`);
        
        // 确定目标目录
        const dirName = langCodeMapping[langCode] || langCode.split('_')[0].toLowerCase();
        const localesDir = path.join(publicDir, 'locales', dirName);
        
        // 确保目录存在
        if (!fs.existsSync(localesDir)) {
          fs.mkdirSync(localesDir, { recursive: true });
        }
        
        // 使用后端返回的原始文件名
        const filePath = path.join(localesDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2), 'utf8');
        
        console.log(`语言文件 ${langCode} 已成功写入到: ${filePath}`);
        savedFiles.push(filePath);
        savedContents[langCode] = fileContent;
      } catch (error) {
        console.error(`处理语言文件 ${langCode} 时发生错误:`, error);
        // 继续处理其他文件
      }
    }
    
    // 返回成功响应
    res.status(200).json({
      code: "0",
      message: `成功保存 ${savedFiles.length} 个语言文件`,
      meta: listData.data,
      savedFiles: savedFiles,
      contents: savedContents
    });
    
  } catch (error) {
    console.error('语言文件处理失败:', {
      错误消息: error instanceof Error ? error.message : '未知错误',
      错误堆栈: error instanceof Error ? error.stack : '无堆栈信息'
    });
    
    res.status(500).json({ 
      data: null, 
      code: 'error',
      message: '获取或保存语言文件失败'
    });

    // 返回错误响应
    res.status(500).json({ error: '获取语言文件失败' });
  }
} 