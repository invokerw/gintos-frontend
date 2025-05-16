import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import {
  type GetRoleListRequest,
  GetRoleListResponse,
  type GetUserListRequest,
  GetUserListResponse
} from "./api/v1/admin/admin";
import { IntValue } from "./api/v1/common/common";

export const getUserList = (data?: GetUserListRequest) => {
  return http.request2<GetUserListResponse>(
    "post",
    baseUrlApi("/api/v1/admin/get_user_list"),
    {
      data
    },
    GetUserListResponse.fromJSON
  );
};

export const getUserCount = () => {
  return http.request2<IntValue>(
    "get",
    baseUrlApi("/api/v1/admin/get_user_count"),
    null,
    IntValue.fromJSON
  );
};

export const getRoleList = (data?: GetRoleListRequest) => {
  return http.request2<GetRoleListResponse>(
    "post",
    baseUrlApi("/api/v1/admin/get_role_list"),
    {
      data
    },
    GetRoleListResponse.fromJSON
  );
};

export const getRoleIds = () => {
  return getRoleList().then(res => {
    const ids = res.roles.map(item => item.id);
    console.log("getRoleIds ids", ids);
    return ids;
  });
};

export const getRoleCount = () => {
  return http.request2<IntValue>(
    "get",
    baseUrlApi("/api/v1/admin/get_role_count"),
    null,
    IntValue.fromJSON
  );
};
