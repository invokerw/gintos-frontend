<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { RoleStatus } from "@/api/api/v1/common/user";
import { roleStatusMap } from "./utils/rule";
import { usePublicHooks } from "../hooks";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    name: "",
    code: "",
    remark: "",
    status: RoleStatus.R_ON,
    sortId: 10
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const { switchStyle } = usePublicHooks();

function getRef() {
  return ruleFormRef.value;
}

function handleSortInput(value: string) {
  const num = Number(value);
  if (num < 1) {
    newFormInline.value.sortId = 1;
  } else if (num > 1000) {
    newFormInline.value.sortId = 1000;
  }
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-form-item label="角色名称" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="请输入角色名称"
      />
    </el-form-item>

    <el-form-item
      v-if="newFormInline.title === '新增'"
      label="角色标识"
      prop="code"
    >
      <el-input
        v-model="newFormInline.code"
        clearable
        placeholder="请输入角色标识"
      />
    </el-form-item>

    <el-form-item label="角色状态">
      <el-switch
        v-model="newFormInline.status"
        inline-prompt
        :active-value="RoleStatus.R_ON"
        :inactive-value="RoleStatus.R_OFF"
        :active-text="roleStatusMap[RoleStatus.R_ON]"
        :inactive-text="roleStatusMap[RoleStatus.R_OFF]"
        :style="switchStyle"
      />
    </el-form-item>

    <el-form-item label="排序" prop="sortId">
      <el-input
        v-model.number="newFormInline.sortId"
        type="number"
        :min="1"
        :max="1000"
        placeholder="请输入1-1000之间的数字"
        @input="handleSortInput"
      />
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
      />
    </el-form-item>
  </el-form>
</template>
