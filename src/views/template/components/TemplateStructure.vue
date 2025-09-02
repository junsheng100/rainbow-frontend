<template>
  <div class="template-structure">
    <el-row :gutter="20">
      <!-- 左侧实体类列表 -->
      <el-col :span="9">
        <entity-list @select="handleEntitySelect" />
      </el-col>

      <!-- 右侧字段列表 -->
      <el-col :span="15">
        <field-list :current-entity="currentEntity" />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup name="TemplateStructure">
import { ref } from 'vue'
import EntityList from './EntityList.vue'
import FieldList from './FieldList.vue'
import type { TemplateEntity } from '@/api/template/types'

const currentEntity = ref<TemplateEntity | null>(null)

const handleEntitySelect = (entity: TemplateEntity | null) => {
  currentEntity.value = entity
}
</script>

<style lang="scss" scoped>
.template-structure {
  .entity-list,
  .field-list {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
  }
}
</style>
