<template>
  <div class="pdf-thumb">
    <img
      v-if="coverSrc"
      class="pdf-thumb__img"
      :src="coverSrc"
      alt="PDF"
      @error="coverSrc = ''"
    />
    <div v-else class="pdf-thumb__placeholder">PDF</div>
  </div>
</template>

<script>
import { renderPdfPagesToImages } from "../../utils/pdf-render";

export default {
  name: "PdfPreviewThumb",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      coverSrc: "",
      loadingId: 0,
    };
  },
  watch: {
    url: {
      immediate: true,
      handler() {
        this.loadCover();
      },
    },
  },
  methods: {
    async loadCover() {
      const id = ++this.loadingId;
      this.coverSrc = "";
      if (!this.url) return;
      try {
        const pages = await renderPdfPagesToImages(this.url);
        if (id !== this.loadingId) return;
        this.coverSrc = pages[0] ? pages[0].src : "";
      } catch (err) {
        if (id !== this.loadingId) return;
        this.coverSrc = "";
        if (process.env.NODE_ENV !== "production") {
          console.error("[FilePreview][PDF] thumb render failed", err);
        }
      }
    },
  },
};
</script>

<style scoped>
.pdf-thumb {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
}

.pdf-thumb__img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.pdf-thumb__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-weight: 600;
  letter-spacing: 1px;
}
</style>
