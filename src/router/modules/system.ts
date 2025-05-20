export default {
  path: "/system",
  meta: {
    icon: "ri:settings-3-line",
    title: "系统管理",
    rank: 14
  },
  children: [
    {
      path: "/system/user/index",
      name: "SystemUser",
      component: () => import("@/views/system/user/index.vue"),
      meta: {
        icon: "ri:admin-line",
        title: "用户管理"
        // roles: ["admin"]
      }
    },
    {
      path: "/system/role/index",
      name: "SystemRole",
      component: () => import("@/views/system/role/index.vue"),
      meta: {
        icon: "ri:admin-fill",
        title: "角色管理"
        // roles: ["admin"]
      }
    }
  ]
} satisfies RouteConfigsTable;
