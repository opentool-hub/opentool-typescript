import { Request, Response, NextFunction } from 'express';

export function checkAuthorization(apiKeys: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 支持大小写不敏感的header名称检查
    const authHeaderRaw = req.headers.authorization || 
                          req.headers.Authorization || 
                          req.headers.AUTHORIZATION;
    
    if (!authHeaderRaw) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    // 处理header可能是数组的情况
    const authHeader = Array.isArray(authHeaderRaw) ? authHeaderRaw[0] : authHeaderRaw;
    
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    // 拒绝空字符串token，即使它在apiKeys数组中
    if (!token || !apiKeys.includes(token)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    next();
  };
}