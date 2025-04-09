import { http } from "@/utils/http";

/* prettier-ignore */

export interface DatasourceInfo {
  /** 主键 */
  id: number;
  /** 数据源名称 */
  name: string;
  /** 数据库类型 */
  dbType: string;
  /** 驱动类名 */
  driverClassName: string;
  /** 数据库主机 */
  dbHost: string;
  /** 端口 */
  port: number;
  /** 数据库名称 */
  databaseName: string;
  /** 模式名称 */
  schemaName: string;
  /** 参数 */
  params: string;
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 备注 */
  remark: string;
}

export const list = (params?: object) => {
  return http.request<ApiResult<Page<DatasourceInfo>>>(
    "get",
    "/api/v1/data-source-infos",
    {
      params
    }
  );
};
export const get = (id: number) => {
  return http.request<ApiResult<DatasourceInfo>>(
    "get",
    `/api/v1/data-source-infos/${id}`
  );
};
export const save = (data: DatasourceInfo) => {
  return http.request<ApiResult<DatasourceInfo>>(
    "post",
    `/api/v1/data-source-infos`,
    { data }
  );
};
export const modify = (data: DatasourceInfo) => {
  return http.request<ApiResult<DatasourceInfo>>(
    "put",
    `/api/v1/data-source-infos`,
    { data }
  );
};
export const remove = (id: number) => {
  return http.request<ApiResult<void>>(
    "delete",
    `/api/v1/data-source-infos/${id}`
  );
};

export const testConnection = (id: number) => {
  return http.request<ApiResult<void>>(
    "get",
    `/api/v1/data-source-infos/${id}/test-connection`
  );
};

export default {
  list,
  get,
  save,
  modify,
  remove,
  testConnection
};
