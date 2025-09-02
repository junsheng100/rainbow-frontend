import type { CustomRouteRecordRaw } from '@/router'

const feedbackRoutes: CustomRouteRecordRaw = {
  path: '/feedback',
  name: 'Feedback',
  component: () => import('@/layouts/index.vue'),
  meta: {
    title: '反馈管理',
    icon: 'ChatDotRound'
  },
  children: [
    {
      path: 'list',
      name: 'FeedbackList',
      component: () => import('@/views/feedback/index.vue'),
      meta: {
        title: '意见反馈',
        icon: 'ChatLineRound',
        permissions: ['feedback:list'] // 定义所需权限
      }
    }
  ]
}

export default feedbackRoutes
