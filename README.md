# element-file-preview

面向老项目的渐进式文件预览能力：**Vue 2** + **Element UI**，支持图片 / 视频 / 音频缩略与全屏预览（遮罩样式与 `el-image-viewer` 一致）。

## 包结构（源码 `packages/`）

```
packages/
├── index.js                      # 对外入口（export / install）
├── components/FilePreview.vue      # 文件预览主组件
├── components/FilePreviewThumb.vue # 单格缩略（按 mediaKind 分支展示）
├── viewer/MediaPreviewViewer.vue   # 全屏预览（图 / 音视频统一壳，左右切换含全部条目）
├── type-handlers/
│   ├── thumbs/                     # 视频 / 音频缩略子组件（由 FilePreviewThumb 组合）
│   └── panes/                      # 全屏内画布（图 / 视频 / 音频）
└── utils/resolve-items.js          # type 推断与 urls 归一化
```

| 目录                    | 说明                                       |
| ----------------------- | ------------------------------------------ |
| `components/`           | **`FilePreview`**、**`FilePreviewThumb`**   |
| `viewer/`               | **`MediaPreviewViewer`**（关闭、左右切换整列表；图片含缩放旋转工具条） |
| `type-handlers/thumbs/` | 视频 / 音频缩略（与 `FilePreviewThumb` 内图片并列使用） |
| `type-handlers/panes/`  | 全屏内图片 / 视频 / 音频子组件            |
| `utils/`                | 纯逻辑                                     |

目录名 **`type-handlers`** 表示按文件类型分发的缩略与遮罩内预览实现；也可选用如 **`preview-engines`**、**`file-renderers`** 等命名。

## 环境要求

- Vue `^2.6`
- Element UI `^2.15`（需在项目中引入 `theme-chalk`，包含 Image / ImageViewer 相关样式）

## 安装

```bash
npm install element-file-preview
```

若从源码使用，可 `npm link` 或相对路径引用构建产物。

## 构建库产物

发布或使用 UMD/CommonJS 前在仓库根目录执行：

```bash
npm install
npm run lib
```

产物输出在 `dist/` 目录（与 `package.json` 中 `main`、`files` 字段一致）。

## 使用

### 全局注册

```javascript
import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import ElementFilePreview from "element-file-preview";

Vue.use(ElementUI);
Vue.use(ElementFilePreview);
```

全局会注册 **`FilePreview`**（文件预览）、**`FilePreviewThumb`**（单格缩略），并保留别名 **`FileMediaPreview`**、**`FileImagePreview`**（兼容旧代码，后续主版本可能移除）。

### 按需使用组件

```javascript
import { FilePreview, FilePreviewThumb } from "element-file-preview";

export default {
  components: { FilePreview, FilePreviewThumb },
};
```

### 模板示例

```vue
<FilePreview :urls="fileItems" :thumb-size="140" :gap="16" />
```

```javascript
// 每项为 { url, type?, poster?, resetOnClose? }；建议始终传入 type（后续可扩展更多文件类型）
const fileItems = [
  { url: "https://example.com/a.png", type: "image/png" },
  { url: "https://example.com/b.jpg" }, // 未传 type 时从 URL 推断
  {
    url: "https://example.com/c.mp4",
    type: "video/mp4",
    poster: "https://example.com/c-poster.jpg",
    // resetOnClose 缺省为 true：关闭全屏后回到开头；设为 false 保留进度
  },
  { url: "https://example.com/d.mp3", type: "audio/mpeg", resetOnClose: false },
];
```

- `urls`（必填）：对象数组，每项含 **`url`**、可选 **`type`**（`image/*`、`video/*`、`audio/*` 或对应扩展名）、可选 **`poster`**（视频缩略 / 封面图 URL，仅视频有效）、可选 **`resetOnClose`**（**视频 / 音频**，默认 **`true`**：关闭全屏预览时暂停并 `currentTime = 0`；为 **`false`** 时保留播放进度）。缺省 `type` 时从 URL 推断；**未知或不支持**时在开发环境 `console.warn`，该条不参与预览。
- 全屏预览为**单一** `MediaPreviewViewer`：样式类名与 **`el-image-viewer`** 对齐（遮罩、关闭、左右切换）；**左右切换按 `urls` 解析后的顺序遍历全部图片与音视频**。图片支持与 Element 一致的缩放、旋转、适应/原始尺寸及滚轮与快捷键；视频 / 音频为内嵌控件。
- `thumb-size`：缩略图边长（px），默认 `140`
- `gap`：缩略图间距（px），默认 `16`
- `viewer-z-index`：预览层 z-index，默认 `2000`（与 el-image 一致）
- `mask-closable`：是否**点击遮罩**关闭全屏预览，默认 **`true`**；设为 `false` 时仅能通过关闭按钮等方式退出（与 Element `el-image-viewer` 的 `maskClosable` 行为一致）

## 本地演示

```bash
npm run serve
```

## 仓库

- <https://github.com/Luzhaotian/element-file-preview>

## 更新日志

版本变更请查看 [CHANGELOG.md](./CHANGELOG.md)。

## 许可证

MIT
