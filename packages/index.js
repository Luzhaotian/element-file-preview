import FileMediaPreview from "./file-preview/file-media-preview.vue";

// 样式：请在业务项目中引入 Element UI 的 theme-chalk（含 image / image-viewer 相关）。

const components = [FileMediaPreview];

const install = function (Vue) {
  components.forEach((com) => {
    Vue.component(com.name, com);
    if (com.name === "FileMediaPreview") {
      Vue.component("FileImagePreview", com);
    }
  });
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
};

export { FileMediaPreview };

/** @deprecated 请改用 FileMediaPreview，将在后续主版本移除别名 */
export { FileMediaPreview as FileImagePreview };
