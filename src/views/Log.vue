<template>
  <div class="log-container">
    <div class="top">
      <div class="top-container">
        <el-form :model="form" label-width="auto" class="log-filter">
          <el-form-item label="日期范围：">
            <el-date-picker
              v-model="form.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 350px"
            />
          </el-form-item>
          <el-form-item label="日志类型：">
            <el-select v-model="form.type" placeholder="请选择日志类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="操作日志" value="operation" />
              <el-option label="访问日志" value="access" />
              <el-option label="安全日志" value="security" />
            </el-select>
            <el-button type="primary" style="margin-left: 10px" @click="handleFilter">
              筛选
            </el-button>
            <el-button style="margin-left: 10px" @click="resetFilter">
              重置
            </el-button>
          </el-form-item>
        </el-form>
        <div class="button-group">
          <el-button type="primary" class="export-button" @click="exportToExcel">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
        </div>
      </div>
    </div>

    <div class="bottom">
      <el-table 
        :data="paginatedData" 
        style="width: 100%" 
        :border="true"
        class="log-table"
        :max-height="tableHeight"
      >
        <el-table-column prop="type" label="日志类型" width="120" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.type === 'operation' ? 'primary' : 
                     scope.row.type === 'access' ? 'success' : 'warning'"
            >
              {{ scope.row.type === 'operation' ? '操作日志' :
                 scope.row.type === 'access' ? '访问日志' : '安全日志' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="150" align="center"/>
        <el-table-column prop="userId" label="操作用户" width="120" align="center"/>
        <el-table-column prop="timestamp" label="操作时间" width="180" align="center">
          <template #default="scope">
            {{ new Date(scope.row.timestamp).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="details" label="详细信息" align="center">
          <template #default="scope">
            <div v-if="typeof scope.row.details === 'object'">
              <div v-for="(value, key) in scope.row.details" :key="key">
                {{ key }}: {{ value }}
              </div>
            </div>
            <span v-else>{{ scope.row.details }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="150" align="center"/>
        <el-table-column prop="location" label="地理位置" width="180" align="center"/>
        <el-table-column prop="isp" label="运营商" width="120" align="center"/>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="filteredData.length"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSystemLogs } from '../utils/storage'
import * as XLSX from 'xlsx'

const form = ref({
  dateRange: [],
  type: ''
})

const pageSize = ref(10)
const currentPage = ref(1)
const tableHeight = ref(0)

// 获取日志数据
const logData = ref(getSystemLogs())

// 根据筛选条件过滤数据
const filteredData = computed(() => {
  let result = [...logData.value]
  
  // 按日期范围筛选
  if (form.value.dateRange && form.value.dateRange.length === 2) {
    const startDate = new Date(form.value.dateRange[0]).getTime()
    const endDate = new Date(form.value.dateRange[1]).getTime()
    result = result.filter(item => {
      const itemDate = new Date(item.timestamp).getTime()
      return itemDate >= startDate && itemDate <= endDate
    })
  }
  
  // 按类型筛选
  if (form.value.type) {
    result = result.filter(item => item.type === form.value.type)
  }
  
  return result
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
}

// 重置筛选
const resetFilter = () => {
  form.value.dateRange = []
  form.value.type = ''
  currentPage.value = 1
}

// 处理页码改变
const handlePageChange = (page) => {
  currentPage.value = page
}

// 计算表高度
const calculateTableHeight = () => {
  const windowHeight = window.innerHeight
  tableHeight.value = windowHeight - 200
}

// 导出Excel
const exportToExcel = () => {
  try {
    const exportData = filteredData.value.map(item => ({
      '日志类型': item.type === 'operation' ? '操作日志' :
                 item.type === 'access' ? '访问日志' : '安全日志',
      '操作': item.action,
      '操作用户': item.userId,
      '操作时间': new Date(item.timestamp).toLocaleString(),
      '详细信息': JSON.stringify(item.details),
      'IP地址': item.ip,
      '地理位置': item.location,
      '运营商': item.isp
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(wb, ws, '系统日志')
    
    const now = new Date()
    const fileName = `系统日志_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  calculateTableHeight()
  window.addEventListener('resize', calculateTableHeight)
})
</script>

<style scoped lang="less">
.log-container {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .top {
    .top-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .log-filter {
      flex: 1;
      margin-right: 20px;
    }
  }

  .bottom {
    flex-grow: 1;
    width: 100%;
    overflow: hidden;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.button-group {
  display: flex;
  gap: 10px;
}
</style> 