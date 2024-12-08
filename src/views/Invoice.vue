<template>
  <div class="invoice-container">
    <div class="top">
      <div class="top-container">
        <el-form :model="form" label-width="auto" class="search-form">
          <el-form-item label="客户名称：" v-if="item_show">
            <el-select 
              v-model="form.name" 
              filterable 
              placeholder="请选择客户"
              style="width: 250px;"
              clearable
            >
              <el-option
                v-for="item in customerList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button type="primary" style="margin-left: 10px;" @click="filterByName">按名称搜索</el-button>
            <el-button v-if="showResetButton" style="margin-left: 10px;" @click="resetNameFilter">重置</el-button>
            <el-button type="primary" style="margin-left: 10px;" @click="toggleDateFilter">按日期搜索</el-button>
          </el-form-item>
          <el-form-item label="筛选条件：" style="width: 600px;" v-else>
            <el-date-picker
              v-model="form.times"
              type="daterange"
              range-separator="到"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              size="default"
            />
            <el-button type="primary" style="margin-left: 10px;" @click="filterByDate">筛选</el-button>
            <el-button style="margin-left: 10px;" @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="button-group">
          <el-button type="primary" @click="exportToExcel">
            <el-icon><Download /></el-icon>
            全部导出
          </el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增发票
          </el-button>
        </div>
      </div>
    </div>
    <div class="bottom">
      <el-table :data="paginatedData" style="width: 100%" :border="true" :max-height="tableHeight">
        <el-table-column prop="id" label="发票ID" width="100" align="center"/>
        <el-table-column prop="name" label="客户名称" width="120" align="center"/>
        <el-table-column prop="invoice" label="发票"  align="center">
          <template #default="scope">
            <el-image 
              style="width: auto; height: 100px" 
              :src="scope.row.invoice" 
              fit="contain"
              @click="showImg(scope.row.invoice)"
            />
          </template>
        </el-table-column> 
        <el-table-column prop="date" label="入库时间" align="center"/>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">修改</el-button>
            <el-button type="primary" size="small" @click="downloader.downloadImage(scope.row.invoice, scope.row.name + '.png')">
              下载发票照片
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="tableData.length"
          :page-size="5"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增发票对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增发票" width="500px">
      <el-form :model="addForm" label-width="100px" ref="addFormRef">
        <el-form-item label="客户名称" prop="name">
          <el-select 
            v-model="addForm.name" 
            filterable 
            placeholder="请选择客户"
            style="width: 100%"
          >
            <el-option
              v-for="item in customerList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入库时间" prop="date">
          <el-date-picker
            v-model="addForm.date"
            type="date"
            placeholder="选择日期"
            :default-value="new Date()"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="发票图片" prop="invoice">
          <div class="upload-container">
            <div v-if="!addForm.invoice" class="upload-placeholder">
              <el-upload
                class="upload-demo"
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :limit="1"
                :file-list="fileList"
                accept="image/*"
              >
                <div class="upload-content">
                  <el-button type="primary">选择图片</el-button>
                  <div class="upload-tip">只能上传jpg/png文件</div>
                </div>
              </el-upload>
            </div>
            <div v-else class="preview-container">
              <el-image
                :src="addForm.invoice"
                fit="contain"
                class="preview-image"
              />
              <div class="preview-actions">
                <el-button type="danger" @click="handleFileRemove">删除图片</el-button>
                <el-button type="primary" @click="handleReplaceImage">更换图片</el-button>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看图片对话框 -->
    <el-dialog v-model="dialogTableVisible" title="查看发票图片" width="850px">
      <el-image 
        style="width: 800px; height:auto" 
        :src="show_url" 
        fit="contain"
      />
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
import { ref, onMounted, computed } from "vue";
import { Plus, Download } from '@element-plus/icons-vue'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { getCustomers, saveCustomers, getInvoices, saveInvoices } from '../utils/storage'
import { logAction, LogType } from '../utils/logger'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import HelpButton from '../components/HelpButton.vue'

const form = ref({
  name:'',
  times:[]
})

const dialogTableVisible = ref(false)
const show_url = ref('')
const tableData = ref(getInvoices())
const originalTableData = ref([...tableData.value])

const item_show = ref(true)
const showImg = (url)=>{
  show_url.value = url
  dialogTableVisible.value = true
}

const handleDelete = async (index, row) => {
  logAction(LogType.ACCESS, 'view_invoice', { invoiceId: row.id })
  
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该发票记录，是否继续？',
      '警告',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await ElMessageBox.prompt(
      '请输入"DELETE"以确认删除操作',
      '二次确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern: /^DELETE$/,
        inputErrorMessage: '请输入正确的确认文本',
        type: 'warning'
      }
    )

    tableData.value = tableData.value.filter(item => item.id !== row.id)
    originalTableData.value = originalTableData.value.filter(item => item.id !== row.id)
    tableData.value = tableData.value.map((item, index) => ({
      ...item,
      id: index + 1
    }))
    originalTableData.value = [...tableData.value]
    saveInvoices(tableData.value)
    
    logAction(LogType.OPERATION, 'delete_invoice', {
      originalInvoiceId: row.id,
      customerName: row.name,
      date: row.date,
      operationResult: '删除发票成功，已重新排序ID'
    })
    
    ElMessage.success('删除成功')
    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      logAction(LogType.SECURITY, 'delete_invoice_failed', {
        invoiceId: row.id,
        error: error.message || '未知错误'
      })
    }
  }
}

const downloader = {
  downloadImage: async (url, filename = '发票.jpg') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectURL);
    } catch (error) {
      console.error('下载图片失败:', error);
    }
  }
};

const showResetButton = ref(false)

const filterByName = () => {
  if (!form.value.name) {
    tableData.value = [...originalTableData.value];
    showResetButton.value = false;
    return;
  }
  tableData.value = originalTableData.value.filter(item => {
    return item.name.includes(form.value.name);
  });
  showResetButton.value = true;
}

const resetNameFilter = () => {
  form.value.name = '';
  tableData.value = [...originalTableData.value];
  showResetButton.value = false;
}

const filterByDate = () => {
  tableData.value = originalTableData.value.filter(item => {
    return form.value.times.length === 2 ? 
      new Date(item.date) >= new Date(form.value.times[0]) && new Date(item.date) <= new Date(form.value.times[1]) 
      : true;
  });
}

const toggleDateFilter = () => {
  item_show.value = false;
}

const resetFilter = () => {
  form.value.name = '';
  form.value.times = [];
  tableData.value = [...originalTableData.value];
  item_show.value = true;
  showResetButton.value = false;
}

const tableHeight = ref(0)

const calculateTableHeight = () => {
  const windowHeight = window.innerHeight
  tableHeight.value = windowHeight - 150
}

const currentPage = ref(1);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * 5;
  const end = start + 5;
  return tableData.value.slice(start, end);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};

// 新增发票相关
const addDialogVisible = ref(false)
const addForm = ref({
  name: '',
  date: new Date().toISOString().split('T')[0],
  invoice: ''
})
const addFormRef = ref(null)
const fileList = ref([])

const customerList = computed(() => {
  const customers = getCustomers()
  return customers.map(c => ({
    value: c.name,
    label: c.name
  }))
})

const handleAdd = () => {
  addDialogVisible.value = true
  addForm.value = {
    name: '',
    date: new Date().toISOString().split('T')[0],
    invoice: ''
  }
  fileList.value = []
}

const BAIDU_OCR_CONFIG = {
  ACCESS_TOKEN: import.meta.env.VITE_BAIDU_ACCESS_TOKEN,
  OCR_URL: 'https://aip.baidubce.com/rest/2.0/ocr/v1/vat_invoice'
}

const handleFileChange = async (file) => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在识别发票...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    // 1. 读取文件并显示预览
    const reader = new FileReader()
    reader.onload = (e) => {
      addForm.value.invoice = e.target.result
    }
    reader.readAsDataURL(file.raw)
    fileList.value = [file]

    // 2. 将图片转为 base64
    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1]
        resolve(base64)
      }
      reader.readAsDataURL(file.raw)
    })

    // 3. 调用百度 OCR API
    const response = await fetch(`${BAIDU_OCR_CONFIG.OCR_URL}?access_token=${BAIDU_OCR_CONFIG.ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `image=${encodeURIComponent(base64Image)}`
    })

    const result = await response.json()

    if (result.error_code) {
      throw new Error(result.error_msg || '识别失败')
    }

    // 4. 处理识别结果
    if (result.words_result) {
      // 获取发票抬头
      const PurchaserName = result.words_result.PurchaserName
      if (PurchaserName) {
        // 查询客户是否存在
        const existingCustomer = customerList.value.find(c => c.value === PurchaserName)
        if (!existingCustomer) {
          const confirmResult = await ElMessageBox.confirm(
            `识别新客户"${PurchaserName}"，是否添加到客户列表？`,
            '提示',
            {
              confirmButtonText: '添加',
              cancelButtonText: '取消',
              type: 'info'
            }
          ).catch(() => false)

          if (confirmResult) {
            // 获取现有客户列表
            const customers = getCustomers()
            // 创建新客户
            const newCustomer = {
              id: customers.length ? Math.max(...customers.map(c => c.id)) + 1 : 1,
              name: PurchaserName,
              phone: '-',
              remark: '通过发票识别添加',
              createTime: new Date().toLocaleDateString()
            }
            // 添加新客户并保存
            customers.push(newCustomer)
            saveCustomers(customers)
            
            addForm.value.name = PurchaserName
            ElMessage.success('已添加新客户')
          } else {
            ElMessage.info('您可以从现有客户中选择或手动添加客户')
          }
        } else {
          addForm.value.name = PurchaserName
          ElMessage.success(`已自动选择客户：${PurchaserName}`)
        }
      }
      console.log(result)
      ElMessage.success('发票识别成功')
    }
  } catch (error) {
    console.error('发票识别失败:', error)
    ElMessage.error(error.message || '发票识别失败')
  } finally {
    loading.close()
  }
}

const handleFileRemove = () => {
  addForm.value.invoice = ''
  fileList.value = []
}

const handleReplaceImage = () => {
  handleFileRemove()
}

const handleSubmit = async () => {
  if (!addForm.value.name || !addForm.value.invoice) {
    ElMessage.error('请填写完整信息')
    return
  }

  // 检查发票是否重复
  const isDuplicate = tableData.value.some(item => {
    const isSameImage = item.invoice === addForm.value.invoice
    const isSameInfo = item.name === addForm.value.name && 
                      item.date === addForm.value.date
    return isSameImage || isSameInfo
  })

  if (isDuplicate) {
    ElMessage.warning('该发票信息已存在，请勿重复添加')
    logAction(LogType.SECURITY, 'duplicate_invoice_attempt', {
      customerName: addForm.value.name,
      date: addForm.value.date
    })
    // 清空表单
    addForm.value = {
      name: '',
      date: new Date().toISOString().split('T')[0],
      invoice: ''
    }
    fileList.value = []
    return
  }

  // 生成新的发票记录
  const newInvoice = {
    id: tableData.value.length ? Math.max(...tableData.value.map(i => i.id)) + 1 : 1,
    name: addForm.value.name,
    invoice: addForm.value.invoice,
    date: addForm.value.date
  }

  // 添加到表格数据中
  tableData.value.push(newInvoice)
  originalTableData.value.push(newInvoice)
  saveInvoices(tableData.value)

  logAction(LogType.OPERATION, 'add_invoice', {
    invoiceId: newInvoice.id,
    customerName: newInvoice.name,
    date: newInvoice.date
  })

  // 关闭对话框并重置表单
  addDialogVisible.value = false
  addForm.value = {
    name: '',
    date: new Date().toISOString().split('T')[0],
    invoice: ''
  }
  fileList.value = []

  ElMessage.success('添加成功')
}

// 编辑发票
const handleEdit = (index, row) => {
  addDialogVisible.value = true
  addForm.value = {
    name: row.name,
    date: row.date,
    invoice: row.invoice
  }
  // 如果有图片，需要显示在预览中
  if (row.invoice) {
    fileList.value = [{
      name: '发票图片',
      url: row.invoice
    }]
  }
}

const exportToExcel = async () => {
  logAction(LogType.ACCESS, 'export_start', {
    totalRecords: tableData.value.length
  })

  try {
    // 显示加载提示
    const loading = ElLoading.service({
      lock: true,
      text: '正在打包发票图片...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 生成日期字符串
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`

    // 创建 zip 文件
    const zip = new JSZip()
    const promises = tableData.value.map(async (item) => {
      try {
        const response = await fetch(item.invoice)
        const blob = await response.blob()
        // 使用客户名称+日期作为文件名
        const fileName = `${item.name}_${item.date}.png`
        zip.file(fileName, blob)
      } catch (error) {
        console.error(`下载图片失败: ${item.name}_${item.date}`, error)
      }
    })

    Promise.all(promises).then(() => {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        // 下载 zip 文件
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = `发票图片_${dateStr}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
        ElMessage.success('发票图片导出成功')

        // 询问是否需要导出Excel
        ElMessageBox.confirm(
          '是否需要同时导出发票信息列表？',
          '提示',
          {
            confirmButtonText: '导出Excel',
            cancelButtonText: '取消',
            type: 'info'
          }
        ).then(() => {
          // 准备导出数据
          const exportData = tableData.value.map(item => ({
            '发票ID': item.id,
            '客户名称': item.name,
            '入库时间': item.date
          }))

          // 创建工作簿
          const wb = XLSX.utils.book_new()
          const ws = XLSX.utils.json_to_sheet(exportData)

          // 设置列宽
          const colWidths = [
            { wch: 10 },  // 发票ID
            { wch: 20 },  // 客户名称
            { wch: 15 }   // 入库时间
          ]
          ws['!cols'] = colWidths

          // 添加工作表到工作簿
          XLSX.utils.book_append_sheet(wb, ws, '发票信息')

          // 导出Excel文件
          const excelFileName = `发票信息_${dateStr}.xlsx`
          XLSX.writeFile(wb, excelFileName)
          ElMessage.success('Excel文件导出成功')

          logAction(LogType.OPERATION, 'export_success', {
            type: 'excel',
            recordCount: tableData.value.length,
            fileName: excelFileName
          })
        }).catch(() => {
          // 用取消导出Excel
        })
      }).finally(() => {
        loading.close()
      })
    }).catch(error => {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
      loading.close()
      logAction(LogType.SECURITY, 'export_failed', {
        error: error.message || '未知错误'
      })
    })
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
    logAction(LogType.SECURITY, 'export_failed', {
      error: error.message || '未知错误'
    })
  }
}

// Tour 相关数据
const tourVisible = ref(false)
const tourSteps = [
  {
    target: '.button-group .el-button--success',
    title: '上传发票',
    description: '点击这里上传发票图片,支持jpg、png格式',
    placement: 'right'
  },
  {
    target: '.bottom .el-table',
    title: '发票列表',
    description: '这里显示所有已上传的发票,可以查看、删除发票',
    placement: 'left'
  },
  {
    target: '.search-form .el-form-item',
    title: '搜索发票',
    description: '输入客户名称或日期来搜索发票',
    placement: 'right'
  }
]

// 添加启动引导的方法
const startTour = () => {
  tourVisible.value = true
}

// 在mounted时检查是否首次访问
onMounted(() => {
  const visited = localStorage.getItem('invoice-visited')
  if (!visited) {
    setTimeout(() => {
      startTour()
    }, 500)
    localStorage.setItem('invoice-visited', 'true')
  }
  calculateTableHeight()
  window.addEventListener('resize', calculateTableHeight)
})
</script>

<style scoped lang="less">
.invoice-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .top {
    width: 100%;
    margin-bottom: 10px;

    .top-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
  }

  .search-form {
    flex: 1;
    margin-right: 20px;
    width: 100%;
    .el-form-item {
      margin-bottom: 10px;
      @media screen and (max-width: 768px) {
        .el-date-picker {
          width: 100%;
        }
        .el-button {
          margin-top: 10px;
        }
      }
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

.upload-container {
  width: 100%;
  min-height: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  padding: 20px;
  box-sizing: border-box;
}

.upload-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.preview-image {
  max-width: 100%;
  height: 200px;
  object-fit: contain;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

:deep(.el-upload) {
  width: 100%;
  display: flex;
  justify-content: center;
}

:deep(.el-upload-list) {
  display: none;
}
</style> 