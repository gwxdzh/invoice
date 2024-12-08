<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>发票管理系统</h2>
        <p>欢迎登录</p>
      </div>
      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="remember-me">
          <div class="flex-between">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            <a href="javascript:;" class="forget-password" @click="showResetDialog">忘记密码？</a>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            class="login-button" 
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        <div class="register-link">
          还没有账号？<a href="javascript:;" @click="showRegisterDialog">立即注册</a>
        </div>
        <div class="guest-login">
          <el-button 
            type="info" 
            plain 
            class="guest-button" 
            @click="handleGuestLogin"
          >
            游客登录
          </el-button>
        </div>
      </el-form>
    </div>

    <el-dialog
      v-model="resetDialogVisible"
      title="重置密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="resetForm.username" placeholder="请输入用户名">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="resetLoading" @click="handleResetPassword">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="registerDialogVisible"
      title="用户注册"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号码">
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="registerDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="registerLoading" @click="handleRegister">
            注册
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone } from '@element-plus/icons-vue'
import { addGuestVisit } from '../utils/storage'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 这里模拟登录请求
    setTimeout(() => {
      // 检查是否是预设账号
      if (loginForm.username === 'admin' && loginForm.password === '123456') {
        handleLoginSuccess({
          username: loginForm.username,
          role: 'admin',
          permissions: ['invoice', 'customer', 'system', 'logs']
        })
      } else if (loginForm.username === 'user' && loginForm.password === '123456') {
        handleLoginSuccess({
          username: loginForm.username,
          role: 'user',
          permissions: ['invoice', 'customer']
        })
      } else {
        // 检查注册用户
        const userStr = localStorage.getItem('systemUsers')
        if (userStr) {
          try {
            const systemUsers = JSON.parse(userStr)
            const user = systemUsers.find(u => 
              u.username === loginForm.username && 
              u.password === loginForm.password
            )
            
            if (user) {
              // 检查用户状态
              if (user.status === 0) {
                ElMessage.error('该账号已被禁用，请联系管理员解禁')
                loading.value = false
                return
              }
              
              handleLoginSuccess({
                username: user.username,
                role: user.role,
                permissions: user.permissions
              })
              return
            }
          } catch (e) {
            console.error('解析系统用户数据失败:', e)
          }
        }
        
        ElMessage.error('用户名或密码错误')
      }
      loading.value = false
    }, 1000)
  } catch (error) {
    console.error('登录验证失败:', error)
  }
}

// 处理登录成功
const handleLoginSuccess = (user) => {
  ElMessage.success('登录成功')
  localStorage.setItem('token', 'mock-token')
  localStorage.setItem('user', JSON.stringify(user))
  
  // 更新最后登录时间
  const userStr = localStorage.getItem('systemUsers')
  if (userStr) {
    try {
      const systemUsers = JSON.parse(userStr)
      const userIndex = systemUsers.findIndex(u => u.username === user.username)
      if (userIndex !== -1) {
        systemUsers[userIndex].lastLogin = new Date().toLocaleString()
        localStorage.setItem('systemUsers', JSON.stringify(systemUsers))
      }
    } catch (e) {
      console.error('更新登录时间失败:', e)
    }
  }
  
  router.push('/dashboard')
}

// 重置密码相关
const resetDialogVisible = ref(false)
const resetLoading = ref(false)
const resetFormRef = ref(null)

const resetForm = reactive({
  username: '',
  newPassword: '',
  confirmPassword: ''
})

// 自定义密码验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (resetForm.confirmPassword !== '') {
      resetFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== resetForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const resetRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { validator: validatePass, trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}

// 显示重置密码对话框
const showResetDialog = () => {
  resetDialogVisible.value = true
  resetForm.username = ''
  resetForm.newPassword = ''
  resetForm.confirmPassword = ''
}

// 处理重置密码
const handleResetPassword = async () => {
  if (!resetFormRef.value) return

  try {
    await resetFormRef.value.validate()
    resetLoading.value = true

    // 这里模拟重置密码请求
    setTimeout(() => {
      // 模拟成功
      if (resetForm.username === 'admin') {
        ElMessage.success('密码重置成功，请使用新密码登录')
        resetDialogVisible.value = false
        // 实际项目中这里需要调后端 API 重置密码
      } else {
        ElMessage.error('用户名不存在')
      }
      resetLoading.value = false
    }, 1000)
  } catch (error) {
    console.error('重置密码验证失败:', error)
    resetLoading.value = false
  }
}

// 注册相关
const registerDialogVisible = ref(false)
const registerLoading = ref(false)
const registerFormRef = ref(null)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: ''
})

// 手机号验证规则
const validatePhone = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入手机号码'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ]
}

// 显示注册对话框
const showRegisterDialog = () => {
  registerDialogVisible.value = true
  registerForm.username = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.phone = ''
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
    registerLoading.value = true

    // 这里模拟注册请求
    setTimeout(() => {
      // 检查用户名是否已存在
      const userStr = localStorage.getItem('systemUsers')
      let systemUsers = []
      if (userStr) {
        try {
          systemUsers = JSON.parse(userStr)
        } catch (e) {
          console.error('解析系统用户数据失败:', e)
        }
      }

      // 检查用户名是否已存在
      if (systemUsers.some(user => user.username === registerForm.username)) {
        ElMessage.error('用户名已存在')
        registerLoading.value = false
        return
      }

      // 创建新用户
      const newUser = {
        id: systemUsers.length + 1,
        username: registerForm.username,
        password: registerForm.password,
        role: 'user',
        permissions: ['invoice'], // 默认只有发票查询权限，系统日志需要单独授权
        phone: registerForm.phone,
        lastLogin: new Date().toLocaleString(),
        status: 1,
        remark: '新注册用户，默认具有发票查询权限'
      }

      // 添加到系统用户列表
      systemUsers.push(newUser)
      localStorage.setItem('systemUsers', JSON.stringify(systemUsers))

      // 关闭注册对话框
      registerDialogVisible.value = false
      registerLoading.value = false

      // 直接执行登录
      handleLoginSuccess({
        username: newUser.username,
        role: newUser.role,
        permissions: newUser.permissions
      })

      // 提示成功
      ElMessage.success('注册成功并已自动登录')
    }, 1000)
  } catch (error) {
    console.error('注册验证失败:', error)
    registerLoading.value = false
  }
}

// 处理游客登录
const handleGuestLogin = () => {
  // 创建游客用户信息
  const guestUser = {
    username: 'guest',
    role: 'guest',
    permissions: [], // 游客没有特殊权限
    lastLogin: new Date().toLocaleString()
  }

  // 保存登录信息
  localStorage.setItem('token', 'guest-token')
  localStorage.setItem('user', JSON.stringify(guestUser))

  // 记录游客访问
  addGuestVisit()

  // 提示成功
  ElMessage.success('游客登录成功')

  // 跳转到控制台
  router.push('/dashboard')
}
</script>

<style scoped lang="less">
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #1d39c4 100%);

  .login-box {
    width: 400px;
    padding: 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      h2 {
        font-size: 24px;
        color: #303133;
        margin-bottom: 10px;
      }

      p {
        font-size: 14px;
        color: #909399;
      }
    }

    .login-form {
      .remember-me {
        margin-bottom: 20px;

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .forget-password {
          font-size: 14px;
          color: #409EFF;
          text-decoration: none;

          &:hover {
            color: #66b1ff;
          }
        }
      }

      .login-button {
        width: 100%;
      }

      .guest-login {
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;

        .guest-button {
          width: 100%;
          margin-top: 10px;
        }
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .login-box {
    width: 90% !important;
    padding: 20px !important;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.register-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #606266;

  a {
    color: #409EFF;
    text-decoration: none;
    margin-left: 5px;

    &:hover {
      color: #66b1ff;
    }
  }
}
</style> 