import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection, getKeyList, handleTree } from "@pureadmin/utils";
import {
  createRole,
  deleteRoles,
  getApiInfoList,
  getRoleCount,
  getRoleList,
  getRolePolicy,
  updateRolePolicy,
  updateRoles
} from "@/api/admin";
import { type Ref, reactive, ref, onMounted, h, watch } from "vue";
import { RoleStatus } from "@/api/api/v1/common/user";
import { roleStatusMap } from "./rule";

export function useRole(treeRef: Ref) {
  const form = reactive({
    name: "",
    code: "",
    status: ""
  });
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const treeIds = ref([]);
  const treeData = ref([]);
  const flatTreeData = ref([]);
  const isShow = ref(false);
  const loading = ref(true);
  const isLinkage = ref(true);
  const treeSearchValue = ref();
  const switchLoadMap = ref({});
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
  const { switchStyle } = usePublicHooks();
  const treeProps = {
    value: "id",
    label: "title",
    children: "children"
  };
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "角色编号",
      prop: "id"
    },
    {
      label: "角色名称",
      prop: "name"
    },
    {
      label: "角色标识",
      prop: "code"
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={RoleStatus.R_ON}
          inactive-value={RoleStatus.R_OFF}
          active-text={roleStatusMap[RoleStatus.R_ON]}
          inactive-text={roleStatusMap[RoleStatus.R_OFF]}
          inline-prompt
          style={switchStyle.value}
          onChange={() => onRoleStatusChange(scope as any)}
        />
      )
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 160
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        dayjs(createTime * 1000).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];
  // const buttonClass = computed(() => {
  //   return [
  //     "h-[20px]!",
  //     "reset-margin",
  //     "text-gray-500!",
  //     "dark:text-white!",
  //     "dark:hover:text-primary!"
  //   ];
  // });

  function onRoleStatusChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === RoleStatus.R_OFF
          ? roleStatusMap[RoleStatus.R_OFF]
          : roleStatusMap[RoleStatus.R_ON]
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.name
      }</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    ).then(() => {
      switchLoadMap.value[index] = Object.assign(
        {},
        switchLoadMap.value[index],
        {
          loading: true
        }
      );
      updateRoles({
        roles: [
          {
            code: row.code,
            status: row.status
          }
        ]
      })
        .then(() => {
          message("已成功修改角色状态", {
            type: "success"
          });
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
        })
        .catch(error => {
          message(`修改角色状态失败: ${error}`, {
            type: "error"
          });
          row.status === RoleStatus.R_OFF
            ? (row.status = RoleStatus.R_ON)
            : (row.status = RoleStatus.R_OFF);
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
        });
    });
  }

  function handleDelete(row) {
    deleteRoles({ codes: [row.code] })
      .then(() => {
        message(`您删除了角色名称为${row.name}的这条数据`, { type: "success" });
        onSearch();
      })
      .catch(error => {
        message(`删除角色${row.name}失败: ${error}`, {
          type: "error"
        });
      });
  }

  function handleSizeChange(val: number) {
    // console.log(`${val} items per page`);
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    // console.log(`current page: ${val}`);
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    try {
      const countResponse = await getRoleCount();
      pagination.total = countResponse.data;

      const data = await getRoleList({
        page: {
          offset: (pagination.currentPage - 1) * pagination.pageSize,
          pageSize: pagination.pageSize
        },
        name: form.name
      });
      dataList.value = data.roles;
    } catch (error) {
      message(`获取角色列表失败: ${error}`, {
        type: "error"
      });
      dataList.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}角色`,
      props: {
        formInline: {
          title,
          ...row
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了角色名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            console.log("openDialog curData", curData);
            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              createRole({ role: curData })
                .then(() => {
                  message("新增角色成功", {
                    type: "success"
                  });
                  chores();
                })
                .catch(error => {
                  message(`新增角色失败: ${error}`, {
                    type: "error"
                  });
                });
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              updateRoles({ roles: [curData] })
                .then(() => {
                  message("修改角色成功", {
                    type: "success"
                  });
                  chores();
                })
                .catch(error => {
                  message(`修改角色失败: ${error}`, {
                    type: "error"
                  });
                });
            }
          }
        });
      }
    });
  }

  /** 权限 */
  async function handleRolePolicy(row?: any) {
    const { code } = row;
    if (code) {
      curRow.value = row;
      isShow.value = true;
      try {
        const { apiInfo } = await getRolePolicy(row.code);
        treeRef.value.setCheckedKeys(apiInfo.map(item => item.name));
      } catch (error) {
        message(`获取角色权限失败: ${error}`, {
          type: "error"
        });
        isShow.value = false;
      }
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  /** 权限-保存 */
  function handleRolePolicySave() {
    const { code, name } = curRow.value;
    const apiInfo = flatTreeData.value.filter(item => item.type !== 0);
    const checkedKeys = treeRef.value.getCheckedKeys();
    const checkedApiInfo = apiInfo.filter(item =>
      checkedKeys.includes(item.id)
    );
    // 根据用户 id 调用实际项目中菜单权限修改接口
    updateRolePolicy({
      roleCode: code,
      apiName: checkedApiInfo.map(item => item.id)
    })
      .then(() => {
        message(`角色名称为${name}的菜单权限修改成功`, {
          type: "success"
        });
      })
      .catch(error => {
        message(`角色名称为${name}的菜单权限修改失败: ${error}`, {
          type: "error"
        });
      });
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 数据权限 可自行开发 */
  // function handleDatabase() {}

  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };

  const filterMethod = (query: string, node) => {
    return node.title!.includes(query);
  };

  onMounted(async () => {
    onSearch();
    const { apiTypeMap } = await getApiInfoList();
    const data = [];
    for (const [key, value] of Object.entries(apiTypeMap)) {
      data.push({
        id: key,
        title: key,
        type: 0, // 0: 菜单, 1: 接口
        parentId: 0
      });
      for (const api of value.apiInfo) {
        data.push({
          id: api.name,
          title: api.name,
          type: 1, // 0: 菜单, 1: 接口
          parentId: key
        });
      }
    }
    flatTreeData.value = data;
    treeIds.value = getKeyList(data, "id");
    treeData.value = handleTree(data);
    // console.log("data", treeData.value);
  });

  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value)
      : treeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value)
      : treeRef.value.setCheckedKeys([]);
  });

  return {
    form,
    isShow,
    curRow,
    loading,
    columns,
    rowStyle,
    dataList,
    treeData,
    treeProps,
    isLinkage,
    pagination,
    isExpandAll,
    isSelectAll,
    treeSearchValue,
    // buttonClass,
    onSearch,
    resetForm,
    openDialog,
    handleRolePolicy,
    handleRolePolicySave,
    handleDelete,
    filterMethod,
    onQueryChanged,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
