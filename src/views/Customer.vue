<template>
  <div class="customer-container">
    <div class="top">
      <div class="top-container">
        <el-form :model="searchForm" label-width="auto" class="search-form">
          <el-form-item label="客户名称：">
            <el-input 
              v-model="searchForm.name" 
              placeholder="请输入客户名称"
              style="width: 250px;"
              clearable
              @clear="handleSearch"
            />
            <el-button type="primary" style="margin-left: 10px;" @click="handleSearch">搜索</el-button>
          </el-form-item>
        </el-form>
        <div class="button-group">
          <el-button type="primary" @click="exportToExcel">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增客户
          </el-button>
        </div>
      </div>
    </div>

    <div class="bottom">
      <el-table 
        :data="paginatedData" 
        style="width: 100%" 
        :border="true"
        :max-height="tableHeight"
      >
        <el-table-column prop="id" label="ID" width="80" align="center"/>
        <el-table-column prop="name" label="客户名称" align="center"/>
        <el-table-column prop="phone" label="联系电话" align="center"/>
        <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip/>
        <el-table-column prop="createTime" label="创建时间" align="center"/>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="customerData.length"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增/编辑客户对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogType === 'add' ? '新增客户' : '编辑客户'"
      width="500px"
    >
      <el-form 
        :model="formData" 
        :rules="rules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入客户名称"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Tour 组件 -->
    <el-tour
      v-model="tourVisible"
      :z-index="9999"
      :mask="true"
      :mask-closable="false"
      :close-on-click-modal="false"
    >
      <template #default>
        <el-tour-step
          v-for="(step, index) in tourSteps"
          :key="index"
          :target="step.target"
          :title="step.title"
          :description="step.description"
          :placement="step.placement"
          :z-index="10000"
        />
      </template>
    </el-tour>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCustomers, saveCustomers } from '../utils/storage'
import { logAction, LogType } from '../utils/logger'
import * as XLSX from 'xlsx'

// 搜索表单数据
const searchForm = ref({
  name: ''
})

// 客户数据
const customerData = ref(getCustomers())
const originalCustomerData = ref([...customerData.value])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const formRef = ref(null)
const formData = ref({
  id: '',
  name: '',
  phone: '',
  remark: ''
})

// 手机号验证规则
const validatePhone = (rule, value, callback) => {
  if (value && !/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ],
  remark: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 页相关
const currentPage = ref(1)
const pageSize = ref(5)  // 每页显示5条数据

// 计算分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return customerData.value.slice(start, end)
})

// 处理页码改变
const handlePageChange = (page) => {
  currentPage.value = page
}

// 表格高度自适应
const tableHeight = ref(0)

const calculateTableHeight = () => {
  const windowHeight = window.innerHeight
  tableHeight.value = windowHeight - 150  // 减去其他元素的高度
}

onMounted(() => {
  calculateTableHeight()
  window.addEventListener('resize', calculateTableHeight)

  // 在 mounted 时检查是否首次访问
  const visited = localStorage.getItem('customer-visited')
  if (!visited) {
    setTimeout(() => {
      startTour()
    }, 500)
    localStorage.setItem('customer-visited', 'true')
  }
})

// 搜索处理
const handleSearch = () => {
  if (!searchForm.value.name) {
    // 如果搜索框为空，示所有数据
    customerData.value = [...originalCustomerData.value]
  } else {
    // 根据名称筛选数据
    customerData.value = originalCustomerData.value.filter(item => 
      item.name.includes(searchForm.value.name)
    )
  }
  // 重置到第一页
  currentPage.value = 1
}

// 新增客户
const handleAdd = () => {
  logAction(LogType.OPERATION, 'add_customer', {
    操作: '点击新增客户按钮'
  })
  dialogType.value = 'add'
  formData.value = {
    name: '',
    phone: '',
    remark: ''
  }
  dialogVisible.value = true
}

// 编辑客户
const handleEdit = (row) => {
  logAction(LogType.OPERATION, 'edit_customer', {
    客户ID: row.id,
    客户名称: row.name,
    操作: '点击编辑客户按钮'
  })
  dialogType.value = 'edit'
  formData.value = {
    id: row.id,
    name: row.name,
    phone: row.phone,
    remark: row.remark
  }
  dialogVisible.value = true
}

// 删除客户
const handleDelete = (row) => {
  logAction(LogType.OPERATION, 'delete_customer', {
    客户ID: row.id,
    客户名称: row.name,
    操作: '点击删除客户按钮'
  })
  ElMessageBox.confirm(
    '确定要删除该客户吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    customerData.value = customerData.value.filter(item => item.id !== row.id)
    originalCustomerData.value = originalCustomerData.value.filter(item => item.id !== row.id)
    customerData.value = customerData.value.map((item, index) => ({
      ...item,
      id: index + 1
    }))
    originalCustomerData.value = [...customerData.value]
    saveCustomers(customerData.value)
    logAction(LogType.OPERATION, 'delete_customer_success', {
      原客户ID: row.id,
      客户名称: row.name,
      操作结果: '删除客户成功，已重新排序ID'
    })
    ElMessage.success('删除成功')
    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 检查客户名是否已存在
        if (customerData.value.some(customer => customer.name === formData.value.name)) {
          ElMessage.error('客户名已存在')
          return
        }
        
        const newId = Math.max(...customerData.value.map(item => item.id)) + 1
        const newCustomer = {
          id: newId,
          name: formData.value.name,
          phone: formData.value.phone,
          remark: formData.value.remark || '-',
          createTime: new Date().toLocaleDateString()
        }
        
        customerData.value.push(newCustomer)
        originalCustomerData.value.push(newCustomer)
        saveCustomers(customerData.value)
        logAction(LogType.OPERATION, 'add_customer_success', {
          客户ID: newId,
          客户名称: newCustomer.name,
          联系电话: newCustomer.phone,
          操作结果: '新增客户成功'
        })
        ElMessage.success('添加成功')
      } else {
        const index = customerData.value.findIndex(item => item.id === formData.value.id)
        if (index !== -1) {
          const updatedCustomer = { 
            ...customerData.value[index], 
            name: formData.value.name,
            phone: formData.value.phone,
            remark: formData.value.remark
          }
          customerData.value[index] = updatedCustomer
          const originalIndex = originalCustomerData.value.findIndex(item => item.id === formData.value.id)
          if (originalIndex !== -1) {
            originalCustomerData.value[originalIndex] = { ...updatedCustomer }
          }
          saveCustomers(customerData.value)
          logAction(LogType.OPERATION, 'edit_customer_success', {
            客户ID: updatedCustomer.id,
            客户名称: updatedCustomer.name,
            联系电话: updatedCustomer.phone,
            操作结果: '编辑客户成功'
          })
          ElMessage.success('修改成功')
        }
      }
      dialogVisible.value = false
    }
  })
}

// 添加导出函数
const exportToExcel = () => {
  logAction(LogType.ACCESS, 'export_customer_start', {
    总客户数: customerData.value.length,
    操作: '开始导出客户信息'
  })
  try {
    // 准备导出数据
    const exportData = customerData.value.map(item => ({
      '客户ID': item.id,
      '客户名称': item.name,
      '联系电话': item.phone,
      '备注': item.remark,
      '创建时间': item.createTime
    }))

    // 创建工作簿
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // 设置列宽
    ws['!cols'] = [
      { wch: 10 },  // 客户ID
      { wch: 20 },  // 客户名称
      { wch: 15 },  // 联系电话
      { wch: 30 },  // 备注
      { wch: 15 }   // 创建时间
    ]

    // 添加工作表
    XLSX.utils.book_append_sheet(wb, ws, '客户信息')

    // 生成文件名
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    const fileName = `客户信息_${dateStr}.xlsx`

    // 导出文件
    XLSX.writeFile(wb, fileName)
    logAction(LogType.OPERATION, 'export_customer_success', {
      文件名: fileName,
      导出数量: customerData.value.length,
      操作结果: '导出客户信息成功'
    })
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    logAction(LogType.SECURITY, 'export_customer_failed', {
      错误信息: error.message || '未知错误',
      操作结果: '导出客户信息失败'
    })
    ElMessage.error('导出失败')
  }
}

// 添加 Tour 相关数据
const tourVisible = ref(false)
const tourSteps = [
  {
    target: '.button-group .el-button--success',
    title: '添加客户',
    description: '点击这里添加新的客户信息',
    placement: 'bottom'
  },
  {
    target: '.el-table',
    title: '客户列表',
    description: '这里显示所有客户信息,可以查看、编辑和删除客户',
    placement: 'top'
  },
  {
    target: '.el-input',
    title: '搜索客户',
    description: '输入客户名称或电话进行搜索',
    placement: 'bottom'
  }
]

// 添加启动引导的方法
const startTour = () => {
  tourVisible.value = true
}
</script>

<style scoped lang="less">
.customer-container {
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

    .search-form {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.button-group {
  display: flex;
  gap: 10px;
}
</style> 