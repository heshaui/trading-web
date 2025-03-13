import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { key } = req.query;
  
  // 打印接收到的请求信息
  console.log('接收到请求:', {
    查询参数: req.query,
    请求方法: req.method,
    请求头: req.headers
  });
  
  try {
    // 需要使用完整的URL（包括协议和主机名）
    const baseUrl = process.env.API_BASE_URL || 'http://ljx.imbit.work/ambit-home-web';
    const fullUrl = `${baseUrl}/home-web/v1/open/userLangPackage/userLangPackageDetail`;
    
    // 打印即将发送的请求信息
    console.log('准备发送请求:', {
      URL: fullUrl,
      数据: { key },
      配置: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    });
    
    // 使用 fetch 发送请求到完整URL
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key }),
    });
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP 错误! 状态: ${response.status}`);
    }
    
    // 解析 JSON 响应
    const data = await response.json();
    
    // 打印响应信息
    console.log('收到响应:', {
      状态码: response.status,
      响应头: Object.fromEntries(response.headers.entries()),
      数据: data
    });
    
    // 返回语言数据
    res.status(200).json(data);
  } catch (error) {
    // 打印详细错误信息
    console.error('获取语言文件失败:', {
      错误消息: error.message,
      错误堆栈: error.stack
    });
    
    res.status(500).json({ 
      data: null, 
      code: 'error',
      message: '获取语言文件失败'
    });
  }
} 