<template>
  <div
    class="file-preview-thumb"
    role="button"
    tabindex="0"
    @click="onActivate"
    @keydown.enter.prevent="onActivate"
    @keydown.space.prevent="onActivate"
  >
    <img
      v-if="isImage"
      :src="item.url"
      alt=""
      class="file-preview-thumb__img"
    />
    <video-preview-thumb
      v-else-if="isVideo"
      :url="item.url"
      :poster="item.poster"
    />
    <audio-preview-thumb v-else-if="isAudio" />
    <div v-else class="file-preview-thumb__placeholder" aria-hidden="true" />
  </div>
</template>

<script>
import AudioPreviewThumb from "../type-handlers/thumbs/audio-thumb.vue";
import VideoPreviewThumb from "../type-handlers/thumbs/video-thumb.vue";

/**
 * 单格缩略：根据 `item.mediaKind` 渲染图片 / 视频 / 音频（与 FilePreview 解析后的条目一致）。
 * @emits activate 点击或键盘确认时抛出，参数为当前 `item`
 */
export default {
  name: "FilePreviewThumb",
  components: {
    VideoPreviewThumb,
    AudioPreviewThumb,
  },
  props: {
    /** 归一化后的项：{ url, mediaKind, poster?, … } */
    item: {
      type: Object,
      required: true,
      validator(value) {
        return (
          value &&
          typeof value.url === "string" &&
          typeof value.mediaKind === "string"
        );
      },
    },
  },
  computed: {
    isImage() {
      return this.item.mediaKind === "image";
    },
    isVideo() {
      return this.item.mediaKind === "video";
    },
    isAudio() {
      return this.item.mediaKind === "audio";
    },
  },
  methods: {
    onActivate() {
      this.$emit("activate", this.item);
    },
  },
};
</script>

<style scoped>
.file-preview-thumb {
  width: 100%;
  height: 100%;
  cursor: pointer;
  outline: none;
}

.file-preview-thumb__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  vertical-align: top;
}

.file-preview-thumb__placeholder {
  width: 100%;
  height: 100%;
  background: #ebeef5;
}
</style>
