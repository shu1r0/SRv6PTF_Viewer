import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import PathView from "../views/PathView.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'PathView',
    component: PathView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
