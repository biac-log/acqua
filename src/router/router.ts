import Vue from 'vue';
import Router, { Route, RouteConfig } from 'vue-router';
import { UserModule } from '@/store/modules/user';
import { PermissionModule } from '@/store/modules/permissions';
import Layout from '@/layout/index.vue';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { SocieteModule } from '@/store/modules/companies';
import { ApplicationModule } from '@/store/modules/application';
import AxiosApi from '@/api/AxiosApi';

NProgress.configure({ showSpinner: false });

Vue.use(Router);
const whiteList = ['/login', '/auth-redirect'];

export const constantRoutes: RouteConfig[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    meta: {
      title: 'Home',
      icon: 'mdi-home',
      affix: true
    },
    children: [
      {
        path: 'home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
        name: 'Home',
        meta: {
          title: 'home',
          icon: 'mdi-home',
          affix: true
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue'),
    meta: { hidden: true }
  }
];

export const asyncRoutes: RouteConfig[] = [
  {
    path: '/achatvente',
    component: Layout,
    redirect: 'achatvente/index',
    meta: {
      roles: ['admin', 'ACQUAACHATVENTE'],
      title: 'Achat Vente',
      icon: 'mdi-currency-eur'
    },
    children: [
      {
        path: 'index',
        component: () => import(/* webpackChunkName: "achatvente" */ '@/views/AchatVente/index.vue'),
        name: 'Achat Vente',
        meta: {
          title: 'Achat Vente',
          icon: 'mdi-currency-eur',
          affix: true
        }
      }
    ]
  },
  {
    path: '/financier',
    component: Layout,
    redirect: 'financier/index',
    meta: {
      roles: ['admin', 'ACQUAACHATVENTE'],
      title: 'Financier',
      icon: 'mdi-cash'
    },
    children: [
      {
        path: 'index',
        component: () => import(/* webpackChunkName: "financier" */ '@/views/Financier/index.vue'),
        name: 'Financier',
        meta: {
          title: 'Financier',
          icon: 'mdi-cash',
          affix: true
        }
      }
    ]
  },
  {
    path: '/operationsdiverses',
    component: Layout,
    redirect: 'operationsdiverses/index',
    meta: {
      roles: ['admin', 'ACQUAACHATVENTE'],
      title: 'Opérations diverses',
      icon: 'mdi-swap-horizontal-bold'
    },
    children: [
      {
        path: 'index',
        component: () => import(/* webpackChunkName: "operationdiverse" */ '@/views/OperationDiverse/index.vue'),
        name: 'Opérations diverses',
        meta: {
          title: 'Opérations diverses',
          icon: 'mdi-cake',
          affix: true
        }
      }
    ]
  },
  {
    path: '/maintenance',
    component: Layout,
    redirect: 'maintenance/fournisseurs',
    meta: {
      roles: ['admin', 'ACQUAGESTIONUTILISATEUR'],
      title: 'Maintenance',
      icon: 'mdi-tools'
    },
    children: [
      {
        path: 'fournisseurs',
        component: () =>
          import(/* webpackChunkName: "fournisseurs" */ '@/views/Maintenance/Fournisseurs/Fournisseurs.vue'),
        name: 'Fournisseurs',
        meta: {
          title: 'Fournisseurs',
          icon: 'mdi-truck',
          affix: true
        }
      },
      // {
      //   path: 'clients',
      //   component: () => import(/* webpackChunkName: "clients" */ '@/views/Maintenance/Fournisseurs/Fournisseurs.vue'),
      //   name: 'Clients',
      //   meta: {
      //     title: 'Clients',
      //     icon: 'mdi-account-supervisor-circle',
      //     affix: true
      //   }
      // },
      {
        path: 'devises',
        component: () => import(/* webpackChunkName: "devises" */ '@/views/Maintenance/Devises/index.vue'),
        name: 'Devises',
        meta: {
          title: 'Devises',
          icon: 'mdi-currency-eur',
          affix: true
        }
      },
      {
        path: 'taux',
        component: () => import(/* webpackChunkName: "taux" */ '@/views/Maintenance/Taux/index.vue'),
        name: 'Taux',
        meta: {
          title: 'Taux',
          icon: 'mdi-sack-percent',
          affix: true
        }
      },
      {
        path: 'libellesreglement',
        component: () =>
          import(/* webpackChunkName: "libellesreglement" */ '@/views/Maintenance/LibellesReglement/index.vue'),
        name: 'Libellés règlement',
        meta: {
          title: 'Libellés règlement',
          icon: 'mdi-format-title',
          affix: true
        }
      },
      {
        path: 'casestva',
        component: () => import(/* webpackChunkName: "casestva" */ '@/views/Maintenance/CasesTVA/index.vue'),
        name: 'Cases TVA',
        meta: {
          title: 'Cases TVA',
          icon: 'mdi-checkbox-blank-outline',
          affix: true
        }
      }
    ]
  },
  {
    path: '/utilisateurs',
    component: Layout,
    redirect: 'utilisateurs/index',
    meta: { roles: ['ACQUAGESTIONUTILISATEUR'], title: 'Utilisateurs', icon: 'mdi-account-multiple' },
    children: [
      {
        path: 'index',
        component: () => import('@/views/GestionUtilisateur/index.vue'),
        name: 'Utilisateurs',
        meta: {
          title: 'Utilisateurs',
          icon: 'mdi-account-multiple',
          affix: true
        }
      }
    ]
  },
  {
    path: '/societes',
    component: Layout,
    redirect: 'societes/index',
    meta: { roles: ['ACQUAGESTIONUTILISATEUR'], title: 'Sociétés', icon: 'mdi-domain' },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Societes/index.vue'),
        name: 'Sociétés',
        meta: {
          title: 'Sociétés',
          icon: 'mdi-domain',
          affix: true
        }
      }
    ]
  }
];

const createRouter = () =>
  new Router({
    //mode: "history",
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) {
        return savedPosition;
      } else {
        return { x: 0, y: 0 };
      }
    },
    base: process.env.BASE_URL,
    routes: constantRoutes
  });

const router = createRouter();

router.beforeEach(async (to: Route, from: Route, next: any) => {
  NProgress.start();
  if (UserModule.token) {
    if (SocieteModule.societes.isEmpty()) {
      // Init societes
      await SocieteModule.fetchSocietes()

      if(SocieteModule.empty && to.path.toUpperCase() != '/SOCIETES/INDEX') {
        next('/societes')
      }else{
        ApplicationModule.initParametre(); // init after headers are added
      }
    }
    if (!UserModule.utilisateur || (PermissionModule.routes && PermissionModule.routes.length === 0)) {
      try {
        await UserModule.loadUser();
        PermissionModule.generateRoutes(UserModule.utilisateur.Permissions);
        //Dynamically add accessible routes
        router.addRoutes(PermissionModule.dynamicRoutes);
        if (to.path.toUpperCase() == '/LOGIN') {
          next({ path: '/' });
        } else {
          next({ ...to, replace: true });
        }
      } catch (err) {
        next(`/login`);
      }
    } else {
      next();
    }
  } else {
    // Has no token
    if (process.env.VUE_APP_SINGLE_USER_MODE) {
      await UserModule.loginSingleUser().then(() => {
        AxiosApi.refreshAcQuaCore();
        next('/');
      });
    }
    if (whiteList.indexOf(to.path) !== -1) {
      // In the free login whitelist, go directly
      next();
    } else {
      // Other pages that do not have permission to access are redirected to the login page.
      next(`/login`);
    }
  }
});

router.afterEach((to: Route) => {
  // set page title
  NProgress.done();
  document.title = to.meta.title;
});
export default router;
