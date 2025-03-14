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

// 缓存上次语言文件的修改时间
let lastModifiedTimestamp: number = 0;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 获取请求中的lastUpdated参数
    const clientLastUpdated = req.query.lastUpdated ? parseInt(req.query.lastUpdated as string, 10) : 0;
    
    // 检查语言文件目录中所有文件的最新修改时间
    const localesDir = path.join(process.cwd(), 'public/locales');
    const currentModifiedTime = await getLatestModificationTime(localesDir);
    
    // 如果是初次加载或强制刷新，则始终返回完整数据
    if (clientLastUpdated === 0) {
      // 更新服务器上缓存的最后修改时间
      lastModifiedTimestamp = currentModifiedTime;
      
      // 返回所有语言文件数据
      const langData = await getAllLangData();
      return res.status(200).json({
        updated: true,
        timestamp: currentModifiedTime,
        data: langData
      });
    }
    
    // 检查是否有更新
    const hasUpdates = currentModifiedTime > clientLastUpdated;
    
    if (hasUpdates) {
      // 有更新，返回更新的语言文件数据
      lastModifiedTimestamp = currentModifiedTime;
      const langData = await getAllLangData();
      return res.status(200).json({
        updated: true,
        timestamp: currentModifiedTime,
        data: langData
      });
    } else {
      // 没有更新，返回简单响应
      return res.status(200).json({
        updated: false,
        timestamp: lastModifiedTimestamp
      });
    }
  } catch (error) {
    console.error('获取语言文件出错:', error);
    return res.status(500).json({ error: '获取语言文件失败' });
  }
}

// 递归获取目录中所有文件的最新修改时间
async function getLatestModificationTime(dir: string): Promise<number> {
  let latestTime = 0;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      const dirLatestTime = await getLatestModificationTime(itemPath);
      latestTime = Math.max(latestTime, dirLatestTime);
    } else if (stats.isFile() && item.endsWith('.json')) {
      latestTime = Math.max(latestTime, stats.mtimeMs);
    }
  }
  
  return latestTime;
}

// 获取所有语言文件数据
async function getAllLangData() {
  // 这里实现读取并返回所有语言文件的逻辑
  // 根据您现有的实现可能需要调整
  const localesDir = path.join(process.cwd(), 'public/locales');
  const languages = fs.readdirSync(localesDir);
  
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