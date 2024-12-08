const helpContent = {
  // 控制台页面帮助
  dashboard: {
    title: '控制台使用帮助',
    description: '控制台提供系统概览和数据统计功能',
    features: [
      {
        title: '数据统计',
        content: '展示系统中的发票总数、客户总数、本月新增等关键指标'
      },
      {
        title: '图表分析',
        content: '通过图表直观展示发票和客户数据的变化趋势'
      },
      {
        title: '快捷操作',
        content: '提供常用功能的快捷入口，如新增发票、添加客户等'
      }
    ]
  },

  // 发票管理页面帮助
  invoice: {
    title: '发票管理使用帮助',
    description: '提供发票的录入、查询、导出等功能',
    features: [
      {
        title: '发票录入',
        content: '支持手动录入和OCR识别两种方式添加发票，自动关联客户信息'
      },
      {
        title: '智能识别',
        content: '上传发票图片后自动识别发票信息，支持新客户自动添加'
      },
      {
        title: '搜索筛选',
        content: '可按客户名称和日期范围搜索发票，支持多条件组合查询'
      },
      {
        title: '批量导出',
        content: '支持导出Excel表格和打包下载发票图片，可选择导出范围'
      },
      {
        title: '发票预览',
        content: '点击发票图片可放大查看，支持图片下载'
      }
    ]
  },

  // 客户管理页面帮助
  customer: {
    title: '客户管理使用帮助',
    description: '提供客户信息的管理和维护功能',
    features: [
      {
        title: '客户录入',
        content: '手动添加客户信息，包括名称、联系方式、备注等'
      },
      {
        title: '信息编辑',
        content: '支持修改客户信息，自动同步关联的发票记录'
      },
      {
        title: '客户搜索',
        content: '可通过客户名称快速查找客户信息'
      },
      {
        title: '数据导出',
        content: '支持导出客户信息表格，包含完整的客户资料'
      }
    ]
  },

  // 系统用户页面帮助
  systemUser: {
    title: '系统用户管理使用帮助',
    description: '管理系统用户账号和权限配置',
    features: [
      {
        title: '用户管理',
        content: '添加、编辑、删除系统用户，设置用户角色和权限'
      },
      {
        title: '权限配置',
        content: '为用户分配功能权限，包括发票管理、客户管理等权限'
      },
      {
        title: '密码重置',
        content: '支持管理员重置用户密码，确保账号安全'
      },
      {
        title: '状态控制',
        content: '可启用/禁用用户账号，控制用户登录权限'
      }
    ]
  },

  // 系统日志页面帮助
  systemLog: {
    title: '系统日志使用帮助',
    description: '查看和分析系统操作日志',
    features: [
      {
        title: '日志查询',
        content: '支持按类型、操作人、时间范围等条件筛选日志'
      },
      {
        title: '实时监控',
        content: '可开启实时监控模式，自动刷新最新日志'
      },
      {
        title: '日志分析',
        content: '提供图表分析功能，直观展示操作趋势和分布'
      },
      {
        title: '数据导出',
        content: '支持导出日志数据，用于备份或进一步分析'
      },
      {
        title: 'IP定位',
        content: '记录操作IP地址，并显示地理位置信息'
      }
    ]
  }
}

export default helpContent 