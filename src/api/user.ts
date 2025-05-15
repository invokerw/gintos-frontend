import { http } from "@/utils/http";
import { baseUrlApi, type ApiResult } from "./utils";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse
} from "./api/v1/auth/auth";

export type UserResult = ApiResult<LoginResponse>;
export type RefreshTokenResult = ApiResult<RefreshTokenResponse>;

/** 登录 */
export const getLogin = (data?: LoginRequest) => {
  return http.request<UserResult>("post", baseUrlApi("/api/v1/auth/login"), {
    data
  });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: RefreshTokenRequest) => {
  return http.request<RefreshTokenResult>(
    "post",
    baseUrlApi("/api/v1/auth/refresh_token"),
    { data }
  );
};
