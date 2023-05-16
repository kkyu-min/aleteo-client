import Vue from "vue";
import VueRouter from "vue-router";

// views
import AppMain from "@/views/AppMain";
import AppBoard from "@/views/AppBoard";
import AppPlan from "@/views/AppPlan";
import AppHotPlace from "@/views/AppHotPlace";
import AppNotice from "@/views/AppNotice";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "main",
    component: AppMain,
  },
  {
    path: "/board",
    name: "board",
    component: AppBoard,
    redirect: "/board/list",
    children: [
      {
        path: "list",
        name: "boardlist",
        component: () => import("@/components/board/BoardList"),
      },
      {
        path: "view/:id",
        name: "boardview",
        component: () => import("@/components/board/BoardView"),
      },
      {
        path: "write",
        name: "boardwrite",
        component: () => import("@/components/board/BoardWrite"),
      },
      {
        path: "modify",
        name: "boardmodify",
        component: () => import("@/components/board/BoardModify"),
      },
      {
        path: "delete",
        name: "boarddelete",
        component: () => import("@/components/board/BoardDelete"),
      },
    ],
  },
  {
    path: "/notice",
    name: "notice",
    component: AppNotice,
  },
  {
    path: "/plan",
    name: "plan",
    component: AppPlan,
  },
  {
    path: "/hotplace",
    name: "hotplace",
    component: AppHotPlace,
    redirect: "/hotplace/list",
    children: [
      {
        path: "list",
        name: "hotplacelist",
        component: () => import("@/components/hotplace/HotplaceList"),
      },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
