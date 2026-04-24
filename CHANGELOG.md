# 更新日志

本文件记录每次发布时的变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增

- 支持 **PDF 预览**：接入 `pdfjs-dist`，可将 PDF 渲染为页图；支持在缩略图区展示封面或全部页（`pdfThumbCoverOnly`）。
- 支持 **Excel 预览**：接入 `xlsx`，支持 `xls/xlsx/xlsm/csv`，全屏以表格渲染并支持多 Sheet 切换。
- 支持 **Word 预览**：接入 `mammoth`，支持 `docx` 转 HTML 预览；`doc` 文件给出兼容提示。
- `FilePreview` 新增属性 **`pdfThumbCoverOnly`**（默认 `true`），可由业务侧控制 PDF 缩略图模式（封面 / 全页）。

### 修复

- 修复“上传文件后列表偶发不显示”问题：`resolveUrls` 改为两阶段更新（先渲染基础列表，再异步补齐 PDF 拆页），避免被慢速 PDF 解析阻塞。
- 修复 PDF worker 初始化报错：为 `pdfjs-dist@5` 显式设置 `GlobalWorkerOptions.workerSrc`。
- 修复 PDF 预览回归：在“缩略图仅封面”模式下，点击封面仍可进入整份 PDF 的全页序列预览。

### 文档

- README 新增 PDF / Excel / Word 能力说明、`pdfThumbCoverOnly` 参数说明与演示更新。

## [0.2.0] - 2026-04-19

### 变更（破坏性）

- 主组件更名为 **`FilePreview`**（文件预览）；仍可通过 **`FileMediaPreview`**、**`FileImagePreview`** 别名引入或全局注册。
- `urls` 为 **`{ url, type?, poster?, name?, resetOnClose?, __isObjectUrl? }` 对象数组**；`type` 可选，缺省时从 URL / `name` 推断，无法识别或不支持预览时在开发环境 `console.warn`，且该条不展示。

### 新增

- 支持 **视频、音频** 预览：全屏层沿用 `el-image-viewer` 遮罩与按钮样式；视频缩略可选 **`poster`**。
- 源码目录整理为 **`packages/components`**、**`packages/viewer`**、**`packages/type-handlers`**、**`packages/utils`**，入口 **`packages/index.js`**。
- **`FilePreview`**：**`maskClosable`**（默认 `true`）；视频 / 音频 **`resetOnClose`**（默认 `true`）。
- **本地 Blob / 文件流**：**`previewItemsFromFiles`**、**`revokePreviewObjectUrls`**；`FilePreview` 在 **`urls` 移除 blob 项或组件销毁时** 对仍占用的 `blob:` 地址调用 `URL.revokeObjectURL`（与 `__isObjectUrl` / `blob:` 检测配合）。
- **`index.js` 具名导出**：`inferTypeFromFileName`、`normalizePreviewItems`、`inferTypeFromUrl`、`mediaKindFromType`（便于业务侧预处理条目）。
- 修复自定义预览层遮罩盖住内容：预览根类名 **`file-preview-viewer`**，并调整遮罩 / 画布 / 控件的 **z-index**。

### 修复

- **`FilePreview`**：`urls` 监听器中用于对比释放对象 URL 的快照**不得**使用 Vue 2 `data()` 的 **`_` 前缀**（此类键不会代理到 `this`），已改为 **`prevBlobUrlSnapshot`**，避免 `forEach` 读到 `undefined`、列表不更新或控制台报错。
- **演示应用**（`src/App.vue`）：本地上传改为 **原生 `input[type=file]`** 由按钮触发，避免 `el-upload` + `action="#"` 在部分环境下点击或选文件无响应。

## [0.1.0] - 2026-04-18

### 新增

- 初始版本：`FileImagePreview` 组件，基于 Element UI `el-image` 展示多图缩略图与点击预览。
- Vue 2 插件入口：`install` 全局注册组件；支持 `export { FileImagePreview }` 按需引入。
