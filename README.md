# element-file-preview

基于 **Vue 2** 与 **Element UI** 的文件预览小库：缩略图网格 + 全屏层，样式与 `el-image-viewer` 的遮罩与按钮一致。图片、视频、音频排在同一列表中时，**左右切换会按顺序经过全部条目**。

## 特性

- **缩略图**：`FilePreview` 内置 `FilePreviewThumb`，按类型展示图 / 视频 / 音频格。
- **全屏**：单一 `MediaPreviewViewer` 壳层；图片带与 Element 相近的缩放、旋转、适应/原始尺寸、拖拽与滚轮；视频 / 音频为内嵌控件。
- **数据**：传入 `urls` 后由 `normalizePreviewItems` 推断 `type` 与 `mediaKind`；不支持的项在开发环境 `console.warn` 并跳过。
- **发布**：UMD / CommonJS 产物在 `dist/`，入口见 `package.json` 的 `main` 与 `files`。

## 环境要求

| 依赖       | 版本    |
| ---------- | ------- |
| Vue        | `^2.6`  |
| Element UI | `^2.15` |

业务项目需引入 **`element-ui/lib/theme-chalk/index.css`**（含 `image` / `image-viewer` 相关样式），否则全屏层按钮与工具条可能无样式。

## 安装

```bash
npm install element-file-preview
```

`element-ui` 与 `vue` 为 **peerDependencies**，请自行安装。

## 快速使用

### 全局注册

```javascript
import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import ElementFilePreview from "element-file-preview";

Vue.use(ElementUI);
Vue.use(ElementFilePreview);
```

会注册 **`FilePreview`**、**`FilePreviewThumb`**。为兼容旧代码，同时注册别名 **`FileMediaPreview`**、**`FileImagePreview`**（均指向 `FilePreview`，后续主版本可能移除）。

### 按需引入

```javascript
import { FilePreview, FilePreviewThumb } from "element-file-preview";

export default {
  components: { FilePreview, FilePreviewThumb },
};
```

### 工具函数（具名导出）

除组件外，入口还导出与类型 / 条目相关的工具（定义见 `packages/utils/resolve-items.js`）：

- **`previewItemsFromFiles`**、**`revokePreviewObjectUrls`**：本地 `File` / `Blob` 与对象 URL 生命周期（见下文「本地文件 / Blob」）。
- **`normalizePreviewItems`**、**`inferTypeFromUrl`**、**`inferTypeFromFileName`**、**`mediaKindFromType`**：可在写入 `urls` 前自行归一化或推断类型。

```javascript
import {
  FilePreview,
  previewItemsFromFiles,
  normalizePreviewItems,
} from "element-file-preview";
```

### 最小示例

```vue
<template>
  <file-preview
    :urls="fileItems"
    :thumb-size="140"
    :gap="16"
    :viewer-z-index="2000"
    :mask-closable="true"
  />
</template>

<script>
import { FilePreview } from "element-file-preview";

export default {
  components: { FilePreview },
  data() {
    return {
      fileItems: [
        { url: "https://example.com/a.png", type: "image/png" },
        { url: "https://example.com/b.jpg" },
        {
          url: "https://example.com/c.mp4",
          type: "video/mp4",
          poster: "https://example.com/c-poster.jpg",
        },
        {
          url: "https://example.com/d.mp3",
          type: "audio/mpeg",
          resetOnClose: false,
        },
      ],
    };
  },
};
</script>
```

## `FilePreview` 属性

| 属性           | 类型      | 默认值   | 说明                                                                                  |
| -------------- | --------- | -------- | ------------------------------------------------------------------------------------- |
| `urls`         | `Array`   | （必填） | 见下文「每一项形状」                                                                  |
| `thumbSize`    | `Number`  | `140`    | 缩略格边长（px）                                                                      |
| `gap`          | `Number`  | `16`     | 缩略格间距（px）                                                                      |
| `viewerZIndex` | `Number`  | `2000`   | 全屏层 z-index                                                                        |
| `maskClosable` | `Boolean` | `true`   | 点击遮罩是否关闭全屏（建议写 `:mask-closable="false"`，勿写无绑定的字符串 `"false"`） |

## `urls` 每一项

对象字段：

| 字段            | 必填 | 说明                                                                                         |
| --------------- | ---- | -------------------------------------------------------------------------------------------- |
| `url`           | 是   | 资源地址                                                                                     |
| `type`          | 否   | MIME 或扩展语义（如 `image/png`、`video/mp4`）；缺省时从 URL 推断                            |
| `poster`        | 否   | 视频封面 / 预览图 URL                                                                        |
| `resetOnClose`  | 否   | 仅 **视频 / 音频**；默认 `true`：关闭全屏时暂停并 `currentTime = 0`；`false` 时保留进度      |
| `name`          | 否   | 文件名；`blob:` 等无扩展路径的 URL 可凭此推断类型                                            |
| `__isObjectUrl` | 否   | 为 `true` 时，`FilePreview` 销毁会对该项 `URL.revokeObjectURL`（见 `previewItemsFromFiles`） |

解析后条目含 `mediaKind`（`image` | `video` | `audio`）等，供内部与 `FilePreviewThumb` 使用。

### 本地文件 / Blob（文件流预览）

使用 **`previewItemsFromFiles(files)`**（`files` 为 `File` / `Blob`、`File[]`、`FileList` 或 `Blob[]`）生成可合并进 `urls` 的条目：`url` 为 `URL.createObjectURL` 结果，并设置 **`type`**（优先 `file.type`，否则按扩展名推断）、**`name`**、**`__isObjectUrl: true`**。适用于本地上传、`<input type="file">`、`el-upload` 的 `raw` 等。

不再需要这些对象 URL 时，可调用 **`revokePreviewObjectUrls(items)`** 释放内存。`FilePreview` 会在 **`urls` 中去掉某条带 `__isObjectUrl` 的项时自动 revoke** 对应 blob，并在组件销毁时 revoke 仍留在列表中的此类项。

```javascript
import {
  FilePreview,
  previewItemsFromFiles,
  revokePreviewObjectUrls,
} from "element-file-preview";

// 例如 el-upload 的 on-change：file.raw 为 File
const items = previewItemsFromFiles([file.raw]);
this.urls = this.urls.concat(items);
```

## 全屏预览行为

- 使用 **`MediaPreviewViewer`**（本包内部组件，默认不从 `index` 导出）。
- **顺序**：与过滤后的 `mediaEntries` 顺序一致，上一张 / 下一张在**全部**图片与音视频之间循环（多于一条时显示左右箭头）。
- **图片**：底部工具条与快捷键行为对齐 Element `image-viewer` 习惯（含空格切换显示模式、方向键缩放等）。
- **键盘**：`Esc` 关闭；`←` `→` 切换条目（在图片模式下与 Element 一致）。

## `FilePreviewThumb`

单格缩略，适合自建列表时复用。

| 属性   | 类型     | 说明                                                                           |
| ------ | -------- | ------------------------------------------------------------------------------ |
| `item` | `Object` | 需含 `url`、`mediaKind`；可选 `poster` 等，与 `normalizePreviewItems` 输出一致 |

事件：**`activate`**，载荷为当前 `item`（点击或 Enter / Space）。

使用前需自行保证 `item` 已归一化，或从 `FilePreview` 同源数据传入。

## 源码目录 `packages/`

```
packages/
├── index.js                         # install、具名导出
├── components/
│   ├── FilePreview.vue
│   └── FilePreviewThumb.vue
├── viewer/
│   └── MediaPreviewViewer.vue       # 全屏壳 + 图片工具条 + 音视频画布
├── type-handlers/
│   ├── thumbs/                      # 视频 / 音频缩略
│   └── panes/                       # 全屏内 图 / 视频 / 音频
└── utils/
    └── resolve-items.js             # 类型推断与归一化
```

## 构建与本地演示

```bash
npm install
npm run lib      # 输出 dist/
npm run serve    # 演示应用
```

演示页（`src/App.vue`）在固定网络示例之外，通过 **原生 `<input type="file" multiple>`**（由 `el-button` 触发 `click()`）选择本地文件，使用 **`previewItemsFromFiles`** 生成对象 URL 并拼入 `urls`，用于验证 Blob / 文件流预览与 **`revokePreviewObjectUrls`** 清理；避免依赖 `el-upload` + `action="#"` 在部分环境下的兼容问题。

## 链接

- 仓库：<https://github.com/Luzhaotian/element-file-preview>
- 更新日志：[CHANGELOG.md](./CHANGELOG.md)

## 许可证

MIT
