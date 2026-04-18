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
      @click="openViewer(index)"
    >
      <image-preview-thumb
        v-if="entry.mediaKind === 'image'"
        :url="entry.url"
      />
      <video-preview-thumb
        v-else-if="entry.mediaKind === 'video'"
        :url="entry.url"
        :poster="entry.poster"
      />
      <audio-preview-thumb v-else-if="entry.mediaKind === 'audio'" />
    </div>

    <media-preview-viewer
      v-if="viewerVisible"
      :items="mediaEntries"
      :initial-index="viewerIndex"
      :z-index="viewerZIndex"
      @close="closeViewer"
    />
  </div>
</template>

<script>
import AudioPreviewThumb from "../media/audio-thumb.vue";
import ImagePreviewThumb from "../media/image-thumb.vue";
import MediaPreviewViewer from "../preview-viewer/media-preview-viewer.vue";
import VideoPreviewThumb from "../media/video-thumb.vue";
import { normalizePreviewItems } from "../shared/resolve-items";

/** 文件预览（图片 / 视频 / 音频等，可继续扩展类型） */
export default {
  name: "FilePreview",
  components: {
    ImagePreviewThumb,
    VideoPreviewThumb,
    AudioPreviewThumb,
    MediaPreviewViewer,
  },
  props: {
    /** 每项为 { url, type?, poster? }；type 缺省时从 URL 推断 */
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
              (item.poster == null || typeof item.poster === "string")
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
    openViewer(index) {
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
  cursor: pointer;
  background: #fff;
  flex-shrink: 0;
}
</style>
