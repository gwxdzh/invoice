import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Invoice from '../views/Invoice.vue'
import Customer from '../views/Customer.vue'
import SystemUser from '../views/SystemUser.vue'
import About from '../views/About.vue'
import SystemLog from '../views/SystemLog.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
      },
      {
        path: 'invoice',
        name: 'Invoice',
        component: Invoice,
        meta: { requiresAuth: true }
      },
      {
        path: 'customer',
        name: 'Customer',
        component: Customer,
        meta: { requiresAuth: true }
      },
      {
        path: 'system',
        name: 'SystemUser',
        component: SystemUser,
        meta: { requiresAuth: true }
      },
      {
        path: 'about',
        name: 'About',
        component: About,
        meta: { requiresAuth: true }
      },
      {
        path: 'logs',
        name: 'SystemLog',
        component: SystemLog,
        meta: { 
          requiresAuth: true,
          permission: 'logs'
        }
      },
      {
        path: 'readme',
        name: 'ReadMe',
        component: () => import('../views/ReadMe.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    // 检查权限
    if (to.meta.permission) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role === 'admin' || (user.permissions && user.permissions.includes(to.meta.permission))) {
        next()
      } else {
        ElMessage.error('没有访问权限')
        next(from.path)
      }
    } else {
      next()
    }
  }
})

export default router