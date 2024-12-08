<template>
  <div class="help-button">
    <el-button 
      type="info" 
      circle
      @click="showHelp"
    >
      <el-icon><QuestionFilled /></el-icon>
    </el-button>

    <el-dialog
      v-model="dialogVisible"
      :title="helpData.title"
      width="600px"
    >
      <div class="help-content">
        <div class="help-description">
          {{ helpData.description }}
        </div>
        
        <el-divider>功能说明</el-divider>
        
        <el-collapse>
          <el-collapse-item
            v-for="(feature, index) in helpData.features"
            :key="index"
            :title="feature.title"
          >
            <div class="feature-content">
              {{ feature.content }}
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import helpContent from '../data/help.js'

const props = defineProps({
  page: {
    type: String,
    required: true
  }
})

const dialogVisible = ref(false)
const helpData = helpContent[props.page]

const showHelp = () => {
  dialogVisible.value = true
}
</script>

<style scoped lang="less">
.help-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}

.help-content {
  .help-description {
    color: #606266;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .feature-content {
    color: #606266;
    line-height: 1.6;
    padding: 10px;
  }
}
</style> 