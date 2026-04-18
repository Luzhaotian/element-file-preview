# element-file-preview

面向老项目的渐进式文件预览能力：**Vue 2** + **Element UI**，支持图片 / 视频 / 音频缩略与全屏预览（遮罩样式与 `el-image-viewer` 一致）。

## 包结构（源码 `packages/`）

| 目录              | 说明                                            |
| ----------------- | ----------------------------------------------- |
| `file-preview/`   | 入口组件 **`FileMediaPreview`**，拼装缩略与预览 |
| `image/`          | 图片缩略（`el-image`）                          |
| `video/`          | 视频缩略（`<video>`）                           |
| `audio/`          | 音频缩略（占位块）                              |
| `preview-viewer/` | 全屏预览层（`el-image-viewer` 同类名样式）      |
| `shared/`         | 类型推断与 `urls` 归一化                        |

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

全局会注册 **`FileMediaPreview`**，并保留别名 **`FileImagePreview`**（兼容旧代码，后续主版本可能移除）。

### 按需使用组件

```javascript
import { FileMediaPreview } from "element-file-preview";

export default {
  components: { FileMediaPreview },
};
```

### 模板示例

```vue
<FileMediaPreview :urls="mediaItems" :thumb-size="140" :gap="16" />
```

```javascript
// 每项为 { url, type?, poster? }；建议始终传入 type
const mediaItems = [
  { url: "https://example.com/a.png", type: "image/png" },
  { url: "https://example.com/b.jpg" }, // 未传 type 时从 URL 推断
  {
    url: "https://example.com/c.mp4",
    type: "video/mp4",
    poster: "https://example.com/c-poster.jpg",
  },
  { url: "https://example.com/d.mp3", type: "audio/mpeg" },
];
```

- `urls`（必填）：对象数组，每项含 **`url`**、可选 **`type`**（`image/*`、`video/*`、`audio/*` 或对应扩展名）、可选 **`poster`**（视频缩略 / 封面图 URL，仅视频有效）。缺省 `type` 时从 URL 推断；**未知或不支持**时在开发环境 `console.warn`，该条不参与预览。
- 全屏预览层使用与 **`el-image-viewer`** 一致的样式类名（遮罩、关闭、左右切换）；内容为图片 / 视频 / 音频控件。
- `thumb-size`：缩略图边长（px），默认 `140`
- `gap`：缩略图间距（px），默认 `16`
- `viewer-z-index`：预览层 z-index，默认 `2000`（与 el-image 一致）

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
