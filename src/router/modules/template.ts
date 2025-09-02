import { RouteRecordRaw } from 'vue-router'

const templateRouter: RouteRecordRaw = {
  path: '/template',
  name: 'Template',
  component: () => import('@/layouts/index.vue'),
  meta: {
    title: '模板管理',
    icon: 'template'
  },
  children: [
    {
      path: 'datatype',
      name: 'DataType',
      component: () => import('@/views/datatype/index.vue'),
      meta: {
        title: '数据类型',
        icon: 'data'
      }
    }
  ]
}

export default templateRouter 