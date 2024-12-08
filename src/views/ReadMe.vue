<template>
  <div class="readme-container">
    <el-card class="readme-card">
      <template #header>
        <div class="card-header">
          <h2>
            <el-icon><Document /></el-icon>
            项目说明文档
          </h2>
        </div>
      </template>
      
      <div class="markdown-content" v-html="markdownContent"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { marked } from 'marked'

const markdownContent = ref('')

// 配置 marked 选项
marked.setOptions({
  breaks: true,  // 支持 GitHub 风格的换行
  gfm: true,     // 启用 GitHub 风格的 Markdown
  headerIds: true // 为标题添加 id
})

onMounted(async () => {
  try {
    const response = await fetch('/README.md')
    if (!response.ok) {
      throw new Error('Failed to load README.md')
    }
    const text = await response.text()
    markdownContent.value = marked(text)
  } catch (error) {
    console.error('加载README.md失败:', error)
    markdownContent.value = '<p class="error">加载文档失败</p>'
  }
})
</script>

<style scoped lang="less">
.readme-container {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;

  .readme-card {
    height: 100%;
    
    :deep(.el-card__body) {
      height: calc(100% - 60px);
      overflow-y: auto;
    }
    
    .card-header {
      h2 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        color: #303133;
      }
    }
  }
}

.markdown-content {
  line-height: 1.6;
  color: #2c3e50;
  padding: 0 10px;
  
  :deep(h1) {
    font-size: 2em;
    margin-bottom: 1em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }

  :deep(h2) {
    font-size: 1.5em;
    margin: 1em 0;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }

  :deep(h3) {
    font-size: 1.25em;
    margin: 1em 0;
  }

  :deep(p) {
    margin: 1em 0;
  }

  :deep(ul), :deep(ol) {
    padding-left: 2em;
    margin: 1em 0;
  }

  :deep(li) {
    margin: 0.5em 0;
  }

  :deep(code) {
    background-color: #f6f8fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
  }

  :deep(pre) {
    background-color: #f6f8fa;
    padding: 1em;
    border-radius: 6px;
    overflow: auto;

    code {
      background-color: transparent;
      padding: 0;
    }
  }

  :deep(blockquote) {
    margin: 1em 0;
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
  }

  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;

    th, td {
      padding: 0.5em 1em;
      border: 1px solid #dfe2e5;
    }

    th {
      background-color: #f6f8fa;
    }
  }
}
</style> 