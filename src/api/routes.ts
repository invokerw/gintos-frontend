import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import type { GetAsyncRoutesResponse } from "./api/v1/auth/auth";

export const getAsyncRoutes = () => {
  return http.request2<GetAsyncRoutesResponse>(
    "get",
    baseUrlApi("/api/v1/auth/get_async_routes")
  );
};
