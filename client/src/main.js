import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Chat from './components/Chat.vue'

const routes = [
  {
    path: '/login',
    component: Login,
  },
  { path: '/', redirect: '/login' },
  {
    path: '/chat',
    component: Chat,
    meta: { requiresAuth: true },
    props: (router) => ({ customerId: Number(router.query.customerId) }),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  console.log('-----before each')
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  console.log('isLoggedIn:' + isLoggedIn)
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
