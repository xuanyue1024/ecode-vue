import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/',
    name: 'main',
    component: () => import('@/views/main/index.vue'),
    children: [
      // 教师：班级管理
      {
        path: '/classManage',
        name: 'classManage',
        component: () => import('@/views/main/teacher/classManage.vue')
      },
      // 教师：题目管理
      {
        path: '/problemManage',
        name: 'problemManage',
        component: () => import('@/views/main/teacher/problemManage.vue')
      },
      {
        path: 'problemManage/add',
        name: 'AddProblem',
        component: () => import('@/views/main/teacher/addProblem.vue')
      },
      {
        path: 'problemManage/edit/:id',
        name: 'EditProblem',
        component: () => import('@/views/main/teacher/addProblem.vue')
      },
      // 教师：班级详情
      {
        path: '/teacher/classDetail/:id',
        name: 'teacherClassDetail',
        component: () => import('@/views/main/teacher/classDetail.vue')
      },
      // 学生：我的班级
      {
        path: '/myClass',
        name: 'myClass',
        component: () => import('@/views/main/student/myClass.vue')
      },
      // 个人信息修改
      {
        path: '/personalDetails',
        name: 'personalDetails',
        component: () => import('@/views/main/personalDetails.vue')
      },
      // AI 聊天
      {
        path: '/chat',
        name: 'chat',
        component: () => import('@/views/chat/index.vue')
      },
      // 注册passkey
      {
        path: '/passkey',
        name: 'passkey',
        component: () => import('@/views/main/passkey.vue')
      }
    ]
  },
  // 学生：班级详情（独立页面）
  {
    path: '/class/:id',
    name: 'classDetail',
    component: () => import('@/views/main/student/classDetail.vue')
  },
  // 代码运行界面
  {
    path: '/code',
    name: 'code',
    component: () => import('@/views/code/index.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/main/test.vue')
  }
]

export default routes