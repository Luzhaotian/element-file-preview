import FileImagePreview from "./file-image-preview/main";

// 样式：请在业务项目中引入 Element UI 的 theme-chalk（含 image / image-viewer 相关）。

const components = [FileImagePreview];

const install = function (Vue) {
  components.forEach((com) => {
    Vue.component(com.name, com);
  });
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
};

export { FileImagePreview };
