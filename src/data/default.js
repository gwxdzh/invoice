export const defaultData = {
  // 系统用户数据
  systemUsers: [
    {
      id: 1,
      username: 'admin',
      password: '123456',
      role: 'admin',
      permissions: ['invoice', 'customer', 'system', 'logs'],
      phone: '13800138000',
      lastLogin: '2024-01-20 10:00:00',
      status: 1,
      remark: '系统管理员，拥有所有权限'
    },
    {
      id: 2,
      username: 'user',
      password: '123456',
      role: 'user',
      permissions: ['invoice'],
      phone: '13800138001',
      lastLogin: '2024-01-19 15:30:00',
      status: 1,
      remark: '普通用户，具有发票查询权限'
    }
  ],

  // 客户数据
  customers: [
    {
      id: 1,
      name: "示例客户",
      phone: "15270389730",
      remark: "示例数据",
      createTime: "2024/1/8"
    },
    {
      id: 2,
      name: "湖南国中医药有限公司",
      phone: "-",
      remark: "通过发票识别添加",
      createTime: "2024/12/8"
    },
    {
      id: 3,
      name: "测试",
      phone: "-",
      remark: "通过发票识别添加",
      createTime: "2024/12/8"
    },
    {
      id: 4,
      name: "闻涛制药有限公司",
      phone: "-",
      remark: "通过发票识别添加",
      createTime: "2024/12/8"
    },
    {
      id: 5,
      name: "深圳信佛家商务咨询有限公司",
      phone: "-",
      remark: "通过发票识别添加",
      createTime: "2024/12/8"
    }
  ],

  // 发票数据
  invoices: [
    {
      id: 1,
      name: '示例客户',
      invoice: '', // 这里可以放一个默认的发票图片base64
      date: '2024-01-08'
    }
  ],

  // 系统日志
  systemLogs: [
    {
      type: 'access',
      action: 'view_invoice',
      userId: 'admin',
      timestamp: '2024-12-08T01:21:09.529Z',
      details: {
        invoiceId: 1
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      ip: '117.171.195.163',
      location: '中国江西省吉安市',
      isp: '中国移动'
    },
    {
      type: 'operation',
      action: 'delete_invoice',
      userId: 'admin',
      timestamp: '2024-12-08T01:21:15.204Z',
      details: {
        originalInvoiceId: 1,
        customerName: '示例客户',
        date: '2024-01-08',
        operationResult: '删除发票成功，已重新排序ID'
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      ip: '117.171.195.163',
      location: '中国江西省吉安市',
      isp: '中国移动'
    },
    {
      type: 'operation',
      action: 'add_invoice',
      userId: 'admin',
      timestamp: '2024-12-08T01:21:38.278Z',
      details: {
        invoiceId: 1,
        customerName: '湖南国中医药有限公司',
        date: '2024-12-08'
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      ip: '117.171.195.163',
      location: '中国江西省吉安市',
      isp: '中国移动'
    }
  ]
} 