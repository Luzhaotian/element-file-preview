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
          <i class="el-icon-arrow-left"></i>
        </span>
        <span
          class="el-image-viewer__btn el-image-viewer__next"
          :class="{ 'is-disabled': !infinite && isLast }"
          @click="next"
        >
          <i class="el-icon-arrow-right"></i>
        </span>
      </template>
      <div
        v-if="isImageActive"
        class="el-image-viewer__btn el-image-viewer__actions"
      >
        <div class="el-image-viewer__actions__inner">
          <i class="el-icon-zoom-out" @click="handleImageActions('zoomOut')"></i>
          <i class="el-icon-zoom-in" @click="handleImageActions('zoomIn')"></i>
          <i class="el-image-viewer__actions__divider"></i>
          <i :class="imageMode.icon" @click="toggleImageMode"></i>
          <i class="el-image-viewer__actions__divider"></i>
          <i
            class="el-icon-refresh-left"
            @click="handleImageActions('anticlocelise')"
          ></i>
          <i
            class="el-icon-refresh-right"
            @click="handleImageActions('clocelise')"
          ></i>
        </div>
      </div>
      <div
        class="el-image-viewer__canvas media-preview-viewer__canvas"
        @click.self="handleMaskClick"
      >
        <template v-if="currentItem">
          <viewer-image-pane
            v-if="currentItem.mediaKind === 'image'"
            :key="'img-' + currentItem.url"
            ref="activePane"
            :url="currentItem.url"
            :img-style="imageImgStyle"
            @image-load="imageLoading = false"
            @image-error="imageLoading = false"
            @image-mousedown="onImageMouseDown"
          />
          <viewer-video-pane
            v-else-if="currentItem.mediaKind === 'video'"
            :key="'v-' + currentItem.url"
            ref="activePane"
            :url="currentItem.url"
            :poster="currentItem.poster"
          />
          <viewer-audio-pane
            v-else-if="currentItem.mediaKind === 'audio'"
            :key="'a-' + currentItem.url"
            ref="activePane"
            :url="currentItem.url"
          />
          <viewer-excel-pane
            v-else-if="currentItem.mediaKind === 'excel'"
            :key="'e-' + currentItem.url"
            ref="activePane"
            :url="currentItem.url"
          />
          <viewer-pdf-pane
            v-else-if="currentItem.mediaKind === 'pdf'"
            :key="'p-' + currentItem.url"
            ref="activePane"
            :url="currentItem.url"
          />
          <viewer-word-pane
            v-else-if="currentItem.mediaKind === 'word'"
            :key="'w-' + currentItem.url"
            ref="activePane"
            :url="currentItem.url"
            :type="currentItem.type"
          />
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import { on, off } from "element-ui/src/utils/dom";
import { rafThrottle, isFirefox } from "element-ui/src/utils/util";
import ViewerAudioPane from "../type-handlers/panes/audio-pane.vue";
import ViewerExcelPane from "../type-handlers/panes/excel-pane.vue";
import ViewerImagePane from "../type-handlers/panes/image-pane.vue";
import ViewerPdfPane from "../type-handlers/panes/pdf-pane.vue";
import ViewerVideoPane from "../type-handlers/panes/video-pane.vue";
import ViewerWordPane from "../type-handlers/panes/word-pane.vue";

const mousewheelEventName = isFirefox() ? "DOMMouseScroll" : "mousewheel";

const ImageViewMode = {
  CONTAIN: {
    name: "contain",
    icon: "el-icon-full-screen",
  },
  ORIGINAL: {
    name: "original",
    icon: "el-icon-c-scale-to-original",
  },
};

export default {
  name: "MediaPreviewViewer",
  components: {
    ViewerImagePane,
    ViewerVideoPane,
    ViewerAudioPane,
    ViewerExcelPane,
    ViewerPdfPane,
    ViewerWordPane,
  },
  props: {
    /** @type {{ url: string, mediaKind: string, poster?: string, resetOnClose?: boolean }[]} */
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
      imageMode: ImageViewMode.CONTAIN,
      imageTransform: {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false,
      },
      imageLoading: false,
    };
  },
  computed: {
    currentItem() {
      if (!this.items.length) return null;
      const i = Math.min(Math.max(this.index, 0), this.items.length - 1);
      return this.items[i];
    },
    isImageActive() {
      return !!(this.currentItem && this.currentItem.mediaKind === "image");
    },
    imageImgStyle() {
      if (!this.isImageActive) return {};
      const { scale, deg, offsetX, offsetY, enableTransition } =
        this.imageTransform;
      const style = {
        transform: `scale(${scale}) rotate(${deg}deg)`,
        transition: enableTransition ? "transform .3s" : "",
        marginLeft: `${offsetX}px`,
        marginTop: `${offsetY}px`,
      };
      if (this.imageMode === ImageViewMode.CONTAIN) {
        style.maxWidth = "100%";
        style.maxHeight = "100%";
      }
      return style;
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
    maskClosableEffective() {
      const v = this.maskClosable;
      if (v === false || v === 0) return false;
      if (typeof v === "string" && v.toLowerCase() === "false") return false;
      return true;
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
      this.resetImageTransform();
      if (this.currentItem && this.currentItem.mediaKind === "image") {
        this.imageLoading = true;
      } else {
        this.imageLoading = false;
      }
    },
  },
  mounted() {
    this._keyDownHandler = (e) => {
      e.stopPropagation();
      const keyCode = e.keyCode;
      if (keyCode === 27) {
        this.hide();
        return;
      }
      if (keyCode === 37) {
        this.prev();
        return;
      }
      if (keyCode === 39) {
        this.next();
        return;
      }
      if (this.isImageActive) {
        if (keyCode === 32) {
          e.preventDefault();
          this.toggleImageMode();
        } else if (keyCode === 38) {
          e.preventDefault();
          this.handleImageActions("zoomIn");
        } else if (keyCode === 40) {
          e.preventDefault();
          this.handleImageActions("zoomOut");
        }
      }
    };
    this._mouseWheelHandler = rafThrottle((e) => {
      if (!this.isImageActive || this.imageLoading) return;
      const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
      if (delta > 0) {
        this.handleImageActions("zoomIn", {
          zoomRate: 0.015,
          enableTransition: false,
        });
      } else {
        this.handleImageActions("zoomOut", {
          zoomRate: 0.015,
          enableTransition: false,
        });
      }
    });
    on(document, "keydown", this._keyDownHandler);
    on(document, mousewheelEventName, this._mouseWheelHandler);
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
      if (this.isImageActive) this.imageLoading = true;
    });
  },
  destroyed() {
    off(document, "keydown", this._keyDownHandler);
    this._keyDownHandler = null;
    off(document, mousewheelEventName, this._mouseWheelHandler);
    this._mouseWheelHandler = null;
    this.teardownImageDrag();
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
    teardownImageDrag() {
      if (this._dragHandler) {
        off(document, "mousemove", this._dragHandler);
        this._dragHandler = null;
      }
      if (this._mouseupHandler) {
        off(document, "mouseup", this._mouseupHandler);
        this._mouseupHandler = null;
      }
    },
    hide() {
      this.applyResetBeforeClose();
      this.pauseMedia();
      this.$emit("close");
    },
    applyResetBeforeClose() {
      const item = this.currentItem;
      const pane = this.$refs.activePane;
      if (!item || !pane || item.resetOnClose === false) return;
      if (item.mediaKind !== "video" && item.mediaKind !== "audio") return;
      if (typeof pane.resetPlayback === "function") {
        pane.resetPlayback();
      }
    },
    handleMaskClick() {
      if (this.maskClosableEffective) this.hide();
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
        const pane = this.$refs.activePane;
        if (pane && typeof pane.pause === "function") {
          pane.pause();
        }
      });
    },
    resetImageTransform() {
      this.imageTransform = {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false,
      };
    },
    toggleImageMode() {
      if (!this.isImageActive || this.imageLoading) return;
      const keys = Object.keys(ImageViewMode);
      const vals = Object.values(ImageViewMode);
      const idx = vals.indexOf(this.imageMode);
      const nextIdx = (idx + 1) % keys.length;
      this.imageMode = ImageViewMode[keys[nextIdx]];
      this.resetImageTransform();
    },
    handleImageActions(action, options = {}) {
      if (!this.isImageActive || this.imageLoading) return;
      const { zoomRate, rotateDeg, enableTransition } = {
        zoomRate: 0.2,
        rotateDeg: 90,
        enableTransition: true,
        ...options,
      };
      const t = this.imageTransform;
      switch (action) {
        case "zoomOut":
          if (t.scale > 0.2) {
            t.scale = parseFloat((t.scale - zoomRate).toFixed(3));
          }
          break;
        case "zoomIn":
          t.scale = parseFloat((t.scale + zoomRate).toFixed(3));
          break;
        case "clocelise":
          t.deg += rotateDeg;
          break;
        case "anticlocelise":
          t.deg -= rotateDeg;
          break;
        default:
          break;
      }
      t.enableTransition = enableTransition;
    },
    onImageMouseDown(e) {
      if (this.imageLoading || e.button !== 0) return;
      this.teardownImageDrag();
      const { offsetX, offsetY } = this.imageTransform;
      const startX = e.pageX;
      const startY = e.pageY;
      this._dragHandler = rafThrottle((ev) => {
        this.imageTransform.offsetX = offsetX + ev.pageX - startX;
        this.imageTransform.offsetY = offsetY + ev.pageY - startY;
      });
      this._mouseupHandler = () => {
        this.teardownImageDrag();
      };
      on(document, "mousemove", this._dragHandler);
      on(document, "mouseup", this._mouseupHandler);
      e.preventDefault();
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
</style>

<style>
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
