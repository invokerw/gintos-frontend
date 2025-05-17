import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse
} from "./api/v1/auth/auth";

/** 登录 */
export const getLogin = (data?: LoginRequest) => {
  return http.request2<LoginResponse>(
    "post",
    baseUrlApi("/api/v1/auth/login"),
    {
      data: LoginRequest.toJSON(data)
    },
    LoginResponse.fromJSON
  );
};

/** 刷新`token` */
export const refreshTokenApi = (data?: RefreshTokenRequest) => {
  return http.request2<RefreshTokenResponse>(
    "post",
    baseUrlApi("/api/v1/auth/refresh_token"),
    { data: RefreshTokenRequest.toJSON(data) },
    RefreshTokenResponse.fromJSON
  );
};
