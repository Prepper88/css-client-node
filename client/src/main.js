import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import CustomerLogin from './components/CustomerLogin.vue'
//import AgentLogin from './components/AgentLogin.vue'
import CustomerChat from './components/CustomerChat.vue'
import AgentChat from './components/AgentChat.vue'

const routes = [
  { path: '/', component: CustomerLogin },
  //{ path: '/agent', component: AgentLogin },
  {
    path: '/chat',
    component: CustomerChat,
    props: (router) => ({ customerId: Number(router.query.customerId) }),
  },
  {
    path: '/agent/chat',
    component: AgentChat,
    props: (router) => ({ customerId: Number(router.query.customerId) }),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
