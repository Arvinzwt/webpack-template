import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [{
  path: "/",
  name: "Home",
  component: ()=> import("../views/Home.vue")
}, {
  path: "/1v1",
  name: "1V1",
  component: ()=> import("../views/V1.vue")
}, {
  path: "/1v4",
  name: "1V4",
  component: ()=> import("../views/V4.vue")
}, {
  path: "/about",
  name: "About",
  component: () => import("../views/About.vue")
}];

const router = new VueRouter({
  routes
});

export default router;
