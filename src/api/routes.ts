import { http } from "@/utils/http";
import { type ApiResult, baseUrlApi } from "./utils";
import type { GetAsyncRoutesResponse } from "./api/v1/auth/auth";

type GetAsyncRoutesResult = ApiResult<GetAsyncRoutesResponse>;

export const getAsyncRoutes = () => {
  return http.request<GetAsyncRoutesResult>(
    "get",
    baseUrlApi("/api/auth/v1/get_async_routes")
  );
};
