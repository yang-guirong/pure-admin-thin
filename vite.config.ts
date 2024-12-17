import { getPluginsList } from "./build/plugins";
import { include, exclude } from "./build/optimize";
import { type UserConfigExport, type ConfigEnv, loadEnv } from "vite";
import {
  root,
  alias,
  wrapperEnv,
  pathResolve,
  __APP_INFO__
} from "./build/utils";

export default ({ mode }: ConfigEnv): UserConfigExport => {
  const { VITE_CDN, VITE_PORT, VITE_COMPRESSION, VITE_PUBLIC_PATH } =
    wrapperEnv(loadEnv(mode, root));
  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias
    },
    // 服务端渲染
    server: {
      // 端口号
      port: VITE_PORT,
      host: "0.0.0.0",
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: {
        // 字符串简写写法：
        // http://localhost:5173/foo
        // -> http://localhost:4567/foo
        // "/api": "http://localhost:8088/"
        // 带选项写法：
        // http://localhost:5173/api/bar
        // -> http://jsonplaceholder.typicode.com/bar
        "/api": {
          target: "http://localhost:8088",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, "")
        }
        // 正则表达式写法：
        // http://localhost:5173/fallback/
        // -> http://jsonplaceholder.typicode.com/
        // "^/fallback/.*": {
        //   target: "http://jsonplaceholder.typicode.com",
        //   changeOrigin: true,
        //   rewrite: path => path.replace(/^\/fallback/, "")
        // },
        // 使用 proxy 实例
        // "/api": {
        //   target: "http://jsonplaceholder.typicode.com",
        //   changeOrigin: true,
        //   configure: (proxy, options) => {
        //     // proxy 是 'http-proxy' 的实例
        //   }
        // },
        // 代理 websockets 或 socket.io 写法：
        // ws://localhost:5173/socket.io
        // -> ws://localhost:5174/socket.io
        // 在使用 `rewriteWsOrigin` 时要特别谨慎，因为这可能会让
        // 代理服务器暴露在 CSRF 攻击之下
        // "/socket.io": {
        //   target: "ws://localhost:5174",
        //   ws: true,
        //   rewriteWsOrigin: true
        // }
      },
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"]
      }
    },
    plugins: getPluginsList(VITE_CDN, VITE_COMPRESSION),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      include,
      exclude
    },
    build: {
      // https://cn.vitejs.dev/guide/build.html#browser-compatibility
      target: "es2015",
      sourcemap: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: {
          index: pathResolve("./index.html", import.meta.url)
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]"
        }
      }
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    }
  };
};
