import Vue from "vue";
import Router, { Route } from "vue-router";
import Home from "@/views/Home.vue";
import { UserModule } from "@/store/modules/user";
import Layout from '@/layout/index.vue'

Vue.use(Router);
const whiteList = ['/login', '/auth-redirect']

const router = new Router({
  routes: [
    {
      path: "/",
      component: Layout,
      redirect: '/home',
      children: [
        {
          path: 'home',
          component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Home.vue'),
          name: 'Home',
          meta: {
            title: 'home',
            icon: 'home',
            affix: true
          }
        }
      ]
    },
    {
      path: "/",
      component: Layout,
      redirect: '/achatvente',
      children: [
        {
          path: 'achatvente',
          component: () => import(/* webpackChunkName: "dashboard" */ '@/components/AchatVente/AchatVente.vue'),
          name: 'Achat Vente',
          meta: {
            title: 'achatvente',
            icon: 'mdi-currency-eur',
            affix: true
          }
        }
      ]
    },
    {
      path: "/login",
      name: "Login",
      component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue'),
      meta: { hidden: true }
    }
  ]
});

export default router;

router.beforeEach(async (to: Route, from: Route, next: any) => {
  if (UserModule.token) {
    UserModule.LoadUser().then(() => {
      if (to.path.toUpperCase() == '/LOGIN') {
        next({ path: '/achatvente' });
      } else {
        next();
      }
    }).catch(reason => {
      next({ path: '/login' });
    });
  } else {
    // Has no token
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
    }
  }
});

