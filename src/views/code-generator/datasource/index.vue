<template>
  <div>
    <el-card>
      <PlusSearch
        v-model="searchFormData"
        :columns="searchFormColumns"
        :show-number="2"
        style="margin-bottom: 10px"
        @search="handleSearchFormSearch"
        @reset="handleSearchFormReset"
      />
      <PlusTable
        :columns="tableColumns"
        :table-data="tableData"
        :action-bar="{
          buttons: buttons,
          type: 'link',
          width: 140,
          actionBarTableColumnProps: {
            align: 'center'
          }
        }"
        has-index-column
      >
        <template #toolbar>
          <el-tooltip effect="dark" content="新增" placement="top">
            <el-button size="small" :icon="CirclePlus" @click="handleAddData" />
          </el-tooltip>
        </template>
      </PlusTable>
    </el-card>
    <PlusDialogForm
      v-model="dialogFormData"
      v-model:visible="dialogFormVisible"
      :form="{
        rules: dialogFormRules,
        columns: dialogFormColumns,
        rowProps: { gutter: 20 },
        colProps: { span: 12 }
      }"
      :dialog="{
        title:
          dialogFormOptCode === 'edit'
            ? '编辑'
            : dialogFormOptCode === 'add'
              ? '新增'
              : ''
      }"
      @cancel="handleDialogFormCancel"
      @confirm="handleDialogFormConfirm"
    />
    <PlusDialog
      v-model="detailDialogVisible"
      title="详情"
      width="60%"
      draggable="true"
      close-on-click-modal
      close-on-press-escape
      :has-footer="false"
    >
      <PlusDescriptions
        :column="2"
        :columns="detailDialogColumns"
        :data="detailDialogData"
      />
    </PlusDialog>
  </div>
</template>

<script lang="ts" setup>
import {
  PlusColumn,
  ButtonsCallBackParams,
  FieldValues
} from "plus-pro-components";
import { useTable } from "plus-pro-components";
import datasourceApi, { DatasourceInfo } from "@/api/code-generator/datasource";
import { ElMessage } from "element-plus";
import { CirclePlus } from "@element-plus/icons-vue";
import { transformI18n } from "@/plugins/i18n";

defineOptions({
  name: "DatasourcePage"
});

type TableRow = DatasourceInfo;

// 搜索表单绑定参数
const searchFormData: Ref<FieldValues> = ref({});
// 搜索表单列配置
const searchFormColumns: PlusColumn[] = [
  {
    label: "名称",
    prop: "name"
  },
  {
    label: "类型",
    prop: "dbType",
    valueType: "select",
    options: [
      {
        label: "MySQL",
        value: "mysql"
      },
      {
        label: "PostgreSQL",
        value: "postgresql"
      }
    ]
  },
  {
    label: "驱动",
    prop: "driverClassName"
  },
  {
    label: "HOST",
    prop: "host",
    tooltip: "域名或ip"
  },
  {
    label: "数据库",
    prop: "databaseName"
  },
  {
    label: "模式",
    prop: "schemaName"
  }
];
// 表单搜索
const handleSearchFormSearch = (values: any) => {
  console.log("handleSearchFormSearch", values);
  getTableDataList();
};
// 搜索表单重置
const handleSearchFormReset = () => {
  console.log("handleSearchFormReset");
  getTableDataList();
};

const { tableData, buttons } = useTable<TableRow[]>();
// 表格操作列按钮
buttons.value = [
  {
    text: "查看",
    code: "view",
    props: (row: any) => ({
      type: "info"
    }),
    async onClick(params: ButtonsCallBackParams) {
      // 展示详情页弹框
      const { data } = await datasourceApi.get(params.row.id);
      detailDialogData.value = data;
      detailDialogVisible.value = true;
    }
  },
  {
    text: "编辑",
    code: "edit",
    props: (row: any) => ({
      type: "primary"
    }),
    onClick(params: ButtonsCallBackParams) {
      dialogFormVisible.value = true;
      dialogFormOptCode.value = "edit";
      dialogFormData.value = { ...params.row };
    }
  },
  {
    text: "删除",
    code: "delete",
    props: (row: any) => ({
      type: "danger"
    }),
    confirm: {
      options: { draggable: true },
      message: data => `确定删除id为${data.row.id}的数据吗？`
    },
    onClick(params: ButtonsCallBackParams) {
      console.log("onClick", params);
    },
    async onConfirm(params: ButtonsCallBackParams) {
      console.log("onConfirm", params);
      const { code, message } = await datasourceApi.remove(params.row.id);
      if (code !== 200) {
        ElMessage.error("删除失败!" + message);
      } else {
        getTableDataList();
      }
    },
    onCancel(params: ButtonsCallBackParams) {
      console.log("onCancel", params);
    }
  }
];
const tableColumns: Ref<PlusColumn[]> = computed(() => [
  {
    label: "ID",
    prop: "id",
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: transformI18n("menus.DatasourcePage"), // 适配国际化
    prop: "name",
    minWidth: 100,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: "类型",
    prop: "dbType",
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: "驱动",
    prop: "driverClassName",
    minWidth: 200,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: "HOST",
    prop: "host",
    minWidth: 120,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: "端口",
    prop: "port",
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: "数据库名",
    prop: "databaseName",
    minWidth: 120,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: "模式",
    prop: "schemaName",
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: "参数",
    prop: "params",
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: "用户名",
    prop: "username",
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: "备注",
    prop: "remark",
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  }
]);
const handleAddData = () => {
  dialogFormOptCode.value = "add";
  dialogFormData.value = {};
  dialogFormVisible.value = true;
};

// 表单弹框显示状态
const dialogFormVisible = ref(false);
// 表单弹框标题
const dialogFormOptCode = ref("edit");
// 表单弹框绑定参数
const dialogFormData = ref<FieldValues>({});
// 弹框表单取消
const handleDialogFormCancel = () => {
  console.log("cancel...");
  dialogFormVisible.value = false;
};
// 弹框表单确定
const handleDialogFormConfirm = async (values: FieldValues) => {
  console.log("handleDialogFormConfirm", values);
  console.log("handleDialogFormConfirm", isRef(values), isProxy(values));
  // @ts-ignore
  const data = { ...values } as TableRow;
  if (dialogFormOptCode.value === "add") {
    const { code, message } = await datasourceApi.save(data);
    if (code !== 200) {
      ElMessage.error("新增失败!" + message);
    } else {
      dialogFormVisible.value = false;
      getTableDataList();
    }
  } else if (dialogFormOptCode.value === "edit") {
    const { code, message } = await datasourceApi.modify(data.id, data);
    if (code !== 200) {
      ElMessage.error("编辑失败!" + message);
    } else {
      dialogFormVisible.value = false;
      getTableDataList();
    }
  }
  dialogFormVisible.value = false;
};
// 弹框表单校验规则
const dialogFormRules = {
  name: [
    {
      required: true,
      message: "请输入名称"
    }
  ],
  dbType: [
    {
      required: true,
      message: "请选择数据库类型"
    }
  ],
  driverClassName: [
    {
      required: true,
      message: "请输入驱动类名"
    }
  ],
  host: [
    {
      required: true,
      message: "请输入HOST"
    }
  ],
  port: [
    {
      required: true,
      message: "请输入端口"
    }
  ],
  databaseName: [
    {
      required: true,
      message: "请输入数据库"
    }
  ],
  username: [
    {
      required: true,
      message: "请输入用户名"
    }
  ],
  password: [
    {
      required: true,
      message: "请输入密码"
    }
  ]
};
// 弹框表单列配置
const dialogFormColumns: PlusColumn[] = [
  {
    label: "名称",
    prop: "name"
  },
  {
    label: "类型",
    prop: "dbType",
    valueType: "select",
    options: [
      {
        label: "MySQL",
        value: "mysql"
      },
      {
        label: "PostgreSQL",
        value: "postgresql"
      }
    ]
  },
  {
    label: "驱动",
    prop: "driverClassName"
  },
  {
    label: "HOST",
    prop: "host",
    tooltip: "域名或ip"
  },
  {
    label: "端口",
    prop: "port",
    valueType: "input-number"
  },
  {
    label: "数据库",
    prop: "databaseName"
  },
  {
    label: "模式",
    prop: "schemaName"
  },
  {
    label: "连接参数",
    prop: "schemaName"
  },
  {
    label: "用户名",
    prop: "username"
  },
  {
    label: "密码",
    prop: "password"
  },
  {
    label: "备注",
    prop: "remark",
    valueType: "textarea",
    colProps: {
      span: 24
    }
  }
];

// 详情弹框显示状态
const detailDialogVisible = ref(false);
// 详情弹框显示列
const detailDialogColumns = [...dialogFormColumns];
// 详情弹框数据
const detailDialogData = ref({});

const getTableDataList = async () => {
  try {
    const { data } = await datasourceApi.list(searchFormData.value);
    tableData.value = data || [];
  } catch (error) {
    console.log(error);
  }
};
onMounted(() => {
  getTableDataList();
});
</script>
