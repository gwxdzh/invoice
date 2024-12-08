<template>
  <div class="system-user-container">
    <div class="top">
      <div class="top-container">
        <el-form :model="searchForm" label-width="auto" class="search-form">
          <el-form-item label="用户名：">
            <el-input 
              v-model="searchForm.username" 
              placeholder="请输入用户名"
              style="width: 250px;"
              clearable
              @clear="handleSearch"
            />
            <el-button type="primary" style="margin-left: 10px;" @click="handleSearch">搜索</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
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
        <el-table-column prop="username" label="用户名" align="center"/>
        <el-table-column prop="role" label="角色" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'">
              {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permissions" label="权限" align="center">
          <template #default="scope">
            <el-tag 
              v-for="perm in scope.row.permissions" 
              :key="perm"
              style="margin: 2px"
            >
              {{ permissionLabels[perm] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录时间" align="center"/>
        <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip/>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template #default="scope">
            <el-button 
              size="small" 
              @click="handleEdit(scope.row)"
              :disabled="scope.row.username === 'admin'"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="warning" 
              @click="handleResetPassword(scope.row)"
            >
              重置密码
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
              :disabled="scope.row.username === 'admin'"
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
          :total="userData.length"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
    >
      <el-form 
        :model="formData" 
        :rules="rules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="formData.username" 
            placeholder="请输入用户名"
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input 
            v-model="formData.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select 
            v-model="formData.role" 
            placeholder="请选择角色"
            :disabled="formData.username === 'admin'"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-checkbox-group 
            v-model="formData.permissions"
            :disabled="formData.username === 'admin'"
          >
            <el-checkbox label="invoice">发票管理</el-checkbox>
            <el-checkbox label="customer">客户管理</el-checkbox>
            <el-checkbox label="system">系统管理</el-checkbox>
            <el-checkbox label="logs">系统日志</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
            maxlength="200"
            show-word-limit
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

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordVisible"
      title="重置密码"
      width="400px"
    >
      <el-form
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        ref="resetPasswordFormRef"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="resetPasswordForm.password"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPasswordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="handleResetPasswordSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

// 搜索表单数据
const searchForm = ref({
  username: ''
})

// 权限标签映射
const permissionLabels = {
  invoice: '发票管理',
  customer: '客户管理',
  system: '系统管理',
  logs: '系统日志'
}

// 修改用户数据获取方式
const loadUserData = () => {
  // 预设用户
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      role: 'admin',
      permissions: ['invoice', 'customer', 'system', 'logs'],
      lastLogin: '2024-01-20 10:00:00',
      status: 1,
      remark: '系统管理员，拥有所有权限'
    },
    {
      id: 2,
      username: 'user',
      role: 'user',
      permissions: ['invoice', 'customer'],
      lastLogin: '2024-01-19 15:30:00',
      status: 1,
      remark: '普通用户，具有发票和客户管理权限'
    }
  ]

  // 获取注册用户
  const userStr = localStorage.getItem('systemUsers')
  if (userStr) {
    try {
      const systemUsers = JSON.parse(userStr)
      // 合并预设用户和注册用户，确保预设用户始终存在
      return [...defaultUsers, ...systemUsers]
    } catch (e) {
      console.error('加载用户数据失败:', e)
    }
  }

  return defaultUsers
}

const userData = ref(loadUserData())
const originalUserData = ref([...userData.value])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return userData.value.slice(start, end)
})

// 表格高度自适应
const tableHeight = ref(0)

const calculateTableHeight = () => {
  const windowHeight = window.innerHeight
  tableHeight.value = windowHeight - 150
}

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const formData = ref({
  username: '',
  password: '',
  role: '',
  permissions: [],
  remark: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  permissions: [
    { required: true, message: '请选择权限', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少选一个权限', trigger: 'change' }
  ],
  remark: [
    { max: 200, message: '备注长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 重置密码相关
const resetPasswordVisible = ref(false)
const resetPasswordFormRef = ref(null)
const currentUserId = ref(null)
const resetPasswordForm = ref({
  password: '',
  confirmPassword: ''
})

const resetPasswordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPasswordForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 事件处理函数
const handlePageChange = (page) => {
  currentPage.value = page
}

const handleSearch = () => {
  if (!searchForm.value.username) {
    userData.value = [...originalUserData.value]
  } else {
    userData.value = originalUserData.value.filter(item => 
      item.username.includes(searchForm.value.username)
    )
  }
  currentPage.value = 1
}

const handleStatusChange = (row) => {
  if (row.username === 'admin') {
    row.status = 1 // 强制恢复启用状态
    ElMessage.warning('管理员账号不可禁用')
    return
  }

  if (row.username === 'user') {
    row.status = 1 // 强制恢复启用状态
    ElMessage.warning('演示账号不可禁用')
    return
  }
  
  // 更新本地存储中的用户状态
  const userStr = localStorage.getItem('systemUsers')
  if (userStr) {
    try {
      const systemUsers = JSON.parse(userStr)
      const userIndex = systemUsers.findIndex(u => u.id === row.id)
      if (userIndex !== -1) {
        systemUsers[userIndex].status = row.status
        localStorage.setItem('systemUsers', JSON.stringify(systemUsers))
        
        const action = row.status === 1 ? '启用' : '禁用'
        ElMessage.success(`已${action}用户：${row.username}`)
        
        // 如果是禁用操作，且该用户当前在线，可以在这里实现强制下线功能
        if (row.status === 0) {
          // 获取当前登录用户
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          if (currentUser.username === row.username) {
            // 清除登录状态
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // 提示用户
            ElMessageBox.alert(
              '您的账号已被管理员禁用，请联系管理员解禁',
              '账号已禁用',
              {
                confirmButtonText: '确定',
                callback: () => {
                  // 跳转到登录页
                  router.push('/login')
                }
              }
            )
          }
        }
      }
    } catch (e) {
      console.error('更新用户状态失败:', e)
      ElMessage.error('操作失败，请重试')
      // 恢复状态
      row.status = row.status === 1 ? 0 : 1
    }
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  formData.value = {
    username: '',
    password: '',
    role: 'user',
    permissions: ['invoice'],
    remark: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  if (row.username === 'admin') {
    ElMessage.warning('管理员账号不可修改')
    return
  }
  
  dialogType.value = 'edit'
  formData.value = {
    id: row.id,
    username: row.username,
    role: row.role,
    permissions: [...row.permissions],
    remark: row.remark
  }
  dialogVisible.value = true
}

const handleResetPassword = (row) => {
  currentUserId.value = row.id
  resetPasswordForm.value = {
    password: '',
    confirmPassword: ''
  }
  resetPasswordVisible.value = true
}

const handleDelete = (row) => {
  if (row.username === 'admin') {
    ElMessage.warning('管理员账号不可删除')
    return
  }

  if (row.username === 'user') {
    ElMessage.warning('演示账号不可删除')
    return
  }
  
  ElMessageBox.confirm(
    '确定要删除该用户吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 先更新本地存储中的用户数据
    const userStr = localStorage.getItem('systemUsers')
    if (userStr) {
      try {
        const systemUsers = JSON.parse(userStr)
        // 只从 systemUsers 中删除要删除的用户
        const updatedSystemUsers = systemUsers.filter(item => item.id !== row.id)
        localStorage.setItem('systemUsers', JSON.stringify(updatedSystemUsers))
      } catch (e) {
        console.error('更新本地存储失败:', e)
      }
    }

    // 然后更新页面显示的数据
    userData.value = userData.value.filter(item => item.id !== row.id)
    originalUserData.value = originalUserData.value.filter(item => item.id !== row.id)
    
    ElMessage.success('删除成功')
    
    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 检查用户名是否已存在
        if (userData.value.some(user => user.username === formData.value.username)) {
          ElMessage.error('用户名已存在')
          return
        }
        
        // 检查用名是否为 admin
        if (formData.value.username.toLowerCase() === 'admin') {
          ElMessage.error('不能创建管理员同账号')
          return
        }
        
        const newId = Math.max(...userData.value.map(item => item.id)) + 1
        const newUser = {
          id: newId,
          username: formData.value.username,
          password: formData.value.password,
          role: formData.value.role,
          permissions: formData.value.permissions,
          lastLogin: '-',
          status: 1,
          remark: formData.value.remark || '-'
        }
        
        // 更新本地存储
        const systemUsers = loadUserData()
        systemUsers.push(newUser)
        localStorage.setItem('systemUsers', JSON.stringify(
          systemUsers.filter(u => 
            u.username !== 'admin' && 
            u.username !== 'user'
          )
        ))
        
        userData.value.push(newUser)
        originalUserData.value.push(newUser)
        ElMessage.success('添加成功')
      } else {
        // 检查是否是 admin 用户
        if (formData.value.username === 'admin') {
          ElMessage.warning('管理员账号不可修改')
          return
        }
        
        const index = userData.value.findIndex(item => item.id === formData.value.id)
        if (index !== -1) {
          userData.value[index] = { 
            ...userData.value[index], 
            role: formData.value.role,
            permissions: formData.value.permissions,
            remark: formData.value.remark
          }
          const originalIndex = originalUserData.value.findIndex(item => item.id === formData.value.id)
          if (originalIndex !== -1) {
            originalUserData.value[originalIndex] = { ...userData.value[index] }
          }
          ElMessage.success('修改成功')
        }
      }
      dialogVisible.value = false
    }
  })
}

const handleResetPasswordSubmit = async () => {
  if (!resetPasswordFormRef.value) return
  
  await resetPasswordFormRef.value.validate((valid) => {
    if (valid) {
      // 检查用户是否存在
      const user = userData.value.find(user => user.id === currentUserId.value)
      if (!user) {
        ElMessage.error('用户不存在')
        return
      }

      // 这里实际项目中需要调用后端 API 重置密码
      // 这里只是模拟更新
      ElMessage.success(`用户 ${user.username} 的密码已重置`)
      resetPasswordVisible.value = false
    }
  })
}

const router = useRouter()

onMounted(() => {
  calculateTableHeight()
  window.addEventListener('resize', calculateTableHeight)
})
</script>

<style scoped lang="less">
.system-user-container {
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
</style> 