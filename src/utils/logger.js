import { getIpInfo } from './ip'

// 日志类型枚举
export const LogType = {
  ACCESS: 'access',    // 数据访问
  OPERATION: 'operation', // 操作行为
  SECURITY: 'security'   // 安全相关
}

// 日志记录函数
export const logAction = async (type, action, details) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const ipInfo = await getIpInfo()
    const log = {
      type,
      action,
      userId: user.username || 'unknown',
      timestamp: new Date().toISOString(),
      details: details || {},
      userAgent: navigator.userAgent,
      ip: ipInfo.ip,
      location: ipInfo.location,
      isp: ipInfo.isp
    }

    // 获取现有日志
    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]')
    logs.push(log)
    
    // 只保留最近1000条日志
    if (logs.length > 1000) {
      logs.shift()
    }
    
    localStorage.setItem('system_logs', JSON.stringify(logs))
    return log
  } catch (error) {
    console.error('记录日志失败:', error)
    return null
  }
} 