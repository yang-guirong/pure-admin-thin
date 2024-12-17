import { http } from "@/utils/http";

/* prettier-ignore */

export interface DatasourceInfo {
  id: number;
  name: string;
  dbType: string;
  driverClassName: string;
  host: string;
  port: number;
  databaseName: string;
  schemaName: string;
  params: string;
  username: string;
  password: string;
  remark: string;
}

export const list = (params?: object) => {
  return http.request<ApiResult<DatasourceInfo[]>>(
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
export const modify = (id: number | string, data: DatasourceInfo) => {
  return http.request<ApiResult<DatasourceInfo>>(
    "put",
    `/api/v1/data-source-infos/${id}`,
    { data }
  );
};
export const remove = (id: number) => {
  return http.request<ApiResult<void>>(
    "delete",
    `/api/v1/data-source-infos/${id}`
  );
};

export default {
  list,
  get,
  save,
  modify,
  remove
};
