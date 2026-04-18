<template>
  <transition name="viewer-fade">
    <div
      ref="wrapper"
      tabindex="-1"
      class="el-image-viewer__wrapper file-preview-viewer"
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
      <div class="el-image-viewer__canvas file-preview-viewer__canvas">
        <preview-image-pane
          v-if="currentItem && currentItem.mediaKind === 'image'"
          :key="'img-' + currentItem.url"
          ref="mediaPane"
          :url="currentItem.url"
        />
        <preview-video-pane
          v-else-if="currentItem && currentItem.mediaKind === 'video'"
          :key="'v-' + currentItem.url"
          ref="mediaPane"
          :url="currentItem.url"
          :poster="currentItem.poster"
        />
        <preview-audio-pane
          v-else-if="currentItem && currentItem.mediaKind === 'audio'"
          :key="'a-' + currentItem.url"
          ref="mediaPane"
          :url="currentItem.url"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import { on, off } from "element-ui/src/utils/dom";
import PreviewAudioPane from "../preview-panes/preview-audio-pane.vue";
import PreviewImagePane from "../preview-panes/preview-image-pane.vue";
import PreviewVideoPane from "../preview-panes/preview-video-pane.vue";

export default {
  name: "MediaPreviewViewer",
  components: {
    PreviewImagePane,
    PreviewVideoPane,
    PreviewAudioPane,
  },
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
        const pane = this.$refs.mediaPane;
        if (pane && typeof pane.pause === "function") {
          pane.pause();
        }
      });
    },
  },
};
</script>

<style scoped>
.file-preview-viewer__canvas {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<style>
/*
 * 遮罩在下、画布与按钮在上，避免误点内容触发关闭。
 * 仅作用于 .file-preview-viewer，不影响原生 el-image 预览。
 */
.file-preview-viewer .el-image-viewer__mask {
  z-index: 0;
}

.file-preview-viewer .el-image-viewer__canvas {
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

.file-preview-viewer .el-image-viewer__btn {
  z-index: 2;
}
</style>
