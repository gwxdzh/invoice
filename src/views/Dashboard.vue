<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-card v-for="item in statData" :key="item.title" class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-title">{{ item.title }}</div>
            <div class="stat-number">{{ item.number }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40" :color="item.color">
              <component :is="item.icon" />
            </el-icon>
          </div>
        </div>
        <div class="stat-footer">
          <span :style="{ color: item.trend > 0 ? '#67C23A' : '#F56C6C' }">
            {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%
          </span>
          较上月
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 发票趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>发票统计</span>
            <el-radio-group v-model="invoiceChartType" size="small">
              <el-radio-button :value="'week'">周</el-radio-button>
              <el-radio-button :value="'month'">月</el-radio-button>
              <el-radio-button :value="'year'">年</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="invoiceChartRef" class="chart"></div>
      </el-card>

      <!-- 客户分布图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>客户分布</span>
          </div>
        </template>
        <div ref="customerChartRef" class="chart"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { Document, User, TrendCharts, DataLine, View } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getCustomers, getInvoices, getGuestVisits } from '../utils/storage'

// 计算统计数据
const statData = computed(() => {
  const customers = getCustomers()
  const invoices = getInvoices()
  const guestVisits = getGuestVisits()
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  // 计算本月新增发票数
  const newInvoicesThisMonth = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date)
    return invoiceDate.getMonth() === thisMonth && 
           invoiceDate.getFullYear() === thisYear
  }).length

  // 计算本月新增客户数
  const newCustomersThisMonth = customers.filter(customer => {
    const customerDate = new Date(customer.createTime)
    return customerDate.getMonth() === thisMonth && 
           customerDate.getFullYear() === thisYear
  }).length

  // 计算上月数据用于计算环比
  const lastMonthInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date)
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const yearOfLastMonth = thisMonth === 0 ? thisYear - 1 : thisYear
    return invoiceDate.getMonth() === lastMonth && 
           invoiceDate.getFullYear() === yearOfLastMonth
  }).length

  const lastMonthCustomers = customers.filter(customer => {
    const customerDate = new Date(customer.createTime)
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const yearOfLastMonth = thisMonth === 0 ? thisYear - 1 : thisYear
    return customerDate.getMonth() === lastMonth && 
           customerDate.getFullYear() === yearOfLastMonth
  }).length

  // 计算本月游客访问数
  const newVisitsThisMonth = guestVisits.filter(visit => {
    const visitDate = new Date(visit.timestamp)
    return visitDate.getMonth() === thisMonth && 
           visitDate.getFullYear() === thisYear
  }).length

  // 计算上月游客访问数用于计算环比
  const lastMonthVisits = guestVisits.filter(visit => {
    const visitDate = new Date(visit.timestamp)
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const yearOfLastMonth = thisMonth === 0 ? thisYear - 1 : thisYear
    return visitDate.getMonth() === lastMonth && 
           visitDate.getFullYear() === yearOfLastMonth
  }).length

  // 计算环比增长率
  const calculateGrowthRate = (current, last) => {
    if (last === 0) return current > 0 ? 100 : 0
    return Number(((current - last) / last * 100).toFixed(1))
  }

  return [
    {
      title: '本月新增发票',
      number: newInvoicesThisMonth,
      trend: calculateGrowthRate(newInvoicesThisMonth, lastMonthInvoices),
      icon: 'Document',
      color: '#409EFF'
    },
    {
      title: '发票总数',
      number: invoices.length,
      trend: calculateGrowthRate(invoices.length, invoices.length - newInvoicesThisMonth),
      icon: 'DataLine',
      color: '#67C23A'
    },
    {
      title: '本月新增客户',
      number: newCustomersThisMonth,
      trend: calculateGrowthRate(newCustomersThisMonth, lastMonthCustomers),
      icon: 'User',
      color: '#E6A23C'
    },
    {
      title: '客户总数',
      number: customers.length,
      trend: calculateGrowthRate(customers.length, customers.length - newCustomersThisMonth),
      icon: 'TrendCharts',
      color: '#F56C6C'
    },
    {
      title: '游客访问统计',
      number: guestVisits.length,
      trend: calculateGrowthRate(newVisitsThisMonth, lastMonthVisits),
      icon: 'View',
      color: '#909399'
    }
  ]
})

// 图表相关
const invoiceChartRef = ref(null)
const customerChartRef = ref(null)
const invoiceChart = ref(null)
const customerChart = ref(null)
const invoiceChartType = ref('month')

// 获取发票数据
const getInvoiceData = () => {
  const invoices = getInvoices()
  const now = new Date()
  
  if (invoiceChartType.value === 'week') {
    // 获取最近7天的数据
    const weekData = Array(7).fill(0)
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    
    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.date)
      const dayDiff = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24))
      if (dayDiff < 7) {
        weekData[6 - dayDiff]++
      }
    })

    return {
      xAxis: weekDays,
      newInvoices: weekData
    }
  } else if (invoiceChartType.value === 'month') {
    // 获取最近12个月的数据
    const monthData = Array(12).fill(0)
    const months = []
    const thisMonth = now.getMonth()
    
    for (let i = 0; i < 12; i++) {
      const month = (thisMonth - i + 12) % 12
      months.unshift(`${month + 1}月`)
    }

    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.date)
      const monthDiff = (now.getFullYear() - invoiceDate.getFullYear()) * 12 + 
                       (now.getMonth() - invoiceDate.getMonth())
      if (monthDiff < 12) {
        monthData[11 - monthDiff]++
      }
    })

    return {
      xAxis: months,
      newInvoices: monthData
    }
  } else {
    // 获取最近5年的数据
    const yearData = Array(5).fill(0)
    const years = []
    const thisYear = now.getFullYear()
    
    for (let i = 0; i < 5; i++) {
      years.unshift(thisYear - i)
    }

    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.date)
      const yearDiff = thisYear - invoiceDate.getFullYear()
      if (yearDiff < 5) {
        yearData[4 - yearDiff]++
      }
    })

    return {
      xAxis: years,
      newInvoices: yearData
    }
  }
}

// 获取游客访问数据
const getGuestVisitData = () => {
  const visits = getGuestVisits()
  const now = new Date()
  
  if (invoiceChartType.value === 'week') {
    // 获取最近7天的数据
    const weekData = Array(7).fill(0)
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    
    visits.forEach(visit => {
      const visitDate = new Date(visit.timestamp)
      const dayDiff = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24))
      if (dayDiff < 7) {
        weekData[6 - dayDiff]++
      }
    })

    return {
      xAxis: weekDays,
      data: weekData
    }
  } else if (invoiceChartType.value === 'month') {
    // 获取最近12个月的数据
    const monthData = Array(12).fill(0)
    const months = []
    const thisMonth = now.getMonth()
    
    for (let i = 0; i < 12; i++) {
      const month = (thisMonth - i + 12) % 12
      months.unshift(`${month + 1}月`)
    }

    visits.forEach(visit => {
      const visitDate = new Date(visit.timestamp)
      const monthDiff = (now.getFullYear() - visitDate.getFullYear()) * 12 + 
                       (now.getMonth() - visitDate.getMonth())
      if (monthDiff < 12) {
        monthData[11 - monthDiff]++
      }
    })

    return {
      xAxis: months,
      data: monthData
    }
  } else {
    // 获取最近5年的数据
    const yearData = Array(5).fill(0)
    const years = []
    const thisYear = now.getFullYear()
    
    for (let i = 0; i < 5; i++) {
      years.unshift(thisYear - i)
    }

    visits.forEach(visit => {
      const visitDate = new Date(visit.timestamp)
      const yearDiff = thisYear - visitDate.getFullYear()
      if (yearDiff < 5) {
        yearData[4 - yearDiff]++
      }
    })

    return {
      xAxis: years,
      data: yearData
    }
  }
}

// 获取客户分布数据
const getCustomerDistribution = () => {
  const customers = getCustomers()
  const distribution = {}
  
  // 根据备注中的关键词来分类
  const keywordMap = {
    '制造': '制造业',
    '服务': '服务业',
    '零售': '零售业',
    '建筑': '建筑业'
  }

  customers.forEach(customer => {
    let classified = false
    for (const [keyword, industry] of Object.entries(keywordMap)) {
      if (customer.remark?.includes(keyword)) {
        distribution[industry] = (distribution[industry] || 0) + 1
        classified = true
        break
      }
    }
    if (!classified) {
      distribution['其他'] = (distribution['其他'] || 0) + 1
    }
  })

  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value
  }))
}

// 初始化发票趋势图
const initInvoiceChart = () => {
  try {
    if (!invoiceChartRef.value) return

    // 销毁现有实例
    if (invoiceChart.value) {
      invoiceChart.value.dispose()
    }

    // 创建新实例
    invoiceChart.value = echarts.init(invoiceChartRef.value)
    
    const data = getInvoiceData()
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['新增发票', '游客访问'],
        top: 10,
        selectedMode: true
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.xAxis,
        axisLine: {
          lineStyle: {
            color: '#909399'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#909399'
          }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '新增发票',
          type: 'line',
          data: data.newInvoices,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: false,
          emphasis: {
            focus: 'series',
            showSymbol: true
          },
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(64,158,255,0.3)'
              },
              {
                offset: 1,
                color: 'rgba(64,158,255,0.1)'
              }
            ])
          }
        },
        {
          name: '游客访问',
          type: 'line',
          data: getGuestVisitData().data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: false,
          emphasis: {
            focus: 'series',
            showSymbol: true
          },
          itemStyle: {
            color: '#909399'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(144,147,153,0.3)'
              },
              {
                offset: 1,
                color: 'rgba(144,147,153,0.1)'
              }
            ])
          }
        }
      ]
    }

    // 设置选项并处理错误
    try {
      invoiceChart.value.setOption(option, true)
    } catch (error) {
      console.error('设置图表选项失败:', error)
    }
  } catch (error) {
    console.error('初始化发票图表失败:', error)
  }
}

// 初始化客户分布图
const initCustomerChart = () => {
  try {
    if (!customerChartRef.value) return

    if (customerChart.value) {
      customerChart.value.dispose()
    }

    customerChart.value = echarts.init(customerChartRef.value)

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '客户分布',
          type: 'pie',
          radius: '50%',
          data: getCustomerDistribution(),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }

    try {
      customerChart.value.setOption(option, true)
    } catch (error) {
      console.error('设置饼图选项失败:', error)
    }
  } catch (error) {
    console.error('初始化客户图表失败:', error)
  }
}

// 组件挂载和卸载
onMounted(() => {
  nextTick(() => {
    initInvoiceChart()
    initCustomerChart()

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  })
})

// 监听图表类型变化
watch(invoiceChartType, () => {
  nextTick(() => {
    initInvoiceChart()
  })
})

// 处理窗口大小变化
const handleResize = () => {
  invoiceChart.value?.resize()
  customerChart.value?.resize()
}

// 组件卸载前清理
onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize)

  // 销毁图表实例
  if (invoiceChart.value) {
    invoiceChart.value.dispose()
  }
  if (customerChart.value) {
    customerChart.value.dispose()
  }
})
</script>

<style scoped lang="less">
.dashboard-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .stat-info {
          .stat-title {
            font-size: 14px;
            color: #909399;
            margin-bottom: 10px;
          }

          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
          }
        }
      }

      .stat-footer {
        font-size: 12px;
        color: #909399;

        span {
          margin-right: 5px;
        }
      }
    }
  }

  .charts-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 20px;

    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart {
        height: 350px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr !important;
  }
}
</style> 