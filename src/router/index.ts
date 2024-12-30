import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/login',
    name: 'login',
    // component: HomeView
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/',
    name: 'main',
    component: () => import('../views/main/index.vue'),
    children: [
        //教师：班级管理
      {
        path: '/classManage',
        name: 'classManage',
        component: () => import('../views/main/teacher/classManage.vue')
      },
        //学生：我的班级
      {
        path: '/myClass',
        name: 'myClass',
        component: () => import('../views/main/student/myClass.vue')
      },
        //个人信息修改
      {
        path: '/personalDetails',
        name: 'personalDetails',
        component: () => import('../views/main/personalDetails.vue')
      },
      // AI 聊天
      {
        path: '/chat',
        name: 'chat',
        component: () => import('../views/chat/index.vue')
      }
    ]
  },
    //代码运行界面
  {
    path: '/code',
    name: 'code',
    component: () => import('../views/code/index.vue')
  }, 
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/main/test.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
