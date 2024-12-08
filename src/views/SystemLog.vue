<template>
  <div class="log-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-switch
        v-model="realtime"
        active-text="实时监控"
        :loading="realtimeLoading"
      />
      <div class="toolbar-right">
        <el-upload
          class="upload-demo"
          accept=".json"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleRestore"
        >
          <el-button type="success">
            <el-icon><Upload /></el-icon>
            恢复日志
          </el-button>
        </el-upload>
        <el-button type="warning" @click="handleBackup">
          <el-icon><Upload /></el-icon>
          备份日志
        </el-button>
        <el-button type="primary" @click="showAnalysis">
          <el-icon><TrendCharts /></el-icon>
          日志分析
        </el-button>
        <el-popconfirm
          title="确定要清理日志吗？此操作不可恢复"
          confirm-button-text="确定清理"
          cancel-button-text="取消"
          @confirm="handleClear"
        >
          <template #reference>
            <el-button type="danger">
              <el-icon><Delete /></el-icon>
              清理日志
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="日志类型">
          <el-select v-model="searchForm.type" clearable placeholder="选择日志类型">
            <el-option
              v-for="(label, value) in logTypeLabels"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="searchForm.userId" clearable placeholder="输入操作人"/>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出日志
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 日志表格 -->
    <el-table
      :data="paginatedLogs"
      style="width: 100%"
      :border="true"
      :max-height="tableHeight"
    >
      <el-table-column prop="timestamp" label="时间" width="180" sortable>
        <template #default="scope">
          {{ formatDate(scope.row.timestamp) }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="getLogTypeStyle(scope.row.type)">
            {{ logTypeLabels[scope.row.type] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="userId" label="操作人" width="120"/>
      <el-table-column prop="action" label="操作" width="150">
        <template #default="scope">
          {{ actionLabels[scope.row.action] || scope.row.action }}
        </template>
      </el-table-column>
      <el-table-column prop="details" label="详细信息">
        <template #default="scope">
          <el-button 
            link 
            type="primary" 
            @click="showDetails(scope.row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="userAgent" label="客户端信息" show-overflow-tooltip/>
      <el-table-column label="IP信息" width="200">
        <template #default="scope">
          <el-button 
            link 
            type="primary" 
            @click="showIpInfo(scope.row)"
          >
            {{ scope.row.ip }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredLogs.length"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailsVisible"
      title="日志详情"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item 
          v-for="(value, key) in selectedLog.details"
          :key="key"
          :label="key"
        >
          {{ value }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 日志分析对话框 -->
    <el-dialog
      v-model="analysisVisible"
      title="日志分析"
      width="800px"
    >
      <div class="analysis-container">
        <!-- 统计卡片 -->
        <div class="stat-cards">
          <el-card v-for="stat in statistics" :key="stat.title" shadow="hover">
            <div class="stat-content">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-number">{{ stat.value }}</div>
            </div>
          </el-card>
        </div>
        
        <!-- 趋势图表 -->
        <el-card class="trend-chart">
          <template #header>
            <div class="chart-header">
              <span>操作趋势</span>
              <el-radio-group v-model="chartTimeRange" size="small" @change="updateChart">
                <el-radio-button :value="'day'">今日</el-radio-button>
                <el-radio-button :value="'week'">本周</el-radio-button>
                <el-radio-button :value="'month'">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="chartRef" style="height: 300px;"></div>
        </el-card>
        
        <!-- 类型分布 -->
        <el-card class="type-chart">
          <template #header>
            <div class="chart-header">
              <span>日志类型分布</span>
            </div>
          </template>
          <div ref="pieChartRef" style="height: 300px;"></div>
        </el-card>
      </div>
    </el-dialog>

    <!-- IP信息对话框 -->
    <el-dialog
      v-model="ipInfoVisible"
      title="IP地址详情"
      width="400px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="IP地址">
          {{ selectedIp.ip }}
        </el-descriptions-item>
        <el-descriptions-item label="地理位置">
          {{ selectedIp.location }}
        </el-descriptions-item>
        <el-descriptions-item label="运营商">
          {{ selectedIp.isp }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { Search, Refresh, Download, Upload, Delete, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { logAction, LogType } from '../utils/logger'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'

const router = useRouter()

// 日志类型标签
const logTypeLabels = {
  access: '访问日志',
  operation: '操作日志',
  security: '安全日志'
}

// 操作类型标签
const actionLabels = {
  add_invoice: '添加发票',
  delete_invoice: '删除发票',
  view_invoice: '查看发票',
  export_invoice: '导出发票',
  backup_logs: '备份日志',
  restore_logs: '恢复日志',
  clear_logs: '清理日志',
  export_logs: '导出日志',
  export_start: '开始导出',
  export_success: '导出成功',
  export_failed: '导出失败',
  duplicate_invoice_attempt: '重复添加发票'
}

// 日志类型样式
const getLogTypeStyle = (type) => {
  const styles = {
    access: 'info',
    operation: 'success',
    security: 'warning'
  }
  return styles[type] || 'info'
}

// 搜索表单
const searchForm = ref({
  type: '',
  userId: '',
  timeRange: []
})

// 表格高度
const tableHeight = ref(window.innerHeight - 200)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 获取日志数据
const logs = ref([])
const loadLogs = () => {
  try {
    const storedLogs = JSON.parse(localStorage.getItem('system_logs') || '[]')
    logs.value = storedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  } catch (error) {
    console.error('加载日志失败:', error)
    ElMessage.error('加载日志失败')
  }
}

// 过滤日志
const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const typeMatch = !searchForm.value.type || log.type === searchForm.value.type
    const userMatch = !searchForm.value.userId || log.userId.includes(searchForm.value.userId)
    let timeMatch = true
    
    if (searchForm.value.timeRange?.length === 2) {
      const logTime = new Date(log.timestamp).getTime()
      const startTime = new Date(searchForm.value.timeRange[0]).getTime()
      const endTime = new Date(searchForm.value.timeRange[1]).getTime()
      timeMatch = logTime >= startTime && logTime <= endTime
    }
    
    return typeMatch && userMatch && timeMatch
  })
})

// 分页数据
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理重置
const handleReset = () => {
  searchForm.value = {
    type: '',
    userId: '',
    timeRange: []
  }
  currentPage.value = 1
}

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page
}

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 查看详情
const detailsVisible = ref(false)
const selectedLog = ref({})
const showDetails = (log) => {
  selectedLog.value = log
  detailsVisible.value = true
}

// 导出日志
const handleExport = () => {
  try {
    // 准备导出数据
    const exportData = filteredLogs.value.map(log => ({
      '时间': formatDate(log.timestamp),
      '类型': logTypeLabels[log.type],
      '操作人': log.userId,
      '操作': actionLabels[log.action] || log.action,
      '客户端信息': log.userAgent,
      'IP地址': log.ip,
      '位置': log.location,
      '运营商': log.isp,
      '详细信息': JSON.stringify(log.details)
    }))

    // 创建工作簿
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // 设置列宽
    ws['!cols'] = [
      { wch: 20 }, // 时间
      { wch: 10 }, // 类型
      { wch: 15 }, // 操作人
      { wch: 20 }, // 操作
      { wch: 40 }, // 客户端信息
      { wch: 15 }, // IP地址
      { wch: 50 }  // 详细信息
    ]

    // 添加工作表
    XLSX.utils.book_append_sheet(wb, ws, '系统日志')

    // 生成文件名
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    const fileName = `系统日志_${dateStr}.xlsx`

    // 导出文件
    XLSX.writeFile(wb, fileName)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  tableHeight.value = window.innerHeight - 200
})

// 实时监控相关
const realtime = ref(false)
const realtimeLoading = ref(false)
let realtimeTimer = null

// 监听实时开关
watch(realtime, (newVal) => {
  if (newVal) {
    startRealtime()
  } else {
    stopRealtime()
    // 只有在用户手动关闭时才显示提示
    if (realtime.value === false) {
      ElMessage.info('已关闭实时监控')
    }
  }
})

// 开始实时监控
const startRealtime = () => {
  realtimeLoading.value = true
  // 每3秒刷新一次
  realtimeTimer = setInterval(() => {
    loadLogs()
  }, 3000)
  ElMessage.success('已开启实时监控')
  realtimeLoading.value = false
}

// 停止实时监控
const stopRealtime = () => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  // 停止实时监控但不显示提示
  realtime.value = false
  stopRealtime()
})

// 备份日志
const handleBackup = () => {
  try {
    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]')
    const backupData = {
      logs,
      backupTime: new Date().toISOString(),
      backupUser: JSON.parse(localStorage.getItem('user') || '{}').username
    }

    // 创建备份文件
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    
    // 生成文件名
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    link.download = `系统日志备份_${dateStr}.json`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    // 记录备份操作
    logAction(LogType.OPERATION, 'backup_logs', {
      totalLogs: logs.length,
      backupTime: dateStr
    })

    ElMessage.success('日志备份成功')
  } catch (error) {
    console.error('备份失败:', error)
    ElMessage.error('备份失败')
  }
}

// 清理日志
const handleClear = async () => {
  try {
    // 获取当前日志数量
    const currentLogs = JSON.parse(localStorage.getItem('system_logs') || '[]')
    const count = currentLogs.length

    // 记录清理操作
    logAction(LogType.OPERATION, 'clear_logs', {
      clearedCount: count,
      clearTime: new Date().toISOString()
    })

    // 清空日志
    localStorage.setItem('system_logs', '[]')
    logs.value = []

    ElMessage.success(`已清理 ${count} 条日志`)
  } catch (error) {
    console.error('清理失败:', error)
    ElMessage.error('清理失败')
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  stopRealtime()
})

// 初始化
onMounted(() => {
  // 检查权限
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.role !== 'admin' && (!user.permissions || !user.permissions.includes('logs'))) {
    ElMessage.error('没有访问权限')
    router.push('/dashboard')
    return
  }
  loadLogs()
})

// 日志恢复功能
const handleRestore = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const backupData = JSON.parse(e.target.result)
      if (!backupData.logs || !Array.isArray(backupData.logs)) {
        throw new Error('无效的备份文件')
      }

      // 记录恢复操作
      logAction(LogType.OPERATION, 'restore_logs', {
        backupTime: backupData.backupTime,
        logsCount: backupData.logs.length
      })

      // 合并日志
      const currentLogs = JSON.parse(localStorage.getItem('system_logs') || '[]')
      const mergedLogs = [...currentLogs, ...backupData.logs]
      
      // 去重并按时间排序
      const uniqueLogs = Array.from(new Map(mergedLogs.map(log => [log.timestamp, log])).values())
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      localStorage.setItem('system_logs', JSON.stringify(uniqueLogs))
      logs.value = uniqueLogs
      ElMessage.success(`成功恢复 ${backupData.logs.length} 条日志`)
    } catch (error) {
      console.error('恢复失败:', error)
      ElMessage.error('恢复失败：无效的备份文件')
    }
  }
  reader.readAsText(file.raw)
}

// 日志分析相关
const analysisVisible = ref(false)
const chartRef = ref(null)
const pieChartRef = ref(null)
const chartTimeRange = ref('day')
let chart = null
let pieChart = null

// 统计数据
const statistics = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayLogs = logs.value.filter(log => new Date(log.timestamp) >= today)
  const securityLogs = logs.value.filter(log => log.type === 'security')
  const uniqueUsers = new Set(logs.value.map(log => log.userId)).size

  return [
    {
      title: '今日日志数',
      value: todayLogs.length
    },
    {
      title: '安全日志数',
      value: securityLogs.length
    },
    {
      title: '操作用户数',
      value: uniqueUsers
    },
    {
      title: '总日志数',
      value: logs.value.length
    }
  ]
})

// 显示分析对话框
const showAnalysis = () => {
  try {
    analysisVisible.value = true
    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    console.error('显示分析对话框失败:', error)
    ElMessage.error('显示分析对话框失败')
  }
}

// 初始化图表
const initCharts = () => {
  try {
    // 初始化趋势图
    if (chartRef.value) {
      chart = echarts.init(chartRef.value)
      updateChart()
    }

    // 初始化饼图
    if (pieChartRef.value) {
      pieChart = echarts.init(pieChartRef.value)
      updatePieChart()
    }
  } catch (error) {
    console.error('初始化图表失败:', error)
    ElMessage.error('初始化图表失败')
  }
}

// 更新趋势图
const updateChart = () => {
  if (!chart) return

  const data = getChartData()
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.xAxis
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '日志数量',
        type: 'line',
        smooth: true,
        data: data.series,
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  }
  chart.setOption(option)
}

// 获取图表数据
const getChartData = () => {
  const now = new Date()
  const data = { xAxis: [], series: [] }

  if (chartTimeRange.value === 'day') {
    // 今日24小时数
    for (let i = 0; i < 24; i++) {
      const hour = String(i).padStart(2, '0')
      data.xAxis.push(`${hour}:00`)
      const count = logs.value.filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate.getDate() === now.getDate() && 
               logDate.getHours() === i
      }).length
      data.series.push(count)
    }
  } else if (chartTimeRange.value === 'week') {
    // 最近7天数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      data.xAxis.push(date.toLocaleDateString())
      const count = logs.value.filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate.toDateString() === date.toDateString()
      }).length
      data.series.push(count)
    }
  } else {
    // 本月数据
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      data.xAxis.push(`${i}日`)
      const count = logs.value.filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate.getMonth() === now.getMonth() && 
               logDate.getDate() === i
      }).length
      data.series.push(count)
    }
  }

  return data
}

// 更新饼图
const updatePieChart = () => {
  if (!pieChart) return

  const typeCount = {}
  logs.value.forEach(log => {
    typeCount[log.type] = (typeCount[log.type] || 0) + 1
  })

  const data = Object.entries(typeCount).map(([type, count]) => ({
    name: logTypeLabels[type],
    value: count
  }))

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
        name: '日志类型',
        type: 'pie',
        radius: '50%',
        data: data,
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
  pieChart.setOption(option)
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  chart?.resize()
  pieChart?.resize()
})

// 组件卸载时清理
onUnmounted(() => {
  chart?.dispose()
  pieChart?.dispose()
})

// IP信息相关
const ipInfoVisible = ref(false)
const selectedIp = ref({})

// 显示IP信息
const showIpInfo = (row) => {
  selectedIp.value = {
    ip: row.ip,
    location: row.location || '未知',
    isp: row.isp || '未知'
  }
  ipInfoVisible.value = true
}
</script>

<style scoped lang="less">
.log-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 15px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

    .toolbar-right {
      display: flex;
      gap: 10px;
    }
  }

  .search-bar {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}

.analysis-container {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;

    .stat-content {
      text-align: center;

      .stat-title {
        color: #909399;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .stat-number {
        color: #303133;
        font-size: 24px;
        font-weight: bold;
      }
    }
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

@media screen and (max-width: 768px) {
  .analysis-container {
    .stat-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style> 