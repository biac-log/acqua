import Vue from "vue";
import Router, { Route } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/components/Login/Login.vue";
import { UserModule } from "@/store/modules/user";

Vue.use(Router);
const whiteList = ['/login', '/auth-redirect']

const router = new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/login",
      name: "Login",
      component: Login
    }
  ]
});

export default router;

router.beforeEach(async (to: Route, from: Route, next: any) => {
  if (UserModule.token) {
    UserModule.LoadUser().then(() => {
      if (to.path.toUpperCase() == '/LOGIN') {
        next({ path: '/' });
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

