<template>
  <div class="content">
    <div class="left-nav">
      <el-menu 
        active-text-color="#ffd04b" 
        background-color="#545c64" 
        :default-active="$route.path"
        text-color="#fff"
        router
      >
        <el-menu-item 
          v-for="menu in userMenus" 
          :key="menu.path"
          :index="menu.path"
        >
          <el-icon>
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.title }}</span>
        </el-menu-item>

        <div class="menu-divider"></div>

        <div class="user-info">
          <el-icon><User /></el-icon>
          <span>{{ currentUser?.username || '未登录' }}</span>
        </div>
        <el-menu-item @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出系统</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="right">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Tickets, User, DataBoard, Setting, SwitchButton, InfoFilled, Document } from '@element-plus/icons-vue'

const router = useRouter()

// 定义所有可能的菜单项
const allMenus = [
  {
    path: '/dashboard',
    title: '控制台',
    icon: 'DataBoard',
    permission: null  // 控制台不需要权限
  },
  {
    path: '/invoice',
    title: '发票信息查询',
    icon: 'Tickets',
    permission: 'invoice'
  },
  {
    path: '/customer',
    title: '客户管理',
    icon: 'User',
    permission: 'customer'
  },
  {
    path: '/system',
    title: '系统管理',
    icon: 'Setting',
    permission: 'system'
  },
  {
    path: '/about',
    title: '项目说明',
    icon: 'InfoFilled',
    permission: null  // 项目说明不需要权限
  },
  {
    path: '/logs',
    title: '系统日志',
    icon: 'Document',
    permission: 'logs'  // 需要 logs 权限
  },
  {
    path: '/readme',
    title: '项目文档',
    icon: 'Document',
    permission: null  // 所有用户都可以访问
  }
]

// 图标组件映射
const iconComponents = {
  DataBoard,
  Tickets,
  User,
  Setting,
  InfoFilled,
  Document
}

// 获取当前用户信息
const currentUser = computed(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch (e) {
    return null
  }
})

// 计算用户可访问的菜单
const userMenus = computed(() => {
  const user = currentUser.value
  if (!user) return []

  return allMenus.filter(menu => {
    // 如果是游客，只显示不需要权限的菜单
    if (user.role === 'guest') {
      return menu.permission === null
    }
    // 其他用户的权限逻辑保持不变
    return !menu.permission || 
           user.role === 'admin' || 
           (user.permissions && user.permissions.includes(menu.permission))
  }).map(menu => ({
    ...menu,
    icon: iconComponents[menu.icon]
  }))
})

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出系统吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 清除登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // 提示
    ElMessage.success('已退出系统')
    // 跳转到登录页
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped lang="less">
.content {
  min-width: 320px;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  overflow-x: auto;
  background-color: #f5f7fa;
}

.left-nav {
  min-width: 200px;
  height: 100%;

  .el-menu {
    height: 100%;
  }

  .menu-divider {
    margin: 10px 0;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .user-info {
    padding: 14px 20px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;

    .el-icon {
      font-size: 16px;
    }
  }
}

.right {
  flex-grow: 1;
  min-width: 0;
  height: 100vh;
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
}
</style> 