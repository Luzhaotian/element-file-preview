<template>
  <div id="app" class="page">
    <header class="header">
      <h1 class="title">文件预览</h1>
      <p class="subtitle">
        图片 / 视频 / 音频统一预览；全屏层与
        <code>el-image-viewer</code>
        样式一致。下方可上传本地文件，使用对象 URL 模拟文件流预览。
      </p>
    </header>

    <section class="toolbar" aria-label="本地上传测试">
      <!-- 原生 file input：避免 el-upload + action="#" 在部分环境下点击/选文件无响应 -->
      <span class="upload-inline">
        <el-button
          size="small"
          type="primary"
          native-type="button"
          @click="openLocalPicker"
        >
          选择本地文件（流 / Blob 预览）
        </el-button>
        <input
          ref="localFileInput"
          class="local-file-input"
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.mp3,.mp4,.webm,.wav,.ogg,.m4a"
          @change="onNativeFileChange"
        />
      </span>
      <el-button
        v-if="blobItems.length"
        size="small"
        @click="clearLocalBlobs"
      >
        清空本地上传
      </el-button>
    </section>

    <section class="gallery-wrap" aria-label="示例媒体">
      <file-preview :urls="previewUrls" />
    </section>

    <p class="hint">
      点击缩略图打开预览；左右键可在「网络资源 + 本地上传」整列表中切换。
    </p>
  </div>
</template>

<script>
import FilePreview from "../packages/components/FilePreview.vue";
import {
  previewItemsFromFiles,
  revokePreviewObjectUrls,
} from "../packages/utils/resolve-items";

const SAMPLE_FILES = [
  {
    url: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
    type: "image/jpeg",
  },
  {
    url: "https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg",
  },
  {
    url: "https://fuss10.elemecdn.com/1/8e/aeffeb4de74e2fde4bd74fc7b4486jpeg.jpeg",
    type: "image",
  },
  {
    url: "https://cfcf2bb9-c341-4ede-bf8c-7b29cc059148.mdnplay.dev/shared-assets/videos/flower.webm",
    type: "video/webm",
  },
  {
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
    type: "audio/mpeg",
  },
];

export default {
  name: "App",
  components: {
    FilePreview,
  },
  data() {
    return {
      blobItems: [],
    };
  },
  computed: {
    previewUrls() {
      return SAMPLE_FILES.concat(this.blobItems);
    },
  },
  beforeDestroy() {
    revokePreviewObjectUrls(this.blobItems);
  },
  methods: {
    openLocalPicker() {
      const input = this.$refs.localFileInput;
      if (input) input.click();
    },
    onNativeFileChange(ev) {
      const input = ev.target;
      if (!input || !input.files || !input.files.length) return;
      const items = previewItemsFromFiles(Array.from(input.files));
      this.blobItems = this.blobItems.concat(items);
      input.value = "";
    },
    clearLocalBlobs() {
      revokePreviewObjectUrls(this.blobItems);
      this.blobItems = [];
    },
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

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 900px;
  margin: 0 auto 20px;
}

.upload-inline {
  position: relative;
  display: inline-block;
}

.local-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
  padding: 0;
  margin: 0;
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
