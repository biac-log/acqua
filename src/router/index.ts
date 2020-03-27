import Vue from "vue";
import Router, { Route, RouteConfig } from "vue-router";
import Home from "@/views/Home.vue";
import { UserModule } from "@/store/modules/user";
import { PermissionModule } from "@/store/modules/permissions";
import Layout from '@/layout/index.vue';

Vue.use(Router);
const whiteList = ['/login', '/auth-redirect'];

export const constantRoutes: RouteConfig[] = [
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
];

export const asyncRoutes: RouteConfig[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/oui',
    meta: {
      title: 'oui',
      icon: 'mdi-lock',
      roles: ['admin', 'ACQUAICINSUPPMULTI'], // you can set roles in root nav
      alwaysShow: true // will always show the root menu
    },
  },
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/non',
  //   meta: {
  //     title: 'non',
  //     icon: 'mdi-lock',
  //     roles: ['admin', 'editor'], // you can set roles in root nav
  //     alwaysShow: true // will always show the root menu
  //   },
  //   children: [
  //     {
  //       path: 'non',
  //       component: () => import(/* webpackChunkName: "dashboard" */ '@/components/AchatVente/AchatVente.vue'),
  //       name: 'Achat Vente',
  //       meta: {
  //         title: 'achatvente',
  //         icon: 'mdi-currency-eur',
  //         affix: true,
  //         roles: ['admin'] // or you can only set roles in sub nav
  //       }
  //     }
  //   ],
  // }
];

const createRouter = () => new Router({
  mode: 'history',
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  base: process.env.BASE_URL,
  routes: constantRoutes
})

const router = createRouter()

router.beforeEach(async (to: Route, from: Route, next: any) => {
  if (UserModule.token) {
    UserModule.LoadUser().then(() => {
      // PermissionModule.GenerateRoutes(UserModule.utilisateur.Permissions.map(p => p.Id));
      // // Dynamically add accessible routes
      // router.addRoutes(PermissionModule.dynamicRoutes)
      if (to.path.toUpperCase() == '/LOGIN') {
        next({ path: '/achatvente', replace: true });
      } else {
        next({ ...to, replace: true })
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

export default router;
