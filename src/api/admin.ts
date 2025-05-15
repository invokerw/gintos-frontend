import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import {
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
