<template>
  <video
    ref="media"
    class="media-pane__video"
    :src="url"
    :poster="poster || undefined"
    controls
    playsinline
    preload="metadata"
    @click.stop
  />
</template>

<script>
export default {
  name: "ViewerVideoPane",
  props: {
    url: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      default: "",
    },
  },
  methods: {
    pause() {
      const el = this.$refs.media;
      if (el && typeof el.pause === "function") {
        try {
          el.pause();
        } catch {
          /* ignore */
        }
      }
    },
    /** 关闭预览时：暂停并回到开头（由 viewer 在 resetOnClose 为 true 时调用） */
    resetPlayback() {
      const el = this.$refs.media;
      if (!el) return;
      try {
        el.pause();
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
    },
  },
};
</script>

<style scoped>
.media-pane__video {
  max-width: 100%;
  max-height: 100%;
  outline: none;
}
</style>
