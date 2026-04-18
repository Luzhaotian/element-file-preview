<template>
  <video
    class="video-thumb"
    :src="url"
    :poster="poster || undefined"
    muted
    playsinline
    preload="metadata"
  />
</template>

<script>
export default {
  name: "VideoPreviewThumb",
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
};
</script>

<style scoped>
.video-thumb {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  vertical-align: top;
}
</style>
