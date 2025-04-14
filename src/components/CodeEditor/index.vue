<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import * as monaco from "monaco-editor";
import { useDark } from "@pureadmin/utils";
import { useDropZone } from "@vueuse/core";
import { useDebounceFn } from "@vueuse/core";
import CodeBoxLine from "@iconify-icons/ri/code-box-line";

const { isDark } = useDark();

const props = defineProps({
  language: {
    type: String,
    default: "typescript",
    required: true
  },
  code: {
    type: String,
    default: "",
    required: true
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(["onChange"]);

const editorContainer = ref(null);
const editorInstance = shallowRef<monaco.editor.IStandaloneCodeEditor>(null);

const currentCode = ref<string>("");
const currentPosition = ref<monaco.IPosition>({
  lineNumber: 0,
  column: 0
});

const currentLanguage = ref<string>(props.language);
const languageList = ref<string[]>([
  "java",
  "javascript",
  "typescript",
  "html",
  "xml",
  "css",
  "react",
  "sql",
  "json",
  "yaml",
  "markdown",
  "txt"
]);
const switchLanguage = (language: string) => {
  if (language === currentLanguage.value) {
    return;
  }
  currentLanguage.value = language;
  monaco.editor.setModelLanguage(editorInstance.value.getModel(), language);
};

// 拖拽文件
useDropZone(editorContainer, {
  onDrop: (files: File[] | null) => {
    // 读取文件内容
    const file = files?.[0];
    // 对文件大小进行限制
    if (file && file.size > 1024 * 1024 * 2) {
      ElMessage.error("文件大小不能超过2MB");
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result as string;
        // 将文件内容设置为编辑器内容
        editorInstance.value.setValue(content);
        // 获取后缀名，需要考虑文件名中有多个点的情况
        const suffix = file.name.split(".").pop();
        // 将后缀名与语言列表进行匹配
        let targetLanguage = languageList.value.find(
          lang => lang.toLowerCase() === suffix.toLowerCase()
        );
        if (!targetLanguage) {
          switch (suffix) {
            case "js":
              targetLanguage = "javascript";
              break;
            case "ts":
              targetLanguage = "typescript";
              break;
            case "yaml":
            case "yml":
              targetLanguage = "yaml";
              break;
            case "md":
              targetLanguage = "markdown";
              break;
            case "vue":
            case "htm":
              targetLanguage = "html";
              break;
            default:
              targetLanguage = "txt";
              break;
          }
        }
        switchLanguage(targetLanguage);
      };
      reader.readAsText(file);
    }
  },
  // dataTypes: ["java", "js", "ts", "yaml", "yml", "md", "txt", "json", "sql", "xml", "txt"],
  // control multi-file drop
  multiple: false,
  // whether to prevent default behavior for unhandled events
  preventDefaultForUnhandled: false
});

const initEditor = (
  language: string,
  value: string,
  readOnly: boolean,
  theme: string
) => {
  editorInstance.value = monaco.editor.create(editorContainer.value, {
    value: value,
    language: language,
    theme: theme,
    automaticLayout: true,
    minimap: {
      enabled: false
    },
    scrollbar: {
      vertical: "auto",
      horizontal: "auto"
    },
    readOnly: readOnly
  });
  // 监听代码变化
  editorInstance.value.onDidChangeModelContent(
    useDebounceFn(() => {
      currentCode.value = editorInstance.value.getValue();
      emit("onChange", currentCode.value);
    }, 1000)
  );
};

const reloadEditor = (
  language: string,
  value: string,
  readOnly: boolean,
  theme: string
) => {
  // 记录当前光标位置
  const position = editorInstance.value.getPosition();
  currentPosition.value = {
    lineNumber: position.lineNumber,
    column: position.column
  };
  if (editorInstance.value) {
    editorInstance.value.dispose();
  }
  initEditor(language, value, readOnly, theme);
  // 设置光标位置
  if (editorInstance.value) {
    editorInstance.value.setPosition(currentPosition.value);
  }
};

// 挂载组件时初始化编辑器
onMounted(() => {
  currentLanguage.value = props.language;
  initEditor(
    props.language,
    props.code,
    props.readOnly,
    isDark.value ? "vs-dark" : "vs"
  );
});

// 卸载组件时销毁编辑器
onBeforeUnmount(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose();
  }
});

// 监听代码变化
watch(
  () => props.code,
  newValue => {
    if (editorInstance.value) {
      editorInstance.value.setValue(newValue);
      currentCode.value = newValue;
    }
  }
);
// 监听语言变化
watch(
  () => props.language,
  newValue => {
    currentLanguage.value = newValue;
    monaco.editor.setModelLanguage(editorInstance.value.getModel(), newValue);
  }
);
// 监听只读状态变化
watch(
  () => props.readOnly,
  newValue => {
    reloadEditor(
      props.language,
      currentCode.value,
      newValue,
      isDark.value ? "vs-dark" : "vs"
    );
  }
);
// 监听主题变化
watch(
  () => isDark.value,
  newValue => {
    monaco.editor.setTheme(newValue ? "vs-dark" : "vs");
  }
);
defineExpose({
  getEditorInstance() {
    return editorInstance.value;
  },
  getEditorValue() {
    return editorInstance.value.getValue();
  }
});
</script>

<template>
  <div>
    <div ref="editorContainer" style="height: calc(100vh - 170px)" />
    <div id="status-bar" class="status-bar">
      <el-dropdown placement="top" trigger="click">
        <el-row>
          <el-space wrap :size="10">
            <IconifyIconOffline :icon="CodeBoxLine" />
            <span style="font-size: 14px"> {{ currentLanguage }}</span>
          </el-space>
        </el-row>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="language in languageList"
              :key="language"
              @click="switchLanguage(language)"
              >{{ language }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.status-bar {
  text-align: right;
  background: #1e1e1e;
  color: #cccccc;
  width: auto;
  height: 16px;
  font-size: 12px;
  position: absolute;
  right: 88px;
  bottom: 44px;
  cursor: pointer;
  z-index: 1000;
}
</style>
