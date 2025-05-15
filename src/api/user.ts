import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import {
  type LoginRequest,
  LoginResponse,
  type RefreshTokenRequest,
  RefreshTokenResponse
} from "./api/v1/auth/auth";

/** 登录 */
export const getLogin = (data?: LoginRequest) => {
  return http.request2<LoginResponse>(
    "post",
    baseUrlApi("/api/v1/auth/login"),
    {
      data
    },
    LoginResponse.fromJSON
  );
};

/** 刷新`token` */
export const refreshTokenApi = (data?: RefreshTokenRequest) => {
  return http.request2<RefreshTokenResponse>(
    "post",
    baseUrlApi("/api/v1/auth/refresh_token"),
    { data },
    RefreshTokenResponse.fromJSON
  );
};
