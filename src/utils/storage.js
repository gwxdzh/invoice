import { defaultData } from '../data/default'

// 客户数据的 key
export const CUSTOMER_KEY = 'invoice_customers'
// 发票数据的 key 
export const INVOICE_KEY = 'invoice_records'
// 游客访问记录的 key
export const GUEST_VISITS_KEY = 'guest_visits'

// 获取系统用户数据
export const getSystemUsers = () => {
  try {
    const userStr = localStorage.getItem('systemUsers')
    return userStr ? JSON.parse(userStr) : defaultData.systemUsers
  } catch (e) {
    console.error('获取用户数据失败:', e)
    return []
  }
}

// 获取客户数据
export const getCustomers = () => {
  try {
    const customerStr = localStorage.getItem('customers')
    return customerStr ? JSON.parse(customerStr) : defaultData.customers
  } catch (e) {
    console.error('获取客户数据失败:', e)
    return []
  }
}

// 保存客户数据
export const saveCustomers = (customers) => {
  try {
    localStorage.setItem('customers', JSON.stringify(customers))
  } catch (e) {
    console.error('保存客户数据失败:', e)
  }
}

// 获取发票数据
export const getInvoices = () => {
  try {
    const invoiceStr = localStorage.getItem('invoices')
    return invoiceStr ? JSON.parse(invoiceStr) : defaultData.invoices
  } catch (e) {
    console.error('获取发票数据失败:', e)
    return []
  }
}

// 保存发票数据
export const saveInvoices = (invoices) => {
  try {
    localStorage.setItem('invoices', JSON.stringify(invoices))
  } catch (e) {
    console.error('保存发票数据失败:', e)
  }
}

// 获取系统日志
export const getSystemLogs = () => {
  try {
    const logStr = localStorage.getItem('system_logs')
    return logStr ? JSON.parse(logStr) : defaultData.systemLogs
  } catch (e) {
    console.error('获取日志数据失败:', e)
    return []
  }
}

// 保存系统日志
export const saveSystemLogs = (logs) => {
  try {
    localStorage.setItem('system_logs', JSON.stringify(logs))
  } catch (e) {
    console.error('保存日志数据失败:', e)
  }
}

// 获取游客访问记录
export const getGuestVisits = () => {
  try {
    const data = localStorage.getItem(GUEST_VISITS_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('获取游客访问记录失败:', e)
    return []
  }
}

// 保存游客访问记录
export const saveGuestVisits = (visits) => {
  try {
    localStorage.setItem(GUEST_VISITS_KEY, JSON.stringify(visits))
  } catch (e) {
    console.error('保存游客访问记录失败:', e)
  }
}

// 添加游客访问记录
export const addGuestVisit = () => {
  const visits = getGuestVisits()
  const newVisit = {
    id: visits.length + 1,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    // 可以添加更多信息，如IP等
  }
  visits.push(newVisit)
  saveGuestVisits(visits)
  return newVisit
} 