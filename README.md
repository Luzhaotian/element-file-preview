# element-file-preview

面向老项目的渐进式文件预览能力：**Vue 2** + **Element UI**，当前提供基于 `el-image` 的图片缩略图与预览（`preview-src-list`）。

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

### 按需使用组件

```javascript
import { FileImagePreview } from "element-file-preview";

export default {
  components: { FileImagePreview },
};
```

### 模板示例

```vue
<FileImagePreview :urls="imageUrls" :thumb-size="140" :gap="16" />
```

- `urls`（必填）：图片地址数组
- `thumb-size`：缩略图边长（px），默认 `140`
- `gap`：缩略图间距（px），默认 `16`

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
