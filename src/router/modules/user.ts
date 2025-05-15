export default {
  path: "/user",
  name: "User",
  redirect: "/user/manager",
  meta: {
    icon: "ep:user-filled",
    title: "用户",
    rank: 2
  },
  children: [
    {
      path: "/user/manager",
      name: "UserManager",
      component: () => import("@/views/user/manager.vue"),
      meta: {
        title: "用户"
      }
    }
  ]
} satisfies RouteConfigsTable;
