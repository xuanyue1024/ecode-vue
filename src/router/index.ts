import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  next()
})

// 处理路由重复点击的错误
const originalPush = router.push.bind(router)
router.push = function push(location) {
  return originalPush(location).catch(err => err)
}

export default router
