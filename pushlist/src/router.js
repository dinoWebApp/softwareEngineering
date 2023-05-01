import { createWebHistory, createRouter } from "vue-router";
import pushList from './components/pushList.vue'
import loginPage from './components/loginPage.vue'
import signUp from './components/signUp.vue'
const routes = [
  {
    path: '/',
    name : 'pushList',
    component : pushList
  },
  {
    path : '/login',
    name : 'loginPage',
    component : loginPage
  },
  {
    path : '/signUp',
    name : 'signUp',
    component : signUp
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;