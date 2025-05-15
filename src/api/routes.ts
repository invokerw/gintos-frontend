import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import type { GetAsyncRoutesResponse } from "./api/v1/auth/auth";

export const getAsyncRoutes = () => {
  // 注意这里没有 marshal 成 GetAsyncRoutesResponse 保留了原始 json 数据
  return http.request2<GetAsyncRoutesResponse>(
    "get",
    baseUrlApi("/api/v1/auth/get_async_routes")
  );
};
