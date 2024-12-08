<template>
  <div class="about-container">
    <!-- 项目介绍卡片 -->
    <el-card class="intro-card">
      <template #header>
        <div class="card-header">
          <h2>
            <el-icon><InfoFilled /></el-icon>
            项目介绍
          </h2>
        </div>
      </template>
      <div class="intro-content">
        <h3>发票管理系统</h3>
        <p>一个现代化的发票管理解决方案，集成智能识别、数据分析和信息管理于一体。</p>
        <div class="version-info">
          <span>当前版本：v1.3.0</span>
          <span>更新日期：{{ currentDate }}</span>
        </div>
        <div class="update-log">
          <h4>更新日志：</h4>
          <ul>
            <li>
              <strong>v1.3.0</strong>
              <ul>
                <li>新增功能引导组件，提升用户体验</li>
                <li>优化发票和客户管理页面交互</li>
                <li>移除帮助按钮，使用更直观的引导方式</li>
                <li>修复已知问题和性能优化</li>
              </ul>
            </li>
            <li>
              <strong>v1.2.0</strong>
              <ul>
                <li>新增系统日志功能，支持操作追踪和审计</li>
                <li>新增日志分析功能，提供数据可视化</li>
                <li>新增IP地址和地理位置记录</li>
                <li>优化ID自动重排序功能</li>
                <li>增强数据安全性和操作确认机制</li>
              </ul>
            </li>
            <li>
              <strong>v1.1.0</strong>
              <ul>
                <li>新增发票OCR识别功能</li>
                <li>新增客户自动识别和添加</li>
                <li>新增批量导出功能</li>
                <li>优化数据管理和搜索功能</li>
              </ul>
            </li>
            <li>
              <strong>v1.0.0</strong>
              <ul>
                <li>基础发票管理功能</li>
                <li>客户信息管理</li>
                <li>用户权限管理</li>
                <li>数据导入导出</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </el-card>

    <!-- 功能特点卡片 -->
    <el-card class="feature-card">
      <template #header>
        <div class="card-header">
          <h2>
            <el-icon><Star /></el-icon>
            核心功能
          </h2>
        </div>
      </template>
      <div class="feature-list">
        <el-timeline>
          <el-timeline-item
            v-for="(feature, index) in features"
            :key="index"
            :type="feature.type"
            :color="feature.color"
            :size="feature.size"
            :hollow="feature.hollow"
          >
            <div class="feature-item">
              <h3>
                <el-icon><component :is="feature.icon" /></el-icon>
                {{ feature.title }}
              </h3>
              <p>{{ feature.description }}</p>
              <div class="feature-tags">
                <el-tag 
                  v-for="tag in feature.tags" 
                  :key="tag"
                  :type="tag.type"
                  size="small"
                  effect="plain"
                >
                  {{ tag.text }}
                </el-tag>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <!-- 技术架构卡片 -->
    <el-card class="tech-card">
      <template #header>
        <div class="card-header">
          <h2>
            <el-icon><Connection /></el-icon>
            技术架构
          </h2>
        </div>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item 
          v-for="(tech, index) in techStack"
          :key="index"
          :label="tech.name"
        >
          <div class="tech-item">
            <el-icon><component :is="tech.icon" /></el-icon>
            {{ tech.description }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 开发依赖卡片 -->
    <el-card class="library-card">
      <template #header>
        <div class="card-header">
          <h2>
            <el-icon><Box /></el-icon>
            开发依赖
          </h2>
        </div>
      </template>
      <el-table :data="libraries" style="width: 100%" :border="true">
        <el-table-column prop="name" label="依赖名称" width="180"/>
        <el-table-column prop="version" label="版本" width="100"/>
        <el-table-column prop="purpose" label="用途"/>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status.type" size="small">
              {{ scope.row.status.text }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { InfoFilled, Star, Connection, Box, Document, User, TrendCharts, DataLine, View, Lock } from '@element-plus/icons-vue'
import { computed } from 'vue'

const features = [
  {
    title: '智能发票识别',
    description: '集成百度OCR API，支持自动识别发票信息，提取客户信息并自动关联客户管理系统',
    type: 'primary',
    icon: 'Document',
    color: '#409EFF',
    hollow: true,
    tags: [
      { text: '智能识别', type: 'success' },
      { text: '自动关联', type: 'info' },
      { text: 'OCR技术', type: 'warning' }
    ]
  },
  {
    title: '数据可视化分析',
    description: '使用ECharts实现直观的数据可视化，包括发票趋势分析、客户分布统计等多维度数据展示',
    type: 'success',
    icon: 'TrendCharts',
    color: '#67C23A',
    tags: [
      { text: '图表分析', type: 'success' },
      { text: '实时统计', type: 'primary' }
    ]
  },
  {
    title: '高效数据管理',
    description: '支持批量导出、智能搜索、分类理等功能，提供Excel导出和图片打包下载',
    type: 'warning',
    icon: 'DataLine',
    color: '#E6A23C',
    tags: [
      { text: '批量处理', type: 'warning' },
      { text: '智能搜索', type: 'info' }
    ]
  },
  {
    title: '安全性保护',
    description: '实现了完整的权限管理系统��反调试机制，保护系统数据安全',
    type: 'danger',
    icon: 'Lock',
    color: '#F56C6C',
    tags: [
      { text: '权限控制', type: 'danger' },
      { text: '安全防护', type: 'warning' }
    ]
  }
]

const techStack = [
  {
    name: '前端框架',
    icon: 'Connection',
    description: 'Vue 3 + Composition API，提供响应式数据处理和组件化开发能力'
  },
  {
    name: 'UI组件库',
    icon: 'Box',
    description: 'Element Plus，提供美观统一的用户界面和丰富的交互组件'
  },
  {
    name: '数据可视化',
    icon: 'TrendCharts',
    description: 'ECharts 5，支持丰富的图表类型和自定义配置'
  },
  {
    name: '路由管理',
    icon: 'Connection',
    description: 'Vue Router 4，实现单页应用的路由控制和权限管理'
  },
  {
    name: '智能识别',
    icon: 'Document',
    description: '百度OCR API，提供高精度的发票文字识别能力'
  }
]

const libraries = [
  {
    name: 'Vue.js',
    version: '3.3.4',
    purpose: '渐进式 JavaScript 框架',
    status: { text: '稳定', type: 'success' }
  },
  {
    name: 'Element Plus',
    version: '2.4.4',
    purpose: 'Vue 3 的 UI 组件库',
    status: { text: '稳定', type: 'success' }
  },
  {
    name: 'Vue Router',
    version: '4.2.5',
    purpose: '官方路由管理器',
    status: { text: '稳定', type: 'success' }
  },
  {
    name: 'ECharts',
    version: '5.4.3',
    purpose: '数据可视化图表库',
    status: { text: '稳定', type: 'success' }
  },
  {
    name: 'xlsx',
    version: '0.18.5',
    purpose: 'Excel 文件处理',
    status: { text: '稳定', type: 'success' }
  },
  {
    name: 'jszip',
    version: '3.10.1',
    purpose: '文件打包处理',
    status: { text: '稳定', type: 'success' }
  },
  {
    name: 'marked',
    version: '9.1.6',
    purpose: 'Markdown 解析器',
    status: { text: '稳定', type: 'success' }
  },
  {
    name: 'Less',
    version: '4.2.0',
    purpose: 'CSS 预处理器',
    status: { text: '稳定', type: 'success' }
  }
]

// 计算当前日期
const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})
</script>

<style scoped lang="less">
.about-container {
  padding: 20px;
  column-count: 2;
  column-gap: 20px;
  
  @media screen and (max-width: 768px) {
    column-count: 1;
  }

  .intro-card,
  .feature-card,
  .tech-card,
  .library-card {
    break-inside: avoid;
    margin-bottom: 20px;
    height: fit-content;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      h2 {
        margin: 0;
        color: #303133;
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
          font-size: 20px;
        }
      }
    }
  }

  .intro-content {
    h3 {
      color: #409EFF;
      margin-bottom: 15px;
    }

    p {
      color: #606266;
      line-height: 1.6;
    }

    .version-info {
      margin-top: 20px;
      display: flex;
      gap: 20px;
      color: #909399;
      font-size: 14px;
    }

    .update-log {
      margin-top: 30px;
      
      h4 {
        color: #303133;
        margin-bottom: 15px;
        font-size: 16px;
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          margin-bottom: 20px;
          
          strong {
            color: #409EFF;
            font-size: 15px;
            display: block;
            margin-bottom: 8px;
          }
          
          ul {
            padding-left: 20px;
            
            li {
              margin-bottom: 5px;
              color: #606266;
              position: relative;
              
              &:before {
                content: "•";
                color: #409EFF;
                position: absolute;
                left: -15px;
              }
            }
          }
        }
      }
    }
  }

  .feature-list {
    .feature-item {
      h3 {
        color: #303133;
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      p {
        color: #606266;
        margin: 0 0 12px 0;
        line-height: 1.6;
      }

      .feature-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }

  .tech-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;

    .el-icon {
      color: #409EFF;
    }
  }

  :deep(.el-descriptions__label) {
    width: 120px;
    font-weight: bold;
    background-color: #f5f7fa;
  }

  :deep(.el-timeline-item__content) {
    padding-bottom: 20px;
  }
}
</style> 