import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { isPhone, isEmail } from "@pureadmin/utils";
import {
  UserAuthority,
  UserGender,
  UserStatus
} from "@/api/api/v1/common/user";

export const sexOptions = [
  {
    value: UserGender.FEMALE,
    label: "女",
    type: "warning"
  },
  {
    value: UserGender.MALE,
    label: "男",
    type: "success"
  },
  {
    value: UserGender.SECRET,
    label: "保密",
    type: "danger"
  }
];
export const sexMap = sexOptions.reduce(
  (acc, cur) => {
    acc[cur.value] = cur;
    return acc;
  },
  {} as Record<number, any>
);

export const authorityOptions = [
  {
    value: UserAuthority.SYS_ADMIN,
    label: "超级管理员",
    type: "danger"
  },
  {
    value: UserAuthority.SYS_MANAGER,
    label: "管理员",
    type: "warning"
  },
  {
    value: UserAuthority.CUSTOMER_USER,
    label: "普通用户",
    type: "info"
  }
];

export const authorityMap = authorityOptions.reduce(
  (acc, cur) => {
    acc[cur.value] = cur;
    return acc;
  },
  {} as Record<number, any>
);

export const statusOptions = [
  {
    value: UserStatus.ON,
    label: "启用"
  },
  {
    value: UserStatus.OFF,
    label: "禁用"
  }
];

export const statusMap = statusOptions.reduce(
  (acc, cur) => {
    acc[cur.value] = cur.label;
    return acc;
  },
  {} as Record<number, string>
);

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  nickname: [{ required: true, message: "用户昵称为必填项", trigger: "blur" }],
  username: [{ required: true, message: "用户名称为必填项", trigger: "blur" }],
  password: [{ required: true, message: "用户密码为必填项", trigger: "blur" }],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isPhone(value)) {
          callback(new Error("请输入正确的手机号码格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
      // trigger: "click" // 如果想在点击确定按钮时触发这个校验，trigger 设置成 click 即可
    }
  ],
  email: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isEmail(value)) {
          callback(new Error("请输入正确的邮箱格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});
