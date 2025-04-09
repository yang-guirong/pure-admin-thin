<template>
  <div>
    <!-- 顶部分组 -->
    <el-tabs v-model="currentGroup.id" @tab-change="handleTabChange">
      <el-tab-pane
        v-for="item in groupList"
        :key="item.id"
        :label="item.name"
        :name="item.id"
      />
    </el-tabs>
    <!-- 表格 -->
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
      :pagination="{
        total: tableDataTotalRow,
        modelValue: pageInfo,
        pageSizeList: [10, 20, 50],
        align: 'right'
      }"
      style="margin-top: 10px"
      @paginationChange="handlePaginationChange"
    >
      <!-- 表格顶部按钮 -->
      <template #toolbar>
        <el-tooltip effect="dark" content="分组设置" placement="top">
          <el-dropdown size="small">
            <el-button
              size="small"
              :icon="Files"
              style="margin-top: 2px; margin-right: 10px"
            >
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleAddGroup">
                  新增分组
                </el-dropdown-item>
                <el-dropdown-item @click="handleEditGroup">
                  编辑分组
                </el-dropdown-item>
                <el-dropdown-item @click="handleDeleteGroup">
                  删除分组
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip effect="dark" content="新增模板" placement="top">
          <el-button
            size="small"
            :icon="CirclePlus"
            @click="handleAddTemplate"
          />
        </el-tooltip>
      </template>
    </PlusTable>
  </div>
</template>

<script lang="tsx" setup>
import { CirclePlus, ArrowDown, Files } from "@element-plus/icons-vue";
import templateApi, {
  CodeTemplate as TableRow,
  CodeTemplateGroup,
  CodeTemplate
} from "@/api/code-generator/codeTemplate";
import typeMappingApi, {
  TypeMappingGroup
} from "@/api/code-generator/typeMapping";

import {
  ButtonsCallBackParams,
  PageInfo,
  PlusColumn,
  PlusForm,
  PlusFormItem,
  useTable
} from "plus-pro-components";
import { TabPaneName, TabsPaneContext } from "element-plus";
import { addDialog } from "@/components/ReDialog";

defineOptions({
  name: "CodeTemplatePage"
});

const currentGroup: Ref<CodeTemplateGroup> = ref({} as CodeTemplateGroup);
const groupList: Ref<CodeTemplateGroup[]> = ref([]);

const {
  tableData,
  buttons,
  pageInfo,
  total: tableDataTotalRow
} = useTable<TableRow[]>();
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
      // const { data } = await templateApi.getTemplate(params.row.id);
    }
  },
  {
    text: "编辑",
    code: "edit",
    props: (row: any) => ({
      type: "primary"
    }),
    onClick(params: ButtonsCallBackParams) {}
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
      const { code, message } = await templateApi.removeTemplate(params.row.id);
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
    label: "名称",
    prop: "name",
    minWidth: 100,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  },
  {
    label: "类型",
    prop: "type",
    valueType: "select",
    options: [
      {
        label: "java源码文件",
        value: 1
      },
      {
        label: "resources资源文件",
        value: 2
      },
      {
        label: "前端文件",
        value: 3
      },
      {
        label: "其他",
        value: 4
      }
    ]
  },
  {
    label: "相对路径",
    prop: "relativePath",
    minWidth: 200,
    tableColumnProps: {
      align: "center",
      showOverflowTooltip: true
    }
  }
]);

const handleTabChange = (id: TabPaneName) => {
  const group = groupList.value.find(item => item.id === id);
  if (group) {
    Object.assign(currentGroup.value, group);
    getTableDataList();
  }
};

const handleAddGroup = () => {
  typeMappingApi
    .listGroup({ _pageSize: 1000000, _pageNum: 1, _sortBy: "name" })
    .then(res => {
      if (res.code === 200) {
        const typeMappingGroups = res.data.records;
        let formData = {
          groupName: "",
          typeMappingGroupId: null
        };
        const dialogFormColumns: PlusColumn[] = [
          {
            label: "模板分组名称",
            prop: "groupName"
          },
          {
            label: "类型映射分组",
            prop: "typeMappingGroupId",
            valueType: "select",
            options: typeMappingGroups.map(item => ({
              label: item.name,
              value: item.id
            }))
          }
        ];
        const dialogFormRules = {
          groupName: [{ required: true, message: "请输入分组名称" }],
          typeMappingGroupId: [
            { required: true, message: "请选择类型映射分组" }
          ]
        };
        addDialog({
          title: "新增分组",
          contentRenderer: () => (
            <PlusForm
              v-model={formData}
              columns={dialogFormColumns}
              rules={dialogFormRules}
              labelWidth="120px"
            >
              {{
                footer: (handleSubmit, handleReset) => <div></div>
              }}
            </PlusForm>
          ),
          beforeSure: (done, { options, index }) => {
            templateApi
              .saveGroup({
                id: null,
                name: formData.groupName,
                typeMappingGroupId: formData.typeMappingGroupId
              })
              .then(res => {
                if (res.code === 200) {
                  done();
                  getGroupList(() => {
                    getTableDataList();
                  });
                }
              });
          }
        });
      }
    });
};

const handleEditGroup = () => {
  typeMappingApi
    .listGroup({ _pageSize: 10000, _pageNum: 1, _sortBy: "name" })
    .then(res => {
      if (res.code === 200) {
        const typeMappingGroups = res.data.records;
        let formData: CodeTemplateGroup = Object.assign({}, currentGroup.value);
        const dialogFormColumns: PlusColumn[] = [
          {
            label: "模板分组名称",
            prop: "name"
          },
          {
            label: "类型映射分组",
            prop: "typeMappingGroupId",
            valueType: "select",
            options: typeMappingGroups.map(item => ({
              label: item.name,
              value: item.id
            }))
          }
        ];
        const dialogFormRules = {
          name: [{ required: true, message: "请输入分组名称" }],
          typeMappingGroupId: [
            { required: true, message: "请选择类型映射分组" }
          ]
        };
        addDialog({
          title: "编辑分组",
          contentRenderer: () => (
            <PlusForm
              v-model={formData}
              columns={dialogFormColumns}
              rules={dialogFormRules}
              labelWidth="120px"
            >
              {{
                footer: (handleSubmit, handleReset) => <div></div>
              }}
            </PlusForm>
          ),
          beforeSure: (done, { options, index }) => {
            templateApi.modifyGroup(formData).then(res => {
              if (res.code === 200) {
                done();
                getGroupList(() => {
                  Object.assign(currentGroup.value, res.data);
                  getTableDataList();
                });
              }
            });
          }
        });
      }
    });
};

const handleDeleteGroup = () => {
  addDialog({
    title: "删除分组",
    contentRenderer: () => <div>确定删除吗？</div>,
    beforeSure: (done, { options, index }) => {
      templateApi.removeGroup(currentGroup.value.id).then(() => {
        done();
        getGroupList(() => {
          getTableDataList();
        });
      });
    }
  });
};

const handleAddTemplate = () => {
  let formData: CodeTemplate = {
    id: null,
    groupId: currentGroup.value.id,
    name: "",
    type: null,
    content: "",
    relativePath: "",
    typeMappingGroupId: null
  };
  const dialogFormColumns: PlusColumn[] = [
    {
      label: "模板名称",
      prop: "name"
    },
    {
      label: "模板类型",
      prop: "type",
      valueType: "select",
      options: [
        { label: "java源码文件", value: 1 },
        { label: "resources资源文件", value: 2 },
        { label: "前端文件", value: 3 },
        { label: "其他", value: 4 }
      ]
    },
    {
      label: "模板内容",
      prop: "content",
      valueType: "textarea",
      fieldProps: {
        maxlength: 10,
        showWordLimit: true,
        autosize: { minRows: 2, maxRows: 4 }
      }
    },
    {
      label: "相对路径",
      prop: "relativePath"
    }
  ];
  const dialogFormRules = {
    name: [{ required: true, message: "请输入模板名称" }],
    type: [{ required: true, message: "请选择模板类型" }],
    content: [{ required: true, message: "请输入模板内容" }],
    relativePath: [{ required: true, message: "请输入相对路径" }]
  };
  addDialog({
    title: "新增模板",
    contentRenderer: () => (
      <PlusForm
        v-model={formData}
        rowProps={{ gutter: 20 }}
        colProps={{ span: 12 }}
        columns={dialogFormColumns}
        rules={dialogFormRules}
        labelWidth="120px"
      >
        {{
          footer: (handleSubmit, handleReset) => <div></div>
        }}
      </PlusForm>
    ),
    beforeSure: (done, { options, index }) => {
      templateApi.saveTemplate(formData).then(res => {
        if (res.code === 200) {
          done();
          getTableDataList();
        }
      });
    }
  });
};

const handleEditTemplate = () => {
  console.log("handleEditTemplate");
};

const handleDeleteTemplate = () => {
  console.log("handleDeleteTemplate");
};

const getTableDataList = async (callback?: () => void) => {
  try {
    const { data } = await templateApi.listTemplate({
      _pageSize: pageInfo.value.pageSize,
      _pageNum: pageInfo.value.page
    });
    tableData.value = data.records || [];
    tableDataTotalRow.value = data.totalRow || 0;
    pageInfo.value.page = data.pageNumber || 1;
    pageInfo.value.pageSize = data.pageSize || 10;
    callback?.();
  } catch (error) {
    console.log(error);
  }
};

// 分页改变
const handlePaginationChange = (_pageInfo: PageInfo) => {
  pageInfo.value = _pageInfo;
  getTableDataList();
};

const getGroupList = async (callback?: () => void) => {
  const { data } = await templateApi.listGroup({
    _pageSize: 10000,
    _pageNum: 1,
    _sortBy: "id"
  });
  groupList.value = data.records || [];
  if (groupList.value.length > 0) {
    Object.assign(currentGroup.value, groupList.value[0]);
  }
  callback?.();
};

onMounted(() => {
  getGroupList();
});
</script>
<style lang="scss" scoped></style>
