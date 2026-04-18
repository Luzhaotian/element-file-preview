import FilePreview from "./components/FilePreview.vue";
import FilePreviewThumb from "./components/FilePreviewThumb.vue";

// 样式：请在业务项目中引入 Element UI 的 theme-chalk（含 image / image-viewer 相关）。

const components = [FilePreview, FilePreviewThumb];

const install = function (Vue) {
  components.forEach((com) => {
    Vue.component(com.name, com);
    if (com.name === "FilePreview") {
      Vue.component("FileMediaPreview", com);
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

export { FilePreview, FilePreviewThumb };

/** @deprecated 请改用 FilePreview */
export { FilePreview as FileMediaPreview };

/** @deprecated 请改用 FilePreview */
export { FilePreview as FileImagePreview };
