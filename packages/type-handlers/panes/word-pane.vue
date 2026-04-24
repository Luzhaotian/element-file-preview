<template>
  <div class="word-pane" @click.stop>
    <div v-if="loading" class="word-pane__status">Word 加载中...</div>
    <div v-else-if="error" class="word-pane__status word-pane__status--error">
      Word 加载失败：{{ errorMessage || "未知错误" }}
    </div>
    <div v-else class="word-pane__content" v-html="html"></div>
  </div>
</template>

<script>
import { renderWordToHtml } from "../../utils/word-render";

export default {
  name: "ViewerWordPane",
  props: {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      loading: false,
      error: false,
      errorMessage: "",
      html: "",
      loadingId: 0,
    };
  },
  watch: {
    url: {
      immediate: true,
      handler() {
        this.loadWord();
      },
    },
    type() {
      this.loadWord();
    },
  },
  methods: {
    pause() {},
    resetPlayback() {},
    async loadWord() {
      const id = ++this.loadingId;
      this.loading = true;
      this.error = false;
      this.errorMessage = "";
      this.html = "";
      try {
        const html = await renderWordToHtml(this.url, this.type);
        if (id !== this.loadingId) return;
        this.html = html;
      } catch (err) {
        if (id !== this.loadingId) return;
        this.error = true;
        this.errorMessage = err && err.message ? err.message : String(err || "");
      } finally {
        if (id === this.loadingId) this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.word-pane {
  width: min(1000px, 100%);
  height: 100%;
  overflow: auto;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 20px 0;
}

.word-pane__content {
  background: #fff;
  color: #303133;
  border-radius: 6px;
  padding: 22px 24px;
  line-height: 1.8;
}

.word-pane__status {
  color: #dcdfe6;
  text-align: center;
  margin-top: 40px;
}

.word-pane__status--error {
  color: #f56c6c;
}
</style>
