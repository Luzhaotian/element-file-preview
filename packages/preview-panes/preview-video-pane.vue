<template>
  <video
    ref="media"
    class="file-preview-pane__video"
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
  name: "PreviewVideoPane",
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
  },
};
</script>

<style scoped>
.file-preview-pane__video {
  max-width: 100%;
  max-height: 100%;
  outline: none;
}
</style>
