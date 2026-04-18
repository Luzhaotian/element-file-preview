<template>
  <div id="app" class="page">
    <header class="header">
      <h1 class="title">文件预览</h1>
      <p class="subtitle">
        第一步：使用 Element UI 的
        <code>el-image</code> 与 <code>preview-src-list</code> 实现多图大图预览
      </p>
    </header>

    <section class="gallery-wrap" aria-label="示例图片">
      <file-image-preview :urls="imageUrls" />
    </section>

    <p class="hint">点击任意缩略图即可打开预览，支持左右切换与关闭。</p>
  </div>
</template>

<script>
import { FileImagePreview } from "../packages";

const SAMPLE_IMAGES = [
  "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
  "https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg",
  "https://fuss10.elemecdn.com/1/8e/aeffeb4de74e2fde4bd74fc7b4486jpeg.jpeg",
];

export default {
  name: "App",
  components: {
    FileImagePreview,
  },
  data() {
    return {
      imageUrls: SAMPLE_IMAGES,
    };
  },
};
</script>

<style>
html,
body,
#app {
  margin: 0;
  min-height: 100%;
}

.page {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 40px 24px 48px;
  font-family:
    "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Arial, sans-serif;
  color: #303133;
  background: #f5f7fa;
}

.header {
  max-width: 720px;
  margin: 0 auto 28px;
  text-align: center;
}

.title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.subtitle code {
  padding: 1px 6px;
  font-size: 13px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
}

.gallery-wrap {
  max-width: 900px;
  margin: 0 auto 20px;
}

.hint {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: #909399;
}
</style>
