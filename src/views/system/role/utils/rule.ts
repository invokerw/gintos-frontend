import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { RoleStatus } from "@/api/api/v1/common/user";

export const roleStatusOptions = [
  {
    value: RoleStatus.R_ON,
    label: "已启用"
  },
  {
    value: RoleStatus.R_OFF,
    label: "已停用"
  }
];

export const roleStatusMap = roleStatusOptions.reduce(
  (acc, cur) => {
    acc[cur.value] = cur.label;
    return acc;
  },
  {} as Record<number, string>
);

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  name: [{ required: true, message: "角色名称为必填项", trigger: "blur" }],
  code: [{ required: true, message: "角色标识为必填项", trigger: "blur" }],
  sortId: [
    { required: true, message: "排序为必填项", trigger: "blur" },
    { type: "number", message: "排序必须为数字", trigger: "blur" }
  ],
  status: [{ required: true, message: "角色状态为必填项", trigger: "blur" }]
});
