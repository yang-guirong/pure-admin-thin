<template>
  <div>
    <el-card>
      <PlusSearch
        v-model="searchFormData"
        :columns="searchFormColumns"
        :show-number="2"
        label-width="100px"
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
          width: 200,
          actionBarTableColumnProps: {
            align: 'center'
          }
        }"
        has-index-column
        :pagination="{
          total: tableDataTotalRow,
          modelValue: pageInfo,
          pageSizeList: [10, 20, 50],
          align: 'right'
        }"
        @paginationChange="handlePaginationChange"
      >
        <template #toolbar>
          <el-tooltip
            effect="dark"
            :content="transformI18n($t('common.add'))"
            placement="top"
          >
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
        colProps: { span: 12 },
        labelWidth: '100px'
      }"
      :dialog="{
        title:
          dialogFormOptCode === 'edit'
            ? transformI18n($t('common.edit'))
            : dialogFormOptCode === 'add'
              ? transformI18n($t('common.add'))
              : ''
      }"
      @cancel="handleDialogFormCancel"
      @confirm="handleDialogFormConfirm"
    />
    <PlusDialog
      v-model="detailDialogVisible"
      :title="transformI18n($t('common.detail'))"
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
  FieldValues,
  PageInfo
} from "plus-pro-components";
import { useTable } from "plus-pro-components";
import datasourceApi, {
  DatasourceInfo as TableRow
} from "@/api/code-generator/datasource";
import { ElMessage } from "element-plus";
import { CirclePlus } from "@element-plus/icons-vue";
import { $t, transformI18n } from "@/plugins/i18n";

defineOptions({
  name: "DatasourcePage"
});

// 搜索表单绑定参数
const searchFormData: Ref<FieldValues> = ref({});
// 搜索表单列配置
const searchFormColumns: Ref<PlusColumn[]> = computed(() => [
  {
    label: transformI18n($t("entity.DataSourceInfo.name")),
    prop: "name"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.dbType")),
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
    label: transformI18n($t("entity.DataSourceInfo.driverClassName")),
    prop: "driverClassName"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.dbHost")),
    prop: "dbHost"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.databaseName")),
    prop: "databaseName"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.schemaName")),
    prop: "schemaName"
  }
]);
// 表单搜索
const handleSearchFormSearch = (values: any) => {
  console.log("handleSearchFormSearch", values);
  getTableDataList();
};
// 搜索表单重置
const handleSearchFormReset = () => {
  getTableDataList();
};
// 分页改变
const handlePaginationChange = (_pageInfo: PageInfo) => {
  pageInfo.value = _pageInfo;
  getTableDataList();
};

const {
  tableData,
  buttons,
  pageInfo,
  total: tableDataTotalRow
} = useTable<TableRow[]>();
// 表格操作列按钮
buttons.value = [
  {
    text: () => transformI18n($t("common.detail")),
    code: "view",
    props: (row: any) => ({
      type: "info"
    }),
    async onClick(params: ButtonsCallBackParams) {
      // 展示详情页弹框
      const { code, message, data } = await datasourceApi.get(params.row.id);
      if (code !== 200) {
        ElMessage.error(message);
      } else {
        detailDialogData.value = data;
        detailDialogVisible.value = true;
      }
    }
  },
  {
    text: () => transformI18n($t("common.edit")),
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
    text: () => transformI18n($t("common.delete")),
    code: "delete",
    props: (row: any) => ({
      type: "danger"
    }),
    confirm: {
      options: { draggable: true },
      message: data =>
        /*`确定删除id为${data.row.id}的数据吗？`*/
        transformI18n($t("common.confirmDelete"))
    },
    async onConfirm(params: ButtonsCallBackParams) {
      const { code, message } = await datasourceApi.remove(params.row.id);
      if (code !== 200) {
        ElMessage.error(message);
      } else {
        getTableDataList();
      }
    }
  },
  {
    text: () => transformI18n($t("buttons.custom.testConnection")),
    code: "test-connection",
    props: (row: any) => ({
      type: "info"
    }),
    async onClick(params: ButtonsCallBackParams) {
      const { code, message } = await datasourceApi.testConnection(params.row.id);
      if (code !== 200) {
        ElMessage.error(
          transformI18n($t("buttons.custom.testConnectionFailed")) + message
        );
      } else {
        ElMessage.success(
          transformI18n($t("buttons.custom.testConnectionSuccess"))
        );
      }
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
    label: transformI18n($t("entity.DataSourceInfo.name")),
    prop: "name",
    minWidth: 100,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.dbType")),
    prop: "dbType",
    minWidth: 100,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.driverClassName")),
    prop: "driverClassName",
    minWidth: 120,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.dbHost")),
    prop: "dbHost",
    minWidth: 120,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.port")),
    prop: "port",
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.databaseName")),
    prop: "databaseName",
    minWidth: 100,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.schemaName")),
    prop: "schemaName",
    minWidth: 100,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.params")),
    prop: "params",
    minWidth: 110,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.username")),
    prop: "username",
    minWidth: 100,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.remark")),
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
  dialogFormVisible.value = false;
};
// 弹框表单确定
const handleDialogFormConfirm = async (values: FieldValues) => {
  // @ts-ignore
  const data = { ...values } as TableRow;
  if (dialogFormOptCode.value === "add") {
    const { code, message } = await datasourceApi.save(data);
    if (code !== 200) {
      ElMessage.error(transformI18n($t("common.operationFailed")) + message);
    } else {
      dialogFormVisible.value = false;
      getTableDataList();
    }
  } else if (dialogFormOptCode.value === "edit") {
    const { code, message } = await datasourceApi.modify(data);
    if (code !== 200) {
      ElMessage.error(transformI18n($t("common.operationFailed")) + message);
    } else {
      dialogFormVisible.value = false;
      getTableDataList();
    }
  }
  dialogFormVisible.value = false;
};
// 弹框表单校验规则
const dialogFormRules = {
  name: [{ required: true }],
  dbType: [{ required: true }],
  driverClassName: [{ required: true }],
  dbHost: [{ required: true }],
  port: [{ required: true }],
  databaseName: [{ required: true }],
  username: [{ required: true }],
  password: [{ required: true }]
};
// 弹框表单列配置
const dialogFormColumns: Ref<PlusColumn[]> = computed(() => [
  {
    label: transformI18n($t("entity.DataSourceInfo.name")),
    prop: "name"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.dbType")),
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
    label: transformI18n($t("entity.DataSourceInfo.driverClassName")),
    prop: "driverClassName",
    valueType: "select",
    options: [
      {
        label: "com.mysql.cj.jdbc.Driver",
        value: "com.mysql.cj.jdbc.Driver"
      },
      {
        label: "org.postgresql.Driver",
        value: "org.postgresql.Driver"
      }
    ]
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.dbHost")),
    prop: "dbHost",
    tooltip: "域名或ip"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.port")),
    prop: "port",
    valueType: "input-number"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.databaseName")),
    prop: "databaseName"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.schemaName")),
    prop: "schemaName"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.params")),
    prop: "params"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.username")),
    prop: "username"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.password")),
    prop: "password"
  },
  {
    label: transformI18n($t("entity.DataSourceInfo.remark")),
    prop: "remark",
    valueType: "textarea",
    colProps: {
      span: 24
    }
  }
]);

// 详情弹框显示状态
const detailDialogVisible = ref(false);
// 详情弹框显示列
const detailDialogColumns: Ref<PlusColumn[]> = computed(() => [
  ...dialogFormColumns.value
]);
// 详情弹框数据
const detailDialogData = ref({});

const getTableDataList = async () => {
  const { data } = await datasourceApi.list({
    ...searchFormData.value,
    _pageSize: pageInfo.value.pageSize,
    _pageNum: pageInfo.value.page
  });
  tableData.value = data.records || [];
  tableDataTotalRow.value = data.totalRow || 0;
  pageInfo.value.page = data.pageNumber || 1;
  pageInfo.value.pageSize = data.pageSize || 10;
};
onMounted(() => {
  getTableDataList();
});
</script>
