import "./reset.css";
import dayjs from "dayjs";
import roleForm from "../form/role.vue";
import editForm from "../form/index.vue";
import { zxcvbn } from "@zxcvbn-ts/core";
import { message } from "@/utils/message";
import userAvatar from "@/assets/user.jpg";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps, RoleFormItemProps } from "../utils/types";
import {
  getKeyList,
  isAllEmpty,
  hideTextAtIndex,
  deviceDetection
} from "@pureadmin/utils";
import {
  getUserList,
  getRoleList,
  getUserCount,
  createUser,
  updateUsers,
  deleteUsers
} from "@/api/admin";
import {
  ElForm,
  ElInput,
  ElFormItem,
  ElProgress,
  ElMessageBox
} from "element-plus";
import {
  type Ref,
  h,
  ref,
  watch,
  computed,
  reactive,
  onMounted,
  Fragment
} from "vue";
import type {
  DeleteUsersRequest,
  GetUserListRequest,
  UpdateUsersRequest
} from "@/api/api/v1/admin/admin";
import { UserGender, UserStatus } from "@/api/api/v1/common/user";
import { authorityMap, sexMap, statusMap } from "./rule";
import { useUserStoreHook } from "@/store/modules/user";

export function useUser(tableRef: Ref) {
  const form = reactive({
    username: "",
    phone: "",
    email: ""
  });
  const formRef = ref();
  const ruleFormRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  // 上传头像信息
  const avatarInfo = ref();
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "用户编号",
      prop: "id",
      width: 90
    },
    {
      label: "用户头像",
      prop: "avatar",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.avatar || userAvatar}
          preview-src-list={Array.of(row.avatar || userAvatar)}
          class="w-[24px] h-[24px] rounded-full align-middle"
        />
      ),
      width: 90
    },
    {
      label: "用户名称",
      prop: "username",
      minWidth: 130
    },
    {
      label: "用户昵称",
      prop: "nickname",
      minWidth: 130
    },
    {
      label: "性别",
      prop: "gender",
      minWidth: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={sexMap[row.gender] ? sexMap[row.gender].type : null}
          effect="plain"
        >
          {sexMap[row.gender]
            ? sexMap[row.gender].label
            : sexMap[UserGender.SECRET].label}
        </el-tag>
      )
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 90,
      formatter: ({ phone }) => hideTextAtIndex(phone, { start: 3, end: 6 })
    },
    {
      label: "邮箱",
      prop: "email",
      minWidth: 90
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
          active-value={UserStatus.ON}
          inactive-value={UserStatus.OFF}
          active-text={statusMap[UserStatus.ON]}
          inactive-text={statusMap[UserStatus.OFF]}
          inline-prompt
          style={switchStyle.value}
          onChange={() => onStatusChange(scope as any)}
        />
      )
    },
    {
      label: "权限",
      prop: "authority",
      minWidth: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={
            authorityMap[row.authority]
              ? authorityMap[row.authority].type
              : null
          }
          effect="plain"
        >
          {authorityMap[row.authority]
            ? authorityMap[row.authority].label
            : "未知"}
        </el-tag>
      )
    },
    {
      label: "角色",
      prop: "roleName",
      minWidth: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} type="info" effect="plain">
          {row.roleName || "无"}
        </el-tag>
      )
    },
    {
      label: "创建时间",
      minWidth: 90,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime * 1000).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "h-[20px]!",
      "reset-margin",
      "text-gray-500!",
      "dark:text-white!",
      "dark:hover:text-primary!"
    ];
  });
  // 重置的新密码
  const pwdForm = reactive({
    newPwd: ""
  });
  const pwdProgress = [
    { color: "#e74242", text: "非常弱" },
    { color: "#EFBD47", text: "弱" },
    { color: "#ffa500", text: "一般" },
    { color: "#1bbf1b", text: "强" },
    { color: "#008000", text: "非常强" }
  ];
  // 当前密码强度（0-4）
  const curScore = ref();
  const roleOptions = ref([]);

  function onStatusChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === UserStatus.OFF
          ? statusMap[UserStatus.OFF]
          : statusMap[UserStatus.ON]
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.username
      }</strong>用户吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(() => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        updateUsers({
          users: [
            {
              id: row.id,
              status: row.status
            }
          ]
        } as UpdateUsersRequest).then(() => {
          message("已成功修改用户状态", {
            type: "success"
          });
        });
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: false
          }
        );
      })
      .catch(() => {
        row.status === UserStatus.OFF
          ? (row.status = UserStatus.ON)
          : (row.status = UserStatus.OFF);
      });
  }

  function handleUpdate(row) {
    console.log(row);
  }

  function handleDelete(row) {
    const myUsername = useUserStoreHook().username;
    if (row.username === myUsername) {
      message("不能删除自己", { type: "error" });
      return;
    }
    deleteUsers({
      names: [row.username]
    } as DeleteUsersRequest)
      .then(() => {
        message(`您删除了用户${row.username}这条数据`, { type: "success" });
        onSearch();
      })
      .catch(err => {
        message(`删除用户${row.username}失败 ${err}`, {
          type: "error"
        });
      });
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    const myUsername = useUserStoreHook().username;
    if (curSelected.some(item => item.username === myUsername)) {
      message("不能删除自己", { type: "error" });
      return;
    }
    deleteUsers({
      names: getKeyList(curSelected, "username")
    } as DeleteUsersRequest)
      .then(() => {
        message(`已删除用户 ${getKeyList(curSelected, "username")} 的数据`, {
          type: "success"
        });
        tableRef.value.getTableRef().clearSelection();
        onSearch();
      })
      .catch(err => {
        message(`批量删除失败 ${err}`, { type: "error" });
      });
  }

  async function onSearch() {
    loading.value = true;
    pagination.total = (await getUserCount()).data;
    const reqData: GetUserListRequest = {
      page: {
        offset: (pagination.currentPage - 1) * pagination.pageSize,
        pageSize: pagination.pageSize
      },
      username: form.username,
      phone: form.phone,
      email: form.email
    };
    const data = await getUserList(reqData);
    dataList.value = data.users;
    // console.log("onSearch data", data.users);
    // console.log("onSearch dataList", dataList.value);

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          title,
          ...row
        }
      },
      width: "46%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了用户名称为${curData.username}的这条数据`, {
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
              createUser({ user: curData }).then(() => {
                message("新增用户成功", {
                  type: "success"
                });
                chores();
              });
            } else {
              updateUsers({ users: [curData] } as UpdateUsersRequest).then(
                () => {
                  message("修改用户成功", {
                    type: "success"
                  });
                  chores();
                }
              );
            }
          }
        });
      }
    });
  }

  const cropRef = ref();
  /** 上传头像 */
  function handleUpload(row) {
    addDialog({
      title: "裁剪、上传头像",
      width: "40%",
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: row.avatar || userAvatar,
          onCropper: info => (avatarInfo.value = info)
        }),
      beforeSure: done => {
        console.log("裁剪后的图片信息：", avatarInfo.value);
        // 根据实际业务使用avatarInfo.value和row里的某些字段去调用上传头像接口即可
        done(); // 关闭弹框
        onSearch(); // 刷新表格数据
      },
      closeCallBack: () => cropRef.value.hidePopover()
    });
  }

  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  /** 重置密码 */
  function handleReset(row) {
    addDialog({
      title: `重置 ${row.username} 用户的密码`,
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () => (
        <Fragment>
          <ElForm ref={ruleFormRef} model={pwdForm}>
            <ElFormItem
              prop="newPwd"
              rules={[
                {
                  required: true,
                  message: "请输入新密码",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPwd}
                placeholder="请输入新密码"
              />
            </ElFormItem>
          </ElForm>
          <div class="my-4 flex">
            {pwdProgress.map(({ color, text }, idx) => (
              <div
                class="w-[19vw]"
                style={{ marginLeft: idx !== 0 ? "4px" : 0 }}
              >
                <ElProgress
                  striped
                  striped-flow
                  duration={curScore.value === idx ? 6 : 0}
                  percentage={curScore.value >= idx ? 100 : 0}
                  color={color}
                  stroke-width={10}
                  show-text={false}
                />
                <p
                  class="text-center"
                  style={{ color: curScore.value === idx ? color : "" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </Fragment>
      ),
      closeCallBack: () => (pwdForm.newPwd = ""),
      beforeSure: done => {
        ruleFormRef.value.validate(valid => {
          if (valid) {
            updateUsers({
              users: [
                {
                  id: row.id,
                  password: pwdForm.newPwd
                }
              ]
            } as UpdateUsersRequest)
              .then(() => {
                message(`已成功重置 ${row.username} 用户的密码`, {
                  type: "success"
                });
                done(); // 关闭弹框
                onSearch(); // 刷新表格数据
              })
              .catch(err => {
                message(`重置 ${row.username} 用户的密码失败 ${err}`, {
                  type: "error"
                });
              });
          }
        });
      }
    });
  }

  /** 分配角色 */
  async function handleRole(row) {
    addDialog({
      title: `分配 ${row.username} 用户的角色`,
      props: {
        formInline: {
          username: row?.username ?? "",
          nickname: row?.nickname ?? "",
          roleOptions: roleOptions.value ?? [],
          roleName: row?.roleName ?? ""
        }
      },
      width: "400px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm),
      beforeSure: (done, { options }) => {
        const curData = options.props.formInline as RoleFormItemProps;
        console.log("curIds", curData.roleName);
        updateUsers({
          users: [
            {
              id: row.id,
              roleName: curData.roleName
            }
          ]
        } as UpdateUsersRequest)
          .then(data => {
            for (let i = 0; i < data.users.length; i++) {
              if (data.users[i].id === row.id) {
                row.roleName = data.users[i].roleName;
              }
            }
            message(`已成功分配 ${row.username} 用户角色`, {
              type: "success"
            });
            done(); // 关闭弹框
            onSearch(); // 刷新表格数据
          })
          .catch(err => {
            message(`分配 ${row.username} 用户角色失败 ${err}`, {
              type: "error"
            });
          });
      }
    });
  }

  onMounted(async () => {
    onSearch();

    // 角色列表
    roleOptions.value = (
      await getRoleList({
        page: {
          offset: 0,
          pageSize: 99999
        }
      })
    ).roles;
  });

  return {
    form,
    loading,
    columns,
    dataList,
    selectedNum,
    pagination,
    buttonClass,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleReset,
    handleRole,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
