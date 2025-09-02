<template>
  <div class="dict-container">
    <!-- 顶部操作按钮 -->
    <div class="top-toolbar">
      <div class="toolbar-left">
      </div>
      <div class="toolbar-right">
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 字典类型 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>字典类型</span>
            </div>
          </template>
          <DictTypePanel ref="dictTypeRef" />
        </el-card>
      </el-col>

      <!-- 字典数据 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>字典数据</span>
              <span v-if="dictStore.currentDictType" class="dict-type">
                当前字典：{{ dictStore.currentDictType }}
              </span>
            </div>
          </template>
          <DictDataPanel />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useDictStore} from '@/stores/dict'
import DictTypePanel from './components/DictTypePanel.vue'
import DictDataPanel from './components/DictDataPanel.vue'

const dictStore = useDictStore()
const dictTypeRef = ref()



</script>

<style lang="scss" scoped>
.dict-container {
  padding: 20px;
  height: 100%;

  .top-toolbar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-left {
      display: flex;
      gap: 8px;
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .box-card {
    height: calc(100vh - 220px);
    margin-bottom: 20px;

    :deep(.el-card__body) {
      height: calc(100% - 57px);
      padding: 10px;
      display: flex;
      flex-direction: column;

      .dict-type-panel,
      .dict-data-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .el-table {
          flex: 1;
          overflow: auto;
          margin-bottom: 12px;
        }

        .pagination-container {
          min-height: 42px;
          padding: 5px 0 15px 0;
          background-color: #fff;
          display: flex;
          justify-content: flex-end;
          align-items: center;

          :deep(.el-pagination) {
            padding: 0;
            margin: 0;
            height: 32px;
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }

  .card-header {
    display: flex;
    align-items: center;

    .dict-type {
      margin-left: 20px;
      font-size: 14px;
      color: #666;
    }
  }
}
</style>
