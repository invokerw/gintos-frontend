import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import {
  CreateRoleRequest,
  CreateRoleResponse,
  CreateUserRequest,
  CreateUserResponse,
  DeleteRolesRequest,
  DeleteUsersRequest,
  GetApiInfoListResponse,
  GetRoleListRequest,
  GetRoleListResponse,
  GetUserListRequest,
  GetUserListResponse,
  RoleGetPolicyResponse,
  RoleUpdatePolicyRequest,
  UpdateRolesRequest,
  UpdateRolesResponse,
  UpdateUserAvatarRequest,
  UpdateUserAvatarResponse,
  UpdateUsersRequest,
  UpdateUsersResponse
} from "./api/v1/admin/admin";
import { IntValue } from "./api/v1/common/common";

export const createUser = (data: CreateUserRequest) => {
  return http.request2(
    "post",
    baseUrlApi("/api/v1/admin/create_user"),
    { data: CreateUserRequest.toJSON(data) },
    CreateUserResponse.fromJSON
  );
};

export const createRole = (data: CreateRoleRequest) => {
  return http.request2(
    "post",
    baseUrlApi("/api/v1/admin/create_role"),
    { data: CreateRoleRequest.toJSON(data) },
    CreateRoleResponse.fromJSON
  );
};

export const updateUsers = (data: UpdateUsersRequest) => {
  return http.request2(
    "post",
    baseUrlApi("/api/v1/admin/update_users"),
    { data: UpdateUsersRequest.toJSON(data) },
    UpdateUsersResponse.fromJSON
  );
};

export const updateRoles = (data: UpdateRolesRequest) => {
  return http.request2(
    "post",
    baseUrlApi("/api/v1/admin/update_roles"),
    { data: UpdateRolesRequest.toJSON(data) },
    UpdateRolesResponse.fromJSON
  );
};

export const deleteUsers = (data: DeleteUsersRequest) => {
  return http.request2("post", baseUrlApi("/api/v1/admin/delete_users"), {
    data: DeleteUsersRequest.toJSON(data)
  });
};

export const deleteRoles = (data: DeleteRolesRequest) => {
  return http.request2("post", baseUrlApi("/api/v1/admin/delete_roles"), {
    data: DeleteRolesRequest.toJSON(data)
  });
};

export const getUserList = (data?: GetUserListRequest) => {
  return http.request2<GetUserListResponse>(
    "post",
    baseUrlApi("/api/v1/admin/get_user_list"),
    { data: GetUserListRequest.toJSON(data) },
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
    { data: GetRoleListRequest.toJSON(data) },

    GetRoleListResponse.fromJSON
  );
};

export const getRoleNames = () => {
  return getRoleList({
    page: {
      offset: 0,
      pageSize: 2000
    }
  } as GetRoleListRequest).then(res => {
    const names = res.roles.map(item => item.name);
    console.log("getRoleNames ids", names);
    return names;
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

export const updateUserAvatar = (data: UpdateUserAvatarRequest) => {
  return http.request2(
    "post",
    baseUrlApi("/api/v1/admin/update_user_avatar"),
    {
      data: UpdateUserAvatarRequest.toJSON(data)
    },
    UpdateUserAvatarResponse.fromJSON
  );
};

export const getApiInfoList = () => {
  return http.request2(
    "get",
    baseUrlApi("/api/v1/admin/get_api_info"),
    null,
    GetApiInfoListResponse.fromJSON
  );
};

export const getRolePolicy = (roleCode: string) => {
  return http.request2(
    "get",
    baseUrlApi(`/api/v1/admin/role_get_policy/${roleCode}`),
    null,
    RoleGetPolicyResponse.fromJSON
  );
};

export const updateRolePolicy = (data: RoleUpdatePolicyRequest) => {
  return http.request2("post", baseUrlApi("/api/v1/admin/role_update_policy"), {
    data: RoleUpdatePolicyRequest.toJSON(data)
  });
};
