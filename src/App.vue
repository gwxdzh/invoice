<template>
  <router-view></router-view>
  <div v-if="isDebuggerOpen" class="debug-mask">
    <div class="debug-content">
      <h2>⚠️ 警告</h2>
      <p>系统检测到开发者工具被打开</p>
      <p>为了系统安全，页面已被锁定</p>
      <el-button type="primary" @click="handleReload">刷新页面</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const isDebuggerOpen = ref(false)

// 检测开发者工具的函数
const checkDevTools = () => {
  // 检查当前用户是否为管理员
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.role === 'admin') return  // 如果是管理员，不执行反爬检测
  
  const threshold = 160
  const widthThreshold = window.outerWidth - window.innerWidth > threshold
  const heightThreshold = window.outerHeight - window.innerHeight > threshold
  
  if (widthThreshold || heightThreshold) {
    handleDevToolsOpen()
  }
}

// 处理开发者工具打开的情况
const handleDevToolsOpen = () => {
  // 再次检查是否为管理员（双重保险）
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.role === 'admin') return
  
  isDebuggerOpen.value = true
  // 清空本地存储（可选）
  // localStorage.clear()
  // 显示警告
  ElMessage.error('禁止使用开发者工具！')
}

// 处理页面刷新
const handleReload = () => {
  window.location.reload()
}

// 禁用右键菜单
const disableContextMenu = (e) => {
  // 检查是否为管理员
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.role === 'admin') return
  
  e.preventDefault()
  return false
}

// 禁用特定快捷键
const disableKeyboardShortcuts = (e) => {
  // 检查是否为管理员
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.role === 'admin') return
  
  // 禁用 F12
  if (e.keyCode === 123) {
    e.preventDefault()
    return false
  }
  
  // 禁用 Ctrl+Shift+I/J/C
  if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
    e.preventDefault()
    return false
  }
  
  // 禁用 Ctrl+U（查看源代码）
  if (e.ctrlKey && e.keyCode === 85) {
    e.preventDefault()
    return false
  }
}

// 定时检查
let checkInterval

onMounted(() => {
  // 添加事件监听
  document.addEventListener('contextmenu', disableContextMenu)
  document.addEventListener('keydown', disableKeyboardShortcuts)
  
  // 启动定时检查
  checkInterval = setInterval(checkDevTools, 1000)
  
  // 添加调试器检测
  const debug = new Function('debugger')
  // 检查是否为管理员
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.role !== 'admin') {
    setInterval(debug, 100)
  }
})

onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener('contextmenu', disableContextMenu)
  document.removeEventListener('keydown', disableKeyboardShortcuts)
  
  // 清理定时器
  clearInterval(checkInterval)
})
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
}

/* 调试模式遮罩层样式 */
.debug-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.debug-content {
  text-align: center;
  padding: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.debug-content h2 {
  color: #f56c6c;
  margin-bottom: 20px;
}

.debug-content p {
  margin: 10px 0;
  color: #fff;
}
</style>
