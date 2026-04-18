<template>
  <transition name="viewer-fade">
    <div
      ref="wrapper"
      tabindex="-1"
      class="el-image-viewer__wrapper file-media-preview-viewer"
      :style="{ 'z-index': viewerZIndex }"
    >
      <div class="el-image-viewer__mask" @click.self="handleMaskClick"></div>
      <span class="el-image-viewer__btn el-image-viewer__close" @click="hide">
        <i class="el-icon-close"></i>
      </span>
      <template v-if="items.length > 1">
        <span
          class="el-image-viewer__btn el-image-viewer__prev"
          :class="{ 'is-disabled': !infinite && isFirst }"
          @click="prev"
        >
          <i class="el-icon-arrow-left" />
        </span>
        <span
          class="el-image-viewer__btn el-image-viewer__next"
          :class="{ 'is-disabled': !infinite && isLast }"
          @click="next"
        >
          <i class="el-icon-arrow-right" />
        </span>
      </template>
      <div class="el-image-viewer__canvas media-preview-viewer__canvas">
        <template v-if="currentItem">
          <img
            v-if="currentItem.mediaKind === 'image'"
            :key="'img-' + currentItem.url"
            class="el-image-viewer__img media-preview-viewer__img"
            :src="currentItem.url"
            alt=""
            @click.stop
            @error="onImgError"
          />
          <video
            v-else-if="currentItem.mediaKind === 'video'"
            :key="'v-' + currentItem.url"
            ref="mediaEl"
            class="media-preview-viewer__video"
            :src="currentItem.url"
            :poster="currentItem.poster || undefined"
            controls
            playsinline
            preload="metadata"
            @click.stop
          />
          <div
            v-else-if="currentItem.mediaKind === 'audio'"
            class="media-preview-viewer__audio"
            @click.stop
          >
            <i class="el-icon-headset media-preview-viewer__audio-icon" />
            <audio
              :key="'a-' + currentItem.url"
              ref="mediaEl"
              class="media-preview-viewer__audio-el"
              :src="currentItem.url"
              controls
              preload="metadata"
            />
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import { on, off } from "element-ui/src/utils/dom";

export default {
  name: "MediaPreviewViewer",
  props: {
    /** @type {{ url: string, mediaKind: string, poster?: string }[]} */
    items: {
      type: Array,
      default: () => [],
    },
    initialIndex: {
      type: Number,
      default: 0,
    },
    zIndex: {
      type: Number,
      default: 2000,
    },
    maskClosable: {
      type: Boolean,
      default: true,
    },
    appendToBody: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      index: this.initialIndex,
      infinite: true,
    };
  },
  computed: {
    currentItem() {
      if (!this.items.length) return null;
      const i = Math.min(Math.max(this.index, 0), this.items.length - 1);
      return this.items[i];
    },
    isFirst() {
      return this.index === 0;
    },
    isLast() {
      return this.index === this.items.length - 1;
    },
    viewerZIndex() {
      return this.zIndex;
    },
  },
  watch: {
    initialIndex: {
      immediate: true,
      handler(val) {
        if (typeof val === "number" && val >= 0) {
          this.index = val;
        }
      },
    },
    index() {
      this.pauseMedia();
    },
  },
  mounted() {
    this._keyDownHandler = (e) => {
      e.stopPropagation();
      const keyCode = e.keyCode;
      if (keyCode === 27) this.hide();
      else if (keyCode === 37) this.prev();
      else if (keyCode === 39) this.next();
    };
    on(document, "keydown", this._keyDownHandler);
    if (
      this.appendToBody &&
      this.$el &&
      this.$el.parentNode !== document.body
    ) {
      document.body.appendChild(this.$el);
    }
    this.$nextTick(() => {
      const w = this.$refs.wrapper;
      if (w) w.focus();
    });
  },
  destroyed() {
    off(document, "keydown", this._keyDownHandler);
    this._keyDownHandler = null;
    if (
      this.appendToBody &&
      this.$el &&
      this.$el.parentNode &&
      this.$el.parentNode === document.body
    ) {
      this.$el.parentNode.removeChild(this.$el);
    }
  },
  methods: {
    hide() {
      this.pauseMedia();
      this.$emit("close");
    },
    handleMaskClick() {
      if (this.maskClosable) this.hide();
    },
    prev() {
      if (this.items.length <= 1) return;
      if (this.isFirst && !this.infinite) return;
      const len = this.items.length;
      this.index = (this.index - 1 + len) % len;
    },
    next() {
      if (this.items.length <= 1) return;
      if (this.isLast && !this.infinite) return;
      const len = this.items.length;
      this.index = (this.index + 1) % len;
    },
    pauseMedia() {
      this.$nextTick(() => {
        const el = this.$refs.mediaEl;
        if (el && typeof el.pause === "function") {
          try {
            el.pause();
          } catch {
            /* ignore */
          }
        }
      });
    },
    onImgError(e) {
      if (e.target) e.target.alt = "加载失败";
    },
  },
};
</script>

<style scoped>
.media-preview-viewer__canvas {
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-preview-viewer__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.media-preview-viewer__video {
  max-width: 100%;
  max-height: 100%;
  outline: none;
}

.media-preview-viewer__audio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  min-width: 280px;
  max-width: 90vw;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 8px;
}

.media-preview-viewer__audio-icon {
  font-size: 48px;
  color: #fff;
}

.media-preview-viewer__audio-el {
  width: 100%;
  min-width: 260px;
}
</style>

<style>
/*
 * Element 默认未区分遮罩与画布的 z-index，在部分环境下遮罩会盖住画布导致点击图片误触 mask 关闭。
 * 仅作用于本组件根上的 .file-media-preview-viewer，不影响原生 el-image 预览。
 */
.file-media-preview-viewer .el-image-viewer__mask {
  z-index: 0;
}

.file-media-preview-viewer .el-image-viewer__canvas {
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

.file-media-preview-viewer .el-image-viewer__btn {
  z-index: 2;
}
</style>
