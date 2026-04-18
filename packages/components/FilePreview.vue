<template>
  <div
    class="file-preview-gallery"
    :style="{
      gap: `${gap}px`,
    }"
  >
    <div
      v-for="(entry, index) in mediaEntries"
      :key="entry.url + index"
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
import { normalizePreviewItems } from "../utils/resolve-items";

/** 文件预览（图片 / 视频 / 音频等，可继续扩展类型） */
export default {
  name: "FilePreview",
  components: {
    FilePreviewThumb,
    MediaPreviewViewer,
  },
  props: {
    /** 每项为 { url, type?, poster?, resetOnClose? }；type 缺省时从 URL 推断 */
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
              (item.resetOnClose == null || typeof item.resetOnClose === "boolean")
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
        this.resolvedItems = normalizePreviewItems(val);
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
      this.prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      this.viewerVisible = true;
    },
    closeViewer() {
      document.body.style.overflow = this.prevBodyOverflow;
      this.viewerVisible = false;
    },
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
