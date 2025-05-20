// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

import type { Role } from "@/api/api/v1/common/user";

interface FormItemProps extends Role {
  /** 用于判断是`新增`还是`修改` */
  title: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
