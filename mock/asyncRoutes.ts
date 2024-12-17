// 模拟后端动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";

/**
 * roles：页面级别权限，这里模拟二种 "admin"、"common"
 * admin：管理员角色
 * common：普通角色
 */
const permissionRouter = {
  path: "/permission",
  meta: {
    title: "menus.purePermission",
    icon: "ep:lollipop",
    rank: 10
  },
  children: [
    {
      path: "/permission/page/index",
      name: "PermissionPage",
      meta: {
        title: "menus.purePermissionPage",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/permission/button",
      meta: {
        title: "menus.purePermissionButton",
        roles: ["admin", "common"]
      },
      children: [
        {
          path: "/permission/button/router",
          component: "permission/button/index",
          name: "PermissionButtonRouter",
          meta: {
            title: "menus.purePermissionButtonRouter",
            auths: [
              "permission:btn:add",
              "permission:btn:edit",
              "permission:btn:delete"
            ]
          }
        },
        {
          path: "/permission/button/login",
          component: "permission/button/perms",
          name: "PermissionButtonLogin",
          meta: {
            title: "menus.purePermissionButtonLogin"
          }
        }
      ]
    }
  ]
};

const datasourceRouter = {
  path: "/code-generator",
  meta: {
    title: "menus.codeGenerator",
    icon: "ri:code-box-line",
    rank: 11
  },
  children: [
    {
      path: "/code-generator/datasource/index",
      name: "DatasourcePage",
      meta: {
        icon: "ri:database-2-line",
        title: "menus.DatasourcePage",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/code-generator/template/index",
      name: "CodeTemplatePage",
      meta: {
        icon: "ri:article-line",
        title: "menus.CodeTemplatePage",
        roles: ["admin", "common"]
      }
    }
  ]
};

export default defineFakeRoute([
  {
    url: "/get-async-routes",
    method: "get",
    response: () => {
      return {
        success: true,
        data: [permissionRouter, datasourceRouter]
      };
    }
  }
]);
