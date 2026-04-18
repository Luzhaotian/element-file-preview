# 更新日志

本文件记录每次发布时的变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 变更（破坏性）

- 主组件更名为 **`FilePreview`**（文件预览）；仍可通过 **`FileMediaPreview`**、**`FileImagePreview`** 别名引入或全局注册。
- `urls` 为 **`{ url, type?, poster? }` 对象数组**；`type` 可选，缺省时从 URL 推断，无法识别或不支持预览时在开发环境 `console.warn`，且该条不展示。

### 新增

- 支持 **视频、音频** 预览：全屏层沿用 `el-image-viewer` 遮罩与按钮样式，画布内为 `<video controls>` / `<audio controls>`；视频缩略可选 **`poster`**。
- 源码目录整理为 **`packages/components`**、**`packages/viewer`**、**`packages/type-handlers/thumbs`**、**`packages/type-handlers/panes`**、**`packages/utils`**（`type-handlers`：按类型的缩略与遮罩内预览），入口仍为 **`packages/index.js`**。
- **`FilePreview`** 增加 **`mask-closable`**（默认 `true`），用于控制点击遮罩是否关闭；内部透传至 **`MediaPreviewViewer`**。
- 视频 / 音频条目支持 **`resetOnClose`**（默认 `true`）：关闭全屏预览时暂停并回到开头；设为 `false` 则保留播放进度。
- 修复自定义预览层 **遮罩盖住内容** 导致的误触关闭：预览根类名 **`file-preview-viewer`**，并调整遮罩 / 画布 / 按钮 **z-index**。

<!-- 下一次发布前，把此处条目移到新版本标题下 -->

## [0.1.0] - 2026-04-18

### 新增

- 初始版本：`FileImagePreview` 组件，基于 Element UI `el-image` 展示多图缩略图与点击预览。
- Vue 2 插件入口：`install` 全局注册组件；支持 `export { FileImagePreview }` 按需引入。
