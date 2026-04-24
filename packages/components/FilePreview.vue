<template>
  <div
    class="file-preview-gallery"
    :style="{
      gap: `${gap}px`,
    }"
  >
    <div
      v-for="(entry, index) in thumbEntries"
      :key="entry.url + '-' + entry.mediaKind + '-' + index"
      class="file-preview-tile"
      :style="thumbStyle"
    >
      <file-preview-thumb :item="entry" @activate="onThumbActivate" />
    </div>

    <media-preview-viewer
      v-if="viewerVisible"
      :items="viewerEntries"
      :initial-index="viewerIndex"
      :z-index="viewerZIndex"
      :mask-closable="maskClosableEffective"
      @close="closeViewer"
    />
  </div>
</template>

<script>
import FilePreviewThumb from "./FilePreviewThumb.vue";
import MediaPreviewViewer from "../viewer/MediaPreviewViewer.vue";
import {
  normalizePreviewItems,
  revokePreviewObjectUrls,
} from "../utils/resolve-items";
import { renderPdfPagesToImages } from "../utils/pdf-render";

/** 文件预览（图片 / 视频 / 音频 / PDF，可继续扩展类型） */
export default {
  name: "FilePreview",
  components: {
    FilePreviewThumb,
    MediaPreviewViewer,
  },
  props: {
    /** 每项为 { url, type?, name?, poster?, resetOnClose?, __isObjectUrl? }；blob URL 建议带 name 或 type 以便推断 */
    urls: {
      type: Array,
      required: true,
      validator(value) {
        return (
          Array.isArray(value) &&
          value.every(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.url === "string" &&
              (item.poster == null || typeof item.poster === "string") &&
              (item.name == null || typeof item.name === "string") &&
              (item.type == null || typeof item.type === "string") &&
              (item.resetOnClose == null || typeof item.resetOnClose === "boolean") &&
              (item.__isObjectUrl == null ||
                typeof item.__isObjectUrl === "boolean")
          )
        );
      },
    },
    thumbSize: {
      type: Number,
      default: 140,
    },
    gap: {
      type: Number,
      default: 16,
    },
    viewerZIndex: {
      type: Number,
      default: 2000,
    },
    /** 点击遮罩是否关闭全屏 */
    maskClosable: {
      type: Boolean,
      default: true,
    },
    /** PDF 缩略图区是否仅展示第一页封面；false 时展示全部页 */
    pdfThumbCoverOnly: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      resolvedItems: [],
      pdfPageMap: {},
      viewerVisible: false,
      viewerIndex: 0,
      prevBodyOverflow: "",
      /** 上一轮 urls 中的 blob: 项（勿用 _ 前缀：Vue 2 不会代理到实例上） */
      prevBlobUrlSnapshot: [],
      resolveSeq: 0,
    };
  },
  computed: {
    thumbStyle() {
      const s = `${this.thumbSize}px`;
      return { width: s, height: s };
    },
    thumbEntries() {
      return this.resolvedItems.filter((e) => e.supported && e.mediaKind);
    },
    viewerEntries() {
      const entries = [];
      this.thumbEntries.forEach((item) => {
        if (item.__thumbPdfSourceUrl) {
          const pages = this.pdfPageMap[item.__thumbPdfSourceUrl] || [];
          if (!pages.length) {
            entries.push(item);
            return;
          }
          pages.forEach((page) => entries.push(page));
          return;
        }
        if (item.mediaKind !== "pdf") {
          entries.push(item);
          return;
        }
        const pages = this.pdfPageMap[item.url] || [];
        if (!pages.length) {
          entries.push(item);
          return;
        }
        pages.forEach((page) => entries.push(page));
      });
      return entries;
    },
    maskClosableEffective() {
      const v = this.maskClosable;
      if (v === false || v === 0) return false;
      if (typeof v === "string" && v.toLowerCase() === "false") return false;
      return true;
    },
  },
  watch: {
    urls: {
      deep: true,
      immediate: true,
      handler(val) {
        this.resolveUrls(val);
      },
    },
  },
  methods: {
    buildThumbItems(supported, pageMap) {
      const thumbItems = supported.map((item) => {
        if (item.mediaKind !== "pdf") return item;
        const pages = pageMap[item.url] || [];
        if (!pages.length) return item;
        if (!this.pdfThumbCoverOnly) {
          return pages;
        }
        return {
          ...pages[0],
          __thumbPdfSourceUrl: item.url,
        };
      });
      return thumbItems.flat();
    },
    async resolveUrls(val) {
      const seq = ++this.resolveSeq;
      const next = Array.isArray(val) ? val : [];
      const nextUrlSet = new Set(
        next.map((u) => u && u.url).filter((url) => typeof url === "string")
      );
      (this.prevBlobUrlSnapshot || []).forEach((item) => {
        if (
          item &&
          item.url &&
          item.url.startsWith("blob:") &&
          !nextUrlSet.has(item.url)
        ) {
          revokePreviewObjectUrls([item]);
        }
      });
      this.prevBlobUrlSnapshot = next
        .filter((u) => u && typeof u.url === "string" && u.url.startsWith("blob:"))
        .map((u) => ({ url: u.url, __isObjectUrl: true }));
      const normalized = normalizePreviewItems(next);
      const supported = [];
      const pageMap = {};
      const pdfItems = [];
      for (const item of normalized) {
        if (!item.supported || !item.mediaKind) continue;
        supported.push(item);
        if (item.mediaKind === "pdf") pdfItems.push(item);
      }
      if (seq !== this.resolveSeq) return;
      // 先渲染基础列表，避免上传项被 PDF 拆页阻塞而“不显示”。
      this.pdfPageMap = {};
      this.resolvedItems = this.buildThumbItems(supported, {});

      for (const item of pdfItems) {
        try {
          const pages = await renderPdfPagesToImages(item.url);
          if (seq !== this.resolveSeq) return;
          pageMap[item.url] = pages.map((page) => ({
            ...item,
            __fromPdf: true,
            __pdfSourceUrl: item.url,
            __pdfPageNumber: page.pageNumber,
            url: page.src,
            type: "image/png",
            mediaKind: "image",
            poster: "",
          }));
        } catch {
          // 拆页失败则保持 pdf 项可预览（按原始类型）
          pageMap[item.url] = [];
        }
        if (seq !== this.resolveSeq) return;
        this.pdfPageMap = { ...pageMap };
        this.resolvedItems = this.buildThumbItems(supported, pageMap);
      }
      if (seq !== this.resolveSeq) return;
      this.pdfPageMap = pageMap;
      this.resolvedItems = this.buildThumbItems(supported, pageMap);
    },
    onThumbActivate(entry) {
      let i = -1;
      if (entry.__thumbPdfSourceUrl) {
        const sourceUrl = entry.__thumbPdfSourceUrl;
        i = this.viewerEntries.findIndex(
          (e) =>
            e.__pdfSourceUrl === sourceUrl &&
            e.__pdfPageNumber === 1 &&
            e.__fromPdf
        );
        if (i < 0) {
          i = this.viewerEntries.findIndex(
            (e) => e.mediaKind === "pdf" && e.url === sourceUrl
          );
        }
      } else {
        i = this.viewerEntries.findIndex(
          (e) => e.url === entry.url && e.mediaKind === entry.mediaKind
        );
      }
      if (i < 0) return;
      this.openViewer(i);
    },
    openViewer(index) {
      if (index < 0 || index >= this.viewerEntries.length) return;
      this.viewerIndex = index;
      if (!this.viewerVisible) {
        this.prevBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        this.viewerVisible = true;
      }
    },
    closeViewer() {
      if (this.viewerVisible) {
        document.body.style.overflow = this.prevBodyOverflow;
        this.viewerVisible = false;
      }
    },
  },
  beforeDestroy() {
    revokePreviewObjectUrls(
      (this.urls || []).filter(
        (u) => u && typeof u.url === "string" && u.url.startsWith("blob:")
      )
    );
    this.prevBlobUrlSnapshot = [];
    if (this.viewerVisible) {
      document.body.style.overflow = this.prevBodyOverflow;
    }
  },
};
</script>

<style scoped>
.file-preview-gallery {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.file-preview-tile {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  background: #fff;
  flex-shrink: 0;
}
</style>
