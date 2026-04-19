<template>
  <div
    class="file-preview-gallery"
    :style="{
      gap: `${gap}px`,
    }"
  >
    <div
      v-for="(entry, index) in mediaEntries"
      :key="entry.url + '-' + entry.mediaKind + '-' + index"
      class="file-preview-tile"
      :style="thumbStyle"
    >
      <file-preview-thumb :item="entry" @activate="onThumbActivate" />
    </div>

    <media-preview-viewer
      v-if="viewerVisible"
      :items="mediaEntries"
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

/** 文件预览（图片 / 视频 / 音频等，可继续扩展类型） */
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
  },
  data() {
    return {
      resolvedItems: [],
      viewerVisible: false,
      viewerIndex: 0,
      prevBodyOverflow: "",
      /** 上一轮 urls 中的 blob: 项（勿用 _ 前缀：Vue 2 不会代理到实例上） */
      prevBlobUrlSnapshot: [],
    };
  },
  computed: {
    thumbStyle() {
      const s = `${this.thumbSize}px`;
      return { width: s, height: s };
    },
    mediaEntries() {
      return this.resolvedItems.filter((e) => e.supported && e.mediaKind);
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
          .filter(
            (u) => u && typeof u.url === "string" && u.url.startsWith("blob:")
          )
          .map((u) => ({ url: u.url, __isObjectUrl: true }));
        this.resolvedItems = normalizePreviewItems(next);
      },
    },
  },
  methods: {
    onThumbActivate(entry) {
      const i = this.mediaEntries.findIndex(
        (e) => e.url === entry.url && e.mediaKind === entry.mediaKind
      );
      if (i < 0) return;
      this.openViewer(i);
    },
    openViewer(index) {
      if (index < 0 || index >= this.mediaEntries.length) return;
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
