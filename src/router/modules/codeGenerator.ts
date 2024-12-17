import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/code-generator",
  meta: {
    title: $t("menus.codeGenerator"),
    icon: "ri:code-box-line",
    rank: 11
  },
  component: Layout,
  children: [
    {
      path: "/code-generator/datasource/index",
      name: "DatasourcePage",
      component: () => import("@/views/code-generator/datasource/index.vue"),
      meta: {
        icon: "ri:database-2-line",
        title: $t("menus.DatasourcePage"),
        roles: ["admin"]
      }
    },
    {
      path: "/code-generator/template/index",
      name: "CodeTemplatePage",
      component: () => import("@/views/code-generator/template/index.vue"),
      meta: {
        icon: "ri:article-line",
        title: $t("menus.CodeTemplatePage"),
        roles: ["admin"]
      }
    }
  ]
} satisfies RouteConfigsTable;
