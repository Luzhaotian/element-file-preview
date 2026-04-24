<template>
  <div class="pdf-pane" @click.stop>
    <div v-if="loading" class="pdf-pane__status">PDF 渲染中...</div>
    <div v-else-if="error" class="pdf-pane__status pdf-pane__status--error">
      PDF 加载失败：{{ errorMessage || "未知错误" }}
    </div>
    <div v-else class="pdf-pane__pages">
      <img
        v-for="page in pages"
        :key="page.pageNumber"
        class="pdf-pane__img"
        :src="page.src"
        :alt="'PDF page ' + page.pageNumber"
      />
    </div>
  </div>
</template>

<script>
import { renderPdfPagesToImages } from "../../utils/pdf-render";

export default {
  name: "ViewerPdfPane",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      error: false,
      errorMessage: "",
      pages: [],
      loadingId: 0,
    };
  },
  watch: {
    url: {
      immediate: true,
      handler() {
        this.loadPages();
      },
    },
  },
  methods: {
    pause() {},
    resetPlayback() {},
    async loadPages() {
      const id = ++this.loadingId;
      this.error = false;
      this.errorMessage = "";
      this.loading = true;
      this.pages = [];
      try {
        const pages = await renderPdfPagesToImages(this.url);
        if (id !== this.loadingId) return;
        this.pages = pages;
      } catch (err) {
        if (id !== this.loadingId) return;
        this.error = true;
        this.errorMessage = err && err.message ? err.message : String(err || "");
        if (process.env.NODE_ENV !== "production") {
          // 透出底层异常，便于判断是兼容性、网络还是 CORS 问题
          console.error("[FilePreview][PDF] render failed", err);
        }
      } finally {
        if (id === this.loadingId) this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.pdf-pane {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 18px 0;
  box-sizing: border-box;
}

.pdf-pane__pages {
  width: min(980px, 100%);
  margin: 0 auto;
}

.pdf-pane__img {
  width: 100%;
  display: block;
  margin-bottom: 14px;
  border-radius: 4px;
  background: #fff;
}

.pdf-pane__status {
  width: 100%;
  text-align: center;
  color: #dcdfe6;
  margin-top: 40px;
}

.pdf-pane__status--error {
  color: #f56c6c;
}
</style>
